/**
 * 共享常量与默认状态。
 *
 * 这一层同时被宿主、preset 作用域插件和测试引用；不要在这里 import 任何
 * DSH 运行时，保持它可以在纯 Node 下跑。
 *
 * @module dsh-myself-preset/schema
 */

/** 人格的底座：风格可以换，干活的方式不换。 */
export const BASE_PERSONA = `你是一个由 DeepSeek Harness 驱动的协作 agent。你说话直接、务实，不奉承、不绕弯。先给结论，再补必要的边界条件；不确定就说不确定；有更好的方案就直接反驳。你只在验证过之后才声称事情完成。`;

/** 五个可解释维度。 */
export const DIMENSIONS = [
  { id: 'voice', label: '语气', weight: 0.25 },
  { id: 'rhythm', label: '节奏', weight: 0.2 },
  { id: 'lexicon', label: '用词', weight: 0.15 },
  { id: 'structure', label: '结构', weight: 0.1 },
  { id: 'scenario', label: '场景', weight: 0.1 },
];

/** 总体进度里“语料量”的权重（不与五维重复计分，单独一项）。 */
export const VOLUME_WEIGHT = 0.2;

/** 维度 id → 中文名。 */
export const DIMENSION_LABEL = Object.fromEntries(DIMENSIONS.map((item) => [item.id, item.label]));

/** 人格提示词上限。 */
export const MAX_PROFILE_CHARS = 6000;

/** 单次深读送入模型的最大字符数。 */
export const MAX_DEEP_CHARS = 20000;

/** 请求体上限。 */
export const MAX_BODY_BYTES = 2 * 1024 * 1024;

/**
 * 单条语料上限。
 *
 * 分析是 O(字数) 的同步计算，跑在宿主进程里；20k 字足够装一段文章，
 * 又能保证最坏情况下（100 条满额）不把事件循环卡住。
 */
export const MAX_ENTRY_CHARS = 20000;

/** 条目总数上限。老版本上限是 300，这里留出余量，避免升级后旧数据被锁死。 */
export const MAX_ENTRIES = 200;

/** 本地规则上限。 */
export const MAX_LOCAL_RULES = 12;

/** 深读规则上限。 */
export const MAX_DEEP_RULES = 8;

/** 100% 的门槛。 */
export const READY_THRESHOLD = 0.92;
export const READY_VOICE_THRESHOLD = 0.65;

/** 默认状态。 */
export function defaultState(now = Date.now()) {
  return {
    version: 1,
    createdAt: now,
    updatedAt: now,
    entries: [],
    rules: [],
    rulePrefs: {},
    manual: { text: '', mode: 'append' },
    deep: {
      job: null,
      runs: [],
      portrait: '',
      portraitAccepted: false,
      portraitStale: false,
    },
    settings: {
      provider: null,
      model: null,
      sendToModel: true,
      privacySeen: false,
    },
  };
}

/** 深读任务的初始状态。 */
export function pendingJob(now = Date.now()) {
  return {
    id: `job-${now.toString(36)}`,
    status: 'running',
    phase: '准备语料',
    startedAt: now,
    finishedAt: null,
    error: null,
    runId: null,
  };
}
