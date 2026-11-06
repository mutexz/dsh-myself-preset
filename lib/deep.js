/**
 * 深读：把语料和纠正交给当前模型，产出一版带证据的画像和规则。
 *
 * 结果只进 pending，不自动写人格；用户收下后才合并。这样模型不会偷偷改
 * 用户的 preset。
 *
 * @module dsh-myself-preset/deep
 */
import { createHash } from 'node:crypto';
import { MAX_DEEP_CHARS, MAX_DEEP_RULES, DIMENSION_LABEL, pendingJob } from './schema.js';
import { localPortrait } from './analyze.js';

/** 稳定的短 id。 */
function shortHash(value) {
  return createHash('sha1').update(String(value)).digest('hex').slice(0, 10);
}

/** 选模型：页面设置 > 当前默认模型。 */
export function selectModel(ctx, state) {
  const settings = state.settings ?? {};
  if (typeof settings.provider === 'string' && settings.provider.length > 0 && typeof settings.model === 'string' && settings.model.length > 0) {
    return { provider: settings.provider, model: settings.model, source: 'settings' };
  }
  let selection = null;
  try {
    selection = ctx.get('agentDefaultModel')?.currentSelection?.() ?? null;
  } catch {
    selection = null;
  }
  if (selection !== null && typeof selection.provider === 'string' && typeof selection.model === 'string') {
    return { provider: selection.provider, model: selection.model, source: 'default' };
  }
  throw new Error('模型没接上：当前没有可用的默认模型，也没有在设置里指定 provider/model。');
}

/** 把条目整理成 prompt 文本；超长时保留最近的条目。 */
function buildMaterial(entries) {
  const selected = [];
  let total = 0;
  for (const entry of [...entries].reverse()) {
    if (entry.type === 'note') continue;
    const body =
      entry.type === 'correction'
        ? `original:\n${String(entry.original ?? '').slice(0, 6000)}\n\nrevised:\n${String(entry.revised ?? entry.text ?? '').slice(0, 6000)}`
        : String(entry.text ?? '').slice(0, 6000);
    if (body.trim().length === 0) continue;
    const block = `### entry ${entry.id} · ${entry.type} · ${entry.title ?? ''}\n${body}`;
    if (total + block.length > MAX_DEEP_CHARS && selected.length > 0) break;
    selected.push(block);
    total += block.length;
  }
  return { text: selected.reverse().join('\n\n'), count: selected.length };
}

/** 深读 system prompt。 */
const SYSTEM = `你是一个风格分析器。你不评价好坏，只提取可迁移的写作习惯。

规则：
- 只根据给出的原文判断，不要编造经历、身份或偏好。
- 每条判断必须带原文引用；引用不超过 40 字，必须逐字来自原文。
- 区分“话题词”和“风格词”：只出现一次的主题词不算口头禅。
- 优先看 correction：original 是 AI 原文，revised 是这个人改后的版本，diff 比长文更有信号。
- 规则最多 6 条（上限 ${MAX_DEEP_RULES}），每条只讲一个习惯，维度只能是 voice / rhythm / lexicon / structure / scenario。
- portrait 用第二人称写 200–400 字，直接可注入 system prompt；不要写“根据语料”“作为 AI”这种壳。
- 输出严格 JSON，不要 Markdown 代码块，不要额外解释。

JSON schema：
{
  "summary": "一句话总结这个人的说话方式",
  "portrait": "300-500 字第二人称画像",
  "rules": [
    {
      "dimension": "voice|rhythm|lexicon|structure|scenario",
      "text": "一条可执行的规则",
      "confidence": 0.0,
      "evidence": [{ "entryId": "entry id", "quote": "原文引用" }]
    }
  ],
  "warnings": ["不确定或互相矛盾的地方"]
}`;

