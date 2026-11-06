import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../lib/store.js';
import { readProfileText, clearProfileCache, sanitizeProfile } from '../lib/persona.js';
import { BASE_PERSONA } from '../lib/schema.js';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('store round-trips state and profile', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dmp-store-'));
  try {
    const store = createStore(dir);
    const state = store.load();
    state.entries.push({ id: 'e1', type: 'corpus', title: 'x', text: '你好', chars: 2, createdAt: 1 });
    store.save(state);
    const loaded = store.load();
    assert.equal(loaded.entries.length, 1);
    store.writeProfile('人格 A');
    assert.equal(store.readProfile(), '人格 A');
    store.writeProfile('人格 B');
    assert.equal(store.readProfile(), '人格 B');
    const reset = store.reset();
    assert.equal(reset.entries.length, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('persona fallback and truncation', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dmp-persona-'));
  try {
    clearProfileCache();
    assert.equal(readProfileText(dir), BASE_PERSONA);
    const store = createStore(dir);
    store.ensure();
    writeFileSync(store.profilePath, '   ', 'utf8');
    clearProfileCache();
    assert.equal(readProfileText(dir), BASE_PERSONA);
    writeFileSync(store.profilePath, 'a'.repeat(7000), 'utf8');
    clearProfileCache();
    const text = readProfileText(dir);
    assert.ok(text.length <= 6100);
    assert.ok(text.includes('人格已截断'));
    assert.ok(!sanitizeProfile('x {{y}}').includes('{{'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
