import test from 'node:test';
import assert from 'node:assert/strict';
import { computeProgress } from '../lib/analyze.js';
import { defaultState } from '../lib/schema.js';

/** 造一条语料条目；chars 按页面同样的口径（去掉空白）计算。 */
function corpus(id, text, createdAt) {
  return {
    id,
    type: 'corpus',
    title: id,
    text,
    chars: text.replace(/\s+/gu, '').length,
    createdAt,
  };
}

test('progress starts empty, exposes five dimensions, and grows with material', () => {
  const state = defaultState();
  const empty = computeProgress(state);
  assert.equal(empty.percent, 0);
  assert.equal(empty.dimensions.length, 5);

  state.entries.push(corpus('e1', '这是第一段语料，用来测试进度。'.repeat(10), 1));
  const one = computeProgress(state);
  assert.ok(one.percent > empty.percent);

  state.entries.push(corpus('e2', '这是第二段语料，语气更直接。'.repeat(10), 2));
  const two = computeProgress(state);
  assert.ok(two.percent > one.percent, 'entries changed, so the cached metrics must be replaced');

  state.entries.pop();
  const back = computeProgress(state);
  assert.equal(back.percent, one.percent, 'removing the entry returns to the previous measurement');
});

test('progress counts corrections and accepted deep reads', () => {
  const state = defaultState();
  const revised = '别绕。直接说结论。';
  state.entries.push({
    id: 'c1',
    type: 'correction',
    title: 'c1',
    original: '首先，我们应该进行深入探讨。',
    revised,
    text: revised,
    chars: revised.replace(/\s+/gu, '').length,
    createdAt: 1,
  });
  const before = computeProgress(state);
  assert.equal(before.corrections, 1);
  assert.equal(before.deepRuns, 0);

  state.deep.runs.push({ id: 'r1', status: 'accepted' });
  state.deep.runs.push({ id: 'r2', status: 'rejected' });
  const after = computeProgress(state);
  assert.equal(after.deepRuns, 1);
  assert.ok(after.percent >= before.percent);
});
