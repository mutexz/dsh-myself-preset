#!/usr/bin/env node
/**
 * 把仓库里的 owner 换掉。
 *
 * 用法：node scripts/set-owner.mjs <github-login>
 * 第一次会把默认的 wunanfang 换掉；之后可以再跑，按 package.json 的 author
 * 找到当前 owner，连同 market/ 里的条目文件一起改名。
 */
import { existsSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const owner = process.argv[2];
if (typeof owner !== 'string' || !/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(owner)) {
  console.error('用法：node scripts/set-owner.mjs <github-login>');
  console.error('GitHub 用户名只能包含字母、数字和连字符，不能以连字符开头或结尾。');
  process.exit(1);
}

const readJson = (path) => JSON.parse(readFileSync(join(root, path), 'utf8'));
let current = 'wunanfang';
try {
  const pkg = readJson('package.json');
  if (typeof pkg.author === 'string' && pkg.author.length > 0) current = pkg.author.split('@')[0].trim();
} catch {
  // 用默认 owner。
}

const replaceIn = (relative) => {
  const path = join(root, relative);
  if (!existsSync(path)) return;
  const text = readFileSync(path, 'utf8');
  if (text.includes(current)) writeFileSync(path, text.replaceAll(current, owner), 'utf8');
};

const marketDir = join(root, 'market');
let marketFile = null;
if (existsSync(marketDir)) {
  const found = readdirSync(marketDir).find((name) => name.endsWith('__dsh-myself-preset.yml'));
  if (found !== undefined) marketFile = found;
}

for (const relative of ['package.json', 'README.md', 'market/SUBMISSION.md']) replaceIn(relative);
if (marketFile !== null) {
  replaceIn(join('market', marketFile));
  const to = join(marketDir, `${owner}__dsh-myself-preset.yml`);
  const from = join(marketDir, marketFile);
  if (from !== to) renameSync(from, to);
}

console.log(`owner -> ${owner}`);
console.log(`entry -> market/${owner}__dsh-myself-preset.yml`);