/** 把模型输出解析成 run；失败抛错。 */
export function parseRun(raw, provider, model) {
  let text = String(raw ?? '').trim();
  text = text.replace(/^```(?:json)?\s*/iu, '').replace(/\s*```$/u, '');
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first >= 0 && last > first) text = text.slice(first, last + 1);
  let value;
  try {
    value = JSON.parse(text);
  } catch (error) {
    throw new Error(`深读返回的不是合法 JSON：${error instanceof Error ? error.message : String(error)}`);
  }
  if (value === null || typeof value !== 'object') throw new Error('深读返回的 JSON 不是对象。');
  const validDimensions = new Set(Object.keys(DIMENSION_LABEL));
  const rules = Array.isArray(value.rules) ? value.rules : [];
  const normalized = [];
  for (const rule of rules.slice(0, MAX_DEEP_RULES)) {
    if (rule === null || typeof rule !== 'object') continue;
    const textValue = typeof rule.text === 'string' ? rule.text.trim().slice(0, 400) : '';
    if (textValue.length === 0) continue;
    const dimension = validDimensions.has(rule.dimension) ? rule.dimension : 'voice';
    const evidence = Array.isArray(rule.evidence)
      ? rule.evidence
          .filter((item) => item !== null && typeof item === 'object' && typeof item.quote === 'string')
          .slice(0, 3)
          .map((item) => ({ entryId: typeof item.entryId === 'string' ? item.entryId : '', quote: item.quote.trim().slice(0, 120) }))
      : [];
    normalized.push({
      id: `deep-r-${shortHash(`${provider}:${model}:${textValue}`)}`,
      key: `deep:${shortHash(textValue)}`,
      layer: 'deep',
      dimension,
      text: textValue,
      confidence: typeof rule.confidence === 'number' && Number.isFinite(rule.confidence) ? Math.max(0, Math.min(1, rule.confidence)) : 0.7,
      evidence,
      enabled: true,
      createdAt: Date.now(),
    });
  }
  return {
    id: `run-${Date.now().toString(36)}-${shortHash(text)}`,
    createdAt: Date.now(),
    provider,
    model,
    summary: typeof value.summary === 'string' ? value.summary.trim().slice(0, 500) : '',
    portrait: typeof value.portrait === 'string' ? value.portrait.trim().slice(0, 3000) : '',
    rules: normalized,
    warnings: Array.isArray(value.warnings) ? value.warnings.filter((item) => typeof item === 'string').slice(0, 5) : [],
    status: 'pending',
  };
}

/**
 * 流式调用模型；每个 text-delta 交给 onDelta。
 *
 * @param {object} ctx - 宿主上下文。
 * @param {object} options - provider/model/messages/maxTokens。
 * @param {(text: string) => void} [onDelta] - 增量回调。
 * @returns {Promise<string>} 完整文本。
 */
export async function streamTextChunks(ctx, options, onDelta) {
  const llm = ctx.get('llm');
  if (llm === undefined || typeof llm.stream !== 'function') {
    throw new Error('模型服务不可用：当前进程没有挂载 llm。');
  }
  const chunks = [];
  const deltaIndexes = new Set();
  for await (const chunk of llm.stream(options)) {
    if (chunk?.type === 'text-delta' && typeof chunk.text === 'string') {
      deltaIndexes.add(chunk.index);
      chunks.push(chunk.text);
      if (typeof onDelta === 'function') onDelta(chunk.text);
      continue;
    }
    if (chunk?.type === 'block-end' && chunk.block?.type === 'text' && !deltaIndexes.has(chunk.index) && typeof chunk.block.text === 'string') {
      chunks.push(chunk.block.text);
      if (typeof onDelta === 'function') onDelta(chunk.block.text);
      continue;
    }
    // 宿主 llm 的终止块是 { type: 'finish', reason: { kind, failure } }。
    if (chunk?.type === 'finish' && chunk.reason?.kind === 'error') {
      const failure = chunk.reason.failure ?? {};
      const detail = typeof failure.message === 'string' ? failure.message : JSON.stringify(failure);
      throw new Error(`模型请求失败：${failure.code ?? 'UNKNOWN'} ${detail}`.trim());
    }
  }
  return chunks.join('');
}

/** 流式调用模型，返回完整文本。 */
export function streamText(ctx, options) {
  return streamTextChunks(ctx, options);
}

