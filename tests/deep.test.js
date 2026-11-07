import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRun, streamTextChunks } from '../lib/deep.js';

/** 假 ctx：只提供 llm.stream，按给定 chunk 序列流式返回。 */
function ctxWith(chunks) {
  return {
    get(name) {
      if (name !== 'llm') return undefined;
      return {
        stream: async function* stream() {
          for (const chunk of chunks) yield chunk;
        },
      };
    },
  };
}

test('streamTextChunks joins deltas and does not repeat the block-end text', async () => {
  const ctx = ctxWith([
    { type: 'text-delta', index: 0, text: '你' },
    { type: 'text-delta', index: 0, text: '好' },
    { type: 'block-end', index: 0, block: { type: 'text', text: '你好' } },
    { type: 'finish', reason: { kind: 'stop' } },
  ]);
  const deltas = [];
  const text = await streamTextChunks(ctx, {}, (delta) => deltas.push(delta));
  assert.equal(text, '你好');
  assert.deepEqual(deltas, ['你', '好']);
});

test('streamTextChunks accepts a text block that only arrives at block-end', async () => {
  const ctx = ctxWith([
    { type: 'block-end', index: 0, block: { type: 'text', text: '完整块' } },
    { type: 'finish', reason: { kind: 'stop' } },
  ]);
  assert.equal(await streamTextChunks(ctx, {}), '完整块');
});

test('streamTextChunks surfaces a finish error carried in reason', async () => {
  const ctx = ctxWith([
    { type: 'finish', reason: { kind: 'error', failure: { code: 'RATE_LIMIT', message: 'too many requests' } } },
  ]);
  await assert.rejects(() => streamTextChunks(ctx, {}), /RATE_LIMIT/);
  await assert.rejects(() => streamTextChunks(ctx, {}), /too many requests/);
});

test('parseRun strips a fenced code block and normalizes rules', () => {
  const raw = '```json\n{"portrait":"画像","rules":[{"dimension":"voice","text":"直接说结论","confidence":0.8,"evidence":[]}]}\n```';
  const run = parseRun(raw, 'provider', 'model');
  assert.equal(run.portrait, '画像');
  assert.equal(run.rules.length, 1);
  assert.equal(run.rules[0].dimension, 'voice');
  assert.equal(run.rules[0].layer, 'deep');
});

test('parseRun rejects output that is not JSON', () => {
  assert.throws(() => parseRun('这不是 JSON', 'p', 'm'), /JSON/);
});

test('streamTextChunks stops after the signal aborts', async () => {
  const controller = new AbortController();
  const ctx = {
    get() {
      return {
        stream: async function* stream() {
          yield { type: 'text-delta', index: 0, text: '一' };
          controller.abort();
          yield { type: 'text-delta', index: 0, text: '二' };
        },
      };
    },
  };
  const text = await streamTextChunks(ctx, { signal: controller.signal });
  assert.equal(text, '一');
});

test('streamTextChunks keeps the abort signal out of the host options', async () => {
  let seen = null;
  const ctx = {
    get() {
      return {
        stream: async function* stream(options) {
          seen = options;
          yield { type: 'finish', reason: { kind: 'stop' } };
        },
      };
    },
  };
  await streamTextChunks(ctx, { provider: 'p', model: 'm', maxTokens: 10, signal: new AbortController().signal });
  assert.equal('signal' in seen, false);
  assert.equal(seen.provider, 'p');
  assert.equal(seen.maxTokens, 10);
});
