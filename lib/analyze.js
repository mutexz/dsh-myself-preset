/**
 * 本地分析：可解释的统计规则 + 纠正 diff。
 *
 * 这里不调用模型。所有规则都带原文证据，页面能告诉用户“为什么学到这条”。
 * 深读负责语义层，本地负责硬约束和量化习惯。
 *
 * @module dsh-myself-preset/analyze
 */
import { createHash } from 'node:crypto';
import {
  DIMENSIONS,
  MAX_LOCAL_RULES,
  READY_THRESHOLD,
  READY_VOICE_THRESHOLD,
  VOLUME_WEIGHT,
} from './schema.js';

/** 中文虚词/高频词：做 n-gram 时过滤，避免“这个/然后/就是”占满口头禅。 */
const STOPWORDS = new Set([
  '的', '了', '是', '在', '我', '你', '他', '她', '它', '我们', '你们', '他们', '这', '那',
  '这个', '那个', '一个', '一下', '什么', '怎么', '因为', '所以', '但是', '不过', '然后',
  '就是', '可以', '没有', '不是', '还是', '已经', '自己', '现在', '时候', '如果', '这样',
  '那样', '这些', '那些', '以及', '还有', '而且', '或者', '虽然', '其实', '觉得', '知道',
  '应该', '需要', '可能', '比较', '非常', '真的', '很多', '一点', '一些', '东西', '事情',
  '问题', '方面', '情况', '地方', '感觉', '比如', '例如', '进行', '通过', '对于', '关于',
  '这种', '那种', '一种', '一样', '一直', '一定', '主要', '直接', '具体', '整个', '所有',
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'has', 'are', 'was', 'were',
  'will', 'would', 'can', 'could', 'should', 'about', 'into', 'over', 'your', 'you', 'our',
  'they', 'them', 'their', 'there', 'here', 'what', 'when', 'where', 'which', 'who', 'how',
  'not', 'but', 'just', 'very', 'really', 'also', 'more', 'most', 'some', 'any', 'all',
]);

/** 模糊词。 */
const HEDGES = ['可能', '大概', '也许', '或许', '似乎', '应该', '不一定', '差不多', '估计', '感觉'];
/** 断言词。 */
const ASSERTIVES = ['就是', '肯定', '一定', '直接', '别', '必须', '根本', '明确', '显然', '只能'];
/** 话语标记。 */
const DISCOURSE = ['其实', '不过', '所以', '然后', '就是说', '说白了', '反正', '讲真', '老实说', '我觉得', '你看', '对吧', '换句话说', '问题是'];
/** 起手式里要避开的公文词。 */
const BUREAU_OPENERS = ['首先', '其次', '最后', '关于', '随着', '在当今', '在当前', '在这个', '近年来', '众所周知'];
/** 客服式收尾。 */
const SERVICE_ENDINGS = ['希望对你有所帮助', '希望这个回答对你有帮助', '如果有任何疑问', '欢迎随时提问', '祝您工作愉快', '希望有帮助', '以上'];

/** AI 腔短语表。 */
export const SLOP_PHRASES = [
  '首先', '其次', '最后', '综上所述', '总而言之', '值得注意的是', '显而易见', '不可否认',
  '毋庸置疑', '双刃剑', '赋能', '抓手', '闭环', '矩阵', '护航', '底色', '画卷',
  '希望对你有所帮助', '希望这个回答对你有帮助', '如果有任何疑问', '欢迎随时提问',
  '祝您工作愉快', '让我们一起', '在数字化转型的浪潮中', '不仅仅是', '更是', '不单单',
  '同时也', '深入探讨', '接下来让我们', '一言以蔽之', '从某种意义上说', '众所周知',
  '毫无疑问', '在这个快节奏的时代', '需要指出的是', '总的来说', '简而言之', '正如你所见',
  '如你所见', '我们可以看到', '本文将', '下面我们将', '首先让我们', '最后但同样重要的是',
  'delve into', 'leverage', "it's worth noting", 'in conclusion', 'furthermore', 'moreover',
  'additionally', 'ultimately', 'at the end of the day', "in today's fast-paced world",
  'it is important to note', 'a testament to', 'navigate', 'landscape', 'realm', 'robust',
  'seamless', 'unlock', 'empower', 'elevate', 'game-changer', 'double-edged sword',
  'in summary', 'to sum up', 'firstly', 'secondly', 'lastly', 'hope this helps',
  'feel free to ask', 'happy to help',
];

