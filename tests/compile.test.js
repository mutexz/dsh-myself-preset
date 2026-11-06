import test from 'node:test';
import assert from 'node:assert/strict';
import { compile, compileToStore } from '../lib/compile.js';
import { defaultState, BASE_PERSONA } from '../lib/schema.js';
import { createStore } from '../lib/store.js';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function withState(extra = {}) {
  return {
    ...defaultState(),
    ...extra,
  };
}

test('compile always returns non-empty', () => {
  const text = compile(withState());
  assert.ok(text.length > 50);
  assert.ok(text.includes('说话方式'));
});

test('manual append and takeover behave differently', () => {
  const state = withState({
    manual: { text: '先说结论，别客套。', mode: 'append' },
    rules: [{ id: 'r1', key: 'voice:1', layer: 'manual', dimension: 'voice', text: '别用首先其次', confidence: 1, evidence: [], enabled: true }],
  });
  const append = compile(state);
  assert.ok(append.includes(BASE_PERSONA));
  assert.ok(append.includes('别用首先其次'));
  assert.ok(append.includes('先说结论'));
  state.manual.mode = 'takeover';
  const takeover = compile(state);
  assert.equal(takeover, '先说结论，别客套。');
});

test('compile sanitizes prompt-variable syntax and caps length', () => {
  const state = withState({
    manual: { text: '这句里有 {{变量}}，不能被插值。', mode: 'append' },
  });
  const text = compile(state);
  assert.ok(!text.includes('{{'));
  assert.ok(text.includes('{ {变量}'));

  const long = withState({
    rules: Array.from({ length: 40 }, (_, index) => ({
      id: `r${index}`,
      key: `voice:${index}`,
      layer: 'manual',
      dimension: 'voice',
      text: `规则 ${index} `.repeat(40),
      confidence: 0.9,
      evidence: [],
      enabled: true,
    })),
  });
  assert.ok(compile(long).length <= 6000);
});

test('compileToStore writes profile.md', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dmp-compile-'));
  try {
    const store = createStore(dir);
    const state = withState();
    const text = compileToStore(state, store);
    assert.equal(readFileSync(store.profilePath, 'utf8'), text);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
