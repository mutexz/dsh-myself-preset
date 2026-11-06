/**
 * 本地文件存储：state.json + profile.md + 备份。
 *
 * 所有写入走临时文件 + rename；进程内用一条 Promise 队列串行化，避免深读
 * 任务和页面投喂同时写坏 state。
 *
 * @module dsh-myself-preset/store
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { BASE_PERSONA, MAX_PROFILE_CHARS, defaultState } from './schema.js';
import { dataDir, profilePath, sanitizeProfile } from './persona.js';

/** 备份保留数量。 */
const MAX_BACKUPS = 20;

/** 深读历史保留数量。 */
const MAX_DEEP_RUNS = 10;

/**
 * 创建 store。
 *
 * @param {string} home - DSH home。
 */
export function createStore(home) {
  const root = dataDir(home);
  const statePath = join(root, 'state.json');
  const profileFile = profilePath(home);
  const backupDir = join(root, 'backups');
  let queue = Promise.resolve();

  function ensure() {
    mkdirSync(root, { recursive: true });
    mkdirSync(backupDir, { recursive: true });
  }

  function atomicWrite(path, text) {
    const tmp = join(dirname(path), `.${randomUUID()}.tmp`);
    writeFileSync(tmp, text, 'utf8');
    renameSync(tmp, path);
  }

  function normalize(raw) {
    const base = defaultState();
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return base;
    const state = {
      ...base,
      ...raw,
      entries: Array.isArray(raw.entries) ? raw.entries : [],
      rules: Array.isArray(raw.rules) ? raw.rules : [],
      rulePrefs: raw.rulePrefs !== null && typeof raw.rulePrefs === 'object' ? raw.rulePrefs : {},
      manual: {
        text: typeof raw.manual?.text === 'string' ? raw.manual.text : '',
        mode: raw.manual?.mode === 'takeover' ? 'takeover' : 'append',
      },
      deep: {
        job: raw.deep?.job ?? null,
        runs: Array.isArray(raw.deep?.runs) ? raw.deep.runs : [],
        portrait: typeof raw.deep?.portrait === 'string' ? raw.deep.portrait : '',
        portraitAccepted: raw.deep?.portraitAccepted === true,
        portraitStale: raw.deep?.portraitStale === true,
      },
      settings: {
        provider: typeof raw.settings?.provider === 'string' ? raw.settings.provider : null,
        model: typeof raw.settings?.model === 'string' ? raw.settings.model : null,
        sendToModel: raw.settings?.sendToModel !== false,
        privacySeen: raw.settings?.privacySeen === true,
      },
    };
    return state;
  }

  /**
   * 读取状态。损坏时把原文件改名留证，再回到默认状态。
   *
   * @returns {object} 状态。
   */
  function load() {
    ensure();
    if (!existsSync(statePath)) {
      const state = defaultState();
      atomicWrite(statePath, JSON.stringify(state, null, 2));
      return state;
    }
    try {
      const raw = JSON.parse(readFileSync(statePath, 'utf8'));
      const state = normalize(raw);
      return state;
    } catch {
      try {
        renameSync(statePath, `${statePath}.corrupt-${Date.now()}`);
      } catch {
        // 留证失败不影响恢复。
      }
      const state = defaultState();
      atomicWrite(statePath, JSON.stringify(state, null, 2));
      return state;
    }
  }

  /**
   * 保存状态。
   *
   * @param {object} state - 状态。
   * @returns {object} 保存后的状态（updatedAt 已更新）。
   */
  function save(state) {
    ensure();
    state.updatedAt = Date.now();
    state.deep.runs = state.deep.runs.slice(0, MAX_DEEP_RUNS);
    atomicWrite(statePath, JSON.stringify(state, null, 2));
    return state;
  }

  /** 串行化一次读改写。 */
  function mutate(fn) {
    const run = queue.then(async () => {
      const state = load();
      const result = await fn(state);
      const saved = result?.state ?? state;
      save(saved);
      return result ?? { state: saved };
    });
    queue = run.catch(() => {});
    return run;
  }

  /**
   * 编译后写 profile.md；内容没变就不动 mtime。
   *
   * @param {string} text - 编译后的人格。
   */
  function writeProfile(text) {
    ensure();
    const next = sanitizeProfile(text);
    let current = '';
    try {
      current = readFileSync(profileFile, 'utf8');
    } catch {
      current = '';
    }
    if (current === next) return next;
    if (current.trim().length > 0) backupProfile(current);
    atomicWrite(profileFile, next);
    return next;
  }

  /** 备份当前人格，最多 20 份。 */
  function backupProfile(current = '') {
    ensure();
    try {
      const stamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-');
      writeFileSync(join(backupDir, `profile-${stamp}.md`), current, 'utf8');
      const files = readdirSync(backupDir)
        .filter((name) => name.startsWith('profile-') && name.endsWith('.md'))
        .map((name) => ({ name, mtime: statSync(join(backupDir, name)).mtimeMs }))
        .sort((left, right) => right.mtime - left.mtime);
      for (const stale of files.slice(MAX_BACKUPS)) {
        rmSync(join(backupDir, stale.name), { force: true });
      }
    } catch {
      // 备份是加分项，失败不阻塞保存。
    }
  }

  /** 读取当前人格；缺失时回到底座。 */
  function readProfile() {
    try {
      const text = readFileSync(profileFile, 'utf8');
      return text.trim().length > 0 ? text : BASE_PERSONA;
    } catch {
      return BASE_PERSONA;
    }
  }

  /** 启动时把上次没跑完的深读标记为中断；只在新进程启动时调用。 */
  function markStaleJob() {
    const state = load();
    if (state.deep.job?.status !== 'running') return state;
    state.deep.job = {
      ...state.deep.job,
      status: 'error',
      phase: '已中断',
      error: '上次深读没有跑完（进程退出）。',
      finishedAt: Date.now(),
    };
    save(state);
    return state;
  }

  /** 清空所有数据；profile.md 回到空（下次编译写底座）。 */
  function reset() {
    ensure();
    const state = defaultState();
    atomicWrite(statePath, JSON.stringify(state, null, 2));
    try {
      atomicWrite(profileFile, BASE_PERSONA);
    } catch {
      // 忽略。
    }
    return state;
  }

  /** 导出可读 JSON。 */
  function exportAll() {
    const state = load();
    return {
      exportedAt: new Date().toISOString(),
      state,
      profile: readProfile(),
    };
  }

  return {
    root,
    statePath,
    profilePath: profileFile,
    backupDir,
    ensure,
    load,
    save,
    mutate,
    writeProfile,
    readProfile,
    markStaleJob,
    reset,
    exportAll,
  };
}

/** 诊断用：检查数据目录是否可读。 */
export function probe(home) {
  try {
    return existsSync(dataDir(home));
  } catch {
    return false;
  }
}

/** 测试用：写入一个任意 profile（不经过 store）。 */
export function debugWriteProfile(home, text) {
  const path = profilePath(home);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, sanitizeProfile(text), 'utf8');
}

/** 测试用：清空目录。 */
export function debugRemove(home) {
  rmSync(dataDir(home), { recursive: true, force: true });
}

/** 常量再导出，方便测试。 */
export { MAX_PROFILE_CHARS };
