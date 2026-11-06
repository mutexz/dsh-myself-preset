# dsh-myself-preset · 设计稿

> 2026-11-06 · 状态：待用户确认
>
> 视觉稿：`docs/mockup-terrarium-dark.png`（深色，100% 构图）/ `docs/mockup-terrarium.png`（浅色）/ `docs/mockup-terrarium-dark-68.png`（68% 缩尺）。植物素材：`assets/plant.png`（作者生图，已抠图）。实机截图：`assets/screenshot-light.png`、`assets/screenshot-dark.png`、`assets/screenshot-rules.png`。玻璃罩、底座、水面、铭牌由代码画。

## 一句话

一个长在 DSH 里的“语感花房”：左边喂语料和纠正，右边玻璃花房里的植物慢慢长起来；本地规则即时生效，深读按需调用模型；最终编译成 preset 的人格提示词，下一句话就生效。

## 目标

- 让用户通过投喂自己的语料、纠正 AI 的回复，持续调教一个专属回复 preset。
- 每次投喂都有即时、可见、可解释的反馈，而不是黑盒地“学习”。
- 深读提供语义层的风格画像，但必须由用户确认后才写进人格。
- 页面好看、好玩、可长时间停留，同时不破坏 DSH 原生的界面语言。
- 语料只存在本机；深读/试音要发送给模型时明确告知。

## 非目标

- 不做多用户、云端同步、团队共享。
- 不做通用写作助手；只服务“让 DSH 像我”。
- 不在每次投喂时改 profile 的 YAML；preset 只安装一次，人格内容走文件 + prompt 变量热更新。
- v1 不做语音、图片、视频语料。
- v1 不做多套 preset 管理；数据结构预留场景维度，但不做多面具 UI。

## 反目标

- 进度按字数线性涨，鼓励灌水。
- 深读结果不给出处、直接覆盖人格。
- 做成通用仪表盘，和 DSH 其他页面格格不入。
- 为了动效牺牲可读性、性能或键盘可达性。

## 已定的决定

- **混合学习**：本地即时规则 + “深读”按钮调模型。
- **100% 的含义**：第一版人格成形、可以上岗，不是终点。之后进入“精炼 +N”，不重置。
- **五维**：语气、节奏、用词、结构、场景；不画在身体上，放在培养舱下方的五根细表。
- **纠正样本权重高于普通语料**：AI 原稿 vs 用户改写的 diff 是最强信号。
- **人格分层**：底座人设 + 硬规则（本地）+ 画像（深读，确认后）+ 手改；四层分开存，出问题能定位。
- **手改不丢**：`state.manual` 独立存储，编译只追加；另有“完全接管”模式，整段人格由用户原文决定。
- **preset 底座保留**：标准 coding-agent 身份与行为约束不替换，学习到的是“怎么说”，不是“能不能干活”。
- **安装方式**：一个 bundle 包，`dsh.bundle.patch` 指向 `cordis.patch.yml`，一次性插入页面插件行 + preset 声明行；卸载走插件管理器，不手改 profile。
- **入口**：左侧栏「语感花房」，主区页面；不是设置页里的一个表单。

## 视觉方向

方向名：**标本培养舱 / Specimen Incubation**。

不是霓虹实验室，也不是通用 SaaS 仪表盘。它像一间只亮着一盏台灯的标本室：玻璃器皿、校准环、手写标签、暖色液体，但所有控件仍然是 DSH 原生的密度和手感。

