/**
 * 宿主侧：HTTP 路由、条目管理、编译、深读、试音、素材。
 *
 * 浏览器页面通过 /dsh-myself-preset/* 取数；preset 作用域插件只读
 * ~/.dsh/myself-preset/profile.md，所以页面保存后下一句话就生效。
 *
 * @module dsh-myself-preset
 */
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { createStore } from './store.js';
import {
  analyzeCorrection,
  analyzeEntries,
  computeProgress,
  inferManualDimension,
  mergeRules,
} from './analyze.js';
import { compile, compileToStore } from './compile.js';
import {
  acceptRun,
  pendingRuns,
  regeneratePortrait,
  runDeep,
  selectModel,
  streamTextChunks,
} from './deep.js';
import { resolveHome } from './persona.js';
import {
  MAX_BODY_BYTES,
  MAX_ENTRIES,
  MAX_ENTRY_CHARS,
  pendingJob,
} from './schema.js';

/** Loader 行名。 */
export const name = 'dsh-myself-preset';

/** 不强制依赖宿主服务；拿到 webServer / llm 时才用。 */
export const inject = [];

/** 路由前缀。 */
const ROUTE_PREFIX = '/dsh-myself-preset';

/** 包根目录（用于素材）。 */
const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = join(HERE, '..');

/** manifest 版本：/ping 用它，避免升级后忘改常量。 */
const VERSION = (() => {
  try {
    const pkg = JSON.parse(readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf8'));
    return typeof pkg.version === 'string' && pkg.version.length > 0 ? pkg.version : '0.0.0';
  } catch {
    return '0.0.0';
  }
})();

/** HTTP 错误。 */
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** 稳定短 id。 */
function shortHash(value) {
  return createHash('sha1').update(String(value)).digest('hex').slice(0, 10);
}

/** provider / model 这类标识符：去控制字符、限长，避免任意长字符串落盘。 */
function cleanIdentifier(value) {
  if (typeof value !== 'string') return null;
  const text = value.replace(/[\u0000-\u001f\u007f]/gu, '').trim().slice(0, 120);
  return text.length === 0 ? null : text;
}

/** 发送 JSON。 */
function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  res.end(body);
}

/** 统一错误出口。 */
function sendError(res, error) {
  if (res.headersSent) {
    try {
      res.end();
    } catch {
      // 已断开。
    }
    return;
  }
  const status = error instanceof HttpError ? error.status : 500;
  const message = error instanceof Error ? error.message : String(error);
  sendJson(res, status, { error: message });
}

/** 回环主机名白名单；`.localhost` 子域由浏览器保证解析到本机。 */
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

/** 从 Host 头里取主机名，处理 `[::1]:1234` 和 `127.0.0.1:1234`。 */
function hostnameOf(hostHeader) {
  const value = String(hostHeader ?? '').trim().toLowerCase();
  if (value.length === 0) return '';
  if (value.startsWith('[')) {
    const end = value.indexOf(']');
    return end < 0 ? value : value.slice(0, end + 1);
  }
  const colon = value.lastIndexOf(':');
  return colon > 0 && value.indexOf(':') === colon ? value.slice(0, colon) : value;
}

/** 连接是否落在回环地址上。 */
function isLoopbackSocket(req) {
  const local = String(req.socket?.localAddress ?? '');
  return local === '127.0.0.1' || local === '::1' || local === '::ffff:127.0.0.1';
}

/**
 * 只接受同源或直接访问，挡住其他站点的 CSRF 和 DNS rebinding。
 *
 * DSH 的页面路由有宿主鉴权，插件注册的 exact 路由没有。
 *
 * 两道关：
 * 1. `sec-fetch-site` / `origin` 必须与 Host 一致，挡住跨站请求；
 * 2. 从回环地址进来的请求，Host 必须是 localhost / 127.0.0.1 / [::1]。
 *    第 2 条专治 DNS rebinding：攻击者把 evil.com 解析到 127.0.0.1 后，
 *    Origin 和 Host 都是 evil.com，第 1 条比不出来。
 */