/** 稳定短 id。 */
function shortHash(value) {
  return createHash('sha1').update(String(value)).digest('hex').slice(0, 10);
}

/** 生成一条本地规则。 */
function makeRule({ key, dimension, text, confidence = 0.6, evidence = [] }) {
  return {
    id: `r-${shortHash(key)}`,
    key,
    layer: 'local',
    dimension,
    text,
    confidence,
    evidence,
    enabled: true,
    createdAt: Date.now(),
  };
}

/** 统计一段文本。 */
function textStats(text) {
  const clean = String(text ?? '');
  const chars = clean.replace(/\s+/gu, '').length;
  const paragraphs = clean
    .split(/\n\s*\n/u)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  const sentences = splitSentences(clean);
  const lengths = sentences.map((item) => item.replace(/\s+/gu, '').length).filter((n) => n > 0);
  const sorted = [...lengths].sort((left, right) => left - right);
  const avg = lengths.length === 0 ? 0 : lengths.reduce((sum, n) => sum + n, 0) / lengths.length;
  const median = sorted.length === 0 ? 0 : sorted[Math.floor(sorted.length / 2)];
  const variance =
    lengths.length === 0
      ? 0
      : lengths.reduce((sum, n) => sum + (n - avg) ** 2, 0) / lengths.length;
  const stddev = Math.sqrt(variance);
  const short = lengths.filter((n) => n < 15).length;
  const long = lengths.filter((n) => n > 38).length;
  return {
    chars,
    paragraphs: paragraphs.length,
    sentences: sentences.length,
    lengths,
    avg,
    median,
    stddev,
    shortRatio: lengths.length === 0 ? 0 : short / lengths.length,
    longRatio: lengths.length === 0 ? 0 : long / lengths.length,
    max: lengths.length === 0 ? 0 : Math.max(...lengths),
  };
}

