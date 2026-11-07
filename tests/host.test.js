import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { apply } from '../lib/index.js';

/** 造一个最小宿主：只实现插件用到的 inject / effect / register。 */
function boot() {
  const home = mkdtempSync(join(tmpdir(), 'dmp-host-'));
  process.env.DSH_HOME = home;
  const routes = new Map();
  const ctx = {
    get() {
      return undefined;
    },
    inject(_deps, callback) {
      callback({
        effect: (fn) => fn(),
        webServer: {
          register: (definition) => {
            routes.set(definition.path, definition);
          },
        },
      });
    },
  };
  apply(ctx);
  return { home, routes };
}

function makeResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: '',
    headersSent: false,
    writableEnded: false,
    destroyed: false,
    writeHead(status, headers = {}) {
      this.statusCode = status;
      this.headers = headers;
      this.headersSent = true;
    },
    write(chunk) {
      if (this.destroyed) throw new Error('EPIPE');
      this.body += String(chunk);
      return true;
    },
    end(chunk) {
      if (chunk !== undefined) this.body += String(chunk);
      this.writableEnded = true;
      this.headersSent = true;
    },
    on() {
      return this;
    },
    off() {
      return this;
    },
  };
}

function makeRequest({ method, headers, body, localAddress }) {
  const bytes = body === undefined ? [] : [Buffer.from(body, 'utf8')];
  return {
    method,
    headers,
    socket: { localAddress },
    async *[Symbol.asyncIterator]() {
      for (const byte of bytes) yield byte;
    },
    on() {
      return this;
    },
    off() {
      return this;
    },
  };
}

const env = boot();
test.after(() => {
  rmSync(env.home, { recursive: true, force: true });
});

/** 路由的 handler 不返回 Promise，只能等响应写完。 */
async function call({ method = 'GET', path, headers = {}, body, localAddress = '127.0.0.1' }) {
  const definition = env.routes.get(`/dsh-myself-preset${path}`);
  assert.ok(definition !== undefined, `没有注册路由 ${path}`);
  const res = makeResponse();
  definition.handler(makeRequest({ method, headers, body, localAddress }), res);
  for (let index = 0; index < 200 && !res.writableEnded; index += 1) {
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  return res;
}

const jsonHeaders = { host: 'localhost:5173', 'content-type': 'application/json' };

test('state route rejects a rebound host arriving on loopback', async () => {
  const res = await call({ path: '/state.json', headers: { host: 'evil.example:5173' } });
  assert.equal(res.statusCode, 403);

  // DNS rebinding 的典型形态：Origin 和 Host 都是攻击者域名，两者一致。
  const disguised = await call({
    path: '/state.json',
    headers: { host: 'evil.example:5173', origin: 'http://evil.example:5173' },
  });
  assert.equal(disguised.statusCode, 403);
});

test('state route rejects a mismatched origin', async () => {
  const res = await call({
    path: '/state.json',
    headers: { host: 'localhost:5173', origin: 'http://evil.example' },
  });
  assert.equal(res.statusCode, 403);
});

test('ping does not leak the data directory', async () => {
  const res = await call({ path: '/ping', headers: { host: 'localhost:5173' } });
  assert.equal(res.statusCode, 200);
  assert.equal('dataDir' in JSON.parse(res.body), false);
});

test('state route accepts localhost', async () => {
  const res = await call({ path: '/state.json', headers: { host: 'localhost:5173' } });
  assert.equal(res.statusCode, 200);
  const payload = JSON.parse(res.body);
  assert.equal(payload.version, 1);
});

test('write routes reject cross-site requests', async () => {
  const res = await call({
    method: 'POST',
    path: '/entries',
    headers: { ...jsonHeaders, 'sec-fetch-site': 'cross-site' },
    body: JSON.stringify({ type: 'corpus', text: '直接说结论，别绕。'.repeat(10) }),
  });
  assert.equal(res.statusCode, 403);
});

test('write routes require a json body', async () => {
  const res = await call({
    method: 'POST',
    path: '/entries',
    headers: { host: 'localhost:5173', 'content-type': 'text/plain' },
    body: 'x',
  });
  assert.equal(res.statusCode, 415);
});

test('entries accept normal text and reject oversize text', async () => {
  const ok = await call({
    method: 'POST',
    path: '/entries',
    headers: jsonHeaders,
    body: JSON.stringify({ type: 'corpus', title: '样本', text: '直接说结论，别绕。'.repeat(10) }),
  });
  assert.equal(ok.statusCode, 200);
  assert.ok(JSON.parse(ok.body).state.entries.length >= 1);

  const tooLong = await call({
    method: 'POST',
    path: '/entries',
    headers: jsonHeaders,
    body: JSON.stringify({ type: 'corpus', text: '字'.repeat(20001) }),
  });
  assert.equal(tooLong.statusCode, 413);
});

test('reset needs an explicit confirmation', async () => {
  const denied = await call({ method: 'POST', path: '/reset', headers: jsonHeaders, body: '{}' });
  assert.equal(denied.statusCode, 400);

  const accepted = await call({
    method: 'POST',
    path: '/reset',
    headers: jsonHeaders,
    body: JSON.stringify({ confirm: 'reset' }),
  });
  assert.equal(accepted.statusCode, 200);
  assert.equal(JSON.parse(accepted.body).state.entries.length, 0);
});