function assertSameOrigin(req) {
  const site = req.headers['sec-fetch-site'];
  if (typeof site === 'string' && site !== 'same-origin' && site !== 'none') {
    throw new HttpError(403, '拒绝跨站请求。');
  }
  const host = String(req.headers.host ?? '');
  if (host.length === 0) throw new HttpError(403, '缺少 Host。');

  const origin = req.headers.origin;
  if (typeof origin === 'string') {
    if (origin === 'null') throw new HttpError(403, '拒绝跨站请求。');
    let parsed;
    try {
      parsed = new URL(origin);
    } catch {
      throw new HttpError(403, '来源不合法。');
    }
    if (parsed.host.toLowerCase() !== host.toLowerCase()) throw new HttpError(403, '拒绝跨站请求。');
  }

  if (isLoopbackSocket(req)) {
    const name = hostnameOf(host);
    if (!(LOOPBACK_HOSTS.has(name) || name.endsWith('.localhost'))) {
      throw new HttpError(403, '拒绝非本机主机名的请求。');
    }
  }
}

/** 写请求必须是 JSON：跨站表单发不出这个 content-type。 */
function assertJsonRequest(req) {
  const type = String(req.headers['content-type'] ?? '');
  if (!/^application\/json\b/iu.test(type)) {
    throw new HttpError(415, '请求体必须是 application/json。');
  }
}

/** 读取 JSON body。 */
async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new HttpError(413, '请求体太大。');
    chunks.push(chunk);
  }
  if (chunks.length === 0) return {};
  const text = Buffer.concat(chunks).toString('utf8').trim();
  if (text.length === 0) return {};
  try {
    const value = JSON.parse(text);
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('not an object');
    }
    return value;
  } catch {
    throw new HttpError(400, '请求体不是合法 JSON 对象。');
  }
}

/** 页面用的完整状态。 */
function statePayload(ctx, store, state) {
  const progress = computeProgress(state);
  const profile = compile(state);
  let selection = null;
  try {
    selection = ctx.get('agentDefaultModel')?.currentSelection?.() ?? null;
  } catch {
    selection = null;
  }
  return {
    version: 1,
    entries: state.entries.map((entry) => ({
      id: entry.id,
      type: entry.type,
      title: entry.title,
      chars: entry.chars,
      createdAt: entry.createdAt,
      tags: entry.tags ?? [],
      signals: entry.signals ?? [],
      diff: entry.diff ?? null,
    })),
    rules: state.rules,
    manual: state.manual,
    profile,
    progress,
    deep: {
      job: state.deep.job,
      pending: pendingRuns(state),
      portrait: state.deep.portrait,
      portraitAccepted: state.deep.portraitAccepted,
      portraitStale: state.deep.portraitStale,
    },
    settings: {
      ...state.settings,
      defaultProvider: selection?.provider ?? null,
      defaultModel: selection?.model ?? null,
    },
    latestRule: state.rules.find((rule) => rule.enabled !== false) ?? null,
    counts: {
      entries: state.entries.length,
      rules: state.rules.filter((rule) => rule.enabled !== false).length,
    },
  };
}

/** 重新分析本地规则、合并、编译、写文件。 */
function recompute(state, store) {
  const { rules: localRules } = analyzeEntries(state.entries);
  state.rules = mergeRules(state, localRules);
  compileToStore(state, store);
  return state;
}