- **光模式**：晨光标本室。暖象牙纸底、墨线、琥珀色液体、青绿高光；像解剖图鉴和实验室手账的混合体。
- **暗模式**：深夜培养舱。深墨底、生物荧光青绿高光、琥珀暖芯；植物和玻璃罩是唯一亮着的东西。
- **字体**：正文沿用 DSH 系统 sans；标题、大数字、铭牌用衬线（Songti SC / Noto Serif SC / Georgia）做“图鉴”感。标签用小号 sans，不大写、不拉字距。
- **颜色**：底层全部走 `--dsw-alias-*` / `--dsw-static-*` token。自定义强调色只保留三种：青绿 `#2fb8a6`、琥珀 `#e8a33d`、墨 `#1b1b1c`；深读待确认时用一点紫 `#8b7cf6`，只出现在待确认状态。
- **背景**：一层巨大的校准环 + 细刻度，像标本台的转盘；不做满屏网格、噪点或渐变光晕。
- **主体**：一个玻璃花房（钟形玻璃罩 + 深色底座），里面是一株从苔藓土丘里长出来的小型盆景树。水在底座里，植物随进度长高、长叶、开花；玻璃罩上有冷凝水珠，植物周围有萤火/露珠形态的记忆气泡。100% 时树冠完整、琥珀色小花亮起、铭牌从 `Specimen 001` 变成 `Ready`。没有身体，也没有“被泡在水里”的感觉。
- **动效**：倒液、液面波动、气泡、点击搅拌、深读扫描、成形苏醒。只动 `transform` / `opacity`；`prefers-reduced-motion` 下全部降级为静态。

参考（只取气质和技术，不抄布局）：