/** 切句：中文标点 + 换行；保留标点。 */
export function splitSentences(text) {
  return String(text ?? '')
    .replace(/\r\n/gu, '\n')
    .split(/(?<=[。！？!?…])\s*|\n+/u)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/** 统计标点。 */
function punctuationStats(text) {
  const clean = String(text ?? '');
  const total = Math.max(1, clean.replace(/\s+/gu, '').length);
  const map = {};
  for (const mark of ['，', '。', '！', '？', '、', '；', '：', '…', '—', '（', '）', '“', '”', '‘', '’', ',', '.', '!', '?', ';', ':', '-', '(', ')']) {
    const count = clean.split(mark).length - 1;
    if (count > 0) map[mark] = count;
  }
  const per1000 = (mark) => ((map[mark] ?? 0) / total) * 1000;
  return {
    counts: map,
    comma: per1000('，') + per1000(','),
    period: per1000('。') + per1000('.'),
    question: per1000('？') + per1000('?'),
    exclaim: per1000('！') + per1000('!'),
    ellipsis: per1000('…'),
    dash: per1000('—') + per1000('-'),
    paren: per1000('（') + per1000('('),
    colon: per1000('：') + per1000(':'),
  };
}

/** 结构统计。 */
function structureStats(text) {
  const clean = String(text ?? '');
  const lines = clean.split('\n');
  const listLines = lines.filter((line) => /^\s*(?:[-*+]|\d+[.)])\s+/u.test(line)).length;
  const headingLines = lines.filter((line) => /^\s*#{1,6}\s+/u.test(line)).length;
  const codeBlocks = Math.floor((clean.match(/```/gu) ?? []).length / 2);
  const tableRows = lines.filter((line) => /^\s*\|.*\|\s*$/u.test(line)).length;
  const blankRuns = (clean.match(/\n\s*\n/gu) ?? []).length;
  return {
    listLines,
    headingLines,
    codeBlocks,
    tableRows,
    blankRuns,
    kinds:
      Number(listLines > 0) +
      Number(headingLines > 0) +
      Number(codeBlocks > 0) +
      Number(tableRows > 0) +
      Number(blankRuns > 0),
  };
}

/** 计数一个词（英文大小写不敏感）。 */
function countPhrase(text, phrase) {
  const source = String(text ?? '').toLowerCase();
  const needle = phrase.toLowerCase();
  if (needle.length === 0) return 0;
  let count = 0;
  let from = 0;
  while (from <= source.length) {
    const at = source.indexOf(needle, from);
    if (at < 0) break;
    count += 1;
    from = at + needle.length;
  }
  return count;
}

/** 取短语附近的一句引用。 */
function quoteAround(text, phrase, max = 40) {
  const source = String(text ?? '');
  const at = source.toLowerCase().indexOf(phrase.toLowerCase());
  if (at < 0) return source.slice(0, max);
  const start = Math.max(0, at - 12);
  return source.slice(start, Math.min(source.length, start + max)).replace(/\s+/gu, ' ').trim();
}

/** 高频 n-gram / 英文词。 */
function ngramStats(documents) {
  const counts = new Map();
  const docSets = new Map();
  const english = new Map();
  const allGrams = new Set();
  documents.forEach((document) => {
    const text = document.text;
    const seen = new Set();
    for (let size = 2; size <= 4; size += 1) {
      for (let index = 0; index + size <= text.length; index += 1) {
        const gram = text.slice(index, index + size);
        if (!/^[\u4e00-\u9fff]+$/u.test(gram)) continue;
        if (STOPWORDS.has(gram)) continue;
        counts.set(gram, (counts.get(gram) ?? 0) + 1);
        allGrams.add(gram);
        seen.add(gram);
      }
    }
    for (const gram of seen) {
      if (!docSets.has(gram)) docSets.set(gram, new Set());
      docSets.get(gram).add(document.id);
    }
    const words = text.toLowerCase().match(/[a-z][a-z'-]{2,}/gu) ?? [];
    for (const word of words) {
      if (STOPWORDS.has(word)) continue;
      english.set(word, (english.get(word) ?? 0) + 1);
    }
  });
  const candidates = [...counts.entries()]
    .filter(([gram, count]) => count >= 2 && (docSets.get(gram)?.size ?? 0) >= 2)
    .map(([gram, count]) => ({ gram, count, docs: docSets.get(gram).size }))
    .sort((left, right) => right.count * right.gram.length - left.count * left.gram.length)
    .slice(0, 8);
  const englishTop = [...english.entries()]
    .filter(([, count]) => count >= 2)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([word]) => word);
  return { candidates, englishTop, unique: allGrams.size, englishUnique: english.size };
}

/** 取高频开头/结尾。 */
function edgePatterns(documents) {
  const openers = new Map();
  const enders = new Map();
  for (const document of documents) {
    const paragraphs = document.text.split(/\n\s*\n/u).map((item) => item.trim()).filter(Boolean);
    for (const paragraph of paragraphs) {
      const sentences = splitSentences(paragraph);
      if (sentences.length === 0) continue;
      const first = sentences[0].replace(/\s+/gu, '');
      const last = sentences[sentences.length - 1].replace(/\s+/gu, '');
      if (first.length >= 2) {
        const key = first.slice(0, 4);
        openers.set(key, (openers.get(key) ?? 0) + 1);
      }
      if (last.length >= 3) {
        const key = last.slice(-6);
        enders.set(key, (enders.get(key) ?? 0) + 1);
      }
    }
  }
  const top = (map, limit) =>
    [...map.entries()].filter(([, count]) => count >= 2).sort((left, right) => right[1] - left[1]).slice(0, limit).map(([key, count]) => ({ key, count }));
  return { openers: top(openers, 3), enders: top(enders, 3) };
}

/** 简单 LCS diff。 */
function lcsDiff(left, right) {
  const a = Array.from(left);
  const b = Array.from(right);
  if (a.length === 0) return b.map((value) => ({ type: 'insert', value }));
  if (b.length === 0) return a.map((value) => ({ type: 'delete', value }));
  if (a.length * b.length > 40000) {
    // 长文本降级：只保留首尾相同的部分。
    let prefix = 0;
    while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix += 1;
    let suffix = 0;
    while (suffix < a.length - prefix && suffix < b.length - prefix && a[a.length - 1 - suffix] === b[b.length - 1 - suffix]) suffix += 1;
    const ops = [];
    ops.push(...a.slice(0, prefix).map((value) => ({ type: 'equal', value })));
    ops.push(...a.slice(prefix, a.length - suffix).map((value) => ({ type: 'delete', value })));
    ops.push(...b.slice(prefix, b.length - suffix).map((value) => ({ type: 'insert', value })));
    ops.push(...a.slice(a.length - suffix).map((value) => ({ type: 'equal', value })));
    return ops;
  }
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ops = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      ops.push({ type: 'equal', value: a[i] });
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: 'delete', value: a[i] });
      i += 1;
    } else {
      ops.push({ type: 'insert', value: b[j] });
      j += 1;
    }
  }
  while (i < a.length) {
    ops.push({ type: 'delete', value: a[i] });
    i += 1;
  }
  while (j < b.length) {
    ops.push({ type: 'insert', value: b[j] });
    j += 1;
  }
  return ops;
}

/** 从 diff 里提取被删/新增的短语。 */
function diffPhrases(original, revised) {
  const ops = lcsDiff(original, revised);
  const deleted = [];
  const added = [];
  let buffer = '';
  let type = '';
  const flush = () => {
    const text = buffer.trim();
    if (text.length >= 2 && text.length <= 60) {
      if (type === 'delete') deleted.push(text);
      if (type === 'insert') added.push(text);
    }
    buffer = '';
  };
  for (const op of ops) {
    if (op.type === 'equal') {
      flush();
      type = '';
    } else {
      if (type !== '' && type !== op.type) flush();
      type = op.type;
      buffer += op.value;
    }
  }
  flush();
  return { deleted, added, ops };
}

/** 分析一条纠正样本。 */
export function analyzeCorrection(entry) {
  const original = String(entry.original ?? '');
  const revised = String(entry.revised ?? '');
  const before = textStats(original);
  const after = textStats(revised);
  const beforeStructure = structureStats(original);
  const afterStructure = structureStats(revised);
  const { deleted, added } = diffPhrases(original, revised);
  const deletedSlop = SLOP_PHRASES.filter((phrase) => countPhrase(original, phrase) > 0 && countPhrase(revised, phrase) === 0);
  const movedOpening = BUREAU_OPENERS.some((phrase) => original.includes(phrase)) && !BUREAU_OPENERS.some((phrase) => revised.includes(phrase));
  const removedClosing = SERVICE_ENDINGS.some((phrase) => original.includes(phrase)) && !SERVICE_ENDINGS.some((phrase) => revised.includes(phrase));
  const shortened = revised.length > 0 && revised.length < original.length * 0.78;
  const splitSentences = after.sentences > before.sentences && after.avg < before.avg;
  const removedLists = beforeStructure.listLines > afterStructure.listLines;
  const addedQuestion = countPhrase(revised, '？') + countPhrase(revised, '?') > countPhrase(original, '？') + countPhrase(original, '?');
  const addedDirective = ['我建议', '直接', '别', '不要', '必须'].some((word) => countPhrase(revised, word) > countPhrase(original, word));
  const addedDiscourse = DISCOURSE.some((word) => countPhrase(revised, word) > countPhrase(original, word));

  const signals = [];
  const rules = [];
  const evidence = [{ entryId: entry.id, quote: (revised || original).slice(0, 80) }];
  const push = (key, dimension, text, confidence, detail) => {
    signals.push({ key, label: detail });
    rules.push(makeRule({ key: `correction:${key}`, dimension, text, confidence, evidence }));
  };

  if (deletedSlop.length > 0) {
    push(
      'slop',
      'lexicon',
      `避免「${deletedSlop.slice(0, 4).join('」「')}」这类词。`,
      0.82,
      `删掉了 ${deletedSlop.slice(0, 3).join('、')}`,
    );
  }
  if (movedOpening) {
    push('opening', 'structure', '别用“首先/关于/随着”起手；先给结论或判断。', 0.78, '换了开头');
  }
  if (removedClosing) {
    push('closing', 'structure', '不要客服式结尾；说完就停。', 0.82, '删了结尾客套');
  }
  if (shortened) {
    push('shorten', 'rhythm', '删掉铺垫，先把结论放前面。', 0.72, `篇幅缩短 ${Math.round((1 - revised.length / Math.max(1, original.length)) * 100)}%`);
  }
  if (splitSentences) {
    push('split', 'rhythm', '长句拆短，一句一个意思。', 0.7, '句数变多、句长变短');
  }
  if (removedLists) {
    push('lists', 'structure', '少用列表，改成自然段。', 0.66, '列表改成了段落');
  }
  if (addedQuestion) {
    push('question', 'voice', '不确定时直接反问，不要绕。', 0.68, '加了问句');
  }
  if (addedDirective) {
    push('directive', 'voice', '给倾向性建议，别和稀泥。', 0.72, '加了明确判断');
  }
  if (addedDiscourse) {
    push('discourse', 'voice', '用口语连接词（其实/不过/所以），别用公文过渡。', 0.62, '加了口语连接词');
  }
  if (deleted.length > 0 && added.length > 0) {
    const detail = `删“${deleted[0]}” → 改“${added[0]}”`;
    signals.push({ key: 'rewrite', label: detail });
  }

  return {
    diff: {
      originalChars: original.length,
      revisedChars: revised.length,
      lengthDelta: revised.length - original.length,
      deleted: deleted.slice(0, 8),
      added: added.slice(0, 8),
    },
    signals,
    rules,
  };
}

/**
 * 分析全部条目：返回指标 + 本地规则。
 *
 * @param {Array<object>} entries - 条目。
 * @returns {{metrics: object, rules: Array<object>}}
 */
export function analyzeEntries(entries) {
  const list = Array.isArray(entries) ? entries : [];
  const documents = [];
  for (const entry of list) {
    if (entry.type === 'corpus' && typeof entry.text === 'string' && entry.text.trim().length > 0) {
      documents.push({ id: entry.id, text: entry.text });
    }
    if (entry.type === 'correction') {
      const revised = typeof entry.revised === 'string' ? entry.revised : entry.text;
      if (typeof revised === 'string' && revised.trim().length > 0) {
        documents.push({ id: entry.id, text: revised });
      }
    }
  }

  const combined = documents.map((document) => document.text).join('\n\n');
  const stats = textStats(combined);
  const punctuation = punctuationStats(combined);
  const structure = structureStats(combined);
  const ngrams = ngramStats(documents);
  const edges = edgePatterns(documents);
  const slopCounts = SLOP_PHRASES.map((phrase) => ({ phrase, count: countPhrase(combined, phrase) })).filter((item) => item.count > 0);
  const hedgeCount = HEDGES.reduce((sum, word) => sum + countPhrase(combined, word), 0);
  const assertiveCount = ASSERTIVES.reduce((sum, word) => sum + countPhrase(combined, word), 0);
  const discourseCount = DISCOURSE.reduce((sum, word) => sum + countPhrase(combined, word), 0);
  const firstPerson = countPhrase(combined, '我') - countPhrase(combined, '我们');
  const secondPerson = countPhrase(combined, '你') - countPhrase(combined, '你们');
  const emojiCount = (combined.match(/\p{Extended_Pictographic}/gu) ?? []).length;
  const englishWords = (combined.match(/[A-Za-z]{2,}/gu) ?? []).length;
  const corrections = list.filter((entry) => entry.type === 'correction');
  const corpusEntries = list.filter((entry) => entry.type === 'corpus');

  const rules = [];
  const firstEvidence = documents.length > 0 ? [{ entryId: documents[0].id, quote: documents[0].text.slice(0, 80) }] : [];

  if (documents.length > 0 && stats.sentences > 0) {
    if (stats.avg < 18) {
      rules.push(makeRule({
        key: 'rhythm:sentence-short',
        dimension: 'rhythm',
        text: `句子偏短（平均 ${Math.round(stats.avg)} 字）；继续保持，一句一个意思。`,
        confidence: 0.7,
        evidence: firstEvidence,
      }));
    } else if (stats.avg > 38) {
      rules.push(makeRule({
        key: 'rhythm:sentence-long',
        dimension: 'rhythm',
        text: `句子偏长（平均 ${Math.round(stats.avg)} 字）；先把结论拆出来，再补解释。`,
        confidence: 0.72,
        evidence: firstEvidence,
      }));
    } else {
      rules.push(makeRule({
        key: 'rhythm:sentence-medium',
        dimension: 'rhythm',
        text: `句长平均 ${Math.round(stats.avg)} 字，节奏适中；保持长短交替。`,
        confidence: 0.5,
        evidence: firstEvidence,
      }));
    }
  }

  if (stats.sentences >= 8) {
    if (punctuation.question > 8) {
      rules.push(makeRule({
        key: 'voice:question',
        dimension: 'voice',
        text: '你习惯用问句推进；保留这个动作，别把反问全改成陈述。',
        confidence: 0.62,
        evidence: firstEvidence,
      }));
    } else if (punctuation.question < 1) {
      rules.push(makeRule({
        key: 'voice:no-question',
        dimension: 'voice',
        text: '几乎不用问句；不确定时可以直接反问，不要绕。',
        confidence: 0.58,
        evidence: firstEvidence,
      }));
    }
  }

  if (structure.listLines > 0 && structure.listLines / Math.max(1, stats.sentences) > 0.12) {
    rules.push(makeRule({
      key: 'structure:lists',
      dimension: 'structure',
      text: '列表用得偏多；信息不是严格并列时，优先自然段。',
      confidence: 0.62,
      evidence: firstEvidence,
    }));
  } else if (documents.length > 0) {
    rules.push(makeRule({
      key: 'structure:prose',
      dimension: 'structure',
      text: '几乎不用列表；保持自然段推进。',
      confidence: 0.48,
      evidence: firstEvidence,
    }));
  }

  if (hedgeCount > 0 || assertiveCount > 0) {
    if (hedgeCount > assertiveCount * 1.5) {
      rules.push(makeRule({
        key: 'voice:hedged',
        dimension: 'voice',
        text: '模糊词多于断言；不确定时保留，但该下判断时别软化。',
        confidence: 0.6,
        evidence: firstEvidence,
      }));
    } else if (assertiveCount > hedgeCount * 2) {
      rules.push(makeRule({
        key: 'voice:assertive',
        dimension: 'voice',
        text: '断言词明显多于模糊词；继续保持“直接给判断”，但别把不确定说满。',
        confidence: 0.62,
        evidence: firstEvidence,
      }));
    }
  }

  if (edges.openers.length > 0) {
    rules.push(makeRule({
      key: 'structure:openers',
      dimension: 'structure',
      text: `常用起手式：${edges.openers.map((item) => item.key).join('、')}；延续这种开头，别用“首先/关于/随着”。`,
      confidence: 0.56,
      evidence: firstEvidence,
    }));
  }

  if (edges.enders.length > 0) {
    rules.push(makeRule({
      key: 'structure:enders',
      dimension: 'structure',
      text: `常用收尾：${edges.enders.map((item) => item.key).join('、')}；避免客服式结尾。`,
      confidence: 0.52,
      evidence: firstEvidence,
    }));
  }

  if (slopCounts.length > 0) {
    const phrases = slopCounts.sort((left, right) => right.count - left.count).slice(0, 3).map((item) => item.phrase);
    rules.push(makeRule({
      key: 'lexicon:slop',
      dimension: 'lexicon',
      text: `语料里出现 AI 腔短语：${phrases.join('、')}；写作时避开。`,
      confidence: 0.74,
      evidence: firstEvidence,
    }));
  }

  if (firstPerson > 2) {
    rules.push(makeRule({
      key: 'voice:first-person',
      dimension: 'voice',
      text: '第一人称用得多；直接讲自己的判断，别用“笔者认为”这类壳。',
      confidence: 0.5,
      evidence: firstEvidence,
    }));
  }

  if (emojiCount === 0 && documents.length > 0) {
    rules.push(makeRule({
      key: 'lexicon:no-emoji',
      dimension: 'lexicon',
      text: '不用 emoji；保持纯文字。',
      confidence: 0.58,
      evidence: firstEvidence,
    }));
  }

  for (const entry of corrections) {
    const correction = analyzeCorrection(entry);
    rules.push(...correction.rules);
  }

  // 去重 + 限制条数。
  const seen = new Set();
  const deduped = [];
  for (const rule of rules) {
    if (seen.has(rule.key)) continue;
    seen.add(rule.key);
    deduped.push(rule);
  }
  const sliced = deduped
    .sort((left, right) => right.confidence - left.confidence)
    .slice(0, MAX_LOCAL_RULES);

  const metrics = {
    documents: documents.length,
    corpusEntries: corpusEntries.length,
    corrections: corrections.length,
    chars: stats.chars,
    sentences: stats.sentences,
    paragraphs: stats.paragraphs,
    avgSentence: Number(stats.avg.toFixed(1)),
    medianSentence: Number(stats.median.toFixed(1)),
    sentenceStddev: Number(stats.stddev.toFixed(1)),
    shortRatio: Number(stats.shortRatio.toFixed(2)),
    longRatio: Number(stats.longRatio.toFixed(2)),
    punctuation,
    structure,
    ngrams: ngrams.candidates,
    englishTop: ngrams.englishTop,
    uniqueNgrams: ngrams.unique,
    englishUnique: ngrams.englishUnique,
    openers: edges.openers,
    enders: edges.enders,
    slop: slopCounts,
    hedges: hedgeCount,
    assertives: assertiveCount,
    discourse: discourseCount,
    firstPerson,
    secondPerson,
    emojiCount,
    englishWords,
  };

  return { metrics, rules: sliced };
}

/**
 * 合并本地规则与已有规则：保留手改/深读规则，按 rulePrefs 应用开关。
 *
 * @param {object} state - 状态。
 * @param {Array<object>} localRules - 新生成的本地规则。
 * @returns {Array<object>} 合并后的规则。
 */
export function mergeRules(state, localRules) {
  const nonLocal = (state.rules ?? []).filter((rule) => rule.layer !== 'local');
  const prefs = state.rulePrefs ?? {};
  const locals = [];
  for (const rule of localRules) {
    const pref = prefs[rule.key] ?? {};
    if (pref.deleted === true) continue;
    const enabled = pref.enabled ?? true;
    const text = typeof pref.text === 'string' && pref.text.trim().length > 0 ? pref.text : rule.text;
    locals.push({ ...rule, text, enabled });
  }
  locals.sort((left, right) => right.confidence - left.confidence);
  return [...nonLocal, ...locals.slice(0, MAX_LOCAL_RULES)];
}

/** 统计指标缓存：只缓存纯统计结果，规则仍然每次重算。 */
let metricsCache = { key: '', value: null };

/** 条目签名：id、类型、字数、时间；任何增删改都会换 key。 */
function metricsKey(entries) {
  const hash = createHash('sha1');
  for (const entry of Array.isArray(entries) ? entries : []) {
    hash.update(
      `${entry.id}\u0000${entry.type}\u0000${entry.chars}\u0000${entry.createdAt}\u0000${String(entry.text ?? '').length}\u0000${String(entry.revised ?? '').length}\n`,
    );
  }
  return hash.digest('hex');
}

/** 读统计指标；同一批条目只算一次。 */
function metricsFor(entries) {
  const key = metricsKey(entries);
  if (metricsCache.key === key && metricsCache.value !== null) return metricsCache.value;
  const { metrics } = analyzeEntries(entries);
  metricsCache = { key, value: metrics };
  return metrics;
}

/**
 * 计算进度。
 *
 * @param {object} state - 状态。
 * @returns {object} 页面用的进度对象。
 */
export function computeProgress(state) {
  const metrics = metricsFor(state.entries);
  const volume = 1 - Math.exp(-metrics.chars / 6000);
  const rhythmQuality = metrics.sentences === 0 ? 0 : Math.min(1, 0.55 + Math.min(1, metrics.sentenceStddev / 14) * 0.45);
  const rhythm = Math.min(1, metrics.sentences / 120) * rhythmQuality;
  const lexicon = Math.min(1, (metrics.uniqueNgrams + metrics.englishUnique * 2) / 600);
  const markerDiversity = Math.min(
    1,
    ((metrics.discourse > 0 ? 1 : 0) +
      (metrics.hedges > 0 ? 1 : 0) +
      (metrics.assertives > 0 ? 1 : 0) +
      (metrics.firstPerson > 0 ? 1 : 0)) /
      4,
  );
  const voice = 0.7 * (1 - Math.exp(-metrics.corrections / 4)) + 0.3 * markerDiversity;
  const structure = Math.min(1, metrics.structure.kinds / 5);
  const scenario = Math.min(1, metrics.documents / 6);
  const overall =
    volume * VOLUME_WEIGHT +
    voice * DIMENSIONS.find((item) => item.id === 'voice').weight +
    rhythm * DIMENSIONS.find((item) => item.id === 'rhythm').weight +
    lexicon * DIMENSIONS.find((item) => item.id === 'lexicon').weight +
    structure * DIMENSIONS.find((item) => item.id === 'structure').weight +
    scenario * DIMENSIONS.find((item) => item.id === 'scenario').weight;
  const ready = overall >= READY_THRESHOLD && voice >= READY_VOICE_THRESHOLD;
  const displayOverall = ready ? 1 : Math.min(0.999, overall);
  const deepRuns = (state.deep?.runs ?? []).filter((run) => run.status !== 'rejected').length;
  const refinement = ready ? Number((Math.log1p(metrics.chars / 1000) + deepRuns * 0.5).toFixed(1)) : 0;

  const dimensions = [
    { id: 'voice', label: '语气', value: Math.round(voice * 100) },
    { id: 'rhythm', label: '节奏', value: Math.round(rhythm * 100) },
    { id: 'lexicon', label: '用词', value: Math.round(lexicon * 100) },
    { id: 'structure', label: '结构', value: Math.round(structure * 100) },
    { id: 'scenario', label: '场景', value: Math.round(scenario * 100) },
  ];

  const hints = [];
  if (ready) {
    hints.push('第一版已成形，可以继续精炼。');
  } else {
    if (voice < READY_VOICE_THRESHOLD) hints.push('再补 2–3 段“AI 原稿 → 你的改写”。');
    if (metrics.documents < 6) hints.push(`再喂 ${Math.max(1, 6 - metrics.documents)} 段不同场景的语料。`);
    if (volume < 0.7) hints.push(`再喂约 ${Math.max(300, Math.round(-Math.log(0.3) * 6000 - metrics.chars))} 字。`);
    if (hints.length === 0) hints.push('可以点“深读”，让模型读一遍。');
  }

  return {
    overall: Number(displayOverall.toFixed(4)),
    percent: Math.round(displayOverall * 100),
    rawOverall: Number(overall.toFixed(4)),
    ready,
    refinement,
    dimensions,
    hints: hints.slice(0, 2),
    chars: metrics.chars,
    documents: metrics.documents,
    corrections: metrics.corrections,
    sentences: metrics.sentences,
    avgSentence: metrics.avgSentence,
    deepRuns,
    metrics,
  };
}

/** 手改规则的维度推断。 */
export function inferManualDimension(text) {
  const value = String(text ?? '');
  if (/句|长|短|节奏|停顿/u.test(value)) return 'rhythm';
  if (/词|说|别用|不要用|措辞/u.test(value)) return 'lexicon';
  if (/列表|段|结构|开头|结尾|标题/u.test(value)) return 'structure';
  if (/场景|对谁|客户|同事/u.test(value)) return 'scenario';
  return 'voice';
}

/** 重写画像用的本地摘要（深读画像过期时）。 */
export function localPortrait(rules) {
  const deepRules = (rules ?? []).filter((rule) => rule.layer === 'deep' && rule.enabled !== false);
  if (deepRules.length === 0) return '';
  const byDimension = new Map();
  for (const rule of deepRules) {
    if (!byDimension.has(rule.dimension)) byDimension.set(rule.dimension, []);
    byDimension.get(rule.dimension).push(rule.text);
  }
  const labels = { voice: '语气与立场', rhythm: '句式与节奏', lexicon: '用词', structure: '结构', scenario: '场景' };
  const lines = [];
  for (const [dimension, texts] of byDimension) {
    lines.push(`### ${labels[dimension] ?? dimension}\n${texts.map((text) => `- ${text}`).join('\n')}`);
  }
  return `以下是从语料和纠正里确认过的说话习惯。\n\n${lines.join('\n\n')}`;
}
