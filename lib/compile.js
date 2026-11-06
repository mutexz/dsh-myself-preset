/**
 * 人格提示词编译：底座 + 已启用规则 + 已确认画像 + 手改。
 *
 * 预算优先给手改，其次给高置信度规则；超长时从最低置信度的规则开始丢，
 * 而不是把用户刚写的那句裁掉。
 *
 * @module dsh-myself-preset/compile
 */
import {
  BASE_PERSONA,
  DIMENSIONS,
  DIMENSION_LABEL,
  MAX_PROFILE_CHARS,
} from './schema.js';
import { sanitizeProfile } from './persona.js';

/** 维度顺序：语气先，结构后。 */
const ORDER = ['voice', 'rhythm', 'lexicon', 'structure', 'scenario'];

/** 收集已启用的规则行。 */
function ruleLines(rules) {
  const byDimension = new Map(ORDER.map((id) => [id, []]));
  for (const rule of rules ?? []) {
    if (rule.enabled === false) continue;
    if (typeof rule.text !== 'string' || rule.text.trim().length === 0) continue;
    const dimension = byDimension.has(rule.dimension) ? rule.dimension : 'voice';
    byDimension.get(dimension).push({
      text: rule.text.trim(),
      confidence: Number(rule.confidence ?? 0.5),
    });
  }
  const lines = [];
  for (const dimension of ORDER) {
    const items = byDimension.get(dimension).sort((left, right) => right.confidence - left.confidence);
    if (items.length === 0) continue;
    lines.push(`### ${DIMENSION_LABEL[dimension] ?? dimension}`);
    for (const item of items) lines.push(`- ${item.text}`);
    lines.push('');
  }
  return lines;
}

/**
 * 编译人格。
 *
 * @param {object} state - 状态。
 * @returns {string} 非空人格文本。
 */
export function compile(state) {
  const manual = state.manual ?? { text: '', mode: 'append' };
  const manualText = typeof manual.text === 'string' ? manual.text.trim() : '';

  if (manual.mode === 'takeover') {
    return sanitizeProfile(manualText || BASE_PERSONA);
  }

  const base = BASE_PERSONA.trim();
  const manualBlock = manualText.length > 0 ? `## 手动补充\n${manualText}` : '';
  const portrait =
    state.deep?.portraitAccepted === true && state.deep?.portraitStale !== true && typeof state.deep?.portrait === 'string'
      ? state.deep.portrait.trim()
      : '';
  const portraitBlock = portrait.length > 0 ? `## 画像\n${portrait}` : '';
  const lines = ruleLines(state.rules);
  const rulesBlock = lines.length > 0 ? `## 说话方式\n${lines.join('\n').trim()}` : '';

  const fixed = [base, rulesBlock, portraitBlock, manualBlock].filter((item) => item.length > 0);
  const fixedLength = fixed.reduce((sum, item) => sum + item.length + 2, 0);

  if (fixedLength > MAX_PROFILE_CHARS) {
    // 手改优先；超长时只保留底座 + 手改。
    const fallback = [base, manualBlock].filter((item) => item.length > 0).join('\n\n');
    return sanitizeProfile(fallback);
  }

  if (rulesBlock.length === 0 && portraitBlock.length === 0 && manualBlock.length === 0) {
    return sanitizeProfile(`${base}\n\n## 说话方式\n目前还没有足够的语料；先用默认的直接、务实语气。`);
  }

  const budget = MAX_PROFILE_CHARS - fixedLength + rulesBlock.length;
  let trimmedRules = rulesBlock;
  if (trimmedRules.length > budget) {
    // 逐条移除最低置信度的规则，直到进预算。
    const byDimension = new Map(ORDER.map((id) => [id, []]));
    for (const rule of state.rules ?? []) {
      if (rule.enabled === false) continue;
      if (typeof rule.text !== 'string' || rule.text.trim().length === 0) continue;
      const dimension = byDimension.has(rule.dimension) ? rule.dimension : 'voice';
      byDimension.get(dimension).push(rule);
    }
    const all = [...byDimension.values()].flat().sort((left, right) => Number(right.confidence ?? 0.5) - Number(left.confidence ?? 0.5));
    const kept = [];
    let size = 0;
    for (const rule of all) {
      const cost = rule.text.trim().length + 3;
      if (size + cost > budget) continue;
      kept.push(rule);
      size += cost;
    }
    const keptLines = ruleLines(kept);
    trimmedRules = keptLines.length > 0 ? `## 说话方式\n${keptLines.join('\n').trim()}` : '';
  }

  const parts = [base];
  if (trimmedRules.length > 0) parts.push(trimmedRules);
  if (portraitBlock.length > 0) parts.push(portraitBlock);
  if (manualBlock.length > 0) parts.push(manualBlock);
  const result = parts.join('\n\n');
  return sanitizeProfile(result.length > MAX_PROFILE_CHARS ? result.slice(0, MAX_PROFILE_CHARS) : result);
}

/**
 * 编译并写入 profile.md。
 *
 * @param {object} state - 状态。
 * @param {object} store - createStore() 的返回值。
 * @returns {string} 写入的人格。
 */
export function compileToStore(state, store) {
  const text = compile(state);
  store.writeProfile(text);
  return text;
}

/** 给 UI 的规则分组。 */
export function groupRules(rules) {
  const groups = [];
  for (const dimension of DIMENSIONS) {
    const items = (rules ?? []).filter((rule) => rule.dimension === dimension.id);
    if (items.length > 0) groups.push({ id: dimension.id, label: dimension.label, rules: items });
  }
  return groups;
}