- [InGen — Specimen Incubation Dashboard](https://dribbble.com/shots/27216948-InGen-Specimen-Incubation-Dashboard)
- [Lucid — Lab Results & Clinical Diagnostic Dashboard](https://elements.envato.com/lucid-lab-results-clinical-diagnostic-dashboard-XQU338B)
- [Liquid Fill Progress Indicator — Wavy SVG Loader](https://webdevpuneet.com/ui-snippets/loader-liquid-fill-progress/)

**为什么用生图 + 代码分层**：植物由生图模型出一张高质量的成树图（或 0/25/50/75/100 五张同机位阶段图），玻璃罩、底座、水面、冷凝、铭牌、进度环都由代码画。这样植物的有机质感交给模型，交互和进度留在代码里，不会被一张静态图锁死。

生图只要求“植株本身”：透明背景（或纯色暖象牙底）、无花盆、无玻璃罩、无文字、无手。整页的“玻璃花房”是代码搭出来的，所以水位、光、气泡都能跟着进度动。最终选用 `assets/plant.png`（冠幅更宽，放玻璃罩更稳）；已经洗掉象牙底色、去掉底部白边。另有一版更瘦高的备选素材，可随时替换。

## 页面结构

```
┌──────────────────────────────────────────────────────────────┐
│ 语感花房   本地规则 8 · 深读 1 版          [深读] [设置]    │
├───────────────┬──────────────────────────────────────────────┤
│ 喂养台         │             ○ 校准环 / 刻度                  │
│ [语料][纠正][直给]                                           │
│ ┌───────────┐ │               ╭──────╮                       │
│ │ 标题       │ │              │  ♧   │  ← 玻璃花房 + 植株     │
│ │           │ │              │   ▽   │                       │
│ │ 大文本框   │ │              │  ◇ ◇  │                       │
│ │           │ │              ╰──────╯                       │
│ └───────────┘ │          Specimen 001 · 你的语气              │
│  [从文件导入]  │      成熟度 68% · 还差 2 段纠正              │
│  [开始滋养]    │   心脏 62 肺 71 脑 55 手 48 眼 40           │
│               │                                              │
│ 最近投喂       │  「它刚学会：先给结论，再补边界条件」         │
│ · ...         │                                              │
├───────────────┴──────────────────────────────────────────────┤
│ ▲ 人格档案   [规则] [人格提示词] [试音]                       │
└──────────────────────────────────────────────────────────────┘
```

- 左栏 380–420px，内部滚动；主按钮始终可见。
- 右侧舞台占剩余空间；培养舱在 1280×800 的第一屏内完整可见。
- 底部抽屉默认收起；展开后占 45% 高度，三个 tab：规则、人格提示词、试音。
- 窄屏（<960px）改为上下堆叠：培养舱在上，喂养台在下；抽屉变成全屏 sheet。

## 交互

### 投喂语料

粘贴或导入 `.txt` / `.md` → 点「开始滋养」→ 一道液体从左上角倒进培养舱，液面上升，底部抽屉里飞入一张新规则卡，液体里冒出一个写着短语的记忆气泡。字数太少时提示“这点营养不够，再喂点”，但仍然记录，只是进度增量很小。

### 投喂纠正

两个文本框：AI 原稿、你的改写。输入时实时显示 diff 和提取到的信号 chips（删了客服结尾、句子拆短、结论前置、列表改自然段……）。投喂时液体变成琥珀色，表示“高营养”。

### 直给规则

输入一条明确规则，例如“别用赋能/闭环”“先给结论”“少用列表”，立即生效，归入手改层。适合不想等分析、直接纠偏。

### 深读

点右上角「深读」→ 玻璃罩上扫过一道光，液体泛紫，底部抽屉显示阶段：读取语料 → 提炼 → 交叉验证 → 编译。完成后结果进入「待确认」：

- **整版收下**：画像 + 全部规则生效。
- **只收规则**：规则生效，画像不进人格。
- **逐条**：每条规则可单独开关；拒绝的规则不进口径。
- **拒绝整版**：什么都不写。

画像和规则都带原文证据；接受后如果又关掉某条规则，画像会被标记“可能过期”，并给一个“按现有规则重写画像”的本地按钮。

深读只读新增或改动的语料 + 上一版已确认画像/规则摘要，不每次全量重读。

### 100% 之后

树冠完整、琥珀色小花亮起、校准环亮起，铭牌变成 `Ready`，出现「第一版成形」印章。之后继续投喂，显示「精炼 +N」，液体增加细碎星点，不再重置。

### 试音

底部抽屉的「试音」tab：输入一个场景，点「用当前人格回答」，流式显示回复。两个按钮：「像」/「不像」。点「不像」把这段回复预填到纠正页的“AI 原稿”，用户写改写，直接进入下一轮滋养。这是调试 preset 的闭环。

### 空态 / 错误 / 加载

- 空态：空玻璃人 + “先喂一段你写的东西，或者一段你改过的回复”；「看示例」只播放动画，不写真实数据。
- 加载：左栏骨架 + 培养舱轮廓占位。
- 错误：明确原因 + 重试；深读不可用时提示“模型没接上”，本地功能不受影响。
- 删除/清空：二次确认；进度会回退，符合真实状态。

## 技术架构

### 包结构

```
dsh-myself-preset/
  package.json          main=lib/index.js，exports ./client ./preset
  cordis.patch.yml      bundle patch：页面插件行 + preset 声明行
  lib/index.js          宿主：路由、存储、分析、深读、试音
  lib/store.js          原子写、备份、简单互斥
  lib/analyze.js        本地统计 + 纠正 diff + 规则生成
  lib/compile.js        人格提示词编译（底座 + 规则 + 画像 + 手改）
  lib/deep.js           深读 prompt、ctx.llm 流式调用、JSON 解析
  preset/index.js       preset 作用域插件：注册 {{myself_persona}} 变量
  client/client.js      浏览器页面（单 bundle）
  scripts/gen-preset.mjs 从 dsh --dump-config 提取 preset-standard，生成 bundle patch
  dev/dev.patch.yml     开发 overlay
  docs/design.md
  docs/mockup-terrarium-dark.png / mockup-terrarium.png / mockup-terrarium-dark-68.png
  README.md
```

### 安装 / 卸载

这是 bundle 包，不是手改 profile：

1. `dsh plugin --profile <profile> add dsh-myself-preset`（或 `github:<owner>/dsh-myself-preset`；也可通过插件管理器安装）。
2. `dsh.bundle.patch` 指向 `cordis.patch.yml`，一次插入两行：
   - 页面插件 `dsh-myself-preset`（宿主路由 + 浏览器页面）
   - preset 声明 `preset-myself`（`@deepseek-ai/dsh-agent-preset`，`config.plugins` 是 standard 的完整清单 + `myself-style` + persona）
3. 卸载：插件管理器移除 `dsh-myself-preset`，bundle patch 一起撤掉；`~/.dsh/myself-preset/` 数据默认保留，可手动删。

`.agent-presets/` 目录是旧格式，当前 DSH 已经不读；不要往那里装。

`scripts/gen-preset.mjs` 用 `dsh --profile web --dump-config` 取 `preset-standard` 行，保留 `!!js` 文本，生成 `cordis.patch.yml` 的 preset 部分。DSH 升级后重跑一次，避免插件清单过期。

### 宿主路由

全部挂在 `/dsh-myself-preset/` 下，只监听本机：

| 方法 | 路径 | 作用 |
| --- | --- | --- |
| GET | `state.json` | 条目、规则、进度、深读状态、设置 |
| POST | `entries` | 新增语料/纠正/手改规则 |
| POST | `entries/delete` | 删除条目并重算 |
| POST | `feed` | 新增 + 本地分析 + 编译 + 返回增量 |
| POST | `deep` | 启动深读任务 |
| GET | `deep/status` | 阶段、进度、结果 |
| POST | `rules/update` | 启用/停用/编辑/收下/拒绝 |
| POST | `profile` | 保存手改层（append / takeover） |
| POST | `test` | 试音：NDJSON 流式返回 |
| POST | `settings` | 模型覆盖、隐私开关 |
| POST | `reset` | 清空所有数据（需确认） |
| GET | `export` | 导出 JSON |

请求体上限 2MB；id 用 UUID；所有输入按文本处理，不拼 HTML。

**第一期第一件事**：注册 `GET /dsh-myself-preset/ping`，从桌面页面 fetch 一次，确认宿主路由在桌面壳的 origin 下可访问。`dsh-plugin-panel` 已经用同样方式取数，预期可行；如果被 origin 拦，退回 `/api` 的 Typert RPC。

### 存储

`$DSH_HOME/myself-preset/`（默认 `~/.dsh/myself-preset/`）：

- `state.json`：条目、规则、手改、深读记录、设置。
- `profile.md`：编译后的最终人格，preset 变量只读这个文件。
- `backups/profile-<时间戳>.md`：每次编译前留一份，最多 20 份。
- `exports/myself-<时间戳>.json`：导出。

写入用临时文件 + rename；进程内串行化，避免并发写坏。

### preset 热更新（关键）

`preset/index.js` 是一个 preset 作用域插件：

```js
export const name = 'myself-style'
export const inject = ['systemPrompt']

export function apply(ctx) {
  ctx.systemPrompt.variable('myself_persona', () => readProfile())
}
```

`readProfile()` 的硬约束：

- **永远返回非空文本**。变量返回空会让整个 system prompt 组装抛错。文件缺失、空、全空白、读失败时，都返回 `BASE_PERSONA`。
- 清除 `{{`（替换成 `{ {`），避免和提示词变量语法冲突。
- 超过 6000 字符按句子边界截断，末尾留一句“（人格已截断）”。
- 按 mtime 缓存，文件没变就不重读。

`BASE_PERSONA` 是底座，约 300–500 字，包含标准 coding-agent 身份 + 结对协作行为（结论先行、敢反驳、不确定就说、先验证再声称）。

preset 里 `@deepseek-ai/dsh-persona` 的 `prefix` 写成 `{{myself_persona}}`。system prompt 每次组装都会重新求值变量，所以页面里保存后，下一句话就生效，不用重启、不用改 YAML。

### 编译人格

`compile.js` 的输出顺序：

1. `BASE_PERSONA`
2. 已启用的硬规则（本地 + 手改 + 深读规则），按维度分组
3. 已确认的深读画像（`portraitAccepted` 为 true 时）
4. 手改层：
   - `append`（默认）：追加在最后；
   - `takeover`：整段替换，编译不再覆盖，页面明确提示“自动学习暂停，直到退出接管”。

预算：底座 + 规则 + 画像 ≤ 1800 字；手改可把总长推到 6000 字；超了按置信度和维度优先级裁剪，末尾留说明。

### 本地分析

- 句子/段落切分：中文标点 + 换行；统计句长均值、中位数、短句/长句比例、段落长度方差。
- 标点密度：逗号、句号、问号、叹号、省略号、破折号、括号、引号、冒号。
- 结构：列表行、标题行、代码块、表格行、空行节奏。
- 词汇：2–4 字 n-gram、停用词过滤、跨条目复现；口头禅候选；emoji / 英文 / 数字比例。
- 语气：第一/第二人称比例、模糊词 vs 断言词、话语标记（其实、不过、所以、说白了、讲真……）。
- 开头/结尾：每段前 4 字、后 6 字的高频模式。
- AI 腔：内置中英文 slop 短语表，统计出现次数；纠正里被删掉的 slop 权重最高。
- 纠正 diff：句子级 LCS + 句内字符级 diff（长句降级为整句）；提取删除/新增短语、句数变化、句长变化、列表/标题变化、开头/结尾变化。
- 规则生成：每条规则带 dimension、confidence、evidence（条目 id + 原文片段）、layer=local。相似规则合并；本地规则最多 12 条。

### 进度

六个分量，0–1，边际递减：

- `volume = 1 - exp(-chars / 6000)`
- `rhythm = min(1, sentences / 120) * 句长/标点质量`
- `lexicon = min(1, uniqueNgrams / 600)`
- `voice = 0.7 * (1 - exp(-corrections / 4)) + 0.3 * 标记多样性`
- `structure = min(1, structureKinds / 5)`
- `scenario = min(1, entries / 6)`

总分 = 加权平均（voice 0.25、volume 0.2、rhythm 0.2、lexicon 0.15、structure 0.1、scenario 0.1）。当总分 ≥ 0.92 且 voice ≥ 0.65 时显示 100%；否则显示“还差：2 段纠正 / 1 个不同场景”。

量级锚点：

- 3 段中等语料（每段 1,200–2,000 字）+ 2 段纠正 ≈ 55–60%。
- 8 段 / 12,000 字 + 6 段纠正 ≈ 85–90%。
- 10 段 / 15,000 字 + 8 段纠正 + 2 种场景 ≈ 100%。

100% 后 `refinement = log(1 + chars/1000) + deepRuns * 0.5`。

### 深读

- 模型选择：`ctx.get('agentDefaultModel')?.currentSelection()`；页面设置可覆盖；都没有就报“模型没接上”。当前默认可能是 `magpie-responses / codex/gpt-6.1-sol`（web）或 `wps / deepseek/deepseek-v4.1-flash`（desktop），不要硬编码。
- 调用：`ctx.llm.stream({ provider, model, messages, maxTokens })`，累积 `text-delta`；120 秒超时；一次解析失败后用“只输出 JSON”重试一次。
- 输入：新增/改动条目 + 上一版已确认画像摘要；超过 20k 字符分块，最多 4 块，合并去重。
- 输出 schema：`{ summary, portrait, rules: [{ dimension, text, evidence: [{ entryId, quote }] }], warnings }`。
- 结果进 `deep.runs[]`，状态 `pending`；用户“整版收下 / 只收规则 / 拒绝”后写入 `state`，再编译 profile。
- 画像与规则的关系：画像只能由模型基于它输出的规则生成；如果用户关掉某条规则，画像标记 `portraitStale`，给“按现有规则重写画像”的本地按钮。
- 隐私：深读/试音会把选中的文本发给当前模型提供方；第一次使用前显示明确提示，设置里可关闭发送（关闭后深读按钮禁用）。

### 试音

同一套 `ctx.llm.stream`。system = `profile.md` 编译结果，user = 用户输入的场景。用 NDJSON 流式返回；失败时给“复制人格”兜底，方便用户自己贴到新会话。

### 设置

顶栏「设置」打开一个轻量 modal：

- 模型：默认（跟随当前默认模型）/ 指定 provider + model。
- 深读发送给模型：开 / 关。
- 导出 JSON。
- 清空所有数据（二次确认）。
- 内置 slop 词表、默认人设：v1 只读展示；v1.1 再做编辑。
- 导入 JSON：v1.1。

## 验收标准

1. 投喂 3 段中等语料 + 2 条纠正，进度到 55–60%，至少 6 条规则，`profile.md` 非空。
2. 新会话选「像你」preset，问“用一句话介绍你自己”，回复能体现至少 3 条已启用规则。
3. 在“人格提示词”的补充区加一句，保存后下一句话即生效；“完全接管”模式下编译不再覆盖原文。
4. 深读返回至少 3 条带原文证据的规则 + 一段画像；只收规则时画像不进口径；关掉规则后画像标记过期。
5. 100% 时液面没过头顶、铭牌变 `Ready`、光环展开；刷新、重启后状态保持。
6. 浅色/深色对比度达标；键盘可完成投喂、深读、收下、试音；reduced motion 下无动画但信息完整。
7. 删除一条语料后进度回退；清空后回到默认人设。
8. 1280×800 第一屏内能看到培养舱、总进度和主按钮。
9. 页面能通过 `/dsh-myself-preset/ping` 拿到宿主响应；拿不到时 fallback 方案在 README 写明。

## 风险与取舍

- **宿主路由 origin**：桌面壳可能不是 http origin；第一期先验证，失败退回 Typert RPC。
- **prompt 变量空值**：strict 插值会抛错，`readProfile` 必须永远返回非空底座；单元测试覆盖缺失/空/空白/读失败/超长/含 `{{`。
- **`ctx.llm` 路由/凭据不可用**：深读和试音失败要优雅降级，本地功能不受影响。
- **本地规则过拟合话题词**：只在多条目复现的词才进口头禅；用户可关；深读纠正。
- **客户端单文件过大**：按区块组织函数，图元用 SVG，气泡用 CSS；不引第三方动画库。
- **隐私**：默认只本地；深读/试音前明确提示；提供导出和清空。
- **视觉风险**：标本室风格可能和 DSH 原生界面割裂；用 token 打底，只让舞台和培养舱有强风格，左栏和抽屉保持原生密度。
- **生图一致性与抠图**：一张 hero 图用自下而上的软揭幕模拟生长；如果做多阶段，必须同机位、同光、同苔藓底座，否则交叉淡化会抖。透明背景优先，纯色底也能抠。
- **preset 清单过期**：DSH 升级后 `standard` 的插件行可能变化；用 `scripts/gen-preset.mjs` 重新生成，README 写明。

## 分期

1. 骨架：包、bundle patch、存储、本地分析、编译、preset 变量、dev patch；先验证 `/ping` 路由。
2. 页面：布局、玻璃花房、投喂/纠正/直给、进度。
3. 深读、试音、规则抽屉、待确认、设置。
4. 打磨：动效、浅深色、键盘、reduced motion、截图、安装、文档。

## 待确认

- 预设先装成可选，不擅自改默认；用户在新建会话里切换。确认后可以再设默认。
- 已定：页面/侧栏用「语感花房」，preset 显示名用「像你」。
- 生图先做一张 100% 成树图即可；如果想要更真实的生长，再补 0/25/50/75 四张同机位图。
- 底座人设保留标准 coding-agent 身份 + 结对协作行为；如果你想连底座也完全由语料决定，告诉我，我改成“底座也可编辑”。