/** 新增条目（语料/纠正/直给）。 */
function addEntry(state, body) {
  if (state.entries.length >= MAX_ENTRIES) {
    throw new HttpError(400, `条目太多了（上限 ${MAX_ENTRIES}），先删一些。`);
  }
  const type = body.type === 'correction' ? 'correction' : body.type === 'note' ? 'note' : 'corpus';
  const now = Date.now();
  if (type === 'note') {
    const text = String(body.text ?? '').trim();
    if (text.length < 2) throw new HttpError(400, '规则太短。');
    if (text.length > 500) throw new HttpError(400, '一条规则最多 500 字。');
    const entry = {
      id: `entry-${randomUUID()}`,
      type: 'note',
      title: text.slice(0, 60),
      text,
      chars: text.length,
      createdAt: now,
    };
    const key = `manual:${shortHash(text)}`;
    const rule = {
      id: `r-${shortHash(`manual:${text}:${now}`)}`,
      key,
      layer: 'manual',
      dimension: inferManualDimension(text),
      text,
      confidence: 0.95,
      evidence: [{ entryId: entry.id, quote: text.slice(0, 80) }],
      enabled: true,
      createdAt: now,
    };
    state.entries.unshift(entry);
    state.rules = state.rules.filter((item) => item.key !== key);
    state.rules.push(rule);
    return { entry, extraRules: [rule] };
  }

  if (type === 'correction') {
    const original = String(body.original ?? '').trim();
    const revised = String(body.revised ?? '').trim();
    if (original.length < 10 || revised.length < 10) {
      throw new HttpError(400, '原稿和改写都要至少 10 个字。');
    }
    if (original.length > MAX_ENTRY_CHARS || revised.length > MAX_ENTRY_CHARS) {
      throw new HttpError(413, `单段最多 ${MAX_ENTRY_CHARS} 字，长文请拆成几段。`);
    }
    const entry = {
      id: `entry-${randomUUID()}`,
      type: 'correction',
      title: String(body.title ?? '').trim().slice(0, 80) || '纠正样本',
      text: revised,
      original,
      revised,
      chars: revised.replace(/\s+/gu, '').length,
      createdAt: now,
    };
    const analysis = analyzeCorrection(entry);
    entry.signals = analysis.signals;
    entry.diff = analysis.diff;
    state.entries.unshift(entry);
    return { entry, extraRules: analysis.rules };
  }

  const text = String(body.text ?? '').trim();
  if (text.length < 20) throw new HttpError(400, '语料太短，至少 20 个字。');
  if (text.length > MAX_ENTRY_CHARS) throw new HttpError(413, `单条最多 ${MAX_ENTRY_CHARS} 字，长文请拆成几段。`);
  const entry = {
    id: `entry-${randomUUID()}`,
    type: 'corpus',
    title: String(body.title ?? '').trim().slice(0, 80) || '语料',
    text,
    chars: text.replace(/\s+/gu, '').length,
    createdAt: now,
  };
  state.entries.unshift(entry);
  return { entry, extraRules: [] };
}

/** 注册一条 exact 路由。 */
function route(webCtx, method, path, handler) {
  const fullPath = `${ROUTE_PREFIX}${path}`;
  webCtx.effect(
    () =>
      webCtx.webServer.register({
        kind: 'exact',
        path: fullPath,
        handler: (req, res) => {
          const allowed = method === 'GET' ? new Set(['GET', 'HEAD']) : new Set([method]);
          if (!allowed.has(req.method ?? '')) {
            res.writeHead(405, { allow: method === 'GET' ? 'GET, HEAD' : method });
            res.end();
            return;
          }
          try {
            assertSameOrigin(req);
            if (method !== 'GET') assertJsonRequest(req);
          } catch (error) {
            sendError(res, error);
            return;
          }
          Promise.resolve(handler(req, res)).catch((error) => sendError(res, error));
        },
      }),
    `dsh-myself-preset: ${method} ${fullPath}`,
  );
}

