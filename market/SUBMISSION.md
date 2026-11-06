# 上架到 DSH 插件市场

市场里有两条入口，读的是同一份目录：

- **社区市场 `dshmarket`**（DSH 侧栏「插件市场」）：读 [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) 的精选目录。
- **官方 Discover**：宿主里「插件 → 发现 → 索引源」可以加 `https://cdn.jsdelivr.net/npm/dsh-plugin-catalog/index.json`；这也是同一份目录的 format-1 索引。

所以标准做法是给 awesome-dsh-plugin 提 PR，不是给市场应用提 PR。

## 1. 建仓库、推代码

```sh
cd dsh-myself-preset
git init -b main
git add .
git commit -m "feat: initial 语感花房 plugin"
# 在 GitHub 上建一个公开仓库 dsh-myself-preset，然后：
git remote add origin git@github.com:<你的 GitHub 登录>/dsh-myself-preset.git
git push -u origin main
```

然后：

- 给仓库加 **`dsh-plugin`** topic。
- 仓库必须创建满 **1 天**才能过 CI（这是自动检查，不是人工评价）。
- 如果你 GitHub 登录不是 `wunanfang`，先运行：

```sh
node scripts/set-owner.mjs <你的 GitHub 登录>
git add -A && git commit -m "chore: set repo owner" && git push
```

## 2. 先确认它能被 `dsh plugin add` 安装

市场不是只看 README；它要求仓库声明 `dsh.bundle`，并能通过 `dsh plugin add` 安装。本包已经在 `package.json` 里声明：

```jsonc
"dsh": {
  "bundle": { "patch": "./cordis.patch.yml" },
  "client": { "platform": "web", "inject": ["@deepseek-ai/dsh-client-ui-renderer", "..."] }
}
```

上架前在一个**干净的 profile** 里实测：

```sh
dsh plugin --profile <clean-profile> add github:<owner>/dsh-myself-preset
```

重启后确认：

- 侧栏出现「语感花房」；
- 新会话 preset 里有「像你」；
- 页面能读数据，能投喂。

不要只测手动 `--patch`；市场一键安装走的是 bundle patch，和 `--patch` 是两条路径。

## 3. 提交目录条目

只改一个文件：在 awesome-dsh-plugin 仓库新增

```
data/plugins/<owner>__dsh-myself-preset.yml
```

内容用本目录的 [同目录的 entry 文件](wunanfang__dsh-myself-preset.yml)（`set-owner` 会改名）。模板：

```yaml
url: https://github.com/<owner>/dsh-myself-preset
name: <owner>/dsh-myself-preset
category: identity
description:
  en: A personal voice workshop for DeepSeek Harness that turns your own writing and corrections into explainable local style rules, optionally distills them with the current model, and compiles the result into a switchable preset that applies on the next message.
  zh: DSH 的个人语气工作台：把你自己写的语料和纠正变成可解释的本地风格规则，可选当前模型深读，编译成下一句话生效的可切换 preset。
icon: https://raw.githubusercontent.com/<owner>/dsh-myself-preset/main/assets/icon-180.png
```

注意：

- 只有 `description.en` 必填；中文可以留空，维护者会补。
- 描述里有 `: `（英文冒号加空格）必须加引号；本条的英文没有，中文是全角冒号。
- 分类选最接近的即可；`identity` 是人格/说话方式，`ui` 是页面。选偏了维护者会改，不会打回。
- 一个 PR 最多 3 条；本插件一条。
- 不要手工改生成出来的 README；只加/改自己的 YAML。
- CI 会检查 `dsh.bundle`、仓库年龄、格式、README 生成一致性；维护者会读代码核对描述。
- 仓库里必须有真实可用代码，不能是占位或 README-only。

PR 标题可以直接写：

```
Add 语感花房 (dsh-myself-preset)
```

PR 描述里放一句功能说明、安装命令、以及你实测过的 DSH 版本。

## 4. 可选：发 npm

发 npm 不是收录的前置条件，但市场会优先一键安装，并显示下载量。

```sh
npm publish --access public
```

- 发布前确认 `package.json` 的 `repository` 指回 GitHub 仓库；市场靠它把 npm 包和目录条目关联起来。
- 不要手写 `npm:` 字段；映射自动采集。
- 如果 `dsh-myself-preset` 被占用，改用 scope（例如 `@<owner>/dsh-myself-preset`），同时把 `cordis.patch.yml` 里的两处包名（页面插件行、`myself-style` 行）改成新包名，并在 README 里改安装命令。
- 本包没有构建步骤；GitHub 源码安装也能用。若以后加了构建，建议发 npm 或挂一个 GitHub Release 的预构建 `.tgz`（条目的 `tarball:` 字段，必须 GitHub 托管）。

## 5. 截图与图标（可选，已准备好）

- `screenshots.json` 已列 3 张图，路径都在仓库内，市场详情页会显示。
- `assets/icon-180.png` 是 GitHub 托管的位图图标；条目里的 `icon` 已指过去。
- 图片只接受 GitHub 托管（`raw.githubusercontent.com` 等）；不要用第三方图床。

## 6. 官方 Discover

如果只想在本机 Discover 里先看到，不走市场：

1. 打开「插件 → 发现 → 索引源」。
2. 加 `https://cdn.jsdelivr.net/npm/dsh-plugin-catalog/index.json`。
3. 搜索 `dsh-myself-preset`。

这和社区市场是同一份目录；上架 PR 合并后两边都会更新，通常一天内生效。

## 7. 安全与隐私

- 收录不等于安全审查；插件代码以用户权限运行。
- 本插件只读写 `~/.dsh/myself-preset/`；深读/试音会把选中的文本发给用户当前的模型提供方，页面和 README 都写明了。
- 不要在任何文件里放 API Key、账号 token 或个人语料；截图只截页面内容。
