/**
 * 浏览器侧：语感花房页面。
 *
 * 左侧喂养台，右侧玻璃花房，底部人格档案抽屉。数据来自宿主路由
 * /dsh-myself-preset/*；改动只写本机，深读/试音才调模型。
 *
 * 改这个文件后客户端模块会按 bundle 的 mtime/大小热更新；没变化就刷新页面。
 */
window.__ModuleLoader__.load({
  id: 'dsh-myself-preset',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;

    const React = require('react');
    const h = React.createElement;

    /** 插件 id / 面板 id / locale 命名空间。 */
    const PLUGIN_ID = 'dsh-myself-preset';
    /** 主区 key 与侧栏 id 相同。 */
    const PANEL_ID = 'dsh-myself-preset';
    /** locale 字典命名空间。 */
    const NS = 'dsh-myself-preset';
    /** 宿主路由前缀。 */
    const API = '/dsh-myself-preset';

    /** 维度顺序。 */
    const DIMENSIONS = [
      { id: 'voice', label: '语气' },
      { id: 'rhythm', label: '节奏' },
      { id: 'lexicon', label: '用词' },
      { id: 'structure', label: '结构' },
      { id: 'scenario', label: '场景' },
    ];

    /** 中文文案。 */
    const zh = {
      nav: '语感花房',
      title: '语感花房',
      subtitle: 'Specimen 001 · 你的语气',
      corpus: '语料',
      correction: '纠正',
      note: '直给',
      feedTitle: '标题（可选）',
      feedPlaceholder: '粘贴一段你写的东西……',
      original: 'AI 原稿',
      originalPlaceholder: '把模型原来的回复贴在这里……',
      revised: '你的改写',
      revisedPlaceholder: '把它改成你会说的话……',
      notePlaceholder: '写一条明确规则，例如：别用“赋能 / 闭环”；先给结论；少用列表',
      pour: '开始滋养',
      pourCorrection: '投喂纠正',
      pourNote: '记下这条',
      importFile: '从文件导入',
      recent: '最近投喂',
      emptyRecent: '还没有投喂。',
      privacy: '语料只存在本机 · 深读/试音时才会发送给模型',
      privacyButton: '知道了',
      maturity: '成熟度',
      hints: '还差',
      ready: '第一版成形',
      readyNote: '可以继续精炼',
      deep: '深读',
      deepRunning: '深读中',
      settings: '设置',
      rules: '规则',
      prompt: '人格提示词',
      test: '试音',
      drawerTitle: '人格档案',
      drawerNote: '本地规则即时生效 · 深读结果需确认',
      rulesEmpty: '还没有规则；先喂一段语料。',
      promptHint: '保存后下一句话生效。追加 = 在自动人格后加一段；完全接管 = 整段由你决定。',
      promptPlaceholder: '补充几句你希望它记住的话……',
      append: '追加',
      takeover: '完全接管',
      save: '保存并生效',
      copy: '复制',
      copied: '已复制',
      testPlaceholder: '写一个场景，例如：同事问你为什么不用某个方案……',
      testRun: '用当前人格回答',
      testRunning: '正在回答…',
      like: '像',
      unlike: '不像',
      likeToast: '记下了。',
      unlikeToast: '把这段放进“AI 原稿”，写你的版本。',
      pending: '待确认的深读',
      acceptAll: '整版收下',
      acceptRules: '只收规则',
      reject: '拒绝',
      portraitStale: '画像可能过期：你关掉了某条深读规则。',
      rewritePortrait: '按现有规则重写画像',
      local: '本地',
      deepBadge: '深读',
      manual: '直给',
      delete: '删除',
      edit: '编辑',
      saveRule: '保存',
      cancel: '取消',
      empty: '还没有投喂。先喂一段你写的东西，或者一段你改过的回复。',
      loading: '正在读取培养舱…',
      error: '读取失败',
      retry: '重试',
      settingsTitle: '设置',
      model: '深读使用的模型',
      modelHint: '留空 = 跟随当前默认模型',
      provider: 'provider',
      modelId: 'model',
      sendToModel: '深读/试音时把文本发送给模型',
      export: '导出 JSON',
      reset: '清空所有数据',
      resetConfirm: '确定清空所有语料、规则和人格？备份会保留。',
      close: '关闭',
      saved: '已保存',
      deleted: '已删除',
      deepStarted: '深读开始。',
      deepDone: '深读完成，去规则里收下。',
      deepFailed: '深读失败',
      feedAdded: '已记录',
      learned: '学会了：',
      chars: '字',
      noModel: '模型没接上',
      assetAlt: '玻璃花房里的盆景树',
    };

    /** 英文只保留导航与最小标签，正文按中文产品走。 */
    const en = {
      nav: 'Persona nursery',
      title: 'Persona nursery',
      subtitle: 'Specimen 001 · your voice',
    };

    /** 没有 locale 座位时按文档语言兜底。 */
    function makeFallbackT() {
      const lang = String((typeof document !== 'undefined' && document.documentElement.lang) || '');
      const dict = lang.toLowerCase().startsWith('zh') ? zh : { ...zh, ...en };
      return (key) => dict[key] ?? key;
    }

    /** 浏览器侧需要的服务。 */
    const inject = ['slots', 'locale'];

    // ---- 样式 ----

    const css = `
.dmp-root{
  --dmp-paper:#f3efe6;--dmp-paper-2:#fbf8f1;--dmp-paper-3:#efe9dd;
  --dmp-ink:#1b1b1c;--dmp-ink-2:#5f5a52;--dmp-ink-3:#8d877c;
  --dmp-line:rgba(27,27,28,.13);--dmp-line-strong:rgba(27,27,28,.22);
  --dmp-teal:#2fb8a6;--dmp-teal-soft:rgba(47,184,166,.14);
  --dmp-amber:#e8a33d;--dmp-amber-soft:rgba(232,163,61,.16);
  --dmp-violet:#8b7cf6;
  --dmp-serif:"Songti SC","Noto Serif SC",Georgia,serif;
  --dmp-sans:-apple-system,BlinkMacSystemFont,"SF Pro Text","PingFang SC","Helvetica Neue",Arial,sans-serif;
  color-scheme:light;
  position:relative;flex:1 1 auto;min-height:0;width:100%;height:100%;
  overflow:hidden;color:var(--dmp-ink);font-family:var(--dmp-sans);
  background:
    radial-gradient(circle at 74% 38%,rgba(232,163,61,.10),transparent 38%),
    radial-gradient(circle at 60% 80%,rgba(47,184,166,.06),transparent 44%),
    var(--dmp-paper);
  -webkit-font-smoothing:antialiased;
}
.dmp-root.dmp-dark{
  --dmp-paper:#0f1115;--dmp-paper-2:#15181d;--dmp-paper-3:#1b1e24;
  --dmp-ink:#f2efe8;--dmp-ink-2:#b9b4aa;--dmp-ink-3:#77736b;
  --dmp-line:rgba(242,239,232,.12);--dmp-line-strong:rgba(242,239,232,.22);
  --dmp-teal:#4fd8c4;--dmp-teal-soft:rgba(79,216,196,.12);
  --dmp-amber:#f0b45a;--dmp-amber-soft:rgba(240,180,90,.12);
  --dmp-violet:#a99bff;
  color-scheme:dark;
  background:
    radial-gradient(circle at 74% 38%,rgba(232,163,61,.08),transparent 38%),
    radial-gradient(circle at 60% 80%,rgba(47,184,166,.05),transparent 44%),
    var(--dmp-paper);
}
.dmp-root.dmp-dark .dmp-jar{border-color:rgba(255,255,255,.16);box-shadow:inset 0 0 0 1px rgba(255,255,255,.08),inset 18px 0 30px rgba(255,255,255,.10),inset -18px 0 30px rgba(255,255,255,.04),0 24px 60px rgba(0,0,0,.55);background:linear-gradient(180deg,rgba(255,255,255,.10),rgba(255,255,255,.02) 26%,rgba(255,255,255,.04) 70%,rgba(255,255,255,.08))}
.dmp-root.dmp-dark .dmp-plant{filter:saturate(.96) contrast(1.04) brightness(1.05) drop-shadow(0 18px 28px rgba(0,0,0,.55))}
.dmp-root.dmp-dark .dmp-water-body{background:linear-gradient(180deg,rgba(79,216,196,.20),rgba(79,216,196,.04))}
.dmp-root.dmp-dark .dmp-base{background:linear-gradient(180deg,#23201b,#11100e);box-shadow:0 18px 40px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.08)}
.dmp-root.dmp-dark .dmp-plaque{background:linear-gradient(180deg,#2a251f,#1a1713);border-color:rgba(232,163,61,.35)}
.dmp-root.dmp-dark .dmp-memory{background:color-mix(in srgb,var(--dmp-paper-2) 78%,transparent)}
.dmp-root.dmp-dark .dmp-drop{background:rgba(255,255,255,.38);box-shadow:0 1px 3px rgba(0,0,0,.35),inset 0 1px 1px rgba(255,255,255,.65)}
.dmp-app{position:relative;z-index:1;display:grid;grid-template-columns:400px minmax(0,1fr);grid-template-rows:64px minmax(0,1fr) 48px;height:100%;min-height:0;overflow:hidden}
.dmp-top{grid-column:1/3;display:flex;align-items:center;justify-content:space-between;padding:0 26px 0 24px;border-bottom:1px solid var(--dmp-line);background:var(--dmp-paper);min-width:0}
.dmp-brand{display:flex;align-items:center;gap:12px;min-width:0}
.dmp-brand-mark{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;border:1px solid var(--dmp-line-strong);background:var(--dmp-paper-2);box-shadow:inset 0 0 0 4px var(--dmp-paper);flex:none}
.dmp-brand h1{margin:0;font-family:var(--dmp-serif);font-size:21px;font-weight:500;letter-spacing:.01em;line-height:1.2;overflow-wrap:break-word;min-width:0}
.dmp-brand p{margin:3px 0 0;font-family:var(--dmp-serif);font-size:11px;color:var(--dmp-ink-3);letter-spacing:.04em;white-space:nowrap}
.dmp-top-right{display:flex;align-items:center;gap:10px;flex:none}
.dmp-status{font-size:11.5px;color:var(--dmp-ink-3);padding-right:6px;white-space:nowrap}
.dmp-status b{color:var(--dmp-ink-2);font-weight:500}
.dmp-btn{height:32px;padding:0 13px;border-radius:9px;border:1px solid var(--dmp-line);background:transparent;color:var(--dmp-ink-2);font-size:12px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:7px;transition:background-color .15s,border-color .15s,color .15s,transform .15s;font-family:inherit}
.dmp-btn:hover{background:color-mix(in srgb,var(--dmp-ink) 5%,transparent);color:var(--dmp-ink)}
.dmp-btn:disabled{opacity:.42;cursor:default;pointer-events:none}
.dmp-btn.primary{border-color:var(--dmp-ink);background:var(--dmp-ink);color:var(--dmp-paper)}
.dmp-btn.primary:hover{background:color-mix(in srgb,var(--dmp-ink) 88%,var(--dmp-teal))}
.dmp-btn.icon{width:32px;padding:0}
.dmp-btn.small{height:31px;padding:0 14px}
.dmp-btn.ghost{border-color:transparent;background:transparent}
.dmp-btn.danger{color:var(--dmp-ink-2);border-color:color-mix(in srgb,var(--dmp-violet) 32%,var(--dmp-line))}
.dmp-btn.danger:hover{color:var(--dmp-ink);border-color:var(--dmp-violet)}
.dmp-btn:focus-visible,.dmp-tab:focus-visible,.dmp-link:focus-visible,.dmp-switch:focus-visible,.dmp-mini:focus-visible,.dmp-input:focus-visible,.dmp-textarea:focus-visible,.dmp-drawer button:focus-visible,.dmp-modal button:focus-visible{outline:2px solid var(--dmp-teal);outline-offset:2px}
.dmp-feed{grid-column:1;grid-row:2;min-height:0;padding:22px 24px 18px;border-right:1px solid var(--dmp-line);display:flex;flex-direction:column;overflow-y:auto;overflow-x:clip;background:var(--dmp-paper)}
.dmp-tabs{display:flex;gap:22px;border-bottom:1px solid var(--dmp-line);margin-bottom:18px;flex:none}
.dmp-tab{position:relative;padding:0 0 10px;border:0;background:transparent;color:var(--dmp-ink-3);font-size:12.5px;cursor:pointer;font-family:inherit}
.dmp-tab:hover{color:var(--dmp-ink)}
.dmp-tab.active{color:var(--dmp-ink);font-weight:500}
.dmp-tab.active::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:1.5px;background:var(--dmp-ink)}
.dmp-field-label{display:flex;align-items:baseline;justify-content:space-between;margin:0 0 7px;font-size:11.5px;color:var(--dmp-ink-3);flex:none}
.dmp-field-label span{color:var(--dmp-ink-3);font-size:11px}
.dmp-input{width:100%;height:36px;padding:0 11px;border:1px solid var(--dmp-line);border-radius:9px;background:var(--dmp-paper-2);color:var(--dmp-ink);font:12.5px/1.4 var(--dmp-sans);outline:none;margin-bottom:16px;box-sizing:border-box}
.dmp-input::placeholder,.dmp-textarea::placeholder{color:var(--dmp-ink-3);opacity:.75}
.dmp-textarea{width:100%;min-height:150px;padding:13px 14px 34px;border:1px solid var(--dmp-line);border-radius:11px;background:var(--dmp-paper-2);color:var(--dmp-ink);font:12.8px/1.85 var(--dmp-sans);outline:none;resize:vertical;box-sizing:border-box;box-shadow:0 1px 0 rgba(255,255,255,.55) inset}
.dmp-textarea.short{min-height:108px;padding-bottom:14px}
.dmp-root .dmp-input,.dmp-root .dmp-textarea{background-color:var(--dmp-paper-2)!important;color:var(--dmp-ink)!important;border-color:var(--dmp-line)!important;caret-color:var(--dmp-ink);-webkit-text-fill-color:var(--dmp-ink)}
.dmp-root .dmp-input::placeholder,.dmp-root .dmp-textarea::placeholder{color:var(--dmp-ink-3)!important;opacity:.75}
.dmp-root .dmp-field input{background-color:var(--dmp-paper)!important;color:var(--dmp-ink)!important;border-color:var(--dmp-line)!important;-webkit-text-fill-color:var(--dmp-ink)}

.dmp-editor-wrap{position:relative;flex:none}
.dmp-char{position:absolute;right:12px;bottom:10px;font-size:10.5px;color:var(--dmp-ink-3);font-variant-numeric:tabular-nums;pointer-events:none}
.dmp-editor-actions{position:absolute;left:12px;bottom:9px;display:flex;gap:12px;align-items:center}
.dmp-link{border:0;background:none;padding:0;color:var(--dmp-ink-2);font-size:11px;cursor:pointer;font-family:inherit}
.dmp-link:hover{color:var(--dmp-ink)}
.dmp-pour{width:100%;height:42px;margin-top:14px;border-radius:11px;font-size:13px;justify-content:space-between;padding:0 15px 0 13px;flex:none}
.dmp-pour .left{display:inline-flex;align-items:center;gap:8px}
.dmp-pour .delta{font-size:11.5px;opacity:.68;font-variant-numeric:tabular-nums}
.dmp-hint{margin:8px 0 0;font-size:11px;color:var(--dmp-ink-3);line-height:1.5;flex:none}
.dmp-signals{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px}
.dmp-chip{padding:2px 7px;border-radius:999px;background:var(--dmp-teal-soft);color:var(--dmp-teal);font-size:10px;line-height:1.5;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dmp-recent{margin-top:22px;min-height:0}
.dmp-recent-head{display:flex;align-items:baseline;justify-content:space-between;padding-bottom:8px;border-bottom:1px solid var(--dmp-line)}
.dmp-recent-head h2{margin:0;font-size:11.5px;font-weight:500;color:var(--dmp-ink-2)}
.dmp-recent-head span{font-size:10.5px;color:var(--dmp-ink-3)}
.dmp-item{display:grid;grid-template-columns:42px minmax(0,1fr) 18px;gap:9px;align-items:center;padding:9px 0;border-bottom:1px solid var(--dmp-line)}
.dmp-badge{justify-self:start;padding:2px 6px;border-radius:5px;font-size:10px;line-height:1.3;white-space:nowrap}
.dmp-badge.corpus{color:var(--dmp-teal);background:var(--dmp-teal-soft)}
.dmp-badge.correction{color:var(--dmp-amber);background:var(--dmp-amber-soft)}
.dmp-badge.note{color:var(--dmp-violet);background:color-mix(in srgb,var(--dmp-violet) 12%,transparent)}
.dmp-item strong{display:block;font-size:11.5px;font-weight:500;color:var(--dmp-ink-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dmp-item em{display:block;margin-top:2px;font-style:normal;font-size:10.5px;color:var(--dmp-ink-3)}
.dmp-item .x{border:0;background:none;color:var(--dmp-ink-3);cursor:pointer;font-size:14px;line-height:1;padding:0;opacity:0}
.dmp-item:hover .x,.dmp-item:focus-within .x{opacity:1}
.dmp-empty{padding:26px 0;text-align:center;font-size:12px;color:var(--dmp-ink-3);line-height:1.6}
.dmp-banner{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:9px 10px;margin:0 0 14px;border:1px solid var(--dmp-line);border-radius:9px;background:color-mix(in srgb,var(--dmp-teal) 6%,transparent);font-size:10.5px;line-height:1.5;color:var(--dmp-ink-3);flex:none}
.dmp-banner button{border:0;background:none;color:var(--dmp-ink-2);font-size:10px;cursor:pointer;padding:0;text-decoration:underline;text-underline-offset:2px;font-family:inherit;flex:none}
.dmp-privacy{margin-top:auto;padding-top:12px;font-size:10px;line-height:1.5;color:var(--dmp-ink-3);border-top:1px solid var(--dmp-line);display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex:none}
.dmp-privacy button{border:0;background:none;color:var(--dmp-ink-2);font-size:10px;cursor:pointer;padding:0;text-decoration:underline;text-underline-offset:2px;font-family:inherit}
.dmp-stage{grid-column:2;grid-row:2;position:relative;min-width:0;min-height:0;display:flex;flex-direction:column;padding:20px 34px 18px;overflow:hidden;background:radial-gradient(circle at 58% 36%,color-mix(in srgb,var(--dmp-amber) 10%,transparent),transparent 40%),radial-gradient(circle at 78% 82%,color-mix(in srgb,var(--dmp-teal) 6%,transparent),transparent 46%),var(--dmp-paper)}
.dmp-stage-top{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;position:relative;z-index:4;flex:none}
.dmp-stage-kicker{font-size:11px;color:var(--dmp-ink-3);letter-spacing:.02em}
.dmp-stage-percent{font-family:var(--dmp-serif);font-size:32px;font-weight:400;line-height:1;letter-spacing:-.01em;margin-left:8px}
.dmp-stage-percent small{font-size:14px;color:var(--dmp-ink-3);margin-left:2px}
.dmp-stage-note{font-size:11px;color:var(--dmp-ink-3);padding-bottom:2px;text-align:right}
.dmp-stage-note b{color:var(--dmp-ink-2);font-weight:500}
.dmp-stage-main{position:relative;flex:1 1 auto;min-height:0;display:grid;place-items:center}
.dmp-halo{position:absolute;left:50%;top:50%;width:610px;height:610px;transform:translate(-50%,-50%);opacity:.72;pointer-events:none}
.dmp-halo .orbit{fill:none;stroke:var(--dmp-line);stroke-width:1}
.dmp-halo .ticks{fill:none;stroke:var(--dmp-ink-3);stroke-width:1;stroke-dasharray:1 9;opacity:.45}
.dmp-halo .arc{fill:none;stroke:var(--dmp-teal);stroke-width:2.4;stroke-linecap:round;transition:stroke-dasharray .8s cubic-bezier(.16,1,.3,1)}
.dmp-halo .arc-glow{fill:none;stroke:var(--dmp-teal);stroke-width:7;stroke-linecap:round;opacity:.12}
.dmp-vessel{position:relative;z-index:2;width:390px;height:620px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end}
.dmp-jar{position:relative;width:340px;height:500px;border-radius:170px 170px 20px 20px;overflow:hidden;border:1px solid rgba(27,27,28,.22);box-shadow:inset 0 0 0 1px rgba(255,255,255,.72),inset 18px 0 30px rgba(255,255,255,.22),inset -18px 0 30px rgba(255,255,255,.08),0 24px 50px rgba(60,50,30,.12);background:linear-gradient(180deg,rgba(255,255,255,.30),rgba(238,246,244,.10) 26%,rgba(238,246,244,.12) 70%,rgba(255,255,255,.22));isolation:isolate}
.dmp-jar::before{content:"";position:absolute;left:14px;top:34px;bottom:28px;width:26px;border-radius:50%;background:linear-gradient(90deg,rgba(255,255,255,.32),rgba(255,255,255,0));filter:blur(2px);pointer-events:none;z-index:5}
.dmp-jar::after{content:"";position:absolute;left:12%;right:12%;top:0;height:44px;border-radius:0 0 50% 50%;border-bottom:1px solid rgba(255,255,255,.5);box-shadow:0 6px 18px rgba(255,255,255,.18) inset;pointer-events:none;z-index:5}
.dmp-plant{position:absolute;left:50%;bottom:12px;width:305px;height:auto;transform-origin:50% 100%;transition:transform .9s cubic-bezier(.16,1,.3,1);filter:saturate(.94) contrast(1.02) brightness(1.01) drop-shadow(0 18px 24px rgba(30,25,15,.18));z-index:2;display:block}
.dmp-water{position:absolute;inset:0;overflow:hidden;z-index:3;pointer-events:none}
.dmp-water-body{position:absolute;left:0;right:0;bottom:0;height:100%;transform:translateY(calc(100% - var(--dmp-water-level,8%)));transition:transform .9s cubic-bezier(.16,1,.3,1);background:linear-gradient(180deg,rgba(47,184,166,.15),rgba(47,184,166,.04))}
.dmp-water-surface{position:absolute;left:-6%;right:-6%;top:-1px;height:1px;background:linear-gradient(90deg,transparent,var(--dmp-teal) 12%,var(--dmp-teal) 88%,transparent);opacity:.38;animation:dmp-sway 7s ease-in-out infinite}
.dmp-water-surface::after{content:"";position:absolute;left:8%;right:8%;top:3px;height:1px;background:var(--dmp-teal);opacity:.14}
@keyframes dmp-sway{0%,100%{transform:translateY(0) rotate(-.15deg)}50%{transform:translateY(1px) rotate(.15deg)}}
.dmp-drop{position:absolute;z-index:5;border-radius:50%;background:rgba(255,255,255,.55);box-shadow:0 1px 2px rgba(30,25,15,.12),inset 0 1px 1px rgba(255,255,255,.8);pointer-events:none}
.dmp-drop.d1{left:74px;top:210px;width:5px;height:5px}
.dmp-drop.d2{left:254px;top:270px;width:3.5px;height:3.5px;opacity:.75}
.dmp-drop.d3{left:92px;top:392px;width:4px;height:4px;opacity:.65}
.dmp-drop.d4{left:238px;top:430px;width:3px;height:3px;opacity:.55}
.dmp-base{position:relative;z-index:4;width:372px;margin-top:-18px;padding:12px 18px;border-radius:10px;background:linear-gradient(180deg,#2f2b26,#211e1a);box-shadow:0 18px 30px rgba(30,25,15,.22),inset 0 1px 0 rgba(255,255,255,.12);display:flex;flex-direction:column;align-items:center;gap:7px}
.dmp-base::before{content:"";position:absolute;left:14px;right:14px;top:0;height:1px;background:linear-gradient(90deg,transparent,rgba(232,163,61,.55),transparent)}
.dmp-plaque{width:210px;padding:5px 10px 6px;border:1px solid rgba(232,163,61,.42);border-radius:4px;background:linear-gradient(180deg,#3b342a,#2a251f);text-align:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}
.dmp-plaque strong{display:block;font-family:var(--dmp-serif);font-size:10px;font-weight:500;letter-spacing:.08em;color:#e7c98f}
.dmp-plaque em{display:block;margin-top:1px;font-family:var(--dmp-serif);font-size:9px;font-style:italic;color:rgba(231,201,143,.66)}
.dmp-memory{position:absolute;z-index:6;padding:5px 9px;border:1px solid color-mix(in srgb,var(--dmp-teal) 32%,transparent);border-radius:999px;background:color-mix(in srgb,var(--dmp-paper-2) 84%,transparent);color:var(--dmp-ink-2);font-size:10.5px;line-height:1.2;white-space:nowrap;box-shadow:0 4px 16px rgba(47,184,166,.10);backdrop-filter:blur(4px);animation:dmp-float 8s ease-in-out infinite;pointer-events:none;max-width:150px;overflow:hidden;text-overflow:ellipsis}
.dmp-memory.m1{left:198px;top:282px}
.dmp-memory.m2{left:54px;top:358px;animation-delay:-2.6s}
.dmp-memory.m3{left:214px;top:426px;animation-delay:-5.1s;border-color:color-mix(in srgb,var(--dmp-amber) 38%,transparent)}
@keyframes dmp-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
.dmp-ready-glow{position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(circle at 50% 38%,rgba(232,163,61,.22),transparent 52%);opacity:0;transition:opacity .8s}
.dmp-jar.is-ready .dmp-ready-glow{opacity:1}
.dmp-stamp{position:absolute;right:16px;top:14px;z-index:7;padding:4px 8px;border:1px solid color-mix(in srgb,var(--dmp-amber) 55%,transparent);border-radius:4px;color:var(--dmp-amber);font-family:var(--dmp-serif);font-size:9px;letter-spacing:.08em;transform:rotate(-3deg);background:color-mix(in srgb,var(--dmp-paper-2) 72%,transparent)}
.dmp-meters{position:relative;z-index:4;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px;max-width:760px;width:100%;margin:0 auto;padding:12px 0 4px;border-top:1px solid var(--dmp-line);flex:none}
.dmp-meter{min-width:0}
.dmp-meter-head{display:flex;align-items:baseline;justify-content:space-between;gap:6px}
.dmp-meter-head span{font-size:10.5px;color:var(--dmp-ink-3)}
.dmp-meter-head b{font-size:10.5px;font-weight:500;color:var(--dmp-ink-2);font-variant-numeric:tabular-nums}
.dmp-bar{height:2px;margin-top:6px;background:var(--dmp-line);border-radius:2px;overflow:hidden}
.dmp-bar i{display:block;height:100%;background:var(--dmp-teal);border-radius:2px;transform-origin:left;transition:transform .8s cubic-bezier(.16,1,.3,1)}
.dmp-meter:nth-child(1) .dmp-bar i{background:var(--dmp-amber)}
.dmp-stage-foot{position:relative;z-index:4;display:flex;align-items:center;justify-content:space-between;gap:16px;max-width:760px;width:100%;margin:8px auto 0;font-size:11px;color:var(--dmp-ink-3);flex:none;min-width:0}
.dmp-stage-foot b{color:var(--dmp-ink-2);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.dmp-stage-foot button{border:0;background:none;color:var(--dmp-ink-3);font-size:11px;cursor:pointer;padding:0;flex:none;font-family:inherit}
.dmp-stage-foot button:hover{color:var(--dmp-ink)}
.dmp-drawer{grid-column:1/3;grid-row:3;display:flex;align-items:center;gap:18px;padding:0 24px;border-top:1px solid var(--dmp-line);background:var(--dmp-paper);cursor:pointer;user-select:none}
.dmp-drawer-handle{width:22px;height:22px;display:grid;place-items:center;border:1px solid var(--dmp-line);border-radius:50%;color:var(--dmp-ink-3);font-size:10px;flex:none;transition:transform .2s}
.dmp-drawer.open .dmp-drawer-handle{transform:rotate(180deg)}
.dmp-drawer strong{font-size:11.5px;font-weight:500;color:var(--dmp-ink-2)}
.dmp-drawer nav{display:flex;gap:4px}
.dmp-drawer nav button{height:27px;padding:0 10px;border:0;border-radius:7px;background:transparent;color:var(--dmp-ink-3);font-size:11px;cursor:pointer;font-family:inherit}
.dmp-drawer nav button:hover{color:var(--dmp-ink);background:color-mix(in srgb,var(--dmp-ink) 5%,transparent)}
.dmp-drawer nav button.active{color:var(--dmp-ink);background:color-mix(in srgb,var(--dmp-ink) 6%,transparent)}
.dmp-drawer-note{margin-left:auto;font-size:10.5px;color:var(--dmp-ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dmp-drawer-panel{position:absolute;left:0;right:0;bottom:48px;height:46%;z-index:20;display:flex;flex-direction:column;background:var(--dmp-paper-2);border-top:1px solid var(--dmp-line-strong);box-shadow:0 -18px 50px rgba(30,25,15,.12);overflow:hidden}
.dmp-drawer-head{display:flex;align-items:center;gap:14px;padding:12px 24px;border-bottom:1px solid var(--dmp-line);flex:none}
.dmp-drawer-head strong{font-family:var(--dmp-serif);font-size:15px;font-weight:500}
.dmp-drawer-head .dmp-close{margin-left:auto}
.dmp-drawer-body{flex:1 1 auto;min-height:0;overflow-y:auto;padding:18px 24px 28px}
.dmp-rule-group{margin-bottom:20px}
.dmp-rule-group h4{margin:0 0 8px;font-size:11px;font-weight:500;color:var(--dmp-ink-3);letter-spacing:.02em}
.dmp-rule{border:1px solid var(--dmp-line);border-radius:10px;padding:10px 12px;margin-bottom:8px;background:color-mix(in srgb,var(--dmp-paper) 55%,transparent)}
.dmp-rule-top{display:flex;align-items:center;gap:8px;min-width:0}
.dmp-src{font-size:9.5px;line-height:1.5;padding:1px 6px;border-radius:5px;flex:none}
.dmp-src.local{color:var(--dmp-teal);background:var(--dmp-teal-soft)}
.dmp-src.deep{color:var(--dmp-violet);background:color-mix(in srgb,var(--dmp-violet) 12%,transparent)}
.dmp-src.manual{color:var(--dmp-amber);background:var(--dmp-amber-soft)}
.dmp-rule-dim{font-size:10px;color:var(--dmp-ink-3);flex:none}
.dmp-rule-text{margin:7px 0 0;font-size:12px;line-height:1.65;color:var(--dmp-ink-2)}
.dmp-quote{margin:6px 0 0;font-size:10.5px;line-height:1.55;color:var(--dmp-ink-3);border-left:1px solid var(--dmp-line-strong);padding-left:8px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.dmp-rule-actions{margin-left:auto;display:flex;align-items:center;gap:4px;flex:none}
.dmp-mini{border:0;background:none;color:var(--dmp-ink-3);font-size:10px;cursor:pointer;padding:2px 5px;border-radius:5px;font-family:inherit}
.dmp-mini:hover{color:var(--dmp-ink);background:color-mix(in srgb,var(--dmp-ink) 5%,transparent)}
.dmp-mini.danger:hover{color:var(--dmp-violet)}
.dmp-switch{width:28px;height:16px;border-radius:999px;border:1px solid var(--dmp-line-strong);background:color-mix(in srgb,var(--dmp-ink) 8%,transparent);position:relative;cursor:pointer;padding:0;flex:none;transition:background-color .15s,border-color .15s}
.dmp-switch::after{content:"";position:absolute;top:1.5px;left:2px;width:11px;height:11px;border-radius:50%;background:var(--dmp-paper-2);box-shadow:0 1px 2px rgba(0,0,0,.2);transition:transform .15s}
.dmp-switch.on{background:var(--dmp-teal);border-color:var(--dmp-teal)}
.dmp-switch.on::after{transform:translateX(12px)}
.dmp-pending{border:1px solid color-mix(in srgb,var(--dmp-violet) 38%,var(--dmp-line));border-radius:12px;padding:12px 14px;margin-bottom:18px;background:color-mix(in srgb,var(--dmp-violet) 4%,transparent)}
.dmp-pending-head{display:flex;align-items:baseline;gap:8px;justify-content:space-between;min-width:0}
.dmp-pending-head strong{font-size:12px;font-weight:500;color:var(--dmp-ink)}
.dmp-pending-head span{font-size:10px;color:var(--dmp-ink-3);flex:none}
.dmp-pending-summary{margin:6px 0 8px;font-size:11.5px;line-height:1.6;color:var(--dmp-ink-2)}
.dmp-pending-list{display:flex;flex-direction:column;gap:6px;margin-bottom:10px}
.dmp-pending-rule{font-size:11px;line-height:1.55;color:var(--dmp-ink-2)}
.dmp-pending-rule .dmp-quote{margin-top:3px}
.dmp-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dmp-pre{margin:0;padding:12px 14px;border:1px solid var(--dmp-line);border-radius:10px;background:var(--dmp-paper);color:var(--dmp-ink-2);font:11.5px/1.65 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;overflow:auto;max-height:220px}
.dmp-prompt-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:18px;align-items:start}
.dmp-prompt-side{display:flex;flex-direction:column;gap:8px;min-width:0}
.dmp-seg{display:inline-flex;gap:2px;padding:2px;border-radius:8px;background:color-mix(in srgb,var(--dmp-ink) 6%,transparent);align-self:flex-start}
.dmp-seg button{border:0;background:transparent;color:var(--dmp-ink-3);font-size:10.5px;padding:4px 8px;border-radius:6px;cursor:pointer;font-family:inherit}
.dmp-seg button.active{background:var(--dmp-paper-2);color:var(--dmp-ink);box-shadow:0 1px 2px rgba(0,0,0,.12)}
.dmp-test{display:flex;flex-direction:column;gap:10px}
.dmp-test .dmp-textarea{min-height:76px;padding-bottom:14px}
.dmp-test-out{min-height:100px;max-height:220px;overflow:auto;padding:12px 14px;border:1px solid var(--dmp-line);border-radius:10px;background:var(--dmp-paper);font-size:12.5px;line-height:1.75;color:var(--dmp-ink-2);white-space:pre-wrap}
.dmp-test-out:empty{display:none}
.dmp-caret{display:inline-block;width:1px;height:1.1em;background:var(--dmp-teal);vertical-align:-.15em;animation:dmp-caret 1s steps(2) infinite}
@keyframes dmp-caret{50%{opacity:0}}
.dmp-modal-mask{position:fixed;inset:0;z-index:40;background:rgba(15,17,21,.42);display:grid;place-items:center;padding:24px}
.dmp-modal{width:min(520px,100%);max-height:calc(100vh - 48px);overflow:auto;border-radius:16px;border:1px solid var(--dmp-line-strong);background:var(--dmp-paper-2);box-shadow:0 24px 70px rgba(0,0,0,.28);color:var(--dmp-ink);padding:20px 22px}
.dmp-modal-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
.dmp-modal-head strong{font-family:var(--dmp-serif);font-size:18px;font-weight:500}
.dmp-field{display:flex;flex-direction:column;gap:6px;margin-bottom:12px}
.dmp-field label{font-size:11px;color:var(--dmp-ink-3)}
.dmp-field input{height:34px;border:1px solid var(--dmp-line);border-radius:8px;background:var(--dmp-paper);color:var(--dmp-ink);padding:0 10px;font:12px/1.4 var(--dmp-sans);outline:none;box-sizing:border-box}
.dmp-check{display:flex;align-items:flex-start;gap:8px;font-size:11.5px;line-height:1.5;color:var(--dmp-ink-2);margin-bottom:14px;cursor:pointer}
.dmp-check input{margin-top:2px;accent-color:var(--dmp-teal)}
.dmp-modal-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:16px}
.dmp-modal-actions .dmp-spacer{flex:1 1 auto}
.dmp-toast{position:fixed;left:50%;bottom:72px;transform:translateX(-50%);z-index:50;max-width:min(560px,calc(100vw - 48px));padding:9px 14px;border-radius:10px;border:1px solid var(--dmp-line-strong);background:var(--dmp-paper-2);color:var(--dmp-ink-2);font-size:11.5px;line-height:1.5;box-shadow:0 12px 30px rgba(0,0,0,.18);animation:dmp-toast .2s ease-out;overflow:hidden;text-overflow:ellipsis}
@keyframes dmp-toast{from{opacity:0;transform:translate(-50%,6px)}to{opacity:1;transform:translate(-50%,0)}}
.dmp-boot{flex:1 1 auto;display:grid;place-items:center;min-height:0;color:var(--dmp-ink-3);font-size:12px;height:100%}
.dmp-boot-inner{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;padding:24px}
.dmp-spinner{width:22px;height:22px;border-radius:50%;border:1.5px solid var(--dmp-line-strong);border-top-color:var(--dmp-teal);animation:dmp-spin .8s linear infinite}
@keyframes dmp-spin{to{transform:rotate(360deg)}}
.dmp-error{max-width:420px;display:flex;flex-direction:column;gap:10px;align-items:flex-start}
.dmp-error strong{font-family:var(--dmp-serif);font-size:18px;color:var(--dmp-ink)}
.dmp-error p{margin:0;font-size:12px;line-height:1.6;color:var(--dmp-ink-2)}
.dmp-skel{border-radius:10px;background:linear-gradient(90deg,color-mix(in srgb,var(--dmp-ink) 5%,transparent),color-mix(in srgb,var(--dmp-ink) 2%,transparent),color-mix(in srgb,var(--dmp-ink) 5%,transparent));background-size:200% 100%;animation:dmp-skel 1.4s ease-in-out infinite}
@keyframes dmp-skel{0%{background-position:200% 0}100%{background-position:-200% 0}}
@media (max-height:860px){
  .dmp-halo{width:520px;height:520px}
  .dmp-vessel{transform:scale(.86);transform-origin:center bottom;height:560px}
  .dmp-jar{width:310px;height:456px;border-radius:155px 155px 18px 18px}
  .dmp-plant{width:280px}
  .dmp-base{width:340px}
  .dmp-memory.m1{left:170px;top:250px}.dmp-memory.m2{left:36px;top:322px}.dmp-memory.m3{left:188px;top:386px}
}
@media (max-width:1050px){
  .dmp-app{grid-template-columns:350px minmax(0,1fr)}
  .dmp-feed{padding-left:18px;padding-right:18px}
  .dmp-stage{padding-left:20px;padding-right:20px}
  .dmp-brand h1{font-size:19px}
}
@media (max-width:860px){
  .dmp-app{grid-template-columns:1fr;grid-template-rows:64px minmax(420px,1fr) auto 48px;height:auto;min-height:100%}
  .dmp-feed{grid-column:1;grid-row:3;border-right:0;border-top:1px solid var(--dmp-line);max-height:46vh}
  .dmp-stage{grid-column:1;grid-row:2;min-height:420px;padding-top:10px}
  .dmp-drawer{grid-column:1;grid-row:4}
  .dmp-status{display:none}
  .dmp-prompt-grid{grid-template-columns:1fr}
  .dmp-drawer-panel{position:fixed;height:76vh;bottom:48px}
  .dmp-drawer-note{display:none}
  .dmp-vessel{transform:scale(.72);transform-origin:center bottom;height:500px}
  .dmp-halo{width:440px;height:440px}
}
@media (prefers-reduced-motion:reduce){
  .dmp-plant,.dmp-water-body,.dmp-bar i,.dmp-halo .arc{transition:none}
  .dmp-water-surface,.dmp-memory,.dmp-spinner,.dmp-skel,.dmp-carets{animation:none}
  .dmp-toast{animation:none}
}
    `;

    /** 注入一次样式。 */
    function ensureStyles() {
      if (typeof document === 'undefined') return;
      const tagId = `${PLUGIN_ID}/page.css`;
      const existing = document.querySelector(`style[data-plugin-css="${tagId}"]`);
      if (existing !== null) {
        existing.textContent = css;
        return;
      }
      const tag = document.createElement('style');
      tag.dataset.plugin = PLUGIN_ID;
      tag.dataset.pluginCss = tagId;
      tag.textContent = css;
      document.head.appendChild(tag);
    }

    // ---- 小工具 ----

    /** 请求宿主。 */
    async function request(path, body, method = 'POST') {
      const init = {
        method,
        headers: body === undefined ? undefined : { 'content-type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      };
      const response = await fetch(`${API}${path}`, init);
      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }
      if (!response.ok) {
        throw new Error(data?.error ?? `HTTP ${response.status}`);
      }
      return data;
    }

    /** 截断。 */
    function clampText(text, max) {
      const value = String(text ?? '');
      return value.length > max ? `${value.slice(0, max - 1)}…` : value;
    }

    /** 相对时间。 */
    function relativeTime(value) {
      const time = Number(value);
      if (!Number.isFinite(time)) return '';
      const delta = Math.max(0, Date.now() - time);
      if (delta < 60_000) return '刚刚';
      if (delta < 3_600_000) return `${Math.floor(delta / 60_000)} 分钟前`;
      if (delta < 86_400_000) return `${Math.floor(delta / 3_600_000)} 小时前`;
      const date = new Date(time);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    /** 数字格式。 */
    function formatChars(value) {
      return Number(value ?? 0).toLocaleString('zh-CN');
    }

    /** 维度名。 */
    function dimensionLabel(id) {
      return DIMENSIONS.find((item) => item.id === id)?.label ?? id;
    }

    /** 来源名。 */
    function layerLabel(layer, t) {
      if (layer === 'deep') return t('deepBadge');
      if (layer === 'manual') return t('manual');
      return t('local');
    }

    /** 按钮。 */
    function Btn(props) {
      const className = [
        'dmp-btn',
        props.primary === true ? 'primary' : '',
        props.ghost === true ? 'ghost' : '',
        props.danger === true ? 'danger' : '',
        props.icon === true ? 'icon' : '',
        props.small === true ? 'small' : '',
        props.className ?? '',
      ]
        .filter(Boolean)
        .join(' ');
      return h(
        'button',
        {
          type: 'button',
          className,
          onClick: props.onClick,
          disabled: props.disabled === true,
          title: props.title,
          'aria-label': props.ariaLabel,
        },
        props.children,
      );
    }

    /** 图标：玻璃罩 + 小植物。 */
    function VesselIcon(props) {
      const size = typeof props.size === 'number' ? props.size : 16;
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 20 20', fill: 'none', 'aria-hidden': 'true', focusable: 'false', style: { display: 'block', flex: 'none' } },
        h('path', { d: 'M5.2 8.4V15c0 1 .8 1.8 1.8 1.8h6c1 0 1.8-.8 1.8-1.8V8.4', stroke: 'currentColor', strokeWidth: 1.2, opacity: 0.75 }),
        h('path', { d: 'M4.2 8.4h11.6', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' }),
        h('path', { d: 'M10 8.4V5.6', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' }),
        h('path', { d: 'M10 6.4c-1.8 0-3-1-3-2.4 1.8 0 3 .9 3 2.4Z', fill: 'currentColor', opacity: 0.6 }),
        h('path', { d: 'M10 5.8c1.5 0 2.5-.9 2.5-2.1-1.5 0-2.5.8-2.5 2.1Z', fill: 'currentColor', opacity: 0.4 }),
        h('circle', { cx: 10, cy: 12.2, r: 0.8, fill: 'currentColor', opacity: 0.6 }),
      );
    }

    /** 侧栏图标。 */
    function PanelIcon(props) {
      return h(VesselIcon, { size: typeof props.size === 'number' ? props.size : 16 });
    }

    /** 放大镜。 */
    function SearchIcon() {
      return h(
        'svg',
        { width: 13, height: 13, viewBox: '0 0 14 14', fill: 'none', 'aria-hidden': 'true' },
        h('circle', { cx: 6.1, cy: 6.1, r: 3.9, stroke: 'currentColor', strokeWidth: 1.3 }),
        h('path', { d: 'm9.2 9.2 2.5 2.5', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' }),
      );
    }

    /** 设置图标。 */
    function SlidersIcon() {
      return h(
        'svg',
        { width: 14, height: 14, viewBox: '0 0 14 14', fill: 'none', 'aria-hidden': 'true' },
        h('path', { d: 'M2 3.2h10M2 7h10M2 10.8h10', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round', opacity: 0.58 }),
        h('circle', { cx: 5, cy: 3.2, r: 1.5, fill: 'var(--dmp-paper)', stroke: 'currentColor', strokeWidth: 1.2 }),
        h('circle', { cx: 9, cy: 7, r: 1.5, fill: 'var(--dmp-paper)', stroke: 'currentColor', strokeWidth: 1.2 }),
        h('circle', { cx: 4, cy: 10.8, r: 1.5, fill: 'var(--dmp-paper)', stroke: 'currentColor', strokeWidth: 1.2 }),
      );
    }

    /** 水滴。 */
    function DropIcon() {
      return h(
        'svg',
        { width: 15, height: 15, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true' },
        h('path', { d: 'M8 1.8S3.6 7.1 3.6 9.6a4.4 4.4 0 0 0 8.8 0C12.4 7.1 8 1.8 8 1.8Z', stroke: 'currentColor', strokeWidth: 1.2, strokeLinejoin: 'round' }),
        h('path', { d: 'M6.2 9.9c.2 1.2 1 1.9 2.1 2', stroke: 'currentColor', strokeWidth: 1.1, strokeLinecap: 'round' }),
      );
    }

    /** 面板标题。 */
    function PageHead(props) {
      return h(
        'header',
        { className: 'dmp-top' },
        h(
          'div',
          { className: 'dmp-brand' },
          h('span', { className: 'dmp-brand-mark', 'aria-hidden': 'true' }, h(VesselIcon, { size: 20 })),
          h('div', null, h('h1', null, props.t('title')), h('p', null, props.t('subtitle'))),
        ),
        h(
          'div',
          { className: 'dmp-top-right' },
          h('span', { className: 'dmp-status' }, h('b', null, String(props.rulesCount)), ' 条规则 · 深读 ', h('b', null, String(props.deepRuns)), ' 版'),
          h(Btn, { icon: true, title: props.t('settings'), ariaLabel: props.t('settings'), onClick: props.onSettings }, h(SlidersIcon)),
          h(
            Btn,
            {
              primary: true,
              small: true,
              disabled: props.deepDisabled,
              title: props.deepTitle,
              onClick: props.onDeep,
            },
            h(SearchIcon),
            props.deepRunning ? props.t('deepRunning') : props.t('deep'),
          ),
        ),
      );
    }

    /** 左侧喂养台。 */
    function FeedPanel(props) {
      const t = props.t;
      const state = props.state;
      const busy = props.busy;
      const tab = props.tab;
      const latestCorrection = state.entries.find((entry) => entry.type === 'correction');
      const fileRef = React.useRef(null);
      const [signalOpen, setSignalOpen] = React.useState(false);

      const onFile = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (file === undefined) return;
        try {
          const text = await file.text();
          props.onFileText(text, file.name.replace(/\.[^.]+$/u, ''));
        } catch (error) {
          props.onError(`读文件失败：${error instanceof Error ? error.message : String(error)}`);
        }
      };

      const canSubmit =
        tab === 'corpus'
          ? props.text.trim().length >= 20
          : tab === 'correction'
            ? props.original.trim().length >= 10 && props.revised.trim().length >= 10
            : props.note.trim().length >= 2;

      return h(
        'aside',
        { className: 'dmp-feed' },
        h(
          'div',
          { className: 'dmp-tabs', role: 'tablist', 'aria-label': '投喂类型' },
          h('button', { className: `dmp-tab${tab === 'corpus' ? ' active' : ''}`, role: 'tab', 'aria-selected': tab === 'corpus', onClick: () => props.onTab('corpus') }, t('corpus')),
          h('button', { className: `dmp-tab${tab === 'correction' ? ' active' : ''}`, role: 'tab', 'aria-selected': tab === 'correction', onClick: () => props.onTab('correction') }, t('correction')),
          h('button', { className: `dmp-tab${tab === 'note' ? ' active' : ''}`, role: 'tab', 'aria-selected': tab === 'note', onClick: () => props.onTab('note') }, t('note')),
        ),
        !state.settings.privacySeen
          ? h(
              'div',
              { className: 'dmp-banner' },
              h('span', null, t('privacy')),
              h('button', { type: 'button', onClick: props.onPrivacy }, t('privacyButton')),
            )
          : null,
        tab === 'corpus'
          ? h(
              React.Fragment,
              null,
              h('label', { className: 'dmp-field-label', htmlFor: 'dmp-title' }, t('feedTitle')),
              h('input', {
                id: 'dmp-title',
                className: 'dmp-input',
                value: props.title,
                placeholder: t('feedTitle'),
                onChange: (event) => props.onTitle(event.target.value),
              }),
              h('div', { className: 'dmp-field-label' }, '正文', h('span', null, `${formatChars(props.text.length)} ${t('chars')}`)),
              h(
                'div',
                { className: 'dmp-editor-wrap' },
                h('textarea', {
                  className: 'dmp-textarea',
                  value: props.text,
                  placeholder: t('feedPlaceholder'),
                  onChange: (event) => props.onText(event.target.value),
                  spellCheck: false,
                }),
                h(
                  'div',
                  { className: 'dmp-editor-actions' },
                  h('button', { type: 'button', className: 'dmp-link', onClick: () => fileRef.current?.click() }, t('importFile')),
                  h('input', { ref: fileRef, type: 'file', accept: '.txt,.md,.markdown,text/plain', style: { display: 'none' }, onChange: onFile }),
                ),
              ),
              h(
                Btn,
                { primary: true, className: 'dmp-pour', disabled: busy || !canSubmit, onClick: () => props.onFeed('corpus') },
                h('span', { className: 'left' }, h(DropIcon), t('pour')),
                h('span', { className: 'delta' }, busy ? '…' : '本地即时'),
              ),
              h('p', { className: 'dmp-hint' }, state.progress.hints[0] ?? '先喂一段你写的东西。'),
            )
          : null,
        tab === 'correction'
          ? h(
              React.Fragment,
              null,
              h('div', { className: 'dmp-field-label' }, t('original'), h('span', null, `${formatChars(props.original.length)} ${t('chars')}`)),
              h('textarea', {
                className: 'dmp-textarea short',
                value: props.original,
                placeholder: t('originalPlaceholder'),
                onChange: (event) => props.onOriginal(event.target.value),
                spellCheck: false,
              }),
              h('div', { className: 'dmp-field-label' }, t('revised'), h('span', null, `${formatChars(props.revised.length)} ${t('chars')}`)),
              h('textarea', {
                className: 'dmp-textarea short',
                value: props.revised,
                placeholder: t('revisedPlaceholder'),
                onChange: (event) => props.onRevised(event.target.value),
                spellCheck: false,
              }),
              h(
                Btn,
                { primary: true, className: 'dmp-pour', disabled: busy || !canSubmit, onClick: () => props.onFeed('correction') },
                h('span', { className: 'left' }, h(DropIcon), t('pourCorrection')),
                h('span', { className: 'delta' }, busy ? '…' : '高营养'),
              ),
              latestCorrection !== undefined && latestCorrection.signals !== undefined && latestCorrection.signals.length > 0
                ? h(
                    React.Fragment,
                    null,
                    h(
                      'button',
                      { type: 'button', className: 'dmp-link', style: { marginTop: 8 }, onClick: () => setSignalOpen((value) => !value) },
                      signalOpen ? '收起上次提取的信号' : '看上次提取的信号',
                    ),
                    signalOpen
                      ? h(
                          'div',
                          { className: 'dmp-signals' },
                          latestCorrection.signals.map((signal, index) =>
                            h('span', { className: 'dmp-chip', key: `${signal.key}-${index}`, title: signal.label }, signal.label),
                          ),
                        )
                      : null,
                  )
                : h('p', { className: 'dmp-hint' }, '投喂后会在“最近投喂”里留下 diff 和信号。'),
            )
          : null,
        tab === 'note'
          ? h(
              React.Fragment,
              null,
              h('div', { className: 'dmp-field-label' }, '明确规则', h('span', null, '立即生效')),
              h('textarea', {
                className: 'dmp-textarea short',
                value: props.note,
                placeholder: t('notePlaceholder'),
                onChange: (event) => props.onNote(event.target.value),
                spellCheck: false,
              }),
              h(
                Btn,
                { primary: true, className: 'dmp-pour', disabled: busy || !canSubmit, onClick: () => props.onFeed('note') },
                h('span', { className: 'left' }, h(DropIcon), t('pourNote')),
                h('span', { className: 'delta' }, '手改层'),
              ),
              h('p', { className: 'dmp-hint' }, '不想等分析时，直接把规则写死。'),
            )
          : null,
        h(
          'div',
          { className: 'dmp-recent' },
          h('div', { className: 'dmp-recent-head' }, h('h2', null, t('recent')), h('span', null, `${state.entries.length} 条`)),
          state.entries.length === 0
            ? h('div', { className: 'dmp-empty' }, t('empty'))
            : state.entries.slice(0, 6).map((entry) =>
                h(
                  'div',
                  { className: 'dmp-item', key: entry.id },
                  h('span', { className: `dmp-badge ${entry.type}` }, entry.type === 'corpus' ? t('corpus') : entry.type === 'correction' ? t('correction') : t('note')),
                  h(
                    'div',
                    { style: { minWidth: 0 } },
                    h('strong', { title: entry.title }, entry.title),
                    h('em', null, `${formatChars(entry.chars)} ${t('chars')} · ${relativeTime(entry.createdAt)}`),
                  ),
                  h('button', { type: 'button', className: 'x', 'aria-label': t('delete'), title: t('delete'), onClick: () => props.onDelete(entry.id) }, '×'),
                ),
              ),
        ),
        h('div', { className: 'dmp-privacy', style: { marginTop: 18 } }, h('span', null, t('privacy'))),
      );
    }

    /** 舞台。 */
    function Stage(props) {
      const t = props.t;
      const state = props.state;
      const progress = state.progress;
      const rules = state.rules.filter((rule) => rule.enabled !== false).slice(0, 3);
      const plantScale = 0.68 + 0.32 * Math.min(1, progress.overall);
      const waterLevel = 8 + 8 * Math.min(1, progress.overall);
      const arc = Math.max(0.01, Math.min(1, progress.overall)) * 100;
      return h(
        'main',
        { className: 'dmp-stage' },
        h(
          'div',
          { className: 'dmp-stage-top' },
          h('div', null, h('span', { className: 'dmp-stage-kicker' }, t('maturity')), h('strong', { className: 'dmp-stage-percent' }, String(progress.percent), h('small', null, '%'))),
          h('div', { className: 'dmp-stage-note' }, progress.ready ? h(React.Fragment, null, h('b', null, t('ready')), ' · ', t('readyNote')) : progress.hints.join(' · ')),
        ),
        h(
          'div',
          { className: 'dmp-stage-main' },
          h(
            'svg',
            { className: 'dmp-halo', viewBox: '0 0 610 610', 'aria-hidden': 'true' },
            h('circle', { className: 'orbit', cx: 305, cy: 305, r: 282 }),
            h('circle', { className: 'ticks', cx: 305, cy: 305, r: 269 }),
            h('circle', { className: 'arc-glow', cx: 305, cy: 305, r: 282, pathLength: 100, strokeDasharray: `${arc} 100`, transform: 'rotate(-90 305 305)' }),
            h('circle', { className: 'arc', cx: 305, cy: 305, r: 282, pathLength: 100, strokeDasharray: `${arc} 100`, transform: 'rotate(-90 305 305)' }),
            h('circle', { cx: 305, cy: 23, r: 3.2, fill: 'var(--dmp-teal)' }),
            h('circle', { cx: 305, cy: 305, r: 226, fill: 'none', stroke: 'var(--dmp-line)', strokeWidth: 1, opacity: 0.55 }),
          ),
          h(
            'div',
            { className: 'dmp-vessel' },
            h(
              'div',
              { className: `dmp-jar${progress.ready ? ' is-ready' : ''}` },
              h('div', { className: 'dmp-ready-glow' }),
              h('img', {
                className: 'dmp-plant',
                src: `${API}/asset/plant.png`,
                alt: t('assetAlt'),
                draggable: false,
                style: { transform: `translateX(-50%) scale(${plantScale.toFixed(4)})` },
              }),
              h(
                'div',
                { className: 'dmp-water', style: { '--dmp-water-level': `${waterLevel.toFixed(2)}%` } },
                h('div', { className: 'dmp-water-body' }, h('div', { className: 'dmp-water-surface' })),
              ),
              h('i', { className: 'dmp-drop d1', 'aria-hidden': 'true' }),
              h('i', { className: 'dmp-drop d2', 'aria-hidden': 'true' }),
              h('i', { className: 'dmp-drop d3', 'aria-hidden': 'true' }),
              h('i', { className: 'dmp-drop d4', 'aria-hidden': 'true' }),
              progress.ready ? h('span', { className: 'dmp-stamp' }, t('ready')) : null,
            ),
            h(
              'div',
              { className: 'dmp-base' },
              h(
                'div',
                { className: 'dmp-plaque' },
                h('strong', null, progress.ready ? 'Ready' : 'Specimen 001'),
                h('em', null, progress.ready ? '你的语气 · 已成形' : '你的语气 · 未成形'),
              ),
            ),
            rules[0] !== undefined ? h('div', { className: 'dmp-memory m1', title: rules[0].text }, clampText(rules[0].text, 10)) : null,
            rules[1] !== undefined ? h('div', { className: 'dmp-memory m2', title: rules[1].text }, clampText(rules[1].text, 10)) : null,
            rules[2] !== undefined ? h('div', { className: 'dmp-memory m3', title: rules[2].text }, clampText(rules[2].text, 10)) : null,
          ),
        ),
        h(
          'div',
          { className: 'dmp-meters' },
          DIMENSIONS.map((dimension) => {
            const value = progress.dimensions.find((item) => item.id === dimension.id)?.value ?? 0;
            return h(
              'div',
              { className: 'dmp-meter', key: dimension.id },
              h('div', { className: 'dmp-meter-head' }, h('span', null, dimension.label), h('b', null, String(value))),
              h('div', { className: 'dmp-bar' }, h('i', { style: { transform: `scaleX(${Math.max(0, Math.min(100, value)) / 100})` } })),
            );
          }),
        ),
        h(
          'div',
          { className: 'dmp-stage-foot' },
          h('span', null, state.latestRule !== null ? h('span', null, '它刚学会：', h('b', null, clampText(state.latestRule.text, 60))) : '先喂一段你写的东西。'),
          h('button', { type: 'button', onClick: () => props.onOpenRules() }, '查看规则 →'),
        ),
      );
    }

    /** 规则卡。 */
    function RuleCard(props) {
      const t = props.t;
      const rule = props.rule;
      const editing = props.editing === rule.id;
      return h(
        'div',
        { className: 'dmp-rule' },
        h(
          'div',
          { className: 'dmp-rule-top' },
          h('span', { className: `dmp-src ${rule.layer}` }, layerLabel(rule.layer, t)),
          h('span', { className: 'dmp-rule-dim' }, dimensionLabel(rule.dimension)),
          h(
            'div',
            { className: 'dmp-rule-actions' },
            h('button', {
              type: 'button',
              className: `dmp-switch${rule.enabled !== false ? ' on' : ''}`,
              role: 'switch',
              'aria-checked': rule.enabled !== false,
              'aria-label': rule.enabled !== false ? '停用这条规则' : '启用这条规则',
              onClick: () => props.onToggle(rule, rule.enabled === false),
            }),
            h('button', { type: 'button', className: 'dmp-mini', onClick: () => props.onEdit(rule) }, t('edit')),
            h('button', { type: 'button', className: 'dmp-mini danger', onClick: () => props.onDelete(rule) }, t('delete')),
          ),
        ),
        editing
          ? h(
              React.Fragment,
              null,
              h('textarea', {
                className: 'dmp-textarea short',
                style: { marginTop: 8, minHeight: 70 },
                value: props.editText,
                onChange: (event) => props.onEditText(event.target.value),
              }),
              h(
                'div',
                { className: 'dmp-actions', style: { marginTop: 6 } },
                h(Btn, { small: true, primary: true, onClick: props.onSaveEdit }, t('saveRule')),
                h(Btn, { small: true, ghost: true, onClick: props.onCancelEdit }, t('cancel')),
              ),
            )
          : h('p', { className: 'dmp-rule-text' }, rule.text),
        !editing && rule.evidence !== undefined && rule.evidence.length > 0
          ? h('p', { className: 'dmp-quote' }, `“${clampText(rule.evidence[0].quote, 72)}”`)
          : null,
      );
    }

    /** 待确认深读。 */
    function PendingCard(props) {
      const t = props.t;
      const run = props.run;
      return h(
        'div',
        { className: 'dmp-pending' },
        h('div', { className: 'dmp-pending-head' }, h('strong', null, t('pending')), h('span', null, `${run.rules.length} 条规则 + 画像`)),
        run.summary ? h('p', { className: 'dmp-pending-summary' }, run.summary) : null,
        h(
          'div',
          { className: 'dmp-pending-list' },
          run.rules.slice(0, 6).map((rule) =>
            h(
              'div',
              { className: 'dmp-pending-rule', key: rule.id },
              h('span', { className: `dmp-src ${rule.layer}` }, layerLabel('deep', t)),
              ' ',
              rule.text,
              rule.evidence?.[0]?.quote ? h('span', { className: 'dmp-quote' }, `“${clampText(rule.evidence[0].quote, 60)}”`) : null,
            ),
          ),
        ),
        h(
          'div',
          { className: 'dmp-actions' },
          h(Btn, { small: true, primary: true, onClick: () => props.onAccept(run.id, 'all') }, t('acceptAll')),
          h(Btn, { small: true, onClick: () => props.onAccept(run.id, 'rules') }, t('acceptRules')),
          h(Btn, { small: true, ghost: true, onClick: () => props.onAccept(run.id, 'reject') }, t('reject')),
        ),
      );
    }

    /** 抽屉。 */
    function Drawer(props) {
      const t = props.t;
      const state = props.state;
      const tab = props.tab;
      const groups = DIMENSIONS.map((dimension) => ({
        ...dimension,
        rules: state.rules.filter((rule) => rule.dimension === dimension.id),
      })).filter((group) => group.rules.length > 0);

      return h(
        React.Fragment,
        null,
        h(
          'footer',
          {
            className: `dmp-drawer${props.open ? ' open' : ''}`,
            onClick: props.onToggle,
            role: 'button',
            tabIndex: 0,
            'aria-expanded': props.open,
            onKeyDown: (event) => {
              if (event.key === 'Enter' || event.key === ' ') props.onToggle();
            },
          },
          h(
            'span',
            { className: 'dmp-drawer-handle', 'aria-hidden': 'true' },
            h('svg', { width: 10, height: 10, viewBox: '0 0 10 10', fill: 'none' }, h('path', { d: 'm2.4 6 2.6-2.6L7.6 6', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round', strokeLinejoin: 'round' })),
          ),
          h('strong', null, t('drawerTitle')),
          h(
            'nav',
            null,
            h('button', { type: 'button', className: tab === 'rules' ? 'active' : '', onClick: (event) => { event.stopPropagation(); props.onTab('rules'); } }, `${t('rules')} ${state.rules.length}`),
            h('button', { type: 'button', className: tab === 'prompt' ? 'active' : '', onClick: (event) => { event.stopPropagation(); props.onTab('prompt'); } }, t('prompt')),
            h('button', { type: 'button', className: tab === 'test' ? 'active' : '', onClick: (event) => { event.stopPropagation(); props.onTab('test'); } }, t('test')),
          ),
          h('span', { className: 'dmp-drawer-note' }, t('drawerNote')),
        ),
        props.open
          ? h(
              'section',
              { className: 'dmp-drawer-panel', 'aria-label': t('drawerTitle') },
              h(
                'div',
                { className: 'dmp-drawer-head' },
                h('strong', null, tab === 'rules' ? t('rules') : tab === 'prompt' ? t('prompt') : t('test')),
                h(Btn, { icon: true, ghost: true, className: 'dmp-close', ariaLabel: t('close'), title: t('close'), onClick: props.onClose }, '×'),
              ),
              h(
                'div',
                { className: 'dmp-drawer-body' },
                tab === 'rules'
                  ? h(
                      React.Fragment,
                      null,
                      state.deep.job?.status === 'running'
                        ? h('div', { className: 'dmp-pending' }, h('div', { className: 'dmp-pending-head' }, h('strong', null, '深读中'), h('span', null, state.deep.job.phase)), h('p', { className: 'dmp-pending-summary' }, '模型正在读语料；完成后会出现在这里，等你收下。'))
                        : null,
                      state.deep.job?.status === 'error'
                        ? h('div', { className: 'dmp-pending' }, h('div', { className: 'dmp-pending-head' }, h('strong', null, t('deepFailed')), h('span', null, '')), h('p', { className: 'dmp-pending-summary' }, state.deep.job.error ?? '未知错误'))
                        : null,
                      (state.deep.pending ?? []).map((run) =>
                        h(PendingCard, { key: run.id, t, run, onAccept: props.onAccept }),
                      ),
                      state.deep.portraitAccepted && state.deep.portraitStale
                        ? h(
                            'div',
                            { className: 'dmp-pending' },
                            h('div', { className: 'dmp-pending-head' }, h('strong', null, t('portraitStale')), h('span', null, '')),
                            h(Btn, { small: true, onClick: props.onRegenerate }, t('rewritePortrait')),
                          )
                        : null,
                      state.rules.length === 0
                        ? h('div', { className: 'dmp-empty' }, t('rulesEmpty'))
                        : groups.map((group) =>
                            h(
                              'div',
                              { className: 'dmp-rule-group', key: group.id },
                              h('h4', null, group.label),
                              group.rules.map((rule) =>
                                h(RuleCard, {
                                  key: rule.id,
                                  t,
                                  rule,
                                  editing: props.editingRule,
                                  editText: props.editText,
                                  onToggle: props.onToggleRule,
                                  onDelete: props.onDeleteRule,
                                  onEdit: props.onEditRule,
                                  onEditText: props.onEditText,
                                  onSaveEdit: props.onSaveEdit,
                                  onCancelEdit: props.onCancelEdit,
                                }),
                              ),
                            ),
                          ),
                    )
                  : null,
                tab === 'prompt'
                  ? h(
                      'div',
                      { className: 'dmp-prompt-grid' },
                      h(
                        'div',
                        null,
                        h('div', { className: 'dmp-field-label' }, '当前人格', h('button', { type: 'button', className: 'dmp-link', onClick: props.onCopy }, t('copy'))),
                        h('pre', { className: 'dmp-pre' }, state.profile),
                      ),
                      h(
                        'div',
                        { className: 'dmp-prompt-side' },
                        h('div', { className: 'dmp-field-label' }, '手动补充'),
                        h('textarea', {
                          className: 'dmp-textarea',
                          style: { minHeight: 120 },
                          value: props.manualText,
                          placeholder: t('promptPlaceholder'),
                          onChange: (event) => props.onManualText(event.target.value),
                        }),
                        h(
                          'div',
                          { className: 'dmp-seg', role: 'tablist', 'aria-label': '手改模式' },
                          h('button', { type: 'button', className: props.manualMode === 'append' ? 'active' : '', onClick: () => props.onManualMode('append') }, t('append')),
                          h('button', { type: 'button', className: props.manualMode === 'takeover' ? 'active' : '', onClick: () => props.onManualMode('takeover') }, t('takeover')),
                        ),
                        h(Btn, { primary: true, small: true, onClick: props.onSaveManual }, t('save')),
                        h('p', { className: 'dmp-hint' }, t('promptHint')),
                      ),
                    )
                  : null,
                tab === 'test'
                  ? h(
                      'div',
                      { className: 'dmp-test' },
                      h('textarea', {
                        className: 'dmp-textarea',
                        value: props.scenario,
                        placeholder: t('testPlaceholder'),
                        onChange: (event) => props.onScenario(event.target.value),
                      }),
                      h(
                        'div',
                        { className: 'dmp-actions' },
                        h(Btn, { primary: true, small: true, disabled: props.testRunning || props.scenario.trim().length < 2, onClick: props.onTest }, props.testRunning ? t('testRunning') : t('testRun')),
                        h('span', { className: 'dmp-hint', style: { margin: 0 } }, '会调用当前模型；结果不会自动写进人格。'),
                      ),
                      props.testError ? h('p', { className: 'dmp-hint', style: { color: 'var(--dmp-violet)' } }, props.testError) : null,
                      props.testOutput.length > 0
                        ? h('div', { className: 'dmp-test-out' }, props.testOutput, props.testRunning ? h('span', { className: 'dmp-caret' }) : null)
                        : null,
                      props.testOutput.length > 0 && !props.testRunning
                        ? h(
                            'div',
                            { className: 'dmp-actions' },
                            h(Btn, { small: true, onClick: props.onLike }, t('like')),
                            h(Btn, { small: true, onClick: props.onUnlike }, t('unlike')),
                          )
                        : null,
                    )
                  : null,
              ),
            )
          : null,
      );
    }

    /** 设置弹窗。 */
    function Settings(props) {
      const t = props.t;
      const state = props.state;
      return h(
        'div',
        { className: 'dmp-modal-mask', onClick: props.onClose },
        h(
          'div',
          { className: 'dmp-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('settingsTitle'), onClick: (event) => event.stopPropagation() },
          h(
            'div',
            { className: 'dmp-modal-head' },
            h('strong', null, t('settingsTitle')),
            h(Btn, { icon: true, ghost: true, ariaLabel: t('close'), title: t('close'), onClick: props.onClose }, '×'),
          ),
          h(
            'div',
            { className: 'dmp-field' },
            h('label', { htmlFor: 'dmp-provider' }, `${t('model')} · ${t('provider')}`),
            h('input', { id: 'dmp-provider', value: props.provider, placeholder: state.settings.defaultProvider ?? 'follow default', onChange: (event) => props.onProvider(event.target.value) }),
          ),
          h(
            'div',
            { className: 'dmp-field' },
            h('label', { htmlFor: 'dmp-model' }, `${t('model')} · ${t('modelId')}`),
            h('input', { id: 'dmp-model', value: props.model, placeholder: state.settings.defaultModel ?? 'follow default', onChange: (event) => props.onModel(event.target.value) }),
          ),
          h('p', { className: 'dmp-hint', style: { marginTop: -4, marginBottom: 14 } }, `${t('modelHint')}（${state.settings.defaultProvider ?? '—'} / ${state.settings.defaultModel ?? '—'}）`),
          h(
            'label',
            { className: 'dmp-check' },
            h('input', { type: 'checkbox', checked: props.sendToModel, onChange: (event) => props.onSendToModel(event.target.checked) }),
            h('span', null, t('sendToModel')),
          ),
          h(
            'div',
            { className: 'dmp-modal-actions' },
            h(Btn, { small: true, onClick: props.onExport }, t('export')),
            h(Btn, { small: true, danger: true, onClick: props.onReset }, t('reset')),
            h('span', { className: 'dmp-spacer' }),
            h(Btn, { small: true, primary: true, onClick: props.onSave }, t('save')),
          ),
        ),
      );
    }

    /** 主页面。 */
    function Page(props) {
      const t = React.useCallback(
        (key) => {
          if (typeof props.t === 'function') {
            const value = props.t(key);
            if (typeof value === 'string' && value !== key) return value;
          }
          return zh[key] ?? key;
        },
        [props.t],
      );
      const [dark, setDark] = React.useState(() => {
        if (typeof document === 'undefined') return false;
        return (
          document.documentElement.hasAttribute('data-ds-dark-theme') ||
          (typeof window !== 'undefined' &&
            typeof window.matchMedia === 'function' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches)
        );
      });
      React.useEffect(() => {
        if (typeof document === 'undefined') return undefined;
        const root = document.documentElement;
        const media =
          typeof window !== 'undefined' && typeof window.matchMedia === 'function'
            ? window.matchMedia('(prefers-color-scheme: dark)')
            : null;
        const update = () => setDark(root.hasAttribute('data-ds-dark-theme') || media?.matches === true);
        update();
        let observer = null;
        if (typeof MutationObserver === 'function') {
          observer = new MutationObserver(update);
          observer.observe(root, { attributes: true, attributeFilter: ['data-ds-dark-theme'] });
        }
        media?.addEventListener?.('change', update);
        return () => {
          observer?.disconnect();
          media?.removeEventListener?.('change', update);
        };
      }, []);
      const rootClass = `dmp-root ${dark ? 'dmp-dark' : 'dmp-light'}`;
      const [state, setState] = React.useState(null);
      const [status, setStatus] = React.useState('loading');
      const [error, setError] = React.useState('');
      const [busy, setBusy] = React.useState(false);
      const [tab, setTab] = React.useState('corpus');
      const [title, setTitle] = React.useState('');
      const [text, setText] = React.useState('');
      const [original, setOriginal] = React.useState('');
      const [revised, setRevised] = React.useState('');
      const [note, setNote] = React.useState('');
      const [drawer, setDrawer] = React.useState(false);
      const [drawerTab, setDrawerTab] = React.useState('rules');
      const [settingsOpen, setSettingsOpen] = React.useState(false);
      const [manualText, setManualText] = React.useState('');
      const [manualMode, setManualMode] = React.useState('append');
      const [editingRule, setEditingRule] = React.useState(null);
      const [editText, setEditText] = React.useState('');
      const [scenario, setScenario] = React.useState('');
      const [testOutput, setTestOutput] = React.useState('');
      const [testError, setTestError] = React.useState('');
      const [testRunning, setTestRunning] = React.useState(false);
      const [provider, setProvider] = React.useState('');
      const [model, setModel] = React.useState('');
      const [sendToModel, setSendToModel] = React.useState(true);
      const [toast, setToast] = React.useState(null);
      const toastTimer = React.useRef(null);
      const manualDirty = React.useRef(false);
      const settingsDirty = React.useRef(false);
      const deepPoll = React.useRef(null);

      const showToast = React.useCallback((message) => {
        if (toastTimer.current !== null) clearTimeout(toastTimer.current);
        setToast({ message, id: Date.now() });
        toastTimer.current = setTimeout(() => setToast(null), 4200);
      }, []);

      const applyState = React.useCallback((next) => {
        setState(next);
        if (!manualDirty.current) {
          setManualText(next.manual?.text ?? '');
          setManualMode(next.manual?.mode === 'takeover' ? 'takeover' : 'append');
        }
        if (!settingsDirty.current) {
          setProvider(next.settings?.provider ?? '');
          setModel(next.settings?.model ?? '');
          setSendToModel(next.settings?.sendToModel !== false);
        }
      }, []);

      const load = React.useCallback(async () => {
        setStatus((current) => (current === 'ready' ? current : 'loading'));
        try {
          const data = await request('/state.json', undefined, 'GET');
          applyState(data);
          setStatus('ready');
          setError('');
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : String(caught));
          setStatus('error');
        }
      }, [applyState]);

      React.useEffect(() => {
        void load();
        return () => {
          if (toastTimer.current !== null) clearTimeout(toastTimer.current);
          if (deepPoll.current !== null) clearInterval(deepPoll.current);
        };
      }, [load]);

      React.useEffect(() => {
        const job = state?.deep?.job;
        if (job === null || job === undefined || job.status !== 'running') {
          if (deepPoll.current !== null) {
            clearInterval(deepPoll.current);
            deepPoll.current = null;
          }
          return undefined;
        }
        if (deepPoll.current !== null) return undefined;
        deepPoll.current = setInterval(async () => {
          try {
            const data = await request('/deep/status', undefined, 'GET');
            setState((prev) => (prev === null ? prev : { ...prev, deep: { ...prev.deep, job: data.job, pending: data.pending ?? prev.deep.pending } }));
            if (data.job?.status === 'done') {
              clearInterval(deepPoll.current);
              deepPoll.current = null;
              const full = await request('/state.json', undefined, 'GET');
              applyState(full);
              setDrawer(true);
              setDrawerTab('rules');
              showToast(t('deepDone'));
            } else if (data.job?.status === 'error') {
              clearInterval(deepPoll.current);
              deepPoll.current = null;
              showToast(`${t('deepFailed')}：${data.job.error ?? '未知错误'}`);
            }
          } catch (caught) {
            clearInterval(deepPoll.current);
            deepPoll.current = null;
            showToast(caught instanceof Error ? caught.message : String(caught));
          }
        }, 950);
        return () => {
          if (deepPoll.current !== null) {
            clearInterval(deepPoll.current);
            deepPoll.current = null;
          }
        };
      }, [state?.deep?.job?.status, state?.deep?.job?.id, applyState, showToast, t]);

      const feed = async (kind) => {
        if (busy) return;
        setBusy(true);
        const before = state?.progress?.percent ?? 0;
        try {
          const payload = await request('/entries', {
            type: kind,
            title: kind === 'corpus' ? title : kind === 'correction' ? '纠正样本' : undefined,
            text: kind === 'corpus' ? text : kind === 'note' ? note : undefined,
            original: kind === 'correction' ? original : undefined,
            revised: kind === 'correction' ? revised : undefined,
          });
          applyState(payload.state);
          const delta = Math.max(0, (payload.state?.progress?.percent ?? before) - before);
          const learned = payload.added?.rules?.[0]?.text;
          if (kind === 'corpus') {
            setTitle('');
            setText('');
          } else if (kind === 'correction') {
            setOriginal('');
            setRevised('');
          } else {
            setNote('');
          }
          showToast(learned ? `${t('learned')}${clampText(learned, 42)} · +${delta}%` : `${t('feedAdded')} · +${delta}%`);
        } catch (caught) {
          showToast(caught instanceof Error ? caught.message : String(caught));
        } finally {
          setBusy(false);
        }
      };

      const deleteEntry = async (id) => {
        if (!window.confirm('删除这条投喂？进度会回退。')) return;
        try {
          const payload = await request('/entries/delete', { id });
          applyState(payload.state);
          showToast(t('deleted'));
        } catch (caught) {
          showToast(caught instanceof Error ? caught.message : String(caught));
        }
      };

      const toggleRule = async (rule, enabled) => {
        try {
          const payload = await request('/rules/update', { id: rule.id, enabled });
          applyState(payload.state);
        } catch (caught) {
          showToast(caught instanceof Error ? caught.message : String(caught));
        }
      };

      const deleteRule = async (rule) => {
        if (!window.confirm('删除这条规则？')) return;
        try {
          const payload = await request('/rules/update', { id: rule.id, deleted: true });
          applyState(payload.state);
          showToast(t('deleted'));
        } catch (caught) {
          showToast(caught instanceof Error ? caught.message : String(caught));
        }
      };

      const startEdit = (rule) => {
        setEditingRule(rule.id);
        setEditText(rule.text);
      };

      const saveEdit = async () => {
        if (editingRule === null) return;
        try {
          const payload = await request('/rules/update', { id: editingRule, text: editText });
          applyState(payload.state);
          setEditingRule(null);
          setEditText('');
          showToast(t('saved'));
        } catch (caught) {
          showToast(caught instanceof Error ? caught.message : String(caught));
        }
      };

      const saveManual = async () => {
        try {
          const payload = await request('/profile', { text: manualText, mode: manualMode });
          manualDirty.current = false;
          applyState(payload.state);
          showToast(t('saved'));
        } catch (caught) {
          showToast(caught instanceof Error ? caught.message : String(caught));
        }
      };

      const startDeep = async () => {
        if (busy) return;
        setBusy(true);
        try {
          await request('/deep', {});
          const full = await request('/state.json', undefined, 'GET');
          applyState(full);
          setDrawer(true);
          setDrawerTab('rules');
          showToast(t('deepStarted'));
        } catch (caught) {
          showToast(caught instanceof Error ? caught.message : String(caught));
        } finally {
          setBusy(false);
        }
      };

      const acceptDeep = async (runId, mode) => {
        try {
          const payload = await request('/deep/accept', { runId, mode });
          applyState(payload.state);
          showToast(mode === 'reject' ? t('deleted') : t('saved'));
        } catch (caught) {
          showToast(caught instanceof Error ? caught.message : String(caught));
        }
      };

      const regenerate = async () => {
        try {
          const payload = await request('/deep/regenerate', {});
          applyState(payload.state);
          showToast(t('saved'));
        } catch (caught) {
          showToast(caught instanceof Error ? caught.message : String(caught));
        }
      };

      const runTest = async () => {
        if (testRunning || scenario.trim().length < 2) return;
        setTestRunning(true);
        setTestError('');
        setTestOutput('');
        try {
          const response = await fetch(`${API}/test`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ scenario }),
          });
          if (!response.ok) {
            const data = await response.json().catch(() => null);
            throw new Error(data?.error ?? `HTTP ${response.status}`);
          }
          if (response.body === null) throw new Error('浏览器不支持流式读取。');
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          let done = false;
          while (!done) {
            const chunk = await reader.read();
            done = chunk.done;
            buffer += decoder.decode(chunk.value ?? new Uint8Array(), { stream: !done });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';
            for (const line of lines) {
              if (line.trim().length === 0) continue;
              let message;
              try {
                message = JSON.parse(line);
              } catch {
                continue;
              }
              if (message.type === 'delta' && typeof message.text === 'string') {
                setTestOutput((previous) => previous + message.text);
              } else if (message.type === 'error') {
                throw new Error(message.error ?? '模型请求失败。');
              }
            }
          }
        } catch (caught) {
          setTestError(caught instanceof Error ? caught.message : String(caught));
        } finally {
          setTestRunning(false);
        }
      };

      const saveSettings = async () => {
        try {
          const payload = await request('/settings', {
            provider: provider.trim().length === 0 ? null : provider.trim(),
            model: model.trim().length === 0 ? null : model.trim(),
            sendToModel,
          });
          settingsDirty.current = false;
          applyState(payload.state);
          setSettingsOpen(false);
          showToast(t('saved'));
        } catch (caught) {
          showToast(caught instanceof Error ? caught.message : String(caught));
        }
      };

      const markPrivacy = async () => {
        try {
          const payload = await request('/settings', { privacySeen: true });
          applyState(payload.state);
        } catch (caught) {
          showToast(caught instanceof Error ? caught.message : String(caught));
        }
      };

      const resetAll = async () => {
        if (!window.confirm(t('resetConfirm'))) return;
        try {
          const payload = await request('/reset', {});
          applyState(payload.state);
          setSettingsOpen(false);
          showToast(t('deleted'));
        } catch (caught) {
          showToast(caught instanceof Error ? caught.message : String(caught));
        }
      };

      const copyProfile = async () => {
        try {
          await navigator.clipboard.writeText(state?.profile ?? '');
          showToast(t('copied'));
        } catch {
          showToast('复制失败；可以手动选中。');
        }
      };

      const openRules = () => {
        setDrawer(true);
        setDrawerTab('rules');
      };

      if (status === 'loading') {
        return h(
          'div',
          { className: rootClass },
          h('div', { className: 'dmp-boot' }, h('div', { className: 'dmp-boot-inner' }, h('span', { className: 'dmp-spinner' }), h('span', null, t('loading')))),
        );
      }

      if (status === 'error' || state === null) {
        return h(
          'div',
          { className: rootClass },
          h(
            'div',
            { className: 'dmp-boot' },
            h(
              'div',
              { className: 'dmp-error' },
              h('strong', null, t('error')),
              h('p', null, error),
              h(Btn, { primary: true, small: true, onClick: load }, t('retry')),
            ),
          ),
        );
      }

      const deepRunning = state.deep.job?.status === 'running';
      const hasMaterial = state.entries.some((entry) => entry.type !== 'note');
      const deepTitle = deepRunning
        ? `${t('deepRunning')}：${state.deep.job?.phase ?? ''}`
        : state.settings.sendToModel === false
          ? '设置里关闭了“发送给模型”'
          : !hasMaterial
            ? '先喂语料'
            : '让模型读一遍，结果需要你收下';
      const rulesCount = state.counts?.rules ?? state.rules.filter((rule) => rule.enabled !== false).length;
      const deepRuns = state.progress?.deepRuns ?? 0;

      return h(
        'div',
        { className: rootClass },
        h(
          'div',
          { className: 'dmp-app' },
          h(PageHead, {
            t,
            rulesCount,
            deepRuns,
            deepRunning,
            deepDisabled: busy || deepRunning || !hasMaterial || state.settings.sendToModel === false,
            deepTitle,
            onSettings: () => {
              settingsDirty.current = false;
              setSettingsOpen(true);
            },
            onDeep: startDeep,
          }),
          h(FeedPanel, {
            t,
            state,
            busy,
            tab,
            title,
            text,
            original,
            revised,
            note,
            onTab: setTab,
            onTitle: setTitle,
            onText: setText,
            onOriginal: setOriginal,
            onRevised: setRevised,
            onNote: setNote,
            onFeed: feed,
            onFileText: (value, name) => {
              setTitle(name);
              setText(value);
            },
            onDelete: deleteEntry,
            onPrivacy: markPrivacy,
            onError: (message) => showToast(message),
          }),
          h(Stage, {
            t,
            state,
            onOpenRules: openRules,
          }),
          h(Drawer, {
            t,
            state,
            open: drawer,
            tab: drawerTab,
            editingRule,
            editText,
            manualText,
            manualMode,
            scenario,
            testOutput,
            testError,
            testRunning,
            onToggle: () => setDrawer((value) => !value),
            onClose: () => setDrawer(false),
            onTab: (next) => {
              setDrawerTab(next);
              setDrawer(true);
            },
            onAccept: acceptDeep,
            onRegenerate: regenerate,
            onToggleRule: toggleRule,
            onDeleteRule: deleteRule,
            onEditRule: startEdit,
            onEditText: setEditText,
            onSaveEdit: saveEdit,
            onCancelEdit: () => {
              setEditingRule(null);
              setEditText('');
            },
            onManualText: (value) => {
              manualDirty.current = true;
              setManualText(value);
            },
            onManualMode: (value) => {
              manualDirty.current = true;
              setManualMode(value);
            },
            onSaveManual: saveManual,
            onCopy: copyProfile,
            onScenario: setScenario,
            onTest: runTest,
            onLike: () => showToast(t('likeToast')),
            onUnlike: () => {
              setTab('correction');
              setOriginal(testOutput);
              setRevised('');
              setDrawer(false);
              showToast(t('unlikeToast'));
            },
          }),
        ),
        settingsOpen
          ? h(Settings, {
              t,
              state,
              provider,
              model,
              sendToModel,
              onProvider: (value) => {
                settingsDirty.current = true;
                setProvider(value);
              },
              onModel: (value) => {
                settingsDirty.current = true;
                setModel(value);
              },
              onSendToModel: (value) => {
                settingsDirty.current = true;
                setSendToModel(value);
              },
              onClose: () => setSettingsOpen(false),
              onSave: saveSettings,
              onExport: () => window.open(`${API}/export`, '_blank'),
              onReset: resetAll,
            })
          : null,
        toast !== null ? h('div', { className: 'dmp-toast', role: 'status', 'aria-live': 'polite' }, toast.message) : null,
      );
    }

    /** 插件入口：注册字典、侧栏入口与主区页面。 */
    function apply(ctx) {
      ensureStyles();
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), `${PLUGIN_ID}: dictionaries`);
      const t = ctx.locale.bind(NS);

      ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL_ID, locale: NS }, Page));

      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          { name: 'sidebar.panellist', id: PANEL_ID, order: 32, locale: NS, label: () => t('nav') },
          PanelIcon,
        ),
      );
    }

    exports.name = PLUGIN_ID;
    exports.inject = inject;
    exports.apply = apply;
    return module.exports;
  },
});
