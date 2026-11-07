import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeEntries, analyzeCorrection, computeProgress, mergeRules } from '../lib/analyze.js';
import { defaultState } from '../lib/schema.js';

const corpusA = `直接选 Redis 就行。现在基本没有单独引入 Memcached 的理由了，除非你只是单纯做超大并发的极简 Key-Value 缓存，且极度在意多线程模型。Redis 数据结构丰富，社区也成熟得多，后续要做计数器、分布式锁都能复用。Memcached 的运维成本不会更低，只是把复杂度换了个地方放。如果 QPS 真到了需要拆缓存层的量级，再考虑多级缓存，不要在第一步就把架构做重。`;
const corpusB = `先说结论：这版先别上微服务。你们的团队规模还撑不起十几套部署和链路追踪。先把单体里的边界切清楚，把日志和指标补齐，等到真的有一个模块需要独立扩容，再拆。拆不是目的，降低变更成本才是。`;
const corpusC = `我会先看失败路径，而不是成功路径。一个方案能不能上线，通常不取决于它顺的时候多顺，而取决于它坏的时候会不会把整条链路拖死。所以我会先问：超时怎么办，重试会不会放大，降级之后用户看到什么。`;
const original = `首先，关于 Redis 和 Memcached 的选择，我们需要从多个方面进行综合考虑。其次，Redis 支持丰富的数据结构，而 Memcached 更专注于简单的键值缓存。最后，希望这个回答对您有所帮助，如果有任何疑问，欢迎随时提问。`;
const revised = `直接选 Redis。Memcached 现在没必要，除非你只做极简 KV 且非常在意多线程模型。Redis 的数据结构更多，后面做计数器、分布式锁都能复用。`;
const entries = [
  { id: 'a', type: 'corpus', title: 'A', text: corpusA },
  { id: 'b', type: 'corpus', title: 'B', text: corpusB },
  { id: 'c', type: 'corpus', title: 'C', text: corpusC },
  { id: 'd', type: 'correction', title: 'D', text: revised, original, revised },
  { id: 'e', type: 'correction', title: 'E', text: revised, original, revised },
];

test('analyzeEntries returns metrics and rules', () => {
  const { metrics, rules } = analyzeEntries(entries);
  assert.ok(metrics.chars > 300);
  assert.ok(metrics.sentences > 10);
  assert.ok(rules.length >= 3);
  assert.ok(rules.every((rule) => rule.evidence.length > 0));
  assert.ok(metrics.uniqueNgrams > 10);
});

test('correction diff extracts slop and structure signals', () => {
  const analysis = analyzeCorrection(entries[3]);
  assert.ok(analysis.signals.some((signal) => signal.key === 'slop'));
  assert.ok(analysis.signals.some((signal) => signal.key === 'closing'));
  assert.ok(analysis.rules.length > 0);
});

test('progress is bounded and grows with content', () => {
  const small = computeProgress({ entries: [entries[0]], deep: { runs: [] } });
  const large = computeProgress({ entries, deep: { runs: [] } });
  assert.ok(small.percent >= 0 && small.percent <= 100);
  assert.ok(large.percent > small.percent);
  assert.equal(large.dimensions.length, 5);
  assert.ok(large.overall > 0.3);
});

test('mergeRules preserves manual rules and applies local prefs', () => {  const state = defaultState();
  state.rules = [{
    id: 'manual-1', key: 'manual:1', layer: 'manual', dimension: 'voice', text: '先给结论', confidence: 1, evidence: [], enabled: true,
  }];
  state.rulePrefs = { 'rhythm:sentence-short': { enabled: false, text: '自定义句长规则' } };
  const local = [{ id: 'local-1', key: 'rhythm:sentence-short', layer: 'local', dimension: 'rhythm', text: '原始句长规则', confidence: 0.8, evidence: [], enabled: true }];
  const merged = mergeRules(state, local);
  assert.equal(merged.find((rule) => rule.layer === 'manual')?.text, '先给结论');
  const localRule = merged.find((rule) => rule.key === 'rhythm:sentence-short');
  assert.equal(localRule.enabled, false);
  assert.equal(localRule.text, '自定义句长规则');
});

test('analysis stays bounded on pathological corpora', () => {
  // 50 万字 × 3 条：旧实现的 Math.max(...lengths) 会在这里爆栈，
  // n-gram 也会把内存吃光。现在只统计最近的一部分，指标口径仍然是全部。
  const text = '一。'.repeat(250000);
  const entries = Array.from({ length: 3 }, (_, index) => ({
    id: `p${index}`,
    type: 'corpus',
    title: 'p',
    text,
    chars: text.length,
    createdAt: index,
  }));
  const { metrics } = analyzeEntries(entries);
  assert.equal(metrics.documents, 3);
  assert.equal(metrics.chars, text.length * 3, '字数按全部条目统计，不受采样影响');
  assert.ok(metrics.sentences > 0);
  assert.ok(Number.isFinite(metrics.avgSentence));
});

test('computeProgress reuses the metrics computed by analyzeEntries', () => {
  const { metrics } = analyzeEntries(entries);
  const progress = computeProgress({ entries, deep: { runs: [] } });
  assert.equal(progress.chars, metrics.chars);
  assert.equal(progress.sentences, metrics.sentences);
  assert.equal(progress.documents, metrics.documents);
});
