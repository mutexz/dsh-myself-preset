/**
 * 人格文件的读写：预设作用域插件和宿主侧共用。
 *
 * 关键约束：prompt 变量必须永远返回非空文本。DSH 的 strict 插值在变量为
 * 空/未注册时会直接让整个 system prompt 组装失败，所以文件缺失、读失败、
 * 空文件、全空白都回到底座人设。
 *
 * @module dsh-myself-preset/persona
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { BASE_PERSONA, MAX_PROFILE_CHARS } from './schema.js';

/** 数据目录名。 */
export const DATA_DIR_NAME = 'myself-preset';

/**
 * 解析 DSH home：优先 profileContext，其次 DSH_HOME，最后 ~/.dsh。
 *
 * @param {object} [ctx] - 任意带 get() 的 Cordis 上下文。
 * @returns {string} 绝对路径。
 */
export function resolveHome(ctx) {
  try {
    const profile = ctx?.get?.('profileContext');
    if (profile !== undefined && typeof profile.home === 'string' && profile.home.length > 0) {
      return profile.home;
    }
  } catch {
    // 没有 profileContext 的上下文（例如单元测试）走下面的兜底。
  }
  const fromEnv = process.env.DSH_HOME;
  if (typeof fromEnv === 'string' && fromEnv.length > 0) return fromEnv;
  return join(homedir(), '.dsh');
}

/** 数据目录。 */
export function dataDir(home) {
  return join(home, DATA_DIR_NAME);
}

/** 人格文件路径。 */
export function profilePath(home) {
  return join(dataDir(home), 'profile.md');
}

/**
 * 清洗人格文本：清掉会和 prompt 变量语法冲突的 `{{`，裁到预算内。
 *
 * @param {string} text - 原始人格。
 * @returns {string} 非空、可安全插值的人格。
 */
export function sanitizeProfile(text) {
  let value = typeof text === 'string' ? text : '';
  value = value.replace(/\{\{/gu, '{ {').trim();
  if (value.length === 0) return BASE_PERSONA;
  if (value.length <= MAX_PROFILE_CHARS) return value;

  const head = value.slice(0, MAX_PROFILE_CHARS);
  const cutAt = Math.max(
    head.lastIndexOf('。'),
    head.lastIndexOf('！'),
    head.lastIndexOf('？'),
    head.lastIndexOf('\n'),
    head.lastIndexOf('. '),
  );
  const cut = cutAt > MAX_PROFILE_CHARS * 0.6 ? cutAt + 1 : MAX_PROFILE_CHARS;
  return `${value.slice(0, cut).trim()}\n（人格已截断）`;
}

/** 进程内 mtime 缓存：文件没变就不重读。 */
let cache = { path: '', mtimeMs: 0, size: -1, text: '' };

/**
 * 读取人格文件。永远返回非空文本。
 *
 * @param {string} home - DSH home。
 * @returns {string} 清洗后的人格。
 */
export function readProfileText(home) {
  const path = profilePath(home);
  try {
    if (!existsSync(path)) return BASE_PERSONA;
    const stat = statSync(path);
    if (cache.path === path && cache.mtimeMs === stat.mtimeMs && cache.size === stat.size) {
      return cache.text;
    }
    const text = sanitizeProfile(readFileSync(path, 'utf8'));
    cache = { path, mtimeMs: stat.mtimeMs, size: stat.size, text };
    return text;
  } catch {
    return BASE_PERSONA;
  }
}

/** 测试/诊断用：丢缓存。 */
export function clearProfileCache() {
  cache = { path: '', mtimeMs: 0, size: -1, text: '' };
}