/** 深读主流程：后台跑，结果写进 pending run。 */
export async function runDeep(ctx, store) {
  const initial = store.load();
  const material = buildMaterial(initial.entries);
  if (material.count === 0) throw new Error('没有可深读的语料。');

  let provider;
  let model;
  try {
    const selection = selectModel(ctx, initial);
    provider = selection.provider;
    model = selection.model;
  } catch (error) {
    await store.mutate((state) => {
      state.deep.job = {
        ...(state.deep.job ?? pendingJob()),
        status: 'error',
        phase: '模型选择失败',
        error: error instanceof Error ? error.message : String(error),
        finishedAt: Date.now(),
      };
      return { state };
    });
    throw error;
  }

  await store.mutate((state) => {
    state.deep.job = { ...(state.deep.job ?? pendingJob()), status: 'running', phase: '读取语料', provider, model };
    return { state };
  });

  try {
    const user = `下面是同一个人的语料和纠正样本。corpus 是 ta 写的；correction 里 original 是 AI 原文，revised 是 ta 改后的版本。

${material.text}

请按 system 里的 JSON schema 输出。`;
    const messages = [
      { role: 'system', content: [{ type: 'text', text: SYSTEM }] },
      { role: 'user', content: [{ type: 'text', text: user }] },
    ];

    await store.mutate((state) => {
      if (state.deep.job !== null) state.deep.job.phase = '提炼';
      return { state };
    });

    const maxOutput = 4500;
    const parseWithSlice = (text) => {
      try {
        return parseRun(text, provider, model);
      } catch (error) {
        const first = text.indexOf('{');
        const last = text.lastIndexOf('}');
        if (first >= 0 && last > first) return parseRun(text.slice(first, last + 1), provider, model);
        throw error;
      }
    };

    let raw = '';
    let firstError = null;
    try {
      raw = await streamText(ctx, { provider, model, messages, maxTokens: maxOutput });
    } catch (error) {
      firstError = error;
    }

    await store.mutate((state) => {
      if (state.deep.job !== null) state.deep.job.phase = '交叉验证';
      return { state };
    });

    let run = null;
    if (raw.trim().length > 0) {
      try {
        run = parseWithSlice(raw);
      } catch {
        run = null;
      }
    }

    if (run === null) {
      // 解析失败/空输出：给一次更严格、更短的重试。
      const repairMessages = [
        ...messages,
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '上次输出为空、被截断或不是合法 JSON。请只输出一个完整的 JSON 对象：portrait 控制在 300 字以内，rules 最多 6 条；不要代码块，不要解释。',
            },
          ],
        },
      ];
      try {
        const repaired = await streamText(ctx, { provider, model, messages: repairMessages, maxTokens: maxOutput });
        run = parseWithSlice(repaired);
      } catch (error) {
        throw firstError ?? error;
      }
    }
    run.warnings = [
      ...run.warnings,
      ...(initial.entries.length > material.count ? [`本次只送了最近 ${material.count} 条，其余没有送进模型。`] : []),
    ];

    await store.mutate((state) => {
      state.deep.runs = [run, ...(state.deep.runs ?? [])].slice(0, 10);
      state.deep.job = {
        ...(state.deep.job ?? {}),
        status: 'done',
        phase: '已生成',
        finishedAt: Date.now(),
        runId: run.id,
        error: null,
      };
      return { state };
    });
    return run;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await store.mutate((state) => {
      state.deep.job = {
        ...(state.deep.job ?? pendingJob()),
        status: 'error',
        phase: '失败',
        error: message,
        finishedAt: Date.now(),
      };
      return { state };
    });
    throw error;
  }
}

/** 收下深读结果。 */
export function acceptRun(state, runId, mode, ruleIds) {
  const run = (state.deep.runs ?? []).find((item) => item.id === runId);
  if (run === undefined) throw new Error('找不到这次深读结果。');
  if (mode === 'reject') {
    run.status = 'rejected';
    return state;
  }
  const allowed = Array.isArray(ruleIds) && ruleIds.length > 0 ? new Set(ruleIds) : null;
  const existingKeys = new Set((state.rules ?? []).filter((rule) => rule.layer === 'deep').map((rule) => rule.key));
  for (const rule of run.rules ?? []) {
    if (allowed !== null && !allowed.has(rule.id)) continue;
    if (existingKeys.has(rule.key)) continue;
    existingKeys.add(rule.key);
    state.rules.push({ ...rule, layer: 'deep', enabled: true });
  }
  if (mode === 'all' && typeof run.portrait === 'string' && run.portrait.trim().length > 0) {
    state.deep.portrait = run.portrait;
    state.deep.portraitAccepted = true;
    state.deep.portraitStale = false;
  }
  run.status = mode === 'all' ? 'accepted' : 'rules';
  return state;
}

/** 按当前已收下的深读规则重写画像。 */
export function regeneratePortrait(state) {
  const portrait = localPortrait(state.rules);
  if (portrait.length === 0) throw new Error('还没有已收下的深读规则。');
  state.deep.portrait = portrait;
  state.deep.portraitAccepted = true;
  state.deep.portraitStale = false;
  return state;
}

/** 取下一条待确认 run（给 UI）。 */
export function pendingRuns(state) {
  return (state.deep.runs ?? []).filter((run) => run.status === 'pending');
}
