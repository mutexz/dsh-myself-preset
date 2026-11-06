#!/usr/bin/env node
/**
 * 发布前自检：只检查仓库结构和 manifest，不启动 DSH。
 * 市场 CI 会独立检查 dsh.bundle、仓库年龄和格式；这里先保证本地不犯低级错误。
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const errors = [];
const read = (path) => readFileSync(join(root, path), 'utf8');
const need = (path, label) => {
  if (!existsSync(join(root, path))) errors.push(`${label ?? path} 不存在：${path}`);
};

let pkg = null;
try {
  pkg = JSON.parse(read('package.json'));
} catch (error) {
  errors.push(`package.json 不是合法 JSON：${error.message}`);
}

if (pkg !== null) {
  if (pkg.private === true) errors.push('package.json 不能是 private；市场/ npm 需要公开包。');
  if (typeof pkg.name !== 'string' || pkg.name.length === 0) errors.push('package.json 缺少 name。');
  if (typeof pkg.version !== 'string' || pkg.version.length === 0) errors.push('package.json 缺少 version。');
  if (pkg.dsh?.bundle?.patch === undefined) errors.push('package.json 缺少 dsh.bundle.patch。');
  if (pkg.dsh?.client?.platform !== 'web') errors.push('package.json 缺少 dsh.client.platform: web。');
  if (pkg.repository?.url === undefined) errors.push('package.json 缺少 repository.url；npm 映射需要它。');
  if (pkg.license !== 'MIT') errors.push('package.json license 应为 MIT。');
  if (pkg.dsh?.bundle?.patch !== undefined && !existsSync(join(root, pkg.dsh.bundle.patch))) {
    errors.push(`dsh.bundle.patch 指向的文件不存在：${pkg.dsh.bundle.patch}`);
  }
  for (const key of ['lib', 'preset', 'client', 'assets', 'cordis.patch.yml', 'README.md', 'LICENSE']) {
    if (!Array.isArray(pkg.files) || !pkg.files.includes(key)) {
      if (key.endsWith('.md') || key.endsWith('.yml') || key === 'LICENSE') {
        // 单文件在 files 里可省略，但目录必须在。
      } else if (!pkg.files?.includes(key)) {
        errors.push(`package.json files 缺少 ${key}。`);
      }
    }
  }
}

need('cordis.patch.yml');
need('README.md');
need('LICENSE');
need('screenshots.json');
need('assets/icon-180.png');
need('assets/plant.png');
need('client/client.js');
need('lib/index.js');
need('preset/index.js');

if (existsSync(join(root, 'cordis.patch.yml'))) {
  const patch = read('cordis.patch.yml');
  for (const id of ['dsh-myself-preset', 'preset-myself', 'myself-style', '{{myself_persona}}']) {
    if (!patch.includes(id)) errors.push(`cordis.patch.yml 缺少 ${id}。`);
  }
}

if (existsSync(join(root, 'screenshots.json'))) {
  try {
    const shots = JSON.parse(read('screenshots.json'));
    if (!Array.isArray(shots) || shots.length === 0 || shots.length > 8) {
      errors.push('screenshots.json 必须是 1–8 个路径的数组。');
    } else {
      for (const shot of shots) {
        if (typeof shot !== 'string') {
          errors.push('screenshots.json 只能包含字符串路径。');
          continue;
        }
        if (shot.startsWith('/') || shot.includes('..')) {
          errors.push(`截图路径必须是仓库内的相对路径：${shot}`);
          continue;
        }
        if (!existsSync(join(root, shot))) errors.push(`截图不存在：${shot}`);
      }
    }
  } catch (error) {
    errors.push(`screenshots.json 不是合法 JSON：${error.message}`);
  }
}

if (errors.length > 0) {
  console.error('发布自检失败：');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('发布自检通过：dsh.bundle、client、cordis.patch.yml、截图和图标都在。');
