/**
 * preset 作用域插件：只做一件事——把 `myself_persona` 变量注册进当前 agent
 * 的 system prompt。
 *
 * 变量在每次组装时重新求值，所以页面里改完 profile.md，下一句话就生效。
 * 变量必须永远返回非空文本；readProfileText 已经保证这一点。
 *
 * @module dsh-myself-preset/preset
 */
import { readProfileText, resolveHome } from '../lib/persona.js';

/** Loader 行名。 */
export const name = 'myself-style';

/** 需要 prompt 注册表。 */
export const inject = ['systemPrompt'];

/**
 * 注册变量。
 *
 * @param {object} ctx - preset 作用域上下文。
 */
export function apply(ctx) {
  ctx.systemPrompt.variable('myself_persona', () => readProfileText(resolveHome(ctx)));
}