/** 插件入口。 */
export function apply(ctx) {
  const home = resolveHome(ctx);
  const store = createStore(home);
  store.ensure();
  store.markStaleJob();

  // 启动时按当前分析器重算一次本地规则，避免代码升级后旧规则留在 profile 里。
  {
    const initial = store.load();
    recompute(initial, store);
    store.save(initial);
  }

  // 第一次启动就把 profile.md 写出来，preset 在页面打开前也能用。
  if (!existsSync(store.profilePath)) {
    const state = store.load();
    compileToStore(state, store);
  }

  ctx.inject(['webServer'], (webCtx) => {
    route(webCtx, 'GET', '/ping', async (req, res) => {
      // 不返回数据目录：绝对路径会带出用户名，诊断价值也不高。
      sendJson(res, 200, {
        ok: true,
        version: VERSION,
        hasProfile: existsSync(store.profilePath),
      });
    });

    route(webCtx, 'GET', '/state.json', async (req, res) => {
      const state = store.load();
      sendJson(res, 200, statePayload(ctx, store, state));
    });

    route(webCtx, 'POST', '/entries', async (req, res) => {
      const body = await readJson(req);
      const result = await store.mutate((state) => {
        const before = new Set(state.rules.map((rule) => rule.key));
        const added = addEntry(state, body);
        const local = analyzeEntries(state.entries).rules;
        state.rules = mergeRules(state, local);
        const addedRules = state.rules
          .filter((rule) => !before.has(rule.key) && rule.layer !== 'deep')
          .slice(0, 5);
        compileToStore(state, store);
        return { state, added: { entry: added.entry, rules: addedRules } };
      });
      sendJson(res, 200, {
        state: statePayload(ctx, store, result.state),
        added: result.added,
      });
    });

    route(webCtx, 'POST', '/entries/delete', async (req, res) => {
      const body = await readJson(req);
      const id = String(body.id ?? '');
      if (id.length === 0) throw new HttpError(400, '缺少条目 id。');
      const result = await store.mutate((state) => {
        const entry = state.entries.find((item) => item.id === id);
        if (entry === undefined) throw new HttpError(404, '条目不存在。');
        state.entries = state.entries.filter((item) => item.id !== id);
        if (entry.type === 'note') {
          const removed = new Set(
            state.rules
              .filter((rule) => rule.layer === 'manual' && (rule.evidence ?? []).some((item) => item.entryId === id))
              .map((rule) => rule.key),
          );
          state.rules = state.rules.filter((rule) => !removed.has(rule.key));
          // 偏好跟着规则一起清，否则 rulePrefs 会随着删改无限长。
          for (const key of removed) delete state.rulePrefs[key];
        }
        recompute(state, store);
        return { state };
      });
      sendJson(res, 200, { state: statePayload(ctx, store, result.state) });
    });

    route(webCtx, 'POST', '/rules/update', async (req, res) => {
      const body = await readJson(req);
      const id = String(body.id ?? '');
      const result = await store.mutate((state) => {
        const rule = state.rules.find((item) => item.id === id);
        if (rule === undefined) throw new HttpError(404, '规则不存在。');
        if (body.deleted === true) {
          state.rules = state.rules.filter((item) => item.id !== id);
          if (rule.layer === 'local') {
            state.rulePrefs[rule.key] = { ...(state.rulePrefs[rule.key] ?? {}), deleted: true };
          }
          if (rule.layer === 'deep' && state.deep.portraitAccepted) state.deep.portraitStale = true;
        } else {
          if (typeof body.enabled === 'boolean') {
            rule.enabled = body.enabled;
            if (rule.layer === 'local') {
              state.rulePrefs[rule.key] = { ...(state.rulePrefs[rule.key] ?? {}), enabled: body.enabled };
            }
            if (rule.layer === 'deep' && body.enabled === false && state.deep.portraitAccepted) {
              state.deep.portraitStale = true;
            }
          }
          if (typeof body.text === 'string' && body.text.trim().length > 0) {
            rule.text = body.text.trim().slice(0, 500);
            if (rule.layer === 'local') {
              state.rulePrefs[rule.key] = { ...(state.rulePrefs[rule.key] ?? {}), text: rule.text };
            }
          }
        }
        compileToStore(state, store);
        return { state };
      });
      sendJson(res, 200, { state: statePayload(ctx, store, result.state) });
    });

    route(webCtx, 'POST', '/profile', async (req, res) => {
      const body = await readJson(req);
      const text = String(body.text ?? '');
      if (text.length > 20000) throw new HttpError(413, '人格文本太长。');
      const mode = body.mode === 'takeover' ? 'takeover' : 'append';
      const result = await store.mutate((state) => {
        state.manual = { text, mode };
        compileToStore(state, store);
        return { state };
      });
      sendJson(res, 200, { state: statePayload(ctx, store, result.state) });
    });

    route(webCtx, 'POST', '/settings', async (req, res) => {
      const body = await readJson(req);
      const result = await store.mutate((state) => {
        if (body.provider === null || typeof body.provider === 'string') {
          state.settings.provider = body.provider === null ? null : cleanIdentifier(body.provider);
        }
        if (body.model === null || typeof body.model === 'string') {
          state.settings.model = body.model === null ? null : cleanIdentifier(body.model);
        }
        if (state.settings.provider === null || state.settings.model === null) {
          state.settings.provider = null;
          state.settings.model = null;
        }
        if (typeof body.sendToModel === 'boolean') state.settings.sendToModel = body.sendToModel;
        if (typeof body.privacySeen === 'boolean') state.settings.privacySeen = body.privacySeen;
        return { state };
      });
      sendJson(res, 200, { state: statePayload(ctx, store, result.state) });
    });

    route(webCtx, 'POST', '/deep', async (req, res) => {
      const job = pendingJob();
      job.status = 'running';
      job.phase = '排队';
      // 检查和占位必须在同一次 mutate 里：先 load 再检查会让两个并发请求
      // 都看到“没有任务”，各起一次模型调用。
      await store.mutate((state) => {
        if (state.deep.job?.status === 'running') throw new HttpError(409, '已经有一次深读在跑。');
        if (state.entries.filter((entry) => entry.type !== 'note').length === 0) {
          throw new HttpError(400, '还没有可深读的语料。');
        }
        if (!state.settings.sendToModel) throw new HttpError(400, '设置里关闭了“深读发送给模型”。');
        state.deep.job = job;
        return { state };
      });
      void runDeep(ctx, store).catch(async (error) => {
        // runDeep 内部已经写过失败状态；这里只兜底“连状态都没写进去”的情况。
        try {
          await store.mutate((state) => {
            if (state.deep.job?.status !== 'running') return { state };
            state.deep.job = {
              ...state.deep.job,
              status: 'error',
              phase: '失败',
              error: error instanceof Error ? error.message : String(error),
              finishedAt: Date.now(),
            };
            return { state };
          });
        } catch {
          // 宿主磁盘不可写时无处可记。
        }
      });
      sendJson(res, 200, { job });
    });

    route(webCtx, 'GET', '/deep/status', async (req, res) => {
      const state = store.load();
      sendJson(res, 200, {
        job: state.deep.job,
        pending: pendingRuns(state),
      });
    });

    route(webCtx, 'POST', '/deep/accept', async (req, res) => {
      const body = await readJson(req);
      const runId = String(body.runId ?? '');
      const mode = body.mode === 'all' ? 'all' : body.mode === 'reject' ? 'reject' : 'rules';
      const ruleIds = Array.isArray(body.ruleIds)
        ? body.ruleIds.filter((item) => typeof item === 'string').slice(0, 50).map((item) => item.slice(0, 64))
        : null;
      const result = await store.mutate((state) => {
        acceptRun(state, runId, mode, ruleIds);
        recompute(state, store);
        return { state };
      });
      sendJson(res, 200, { state: statePayload(ctx, store, result.state) });
    });

    route(webCtx, 'POST', '/deep/regenerate', async (req, res) => {
      const result = await store.mutate((state) => {
        regeneratePortrait(state);
        compileToStore(state, store);
        return { state };
      });
      sendJson(res, 200, { state: statePayload(ctx, store, result.state) });
    });

    route(webCtx, 'POST', '/reset', async (req, res) => {
      const body = await readJson(req);
      // 同源的其它插件也能发 POST；清库必须带显式确认，避免被顺手调用。
      if (body.confirm !== 'reset') throw new HttpError(400, '清空数据需要显式确认。');
      const state = store.reset();
      compileToStore(state, store);
      sendJson(res, 200, { state: statePayload(ctx, store, state) });
    });

    route(webCtx, 'GET', '/export', async (req, res) => {
      const payload = store.exportAll();
      const body = JSON.stringify(payload, null, 2);
      res.writeHead(200, {
        'content-type': 'application/json; charset=utf-8',
        'content-disposition': `attachment; filename="dsh-myself-preset-${new Date().toISOString().slice(0, 10)}.json"`,
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
      });
      res.end(body);
    });

    route(webCtx, 'POST', '/test', async (req, res) => {
      const body = await readJson(req);
      const scenario = String(body.scenario ?? '').trim();
      if (scenario.length < 2) throw new HttpError(400, '写一个试音场景。');
      if (scenario.length > 4000) throw new HttpError(413, '场景太长。');
      const state = store.load();
      if (!state.settings.sendToModel) throw new HttpError(400, '设置里关闭了“发送给模型”。');
      const selection = selectModel(ctx, state);
      const profile = compile(state);
      const messages = [
        {
          role: 'system',
          content: [
            {
              type: 'text',
              text: `${profile}\n\n## 试音\n用户会给一个场景。直接用上面的说话方式回答；不要解释你在模仿谁，不要加“根据人格”之类的壳。`,
            },
          ],
        },
        { role: 'user', content: [{ type: 'text', text: scenario }] },
      ];
      const controller = new AbortController();
      let closed = false;
      const onClose = () => {
        closed = true;
        if (!controller.signal.aborted) controller.abort();
      };
      res.on('close', onClose);
      const writeEvent = (payload) => {
        if (closed || res.writableEnded || res.destroyed) return;
        try {
          res.write(`${JSON.stringify(payload)}\n`);
        } catch {
          closed = true;
        }
      };
      let headerSent = false;
      try {
        res.writeHead(200, {
          'content-type': 'application/x-ndjson; charset=utf-8',
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff',
          connection: 'keep-alive',
        });
        headerSent = true;
      } catch {
        // 连接在写头之前就断了。
      }
      if (!headerSent) return;
      writeEvent({ type: 'start', provider: selection.provider, model: selection.model });
      try {
        await streamTextChunks(
          ctx,
          // signal 被取消时 for await 会跳出，上游有机会中断，不再白算 token。
          { provider: selection.provider, model: selection.model, messages, maxTokens: 1200, signal: controller.signal },
          (text) => writeEvent({ type: 'delta', text }),
        );
        writeEvent({ type: 'done' });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        writeEvent({ type: 'error', error: message });
      } finally {
        res.off('close', onClose);
        if (!res.writableEnded) {
          try {
            res.end();
          } catch {
            // 连接已经断了。
          }
        }
      }
    });

    route(webCtx, 'GET', '/asset/plant.png', async (req, res) => {
      const path = join(PACKAGE_ROOT, 'assets', 'plant.png');
      let stat;
      try {
        stat = statSync(path);
      } catch {
        throw new HttpError(404, '素材不存在。');
      }
      res.writeHead(200, {
        'content-type': 'image/png',
        'content-length': String(stat.size),
        'cache-control': 'public, max-age=3600',
      });
      if (req.method === 'HEAD') {
        res.end();
        return;
      }
      const stream = createReadStream(path);
      // pipe 不转发错误：文件在 stat 之后被删掉时，没有这个监听会直接把进程带崩。
      stream.on('error', () => {
        try {
          res.destroy();
        } catch {
          // 已断开。
        }
      });
      stream.pipe(res);
    });
  });
}
