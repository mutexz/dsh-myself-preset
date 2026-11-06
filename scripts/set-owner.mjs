#!/usr/bin/env node
/**
 * 把仓库里的占位 owner 换掉。
 *
 * 用法：node scripts/set-owner.mjs <github-login>
 * 例如：node scripts/set-owner.mjs wunanfang
 */
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const owner = process.argv[2];
if (typeof owner !== 'string' || !/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(owner)) {
  console.error('用法：node scripts/set-owner.mjs <github-login>');
  console.error('GitHub 用户名只能包含字母、数字和连字符，不能以连字符开头或结尾。');
  process.exit(1);
}

const old = 'wunanfang';
const files = [
  'package.json',
  'README.md',
  'market/wunanfang__dsh-myself-preset.yml',
  'market/SUBMISSION.md',
];
for (const relative of files) {
  const path = join(root, relative);
  if (!existsSync(path)) continue;
  const text = readFileSync(path, 'utf8');
  writeFileSync(path, text.replaceAll(old, owner), 'utf8');
}

const from = join(root, 'market', `wunanfang__dsh-myself-preset.yml`);
const to = join(root, 'market', `${owner}__dsh-myself-preset.yml`);
if (existsSync(from) && from !== to) renameSync(from, to);

console.log(`owner -> ${owner}`);
console.log(`entry -> market/${owner}__dsh-myself-preset.yml`);
