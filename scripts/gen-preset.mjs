#!/usr/bin/env node
/**
 * 从当前 DSH 的 composed profile 里提取 `preset-standard` 的插件清单，
 * 重新生成 bundle patch 的 preset 部分。
 *
 * DSH 升级后如果 standard preset 增删了插件，跑一次：
 *   node scripts/gen-preset.mjs
 *
 * 生成结果会覆盖 cordis.patch.yml；页面插件行和注释保持不变。
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dsh =
  process.env.DSH_BIN ??
  '/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh';

const dump = execFileSync(dsh, ['--profile', 'web', '--dump-config'], {
  encoding: 'utf8',
  maxBuffer: 32 * 1024 * 1024,
});
const lines = dump.split('\n');

const start = lines.findIndex((line) => line.trim() === '- id: preset-standard');
if (start < 0) throw new Error('找不到 preset-standard；DSH 的 standard preset 可能改名了。');
const pluginsAt = lines.findIndex((line, index) => index > start && line.trim() === 'plugins:');
if (pluginsAt < 0) throw new Error('找到 preset-standard，但没有 plugins:。');

let end = lines.length;
for (let index = pluginsAt + 1; index < lines.length; index += 1) {
  if (/^-\s/.test(lines[index])) {
    end = index;
    break;
  }
}

// dump 的缩进比 bundle patch 少 4 格；补上后直接嵌进 config.plugins。
const block = lines
  .slice(pluginsAt, end)
  .map((line) => (line.length > 0 ? `    ${line}` : line))
  .join('\n')
  .replace(
    /^ {4} {6}- id: persona$/mu,
    '          - id: myself-style\n            name: \'dsh-myself-preset/preset\'\n          - id: persona',
  )
  .replace(
    /^( +prefix:) .*$/mu,
    "$1 '{{myself_persona}}'",
  )
  .replace(/\n{3,}/gu, '\n\n')
  .trimEnd();

const patch = `# dsh-myself-preset —— 一个 bundle 同时装两样东西：
#   1. 页面插件（宿主路由 + 浏览器页面）
#   2. preset 声明（standard 的完整插件清单 + myself-style 变量 + persona）
#
# 安装：dsh plugin --profile <name> add link:/path/to/dsh-myself-preset
# 卸载：插件管理器移除 dsh-myself-preset；数据目录 ~/.dsh/myself-preset/ 默认保留。
- insert:
    - id: dsh-myself-preset
      name: dsh-myself-preset
    - id: preset-myself
      name: '@deepseek-ai/dsh-agent-preset'
      config:
        id: myself
        name: 我自己
        description: 从你的语料和纠正里长出来的人格；页面里随时调。
        order: 35
${block}
`;

writeFileSync(join(root, 'cordis.patch.yml'), patch, 'utf8');
console.log(`已写入 ${join(root, 'cordis.patch.yml')}（${block.split('\n').length} 行 preset 配置）`);
