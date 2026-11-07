/**
 * 浏览器侧：语感花房页面。
 *
 * 三栏工作台：左「标本」、中「写作」、右「档案」。
 * - 写作是每天用得最多的动作，占最大面积，主按钮固定可见；
 * - 规则不再藏在底部抽屉，桌面上常驻右栏，窄屏收成右侧 sheet；
 * - 字号与对比度按 WCAG AA（正文 4.5:1），命中区不小于 30px。
 *
 * 数据来自宿主路由 /dsh-myself-preset/*；改动只写本机，深读/试音才调模型。
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

    /** 深读阶段，和 deep.js 里写的 phase 对齐。 */
    const DEEP_STEPS = ['读取语料', '提炼', '交叉验证'];

    /** 示例语料：空态时可直接填入。 */
    const SAMPLES = [
      '先给结论：这版别上微服务。团队还撑不起十几套部署，先把单体里的边界切清楚。',
      '我会先看失败路径。超时怎么办，重试会不会放大，降级之后用户看到什么。',
      '直接选 Redis。Memcached 现在没必要，除非你只做极简 KV 且非常在意多线程模型。',
    ];

    /** 中文文案。 */
    const zh = {
      nav: '语感花房',
      title: '语感花房',
      subtitle: '标本 001 · 你的语气',
      corpus: '语料',
      correction: '纠正',
      note: '直给',
      feedTitle: '标题',
      feedTitleHint: '可选',
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
      submitHint: '只在本地分析 · 立即生效',
      shortcut: '⌘ ↵ 提交',
      recent: '最近投喂',
      emptyRecent: '还没有投喂。',
      emptyTitle: '先喂一段你写的东西',
      emptyNote: '或者从一段你改过的回复开始，本地分析，不联网。',
      samples: '试一段示例',
      privacy: '语料只存在本机 · 深读/试音时才会发送给模型',
      privacyButton: '知道了',
      maturity: '成熟度',
      ready: '第一版成形',
      readyNote: '可以继续精炼',
      deep: '深读',
      deepRunning: '深读中',
      archive: '人格档案',
      archiveOpen: '打开人格档案',
      archiveClose: '关闭人格档案',
      pendingCount: '条待确认',
      rulesEmpty: '还没有规则',
      prompt: '人格',
      test: '试音',
      promptHint: '保存后下一句话生效。追加 = 在自动人格后加一段；完全接管 = 整段由你决定。',
      promptPlaceholder: '补充几句你希望它记住的话……',
      append: '追加',
      takeover: '完全接管',
      save: '保存并生效',
      unsaved: '未保存',
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
      undo: '撤销',
      deleted: '已删除',
      deletedPending: '已删除 · 5 秒内可撤销',
      confirmAgain: '再点一次',
      edit: '编辑',
      saveRule: '保存',
      cancel: '取消',
      loading: '正在读取培养舱…',
      error: '读取失败',
      retry: '重试',
      settingsTitle: '设置',
      model: '深读使用的模型',
      modelHint: '留空 = 跟随当前默认模型',
      provider: 'provider',
      modelId: 'model',
      followDefault: '跟随默认',
      sendToModel: '深读/试音时把文本发送给模型',
      export: '导出 JSON',
      reset: '清空所有数据',
      resetArmed: '再点一次确认清空',
      close: '关闭',
      saved: '已保存',
      deepStarted: '深读开始。',
      deepDone: '深读完成，去规则里收下。',
      deepFailed: '深读失败',
      feedAdded: '已记录',
      learned: '学会了：',
      chars: '字',
      noModel: '模型没接上',
      assetAlt: '玻璃罩里的植株',
      ruleOn: '停用这条规则',
      ruleOff: '启用这条规则',
    };

    /** 英文只保留导航与最小标签，正文按中文产品走。 */
    const en = {
      nav: 'Persona nursery',
      title: 'Persona nursery',
      subtitle: 'Specimen 001 · your voice',
    };

    /** 浏览器侧需要的服务。 */
    const inject = ['slots', 'locale'];

    // ---- 样式 ----

    const css = `
.dmp-root{
  --paper:#f3efe6;--paper-2:#fbf8f1;--paper-3:#ece6d9;
  --ink:#1b1b1c;--ink-2:#57534b;--ink-3:#6d675e;
  --line:rgba(27,27,28,.12);--line-strong:rgba(27,27,28,.2);
  --accent:#2fb8a6;--accent-ink:#13695d;--accent-soft:rgba(47,184,166,.13);
  --amber:#e8a33d;--amber-ink:#85560f;--amber-soft:rgba(232,163,61,.15);
  --violet:#8b7cf6;--violet-ink:#5748bd;--violet-soft:rgba(139,124,246,.12);
  --serif:"Songti SC","Noto Serif SC",Georgia,serif;
  --sans:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",Arial,sans-serif;
  color-scheme:light;
  position:relative;display:flex;flex-direction:column;flex:1 1 auto;
  width:100%;height:100%;min-height:0;overflow:hidden;
  color:var(--ink);font-family:var(--sans);font-size:14px;line-height:1.7;
  background:
    radial-gradient(circle at 18% 6%,rgba(232,163,61,.08),transparent 42%),
    radial-gradient(circle at 88% 84%,rgba(47,184,166,.06),transparent 46%),
    var(--paper);
  -webkit-font-smoothing:antialiased;
}
.dmp-root.dmp-dark{
  color-scheme:dark;
  --paper:#0f1115;--paper-2:#15181d;--paper-3:#1b1e24;
  --ink:#f2efe8;--ink-2:#b9b4aa;--ink-3:#8f8a80;
  --line:rgba(242,239,232,.12);--line-strong:rgba(242,239,232,.22);
  --accent:#4fd8c4;--accent-ink:#4fd8c4;--accent-soft:rgba(79,216,196,.13);
  --amber:#f0b45a;--amber-ink:#f0b45a;--amber-soft:rgba(240,180,90,.13);
  --violet:#a99bff;--violet-ink:#a99bff;--violet-soft:rgba(169,155,255,.13);
  background:
    radial-gradient(circle at 18% 6%,rgba(232,163,61,.06),transparent 42%),
    radial-gradient(circle at 88% 84%,rgba(47,184,166,.05),transparent 46%),
    var(--paper);
}
.dmp-root *,.dmp-root *::before,.dmp-root *::after{box-sizing:border-box}
.dmp-root :where(button){font:inherit;color:inherit;cursor:pointer;border:0;background:none}
.dmp-root :where(h1,h2,h3,h4,p,ul){margin:0;padding:0}
.dmp-root :where(ul){list-style:none}
.dmp-root :where(input,textarea){font:inherit;color:inherit}
.dmp-root :focus-visible{outline:2px solid var(--accent-ink);outline-offset:2px}

/* ---- 顶栏 ---- */
.dmp-topbar{
  position:relative;flex:none;display:flex;align-items:center;gap:12px;
  height:56px;padding:0 18px;border-bottom:1px solid var(--line);
  background:color-mix(in srgb,var(--paper-2) 55%,var(--paper));
}
.dmp-brand{display:flex;align-items:center;gap:10px;min-width:0}
.dmp-mark{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;border:1px solid var(--line-strong);background:var(--paper-2);color:var(--ink-2);flex:none}
.dmp-brand h1{font-family:var(--serif);font-size:19px;font-weight:500;letter-spacing:.01em;line-height:1;white-space:nowrap}
.dmp-crumb{font-size:12px;color:var(--ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dmp-topright{display:flex;align-items:center;gap:6px;margin-left:auto;flex:none}
.dmp-maturity{display:flex;align-items:baseline;gap:3px;padding-right:8px;white-space:nowrap}
.dmp-maturity b{font-family:var(--serif);font-size:20px;font-weight:500;line-height:1}
.dmp-maturity span{font-size:12px;color:var(--ink-3)}
.dmp-btn{
  height:36px;padding:0 13px;border-radius:9px;border:1px solid var(--line-strong);
  display:inline-flex;align-items:center;justify-content:center;gap:7px;
  font-size:13px;color:var(--ink);background:transparent;
  transition:background-color .15s,border-color .15s,color .15s;
}
.dmp-btn:hover:not(:disabled){background:color-mix(in srgb,var(--ink) 5%,transparent)}
.dmp-btn:disabled{opacity:.45;cursor:default}
.dmp-btn.primary{background:var(--ink);border-color:var(--ink);color:var(--paper)}
.dmp-btn.primary:hover:not(:disabled){background:color-mix(in srgb,var(--ink) 88%,var(--accent))}
.dmp-btn.ghost{border-color:transparent}
.dmp-btn.danger{color:var(--violet-ink);border-color:color-mix(in srgb,var(--violet) 40%,var(--line))}
.dmp-btn.small{height:32px;padding:0 11px;font-size:12.5px}
.dmp-iconbtn{width:36px;height:36px;border-radius:9px;border:1px solid transparent;display:grid;place-items:center;color:var(--ink-2);position:relative}
.dmp-iconbtn:hover{background:color-mix(in srgb,var(--ink) 5%,transparent);border-color:var(--line)}
.dmp-iconbtn .dmp-count{position:absolute;top:2px;right:2px;min-width:14px;height:14px;padding:0 3px;border-radius:7px;background:var(--amber-soft);color:var(--amber-ink);font-size:9.5px;line-height:14px;text-align:center}
.dmp-progress{position:absolute;left:0;bottom:-1px;height:2px;background:var(--accent);transition:width .45s ease}
.dmp-archbtn{display:none}

/* ---- 三栏 ---- */
.dmp-body{flex:1 1 auto;display:grid;grid-template-columns:300px minmax(0,1fr) 340px;min-height:0}

/* ---- 标本栏 ---- */
.dmp-specimen{
  display:flex;flex-direction:column;gap:12px;min-height:0;overflow-y:auto;
  padding:16px 18px;border-right:1px solid var(--line);
  background:linear-gradient(180deg,color-mix(in srgb,var(--paper-2) 55%,transparent),transparent 55%);
  scrollbar-width:thin;scrollbar-color:var(--line-strong) transparent;
}
.dmp-vessel{display:flex;flex-direction:column;align-items:center;flex:none}
.dmp-jar{
  position:relative;width:200px;height:286px;flex:none;border-radius:100px 100px 14px 14px;
  overflow:hidden;border:1px solid color-mix(in srgb,var(--ink) 22%,transparent);
  background:linear-gradient(180deg,rgba(255,255,255,.34),rgba(238,246,244,.12) 30%,rgba(238,246,244,.14) 70%,rgba(255,255,255,.24));
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.7),inset 10px 0 18px rgba(255,255,255,.28),inset -10px 0 18px rgba(255,255,255,.1),0 14px 30px rgba(60,50,30,.12);
  isolation:isolate;
}
.dmp-dark .dmp-jar{
  border-color:rgba(255,255,255,.16);
  background:linear-gradient(180deg,rgba(255,255,255,.1),rgba(255,255,255,.02) 26%,rgba(255,255,255,.04) 70%,rgba(255,255,255,.08));
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.08),inset 10px 0 18px rgba(255,255,255,.1),inset -10px 0 18px rgba(255,255,255,.04),0 14px 30px rgba(0,0,0,.5);
}
.dmp-jar::before{content:"";position:absolute;left:10px;top:22px;bottom:18px;width:14px;border-radius:50%;background:linear-gradient(90deg,rgba(255,255,255,.34),rgba(255,255,255,0));filter:blur(1.5px);z-index:5}
.dmp-jar::after{content:"";position:absolute;left:12%;right:12%;top:0;height:30px;border-radius:0 0 50% 50%;border-bottom:1px solid rgba(255,255,255,.5);z-index:5}
.dmp-plant{position:absolute;left:50%;bottom:8px;width:176px;height:auto;transform:translateX(-50%);z-index:2;display:block;filter:saturate(.95) drop-shadow(0 10px 14px rgba(30,25,15,.16))}
.dmp-dark .dmp-plant{filter:saturate(.96) contrast(1.04) brightness(1.05) drop-shadow(0 12px 18px rgba(0,0,0,.55))}
.dmp-water{position:absolute;inset:0;overflow:hidden;z-index:3;pointer-events:none}
.dmp-water-body{position:absolute;inset:0;transform:translateY(calc(100% - var(--dmp-water-level,8%)));transition:transform .8s cubic-bezier(.16,1,.3,1);background:linear-gradient(180deg,rgba(47,184,166,.2),rgba(47,184,166,.05))}
.dmp-dark .dmp-water-body{background:linear-gradient(180deg,rgba(79,216,196,.18),rgba(79,216,196,.04))}
.dmp-water-body::before{content:"";position:absolute;left:-6%;right:-6%;top:-1px;height:1px;background:var(--accent);opacity:.45}
.dmp-drop{position:absolute;z-index:5;border-radius:50%;background:rgba(255,255,255,.6);box-shadow:0 1px 2px rgba(30,25,15,.12),inset 0 1px 1px rgba(255,255,255,.8);pointer-events:none}
.dmp-drop.d1{left:40px;top:120px;width:4px;height:4px}
.dmp-drop.d2{left:150px;top:160px;width:3px;height:3px;opacity:.7}
.dmp-drop.d3{left:60px;top:224px;width:3px;height:3px;opacity:.6}
.dmp-base{width:232px;margin-top:-9px;padding:7px 10px;border-radius:8px;flex:none;background:linear-gradient(180deg,#2f2b26,#211e1a);box-shadow:0 12px 22px rgba(30,25,15,.2),inset 0 1px 0 rgba(255,255,255,.12);z-index:4}
.dmp-plaque{width:100%;padding:4px 8px 5px;border:1px solid rgba(232,163,61,.4);border-radius:3px;background:linear-gradient(180deg,#3b342a,#2a251f);text-align:center}
.dmp-plaque strong{display:block;font-family:var(--serif);font-size:9.5px;font-weight:500;letter-spacing:.1em;color:#e7c98f}
.dmp-plaque em{display:block;margin-top:1px;font-family:var(--serif);font-size:9px;font-style:italic;color:rgba(231,201,143,.72)}
.dmp-score{display:flex;align-items:flex-end;justify-content:space-between;flex:none;padding-top:2px}
.dmp-score span{font-size:12px;color:var(--ink-3)}
.dmp-score b{font-family:var(--serif);font-size:30px;font-weight:400;line-height:.9}
.dmp-score b small{font-size:13px;color:var(--ink-3);margin-left:1px}
.dmp-dims{display:flex;flex-direction:column;gap:9px;flex:none}
.dmp-dim{display:grid;grid-template-columns:1fr auto;align-items:center;gap:4px 8px}
.dmp-dim span{grid-column:1;font-size:12px;color:var(--ink-3)}
.dmp-dim b{grid-column:2;justify-self:end;font-size:12px;font-weight:500;color:var(--ink-2);font-variant-numeric:tabular-nums}
.dmp-bar{grid-column:1/3;grid-row:2;height:4px;border-radius:2px;background:color-mix(in srgb,var(--ink) 9%,transparent);overflow:hidden}
.dmp-bar i{display:block;height:100%;border-radius:2px;background:var(--accent);transform-origin:left}
.dmp-dim:first-child .dmp-bar i{background:var(--amber)}
.dmp-learned{margin-top:auto;padding:10px 0 2px 11px;border-left:2px solid var(--accent);flex:none}
.dmp-learned span{display:block;font-size:11px;letter-spacing:.1em;color:var(--ink-3)}
.dmp-learned p{margin-top:4px;font-size:13px;line-height:1.6;color:var(--ink)}

/* ---- 写作区 ---- */
.dmp-composer{display:flex;flex-direction:column;min-height:0;padding:18px 26px 0;overflow:hidden}
.dmp-write{flex:none}
.dmp-chead{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}
.dmp-chead h2{font-size:16px;font-weight:600;letter-spacing:.01em}
.dmp-chead p{margin-top:3px;font-size:12.5px;color:var(--ink-3)}
.dmp-seg{display:inline-flex;padding:3px;border-radius:9px;background:color-mix(in srgb,var(--ink) 6%,transparent);flex:none}
.dmp-seg button{border-radius:6px;padding:5px 11px;font-size:12.5px;color:var(--ink-3)}
.dmp-seg button[aria-selected="true"]{background:var(--paper-2);color:var(--ink);box-shadow:0 1px 2px rgba(0,0,0,.1)}
.dmp-label{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:6px;font-size:12px;color:var(--ink-3)}
.dmp-label em{font-style:normal;font-size:12px;color:var(--ink-3)}
.dmp-input{width:100%;height:38px;padding:0 12px;border:1px solid var(--line);border-radius:9px;background:var(--paper-2);font-size:14px;outline:none;margin-bottom:12px}
.dmp-input::placeholder,.dmp-textarea::placeholder{color:var(--ink-3);opacity:.9}
.dmp-input:focus,.dmp-textarea:focus{border-color:var(--accent-ink);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 18%,transparent)}
.dmp-editor{position:relative}
.dmp-textarea{display:block;width:100%;height:158px;padding:12px 14px 34px;border:1px solid var(--line);border-radius:10px;background:var(--paper-2);font-size:14px;line-height:1.85;resize:none;outline:none}
.dmp-textarea.short{height:110px;padding-bottom:14px}
.dmp-editor-foot{position:absolute;left:12px;right:12px;bottom:8px;display:flex;align-items:center;justify-content:space-between;pointer-events:none}
.dmp-editor-foot>*{pointer-events:auto}
.dmp-link{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:var(--ink-2);padding:2px 0}
.dmp-link:hover{color:var(--ink)}
.dmp-kbd{font-size:11px;color:var(--ink-3);border:1px solid var(--line);border-radius:4px;padding:1px 5px;background:var(--paper)}
.dmp-actionbar{display:flex;align-items:center;gap:12px;margin-top:12px;flex:none}
.dmp-submit{height:40px;padding:0 18px;border-radius:10px;border:1px solid var(--ink);background:var(--ink);color:var(--paper);font-size:14px;display:inline-flex;align-items:center;gap:9px}
.dmp-submit:hover:not(:disabled){background:color-mix(in srgb,var(--ink) 86%,var(--accent))}
.dmp-submit:disabled{opacity:.4;cursor:default}
.dmp-actionnote{font-size:12px;color:var(--ink-3)}
.dmp-hint{margin-top:8px;font-size:12px;color:var(--ink-3);line-height:1.6}
.dmp-hint strong{color:var(--ink-2);font-weight:500}
.dmp-signals{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}
.dmp-chip{padding:2px 7px;border-radius:999px;background:var(--accent-soft);color:var(--accent-ink);font-size:11px;line-height:1.6;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dmp-divider{height:1px;background:var(--line);margin:16px 0 10px;flex:none}
.dmp-lhead{display:flex;align-items:baseline;justify-content:space-between;flex:none;margin-bottom:2px}
.dmp-lhead h3{font-size:13px;font-weight:600;color:var(--ink-2)}
.dmp-lhead span{font-size:12px;color:var(--ink-3)}
.dmp-list{flex:1 1 auto;min-height:60px;overflow-y:auto;padding-bottom:14px;scrollbar-width:thin;scrollbar-color:var(--line-strong) transparent}
.dmp-row{display:flex;align-items:center;gap:12px;min-height:54px;padding:8px 0;border-bottom:1px solid color-mix(in srgb,var(--ink) 8%,transparent)}
.dmp-row-main{min-width:0;flex:1}
.dmp-row-main b{display:block;font-size:13.5px;font-weight:500;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dmp-row-main span{display:block;font-size:12px;color:var(--ink-3)}
.dmp-tag{flex:none;font-size:11px;line-height:1.6;padding:2px 7px;border-radius:5px;letter-spacing:.02em}
.dmp-tag.corpus{color:var(--accent-ink);background:var(--accent-soft)}
.dmp-tag.correction{color:var(--amber-ink);background:var(--amber-soft)}
.dmp-tag.note{color:var(--violet-ink);background:var(--violet-soft)}
.dmp-del{width:30px;height:30px;flex:none;display:grid;place-items:center;border-radius:8px;border:1px solid transparent;color:var(--ink-3);opacity:.6;transition:opacity .15s,background-color .15s,color .15s}
.dmp-row:hover .dmp-del,.dmp-del:focus-visible{opacity:1}
.dmp-del:hover{background:var(--violet-soft);color:var(--violet-ink)}
.dmp-empty{padding:18px 0;color:var(--ink-3);font-size:13px;line-height:1.7}
.dmp-empty strong{display:block;color:var(--ink-2);font-weight:500;font-size:13.5px;margin-bottom:2px}
.dmp-samples{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.dmp-samples button{padding:4px 9px;border:1px dashed var(--line-strong);border-radius:7px;font-size:12px;color:var(--ink-2)}
.dmp-samples button:hover{border-color:var(--accent-ink);color:var(--accent-ink)}

/* ---- 档案栏 ---- */
.dmp-archive{
  display:flex;flex-direction:column;min-height:0;border-left:1px solid var(--line);
  background:color-mix(in srgb,var(--paper-2) 45%,transparent);
}
.dmp-ahead{display:flex;align-items:center;gap:10px;padding:16px 18px 8px;flex:none}
.dmp-ahead h2{font-size:15px;font-weight:600}
.dmp-ahead .dmp-badge{font-size:11px;padding:2px 8px;border-radius:999px;color:var(--amber-ink);background:var(--amber-soft);white-space:nowrap}
.dmp-ahead .dmp-badge.running{color:var(--accent-ink);background:var(--accent-soft)}
.dmp-tabs{display:flex;gap:16px;padding:0 18px;border-bottom:1px solid var(--line);flex:none}
.dmp-tab{position:relative;padding:0 0 9px;font-size:13px;color:var(--ink-3)}
.dmp-tab b{font-weight:500;font-size:11px;margin-left:2px;color:var(--ink-3)}
.dmp-tab[aria-selected="true"]{color:var(--ink);font-weight:500}
.dmp-tab[aria-selected="true"]::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;background:var(--ink)}
.dmp-panel{flex:1 1 auto;min-height:0;overflow-y:auto;padding:14px 18px 20px;scrollbar-width:thin;scrollbar-color:var(--line-strong) transparent}
.dmp-group{margin-bottom:16px}
.dmp-group h4{font-size:11px;letter-spacing:.1em;color:var(--ink-3);font-weight:500;margin-bottom:8px}
.dmp-rule{border:1px solid var(--line);border-radius:10px;padding:10px 12px;margin-bottom:8px;background:color-mix(in srgb,var(--paper) 65%,transparent)}
.dmp-rule-top{display:flex;align-items:center;gap:8px}
.dmp-src{font-size:10.5px;padding:1px 6px;border-radius:4px;line-height:1.6}
.dmp-src.local{color:var(--accent-ink);background:var(--accent-soft)}
.dmp-src.deep{color:var(--violet-ink);background:var(--violet-soft)}
.dmp-src.manual{color:var(--amber-ink);background:var(--amber-soft)}
.dmp-rule-top .dmp-dim{font-size:11px;color:var(--ink-3);margin-left:2px;grid-column:auto}
.dmp-rule-actions{margin-left:auto;display:flex;align-items:center;gap:2px}
.dmp-switch{width:34px;height:20px;border-radius:999px;border:1px solid var(--line-strong);background:color-mix(in srgb,var(--ink) 8%,transparent);position:relative;flex:none;transition:background-color .15s,border-color .15s;margin-right:6px}
.dmp-switch::before{content:'';position:absolute;inset:-6px;border-radius:999px}
.dmp-switch::after{content:"";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:var(--paper-2);box-shadow:0 1px 2px rgba(0,0,0,.2);transition:transform .15s}
.dmp-switch[aria-checked="true"]{background:var(--accent-ink);border-color:var(--accent-ink)}
.dmp-switch[aria-checked="true"]::after{transform:translateX(14px)}
.dmp-mini{border-radius:6px;padding:5px 7px;font-size:11.5px;color:var(--ink-3)}
.dmp-mini:hover{background:color-mix(in srgb,var(--ink) 5%,transparent);color:var(--ink)}
.dmp-mini.danger:hover{color:var(--violet-ink)}
.dmp-mini.armed{color:var(--violet-ink);background:var(--violet-soft)}
.dmp-rule p{margin-top:7px;font-size:13px;line-height:1.65;color:var(--ink)}
.dmp-rule q{display:block;quotes:none;margin-top:6px;font-size:12px;line-height:1.6;color:var(--ink-3);border-left:1px solid var(--line-strong);padding-left:8px}
.dmp-rule q::before,.dmp-rule q::after{content:none}
.dmp-rule .dmp-textarea{height:76px;padding:8px 10px;font-size:13px;margin-top:8px}
.dmp-rule-edit{display:flex;gap:6px;margin-top:6px}
.dmp-pending{border:1px solid color-mix(in srgb,var(--violet) 38%,var(--line));border-radius:10px;padding:11px 12px;margin-bottom:14px;background:color-mix(in srgb,var(--violet) 4%,transparent)}
.dmp-pending-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
.dmp-pending-head strong{font-size:12.5px;font-weight:500}
.dmp-pending-head span{font-size:11px;color:var(--ink-3)}
.dmp-pending p{margin-top:6px;font-size:12.5px;line-height:1.6;color:var(--ink-2)}
.dmp-pending-rule{font-size:12.5px;line-height:1.6;color:var(--ink-2);margin-top:6px}
.dmp-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:8px}
.dmp-pre{margin:0;padding:11px 12px;border:1px solid var(--line);border-radius:9px;background:var(--paper);color:var(--ink-2);font:12px/1.7 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;max-height:280px;overflow:auto}
.dmp-dirty{display:inline-flex;align-items:center;gap:5px;font-size:11px;color:var(--amber-ink)}
.dmp-dirty i{width:6px;height:6px;border-radius:50%;background:var(--amber-ink);display:block}
.dmp-testout{min-height:88px;margin-top:10px;padding:10px 12px;border:1px solid var(--line);border-radius:9px;background:var(--paper);font-size:13px;line-height:1.7;color:var(--ink-2);white-space:pre-wrap;max-height:240px;overflow:auto}
.dmp-caret{display:inline-block;width:1px;height:1.1em;background:var(--accent-ink);vertical-align:-.15em;animation:dmp-caret 1s steps(2) infinite}
@keyframes dmp-caret{50%{opacity:0}}

/* ---- 弹窗 / 提示 ---- */
.dmp-mask{position:fixed;inset:0;z-index:40;background:rgba(15,17,21,.42);display:grid;place-items:center;padding:24px}
.dmp-modal{width:min(520px,100%);max-height:calc(100vh - 48px);overflow:auto;border-radius:14px;border:1px solid var(--line-strong);background:var(--paper-2);color:var(--ink);padding:20px 22px;box-shadow:0 24px 70px rgba(0,0,0,.28)}
.dmp-modal-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
.dmp-modal-head strong{font-family:var(--serif);font-size:18px;font-weight:500}
.dmp-field{display:flex;flex-direction:column;gap:6px;margin-bottom:12px}
.dmp-field label{font-size:12px;color:var(--ink-3)}
.dmp-field input{height:36px;border:1px solid var(--line);border-radius:8px;background:var(--paper);padding:0 10px;font-size:13px;outline:none}
.dmp-field input:focus{border-color:var(--accent-ink);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 18%,transparent)}
.dmp-field-row{display:flex;align-items:center;gap:8px}
.dmp-field-row input{flex:1}
.dmp-check{display:flex;align-items:flex-start;gap:8px;font-size:13px;line-height:1.5;color:var(--ink-2);margin:4px 0 14px;cursor:pointer}
.dmp-check input{margin-top:2px;accent-color:var(--accent-ink)}
.dmp-modal-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:16px}
.dmp-spacer{flex:1 1 auto}
.dmp-toast{
  position:absolute;left:50%;bottom:18px;transform:translate(-50%,8px);z-index:30;
  display:flex;align-items:center;gap:10px;max-width:calc(100% - 48px);
  padding:9px 14px;border-radius:9px;border:1px solid var(--line-strong);
  background:var(--paper-2);color:var(--ink);font-size:13px;
  box-shadow:0 12px 26px rgba(0,0,0,.16);opacity:0;pointer-events:none;
  transition:opacity .18s,transform .18s;white-space:nowrap;overflow:hidden;
}
.dmp-toast.show{opacity:1;transform:translate(-50%,0);pointer-events:auto}
.dmp-toast button{font-size:13px;color:var(--accent-ink);text-decoration:underline;text-underline-offset:2px;flex:none}
.dmp-boot{flex:1 1 auto;display:grid;place-items:center;padding:24px;color:var(--ink-3);font-size:13px}
.dmp-boot-inner{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center}
.dmp-spinner{width:22px;height:22px;border-radius:50%;border:1.5px solid var(--line-strong);border-top-color:var(--accent-ink);animation:dmp-spin .8s linear infinite}
@keyframes dmp-spin{to{transform:rotate(360deg)}}
.dmp-errorbox{max-width:420px;display:flex;flex-direction:column;gap:10px;align-items:flex-start}
.dmp-errorbox strong{font-family:var(--serif);font-size:18px}
.dmp-errorbox p{font-size:13px;line-height:1.6;color:var(--ink-2)}

/* ---- 窄屏 ---- */
.dmp-backdrop{display:none}
@media (max-width:1240px){
  .dmp-body{grid-template-columns:260px minmax(0,1fr)}
  .dmp-archive{
    position:absolute;top:56px;right:0;bottom:0;width:min(360px,92vw);z-index:20;
    background:var(--paper-2);border-left:1px solid var(--line-strong);
    box-shadow:-18px 0 50px rgba(0,0,0,.18);
    transform:translateX(101%);visibility:hidden;
    transition:transform .22s cubic-bezier(.16,1,.3,1),visibility 0s linear .22s;
  }
  .dmp-archive.is-open{transform:none;visibility:visible;transition:transform .22s cubic-bezier(.16,1,.3,1),visibility 0s}
  .dmp-backdrop{display:block;position:absolute;inset:56px 0 0;z-index:19;background:rgba(15,17,21,.28);opacity:0;pointer-events:none;transition:opacity .2s}
  .dmp-backdrop.show{opacity:1;pointer-events:auto}
  .dmp-archbtn{display:inline-grid}
}
@media (min-width:1241px){
  .dmp-archive-close{display:none}
}
@media (max-width:900px){
  .dmp-body{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr)}
  .dmp-specimen{flex-direction:row;align-items:center;gap:14px;padding:10px 16px;border-right:0;border-bottom:1px solid var(--line);overflow:visible}
  .dmp-vessel{display:none}
  .dmp-score{padding:0;align-items:baseline;gap:6px}
  .dmp-score b{font-size:24px}
  .dmp-dims{flex:1;flex-direction:row;gap:8px;min-width:0}
  .dmp-dim{grid-template-columns:minmax(0,1fr);gap:3px;flex:1}
  .dmp-dim span{grid-column:1}
  .dmp-dim span{font-size:11px}
  .dmp-dim b{display:none}
  .dmp-bar{grid-column:1;height:3px}
  .dmp-learned{display:none}
  .dmp-composer{padding:14px 16px 0}
  .dmp-chead h2{font-size:15px}
  .dmp-chead p{display:none}
  .dmp-textarea{height:132px}
  .dmp-maturity{display:none}
  .dmp-crumb{display:none}
}
@media (max-width:560px){
  .dmp-topbar{padding:0 12px;gap:8px}
  .dmp-seg button{padding:5px 8px;font-size:12px}
  .dmp-actionbar{flex-wrap:wrap;row-gap:6px}
  .dmp-kbd{display:none}
  .dmp-actionnote{display:none}
}
@media (max-height:640px){
  .dmp-textarea{height:112px}
  .dmp-chead p{display:none}
}
@media (prefers-reduced-motion:reduce){
  .dmp-water-body,.dmp-bar i,.dmp-toast,.dmp-archive{transition:none}
  .dmp-caret,.dmp-spinner{animation:none}
}
    `;

    /** 注入一次样式。 */
    function ensureStyles() {
      if (typeof document === 'undefined') return;
      const tagId = `${PLUGIN_ID}/page.css`;
      const existing = document.querySelector(`style[data-plugin-css="${tagId}"]`);
      if (existing !== null) {
        if (existing.textContent !== css) existing.textContent = css;
        return;
      }
      const tag = document.createElement('style');
      tag.dataset.plugin = PLUGIN_ID;
      tag.dataset.pluginCss = tagId;
      tag.textContent = css;
      document.head.appendChild(tag);
    }

    // ---- 小工具 ----

    /** 请求宿主；带超时，避免一次挂起就把 busy 卡死。 */
    async function request(path, body, method = 'POST', timeoutMs = 20000) {
      const init = {
        method,
        headers: body === undefined ? undefined : { 'content-type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      };
      const controller = typeof AbortController === 'function' ? new AbortController() : null;
      const timer = controller === null ? null : setTimeout(() => controller.abort(), timeoutMs);
      if (controller !== null) init.signal = controller.signal;
      try {
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
      } catch (error) {
        if (error !== null && typeof error === 'object' && error.name === 'AbortError') {
          throw new Error('请求超时：宿主没有响应。');
        }
        throw error;
      } finally {
        if (timer !== null) clearTimeout(timer);
      }
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

    /** 深读阶段 → 进度（0–1）。 */
    function deepRatio(job) {
      if (!job) return 0;
      if (job.status === 'done') return 1;
      if (job.status !== 'running') return 0;
      const index = DEEP_STEPS.indexOf(job.phase);
      if (index >= 0) return (index + 1) / (DEEP_STEPS.length + 1);
      return 0.08;
    }

    // ---- 图标 ----

    /** 玻璃罩 + 小植物。 */
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

    /** 星光：深读。 */
    function SparkIcon() {
      return h(
        'svg',
        { width: 14, height: 14, viewBox: '0 0 14 14', fill: 'none', 'aria-hidden': 'true' },
        h('path', { d: 'M7 1.6l1.2 3.4 3.4 1.2-3.4 1.2L7 10.8 5.8 7.4 2.4 6.2l3.4-1.2L7 1.6Z', stroke: 'currentColor', strokeWidth: 1.1, strokeLinejoin: 'round' }),
      );
    }

    /** 滑杆：设置。 */
    function SlidersIcon() {
      return h(
        'svg',
        { width: 16, height: 16, viewBox: '0 0 14 14', fill: 'none', 'aria-hidden': 'true' },
        h('path', { d: 'M2 3.2h10M2 7h10M2 10.8h10', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round', opacity: 0.6 }),
        h('circle', { cx: 5, cy: 3.2, r: 1.5, fill: 'var(--paper-2)', stroke: 'currentColor', strokeWidth: 1.2 }),
        h('circle', { cx: 9, cy: 7, r: 1.5, fill: 'var(--paper-2)', stroke: 'currentColor', strokeWidth: 1.2 }),
        h('circle', { cx: 4, cy: 10.8, r: 1.5, fill: 'var(--paper-2)', stroke: 'currentColor', strokeWidth: 1.2 }),
      );
    }

    /** 档案：右栏开关。 */
    function ArchiveIcon() {
      return h(
        'svg',
        { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true' },
        h('path', { d: 'M3 3.4h10M3 8h10M3 12.6h6', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' }),
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

    /** 删除。 */
    function TrashIcon() {
      return h(
        'svg',
        { width: 14, height: 14, viewBox: '0 0 14 14', fill: 'none', 'aria-hidden': 'true' },
        h('path', { d: 'M2.6 3.6h8.8M5.4 3.6V2.4h3.2v1.2M3.8 3.6l.5 7.2c0 .5.4.8.9.8h3.6c.5 0 .9-.3.9-.8l.5-7.2', stroke: 'currentColor', strokeWidth: 1.1, strokeLinecap: 'round', strokeLinejoin: 'round' }),
      );
    }

    /** 回形针。 */
    function ClipIcon() {
      return h(
        'svg',
        { width: 13, height: 13, viewBox: '0 0 14 14', fill: 'none', 'aria-hidden': 'true' },
        h('path', { d: 'M6 8.2 8.2 6a2.4 2.4 0 0 1 3.4 3.4l-1.4 1.4M8 5.8 5.8 8A2.4 2.4 0 0 1 2.4 4.6l1.4-1.4', stroke: 'currentColor', strokeWidth: 1.1, strokeLinecap: 'round' }),
      );
    }

    /** 箭头。 */
    function ArrowIcon() {
      return h(
        'svg',
        { width: 14, height: 14, viewBox: '0 0 14 14', fill: 'none', 'aria-hidden': 'true' },
        h('path', { d: 'M2.6 7h8.2M7.4 3.6 10.8 7 7.4 10.4', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' }),
      );
    }

    /** 关闭。 */
    function CloseIcon() {
      return h(
        'svg',
        { width: 14, height: 14, viewBox: '0 0 14 14', fill: 'none', 'aria-hidden': 'true' },
        h('path', { d: 'm3.4 3.4 7.2 7.2M10.6 3.4l-7.2 7.2', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' }),
      );
    }

    // ---- 组件 ----

    /** 顶栏。 */
    function Topbar(props) {
      const t = props.t;
      const progress = props.progress;
      const running = props.deepRunning;
      return h(
        'header',
        { className: 'dmp-topbar' },
        h('div', { className: 'dmp-brand' }, h('span', { className: 'dmp-mark', 'aria-hidden': 'true' }, h(VesselIcon, { size: 16 })), h('h1', null, t('title')), h('span', { className: 'dmp-crumb' }, t('subtitle'))),
        h(
          'div',
          { className: 'dmp-topright' },
          h('div', { className: 'dmp-maturity', title: `${t('maturity')} ${progress.percent}%` }, h('b', null, String(progress.percent)), h('span', null, '%')),
          h(
            'button',
            {
              type: 'button',
              className: 'dmp-btn',
              onClick: props.onDeep,
              disabled: props.deepDisabled,
              title: props.deepTitle,
            },
            h(SparkIcon),
            h('span', null, running ? props.phase || t('deepRunning') : t('deep')),
          ),
          h(
            'button',
            { type: 'button', className: 'dmp-iconbtn dmp-archbtn', onClick: props.onOpenArchive, 'aria-label': t('archiveOpen'), title: t('archiveOpen'), 'aria-expanded': props.archiveOpen, 'aria-controls': 'dmp-archive' },
            h(ArchiveIcon),
            props.pendingCount > 0 ? h('span', { className: 'dmp-count' }, String(props.pendingCount)) : null,
          ),
          h('button', { type: 'button', className: 'dmp-iconbtn', onClick: props.onSettings, 'aria-label': t('settingsTitle'), title: t('settingsTitle') }, h(SlidersIcon)),
        ),
        running ? h('div', { className: 'dmp-progress', style: { width: `${Math.round(props.deepRatio * 100)}%` } }) : null,
      );
    }

    /** 左栏：标本。 */
    function Specimen(props) {
      const t = props.t;
      const progress = props.progress;
      const water = 8 + 8 * Math.min(1, progress.overall);
      const dims = DIMENSIONS.map((dimension) => ({
        ...dimension,
        value: progress.dimensions.find((item) => item.id === dimension.id)?.value ?? 0,
      }));
      return h(
        'aside',
        { className: 'dmp-specimen', 'aria-label': '标本状态' },
        h(
          'div',
          { className: 'dmp-vessel' },
          h(
            'div',
            { className: 'dmp-jar' },
            h('div', { className: 'dmp-water', style: { '--dmp-water-level': `${water.toFixed(2)}%` } }, h('div', { className: 'dmp-water-body' })),
            h('img', { className: 'dmp-plant', src: `${API}/asset/plant.png`, alt: t('assetAlt'), draggable: false }),
            h('i', { className: 'dmp-drop d1', 'aria-hidden': 'true' }),
            h('i', { className: 'dmp-drop d2', 'aria-hidden': 'true' }),
            h('i', { className: 'dmp-drop d3', 'aria-hidden': 'true' }),
          ),
          h('div', { className: 'dmp-base' }, h('div', { className: 'dmp-plaque' }, h('strong', null, 'SPECIMEN 001'), h('em', null, progress.ready ? '你的语气 · 已成形' : '你的语气 · 未成形'))),
        ),
        h('div', { className: 'dmp-score' }, h('span', null, t('maturity')), h('b', null, String(progress.percent), h('small', null, '%'))),
        h(
          'ul',
          { className: 'dmp-dims' },
          dims.map((dimension) =>
            h(
              'li',
              { className: 'dmp-dim', key: dimension.id, title: `${dimension.label} ${dimension.value}` },
              h('span', null, dimension.label),
              h('b', null, String(dimension.value)),
              h('div', { className: 'dmp-bar' }, h('i', { style: { transform: `scaleX(${Math.max(0, Math.min(100, dimension.value)) / 100})` } })),
            ),
          ),
        ),
        h('div', { className: 'dmp-learned' }, h('span', null, progress.ready ? '继续精炼' : '它刚学会'), h('p', null, progress.latestRule ?? '先喂一段你写的东西。')),
      );
    }

    /** 中栏：写作 + 最近投喂。 */
    function Composer(props) {
      const t = props.t;
      const state = props.state;
      const busy = props.busy;
      const tab = props.tab;
      const fileRef = React.useRef(null);
      const textRef = React.useRef(null);
      const [signalOpen, setSignalOpen] = React.useState(false);
      const latestCorrection = state.entries.find((entry) => entry.type === 'correction');

      const onFile = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (file === undefined) return;
        if (file.size > 1_000_000) {
          props.onError('文件太大（上限 1MB），请拆成几段分别导入。');
          return;
        }
        try {
          const text = await file.text();
          if (text.length > 20000) {
            props.onError('单条最多 2 万字，请拆成几段分别导入。');
            return;
          }
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

      const submitLabel = tab === 'corpus' ? t('pour') : tab === 'correction' ? t('pourCorrection') : t('pourNote');
      const onKeyDown = (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
          event.preventDefault();
          if (!busy && canSubmit) props.onFeed(tab);
        }
      };

      const samples = state.entries.length === 0 && tab === 'corpus'
        ? h(
            'div',
            { className: 'dmp-samples' },
            SAMPLES.map((sample) =>
              h('button', {
                type: 'button',
                key: sample.slice(0, 8),
                onClick: () => {
                  props.onText(sample);
                  if (textRef.current !== null) textRef.current.focus();
                },
              }, clampText(sample, 16)),
            ),
          )
        : null;

      return h(
        'main',
        { className: 'dmp-composer' },
        h(
          'div',
          { className: 'dmp-write' },
          h(
            'div',
            { className: 'dmp-chead' },
            h('div', null, h('h2', null, '喂养台'), h('p', null, '粘贴你写的东西，或一段你改过的回复。本地分析，不联网。')),
            h(
              'div',
              { className: 'dmp-seg', role: 'tablist', 'aria-label': '投喂类型' },
              [
                ['corpus', t('corpus')],
                ['correction', t('correction')],
                ['note', t('note')],
              ].map(([key, label]) =>
                h('button', {
                  type: 'button',
                  key,
                  role: 'tab',
                  'aria-selected': tab === key,
                  onClick: () => props.onTab(key),
                }, label),
              ),
            ),
          ),

          tab === 'corpus'
            ? h(
                React.Fragment,
                null,
                h('label', { className: 'dmp-label', htmlFor: 'dmp-title' }, h('span', null, t('feedTitle')), h('em', null, t('feedTitleHint'))),
                h('input', {
                  id: 'dmp-title',
                  className: 'dmp-input',
                  value: props.title,
                  placeholder: t('feedTitle'),
                  onChange: (event) => props.onTitle(event.target.value),
                }),
                h(
                  'div',
                  { className: 'dmp-label' },
                  h('span', null, '正文'),
                  h('em', null, `${formatChars(props.text.length)} ${t('chars')}`),
                ),
                h(
                  'div',
                  { className: 'dmp-editor' },
                  h('textarea', {
                    ref: textRef,
                    className: 'dmp-textarea',
                    value: props.text,
                    placeholder: t('feedPlaceholder'),
                    onChange: (event) => props.onText(event.target.value),
                    onKeyDown,
                    spellCheck: false,
                    'aria-label': '正文',
                  }),
                  h(
                    'div',
                    { className: 'dmp-editor-foot' },
                    h('button', { type: 'button', className: 'dmp-link', onClick: () => fileRef.current?.click() }, h(ClipIcon), t('importFile')),
                    h('span', { className: 'dmp-kbd' }, t('shortcut')),
                  ),
                  h('input', { ref: fileRef, type: 'file', accept: '.txt,.md,.markdown,text/plain', style: { display: 'none' }, onChange: onFile }),
                ),
                h(
                  'div',
                  { className: 'dmp-actionbar' },
                  h(
                    'button',
                    { type: 'button', className: 'dmp-submit', disabled: busy || !canSubmit, onClick: () => props.onFeed('corpus') },
                    busy ? '…' : submitLabel,
                    h(ArrowIcon),
                  ),
                  h('span', { className: 'dmp-actionnote' }, t('submitHint')),
                ),
                state.progress?.hints?.[0] ? h('p', { className: 'dmp-hint' }, state.progress.hints[0]) : null,
                samples,
              )
            : null,

          tab === 'correction'
            ? h(
                React.Fragment,
                null,
                h('div', { className: 'dmp-label' }, h('span', null, t('original')), h('em', null, `${formatChars(props.original.length)} ${t('chars')}`)),
                h('textarea', {
                  className: 'dmp-textarea short',
                  value: props.original,
                  placeholder: t('originalPlaceholder'),
                  onChange: (event) => props.onOriginal(event.target.value),
                  onKeyDown,
                  spellCheck: false,
                  'aria-label': t('original'),
                }),
                h('div', { className: 'dmp-label', style: { marginTop: 10 } }, h('span', null, t('revised')), h('em', null, `${formatChars(props.revised.length)} ${t('chars')}`)),
                h('textarea', {
                  className: 'dmp-textarea short',
                  value: props.revised,
                  placeholder: t('revisedPlaceholder'),
                  onChange: (event) => props.onRevised(event.target.value),
                  onKeyDown,
                  spellCheck: false,
                  'aria-label': t('revised'),
                }),
                h(
                  'div',
                  { className: 'dmp-actionbar' },
                  h(
                    'button',
                    { type: 'button', className: 'dmp-submit', disabled: busy || !canSubmit, onClick: () => props.onFeed('correction') },
                    busy ? '…' : submitLabel,
                    h(DropIcon),
                  ),
                  h('span', { className: 'dmp-actionnote' }, '高营养：diff 比长文更有信号'),
                ),
                latestCorrection !== undefined && (latestCorrection.signals ?? []).length > 0
                  ? h(
                      React.Fragment,
                      null,
                      h('button', { type: 'button', className: 'dmp-link', style: { marginTop: 8 }, onClick: () => setSignalOpen((value) => !value) }, signalOpen ? '收起上次提取的信号' : '看上次提取的信号'),
                      signalOpen
                        ? h(
                            'div',
                            { className: 'dmp-signals' },
                            latestCorrection.signals.map((signal, index) => h('span', { className: 'dmp-chip', key: `${signal.key}-${index}`, title: signal.label }, signal.label)),
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
                h('div', { className: 'dmp-label' }, h('span', null, '明确规则'), h('em', null, '立即生效')),
                h('textarea', {
                  className: 'dmp-textarea short',
                  value: props.note,
                  placeholder: t('notePlaceholder'),
                  onChange: (event) => props.onNote(event.target.value),
                  onKeyDown,
                  spellCheck: false,
                  'aria-label': '明确规则',
                }),
                h(
                  'div',
                  { className: 'dmp-actionbar' },
                  h('button', { type: 'button', className: 'dmp-submit', disabled: busy || !canSubmit, onClick: () => props.onFeed('note') }, busy ? '…' : submitLabel, h(ArrowIcon)),
                  h('span', { className: 'dmp-actionnote' }, '不想等分析时，直接把规则写死'),
                ),
              )
            : null,

          state.settings.privacySeen === false
            ? h(
                'div',
                { className: 'dmp-hint', style: { display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' } },
                h('span', null, t('privacy')),
                h('button', { type: 'button', className: 'dmp-link', onClick: props.onPrivacy }, t('privacyButton')),
              )
            : null,

          h('div', { className: 'dmp-divider' }),
        ),

        h(
          'div',
          { className: 'dmp-lhead' },
          h('h3', null, t('recent')),
          h('span', null, `${state.entries.length} 条 · ${formatChars(state.progress?.chars ?? 0)} ${t('chars')}`),
        ),
        state.entries.length === 0
          ? h('div', { className: 'dmp-empty' }, h('strong', null, t('emptyTitle')), t('emptyNote'))
          : h(
              'ul',
              { className: 'dmp-list' },
              state.entries.filter((entry) => !props.hiddenIds.includes(entry.id)).map((entry) =>
                h(
                  'li',
                  { className: 'dmp-row', key: entry.id },
                  h('span', { className: `dmp-tag ${entry.type}` }, entry.type === 'corpus' ? t('corpus') : entry.type === 'correction' ? t('correction') : t('note')),
                  h(
                    'div',
                    { className: 'dmp-row-main' },
                    h('b', { title: entry.title }, entry.title),
                    h('span', null, `${formatChars(entry.chars)} ${t('chars')} · ${relativeTime(entry.createdAt)}`),
                  ),
                  h('button', { type: 'button', className: 'dmp-del', onClick: () => props.onDelete(entry), 'aria-label': `${t('delete')} ${entry.title}`, title: t('delete') }, h(TrashIcon)),
                ),
              ),
            ),
      );
    }

    /** 规则卡。 */
    function RuleCard(props) {
      const t = props.t;
      const rule = props.rule;
      const editing = props.editingRule === rule.id;
      const armed = props.armedRuleId === rule.id;
      const enabled = rule.enabled !== false;
      return h(
        'article',
        { className: 'dmp-rule' },
        h(
          'div',
          { className: 'dmp-rule-top' },
          h('span', { className: `dmp-src ${rule.layer}` }, layerLabel(rule.layer, t)),
          h('span', { className: 'dmp-dim' }, dimensionLabel(rule.dimension)),
          h(
            'div',
            { className: 'dmp-rule-actions' },
            h('button', {
              type: 'button',
              className: 'dmp-switch',
              role: 'switch',
              'aria-checked': enabled,
              'aria-label': enabled ? t('ruleOn') : t('ruleOff'),
              onClick: () => props.onToggle(rule, !enabled),
            }),
            h('button', { type: 'button', className: 'dmp-mini', onClick: () => props.onEdit(rule) }, t('edit')),
            h('button', { type: 'button', className: `dmp-mini danger${armed ? ' armed' : ''}`, onClick: () => props.onDelete(rule) }, armed ? t('confirmAgain') : t('delete')),
          ),
        ),
        editing
          ? h(
              React.Fragment,
              null,
              h('textarea', { className: 'dmp-textarea', value: props.editText, onChange: (event) => props.onEditText(event.target.value), 'aria-label': '编辑规则' }),
              h(
                'div',
                { className: 'dmp-rule-edit' },
                h('button', { type: 'button', className: 'dmp-btn primary small', onClick: props.onSaveEdit }, t('saveRule')),
                h('button', { type: 'button', className: 'dmp-btn small ghost', onClick: props.onCancelEdit }, t('cancel')),
              ),
            )
          : h('p', null, rule.text),
        !editing && (rule.evidence ?? []).length > 0 ? h('q', null, `“${clampText(rule.evidence[0].quote, 72)}”`) : null,
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
        run.summary ? h('p', null, run.summary) : null,
        (run.rules ?? []).slice(0, 6).map((rule) =>
          h('div', { className: 'dmp-pending-rule', key: rule.id }, h('span', { className: 'dmp-src deep' }, layerLabel('deep', t)), ' ', rule.text),
        ),
        h(
          'div',
          { className: 'dmp-actions' },
          h('button', { type: 'button', className: 'dmp-btn primary small', onClick: () => props.onAccept(run.id, 'all') }, t('acceptAll')),
          h('button', { type: 'button', className: 'dmp-btn small', onClick: () => props.onAccept(run.id, 'rules') }, t('acceptRules')),
          h('button', { type: 'button', className: 'dmp-btn small ghost', onClick: () => props.onAccept(run.id, 'reject') }, t('reject')),
        ),
      );
    }

    /** 右栏：人格档案。 */
    function Archive(props) {
      const t = props.t;
      const state = props.state;
      const tab = props.archiveTab;
      const job = state.deep.job;
      const groups = DIMENSIONS.map((dimension) => ({
        ...dimension,
        rules: state.rules.filter((rule) => rule.dimension === dimension.id),
      })).filter((group) => group.rules.length > 0);
      const pending = state.deep.pending ?? [];
      const ruleCount = state.rules.length;

      return h(
        'aside',
        { className: `dmp-archive${props.open ? ' is-open' : ''}`, 'aria-label': t('archive'), id: 'dmp-archive' },
        h(
          'div',
          { className: 'dmp-ahead' },
          h('h2', null, t('archive')),
          h('span', { className: 'dmp-spacer' }),
          job?.status === 'running'
            ? h('span', { className: 'dmp-badge running' }, `${t('deepRunning')} · ${job.phase ?? ''}`)
            : pending.length > 0
              ? h('span', { className: 'dmp-badge' }, `${pending.length} ${t('pendingCount')}`)
              : null,
          h('button', { type: 'button', className: 'dmp-iconbtn dmp-archive-close', onClick: props.onClose, 'aria-label': t('archiveClose'), title: t('archiveClose') }, h(CloseIcon)),
        ),
        h(
          'div',
          { className: 'dmp-tabs', role: 'tablist', 'aria-label': t('archive') },
          [
            ['rules', `规则 ${ruleCount}`],
            ['prompt', t('prompt')],
            ['test', t('test')],
          ].map(([key, label]) =>
            h('button', {
              type: 'button',
              key,
              className: 'dmp-tab',
              role: 'tab',
              'aria-selected': tab === key,
              onClick: () => props.onTab(key),
            }, label),
          ),
        ),

        tab === 'rules'
          ? h(
              'div',
              { className: 'dmp-panel' },
              job?.status === 'running'
                ? h('div', { className: 'dmp-pending' }, h('div', { className: 'dmp-pending-head' }, h('strong', null, t('deepRunning')), h('span', null, job.phase ?? '')), h('p', null, '模型正在读语料；完成后会出现在这里，等你收下。'))
                : null,
              job?.status === 'error'
                ? h('div', { className: 'dmp-pending' }, h('div', { className: 'dmp-pending-head' }, h('strong', null, t('deepFailed')), h('span', null, '')), h('p', null, job.error ?? '未知错误'))
                : null,
              pending.map((run) => h(PendingCard, { key: run.id, t, run, onAccept: props.onAccept })),
              state.deep.portraitAccepted && state.deep.portraitStale
                ? h(
                    'div',
                    { className: 'dmp-pending' },
                    h('div', { className: 'dmp-pending-head' }, h('strong', null, t('portraitStale')), h('span', null, '')),
                    h('div', { className: 'dmp-actions' }, h('button', { type: 'button', className: 'dmp-btn small', onClick: props.onRegenerate }, t('rewritePortrait'))),
                  )
                : null,
              state.rules.length === 0
                ? h('div', { className: 'dmp-empty' }, h('strong', null, t('rulesEmpty')), '先喂一段语料，规则会带着原文证据出现在这里。')
                : groups.map((group) =>
                    h(
                      'section',
                      { className: 'dmp-group', key: group.id },
                      h('h4', null, `${group.label} · ${group.rules.length}`),
                      group.rules.map((rule) =>
                        h(RuleCard, {
                          key: rule.id,
                          t,
                          rule,
                          editingRule: props.editingRule,
                          editText: props.editText,
                          armedRuleId: props.armedRuleId,
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
              { className: 'dmp-panel' },
              h(
                'div',
                { className: 'dmp-lhead', style: { marginBottom: 6 } },
                h('h3', null, '当前人格'),
                h('button', { type: 'button', className: 'dmp-link', onClick: props.onCopy }, t('copy')),
              ),
              h('pre', { className: 'dmp-pre' }, state.profile),
              h(
                'div',
                { className: 'dmp-label', style: { marginTop: 14 } },
                h('span', null, '手动补充'),
                props.manualDirty ? h('em', { className: 'dmp-dirty' }, h('i', null), t('unsaved')) : h('em', null, '⌘S'),
              ),
              h('textarea', {
                className: 'dmp-textarea',
                style: { height: 120, paddingBottom: 12 },
                value: props.manualText,
                placeholder: t('promptPlaceholder'),
                onChange: (event) => props.onManualText(event.target.value),
                'aria-label': '手动补充',
              }),
              h(
                'div',
                { className: 'dmp-seg', style: { marginTop: 8 }, role: 'tablist', 'aria-label': '手改模式' },
                [['append', t('append')], ['takeover', t('takeover')]].map(([key, label]) =>
                  h('button', { type: 'button', key, role: 'tab', 'aria-selected': props.manualMode === key, onClick: () => props.onManualMode(key) }, label),
                ),
              ),
              h('div', { className: 'dmp-actionbar' }, h('button', { type: 'button', className: 'dmp-btn primary small', onClick: props.onSaveManual }, t('save'))),
              h('p', { className: 'dmp-hint' }, t('promptHint')),
            )
          : null,

        tab === 'test'
          ? h(
              'div',
              { className: 'dmp-panel' },
              h('div', { className: 'dmp-label' }, h('span', null, '场景'), h('em', null, '不会自动写进人格')),
              h('textarea', {
                className: 'dmp-textarea',
                style: { height: 92, paddingBottom: 12 },
                value: props.scenario,
                placeholder: t('testPlaceholder'),
                onChange: (event) => props.onScenario(event.target.value),
                'aria-label': '试音场景',
              }),
              h(
                'div',
                { className: 'dmp-actionbar' },
                h('button', { type: 'button', className: 'dmp-btn small', disabled: props.testRunning || props.scenario.trim().length < 2, onClick: props.onTest }, props.testRunning ? t('testRunning') : t('testRun')),
              ),
              props.testError ? h('p', { className: 'dmp-hint', style: { color: 'var(--violet-ink)' } }, props.testError) : null,
              props.testOutput.length > 0
                ? h('div', { className: 'dmp-testout', role: 'log', 'aria-live': 'polite' }, props.testOutput, props.testRunning ? h('span', { className: 'dmp-caret' }) : null)
                : null,
              props.testOutput.length > 0 && !props.testRunning
                ? h(
                    'div',
                    { className: 'dmp-actions' },
                    h('button', { type: 'button', className: 'dmp-btn small', onClick: props.onLike }, t('like')),
                    h('button', { type: 'button', className: 'dmp-btn small', onClick: props.onUnlike }, t('unlike')),
                  )
                : null,
            )
          : null,
      );
    }

    /** 设置弹窗。 */
    function Settings(props) {
      const t = props.t;
      const state = props.state;
      const panelRef = React.useRef(null);
      const closeRef = React.useRef(props.onClose);
      closeRef.current = props.onClose;
      const [armed, setArmed] = React.useState(false);

      React.useEffect(() => {
        const previous = document.activeElement;
        const node = panelRef.current;
        if (node !== null) {
          const input = node.querySelector('input');
          const target = input ?? node.querySelector('button');
          if (target !== null) target.focus();
        }
        const onKey = (event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            closeRef.current();
            return;
          }
          if (event.key !== 'Tab' || node === null) return;
          const focusables = Array.from(node.querySelectorAll('button:not([disabled]),input:not([disabled]),textarea,a[href]'));
          if (focusables.length === 0) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        };
        document.addEventListener('keydown', onKey, true);
        return () => {
          document.removeEventListener('keydown', onKey, true);
          if (previous !== null && typeof previous.focus === 'function' && document.contains(previous)) previous.focus();
        };
      }, []);

      return h(
        'div',
        { className: 'dmp-mask', onClick: props.onClose },
        h(
          'div',
          { className: 'dmp-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('settingsTitle'), ref: panelRef, onClick: (event) => event.stopPropagation() },
          h(
            'div',
            { className: 'dmp-modal-head' },
            h('strong', null, t('settingsTitle')),
            h('button', { type: 'button', className: 'dmp-iconbtn', onClick: props.onClose, 'aria-label': t('close'), title: t('close') }, h(CloseIcon)),
          ),
          h(
            'div',
            { className: 'dmp-field' },
            h('label', { htmlFor: 'dmp-provider' }, `${t('model')} · ${t('provider')}`),
            h(
              'div',
              { className: 'dmp-field-row' },
              h('input', { id: 'dmp-provider', value: props.provider, placeholder: state.settings.defaultProvider ?? 'follow default', onChange: (event) => props.onProvider(event.target.value) }),
              h('button', { type: 'button', className: 'dmp-btn small ghost', onClick: () => props.onProvider('') }, t('followDefault')),
            ),
          ),
          h(
            'div',
            { className: 'dmp-field' },
            h('label', { htmlFor: 'dmp-model' }, `${t('model')} · ${t('modelId')}`),
            h(
              'div',
              { className: 'dmp-field-row' },
              h('input', { id: 'dmp-model', value: props.model, placeholder: state.settings.defaultModel ?? 'follow default', onChange: (event) => props.onModel(event.target.value) }),
              h('button', { type: 'button', className: 'dmp-btn small ghost', onClick: () => props.onModel('') }, t('followDefault')),
            ),
          ),
          h('p', { className: 'dmp-hint', style: { marginTop: -6, marginBottom: 12 } }, `${t('modelHint')}（${state.settings.defaultProvider ?? '—'} / ${state.settings.defaultModel ?? '—'}）`),
          h(
            'label',
            { className: 'dmp-check' },
            h('input', { type: 'checkbox', checked: props.sendToModel, onChange: (event) => props.onSendToModel(event.target.checked) }),
            h('span', null, t('sendToModel')),
          ),
          h(
            'div',
            { className: 'dmp-modal-actions' },
            h('button', { type: 'button', className: 'dmp-btn small', onClick: props.onExport }, t('export')),
            h(
              'button',
              {
                type: 'button',
                className: 'dmp-btn small danger',
                onClick: () => {
                  if (armed) {
                    setArmed(false);
                    props.onReset();
                  } else {
                    setArmed(true);
                  }
                },
              },
              armed ? t('resetArmed') : t('reset'),
            ),
            h('span', { className: 'dmp-spacer' }),
            h('button', { type: 'button', className: 'dmp-btn small primary', onClick: props.onSave }, t('save')),
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
          (typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches)
        );
      });
      React.useEffect(() => {
        if (typeof document === 'undefined') return undefined;
        const root = document.documentElement;
        const media = typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
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
      const [archiveOpen, setArchiveOpen] = React.useState(false);
      const [archiveTab, setArchiveTab] = React.useState('rules');
      const [settingsOpen, setSettingsOpen] = React.useState(false);
      const [manualText, setManualText] = React.useState('');
      const [manualMode, setManualMode] = React.useState('append');
      const [manualDirty, setManualDirty] = React.useState(false);
      const [editingRule, setEditingRule] = React.useState(null);
      const [editText, setEditText] = React.useState('');
      const [armedRuleId, setArmedRuleId] = React.useState(null);
      const [scenario, setScenario] = React.useState('');
      const [testOutput, setTestOutput] = React.useState('');
      const [testError, setTestError] = React.useState('');
      const [testRunning, setTestRunning] = React.useState(false);
      const [provider, setProvider] = React.useState('');
      const [model, setModel] = React.useState('');
      const [sendToModel, setSendToModel] = React.useState(true);
      const [toast, setToast] = React.useState(null);
      const [hiddenIds, setHiddenIds] = React.useState([]);

      const toastTimer = React.useRef(null);
      const manualDirtyRef = React.useRef(false);
      const settingsDirty = React.useRef(false);
      const deepPoll = React.useRef(null);
      const deepPollBusy = React.useRef(false);
      const testAbort = React.useRef(null);
      const testBuffer = React.useRef('');
      const testFlush = React.useRef(null);
      const pendingDeletes = React.useRef(new Map());
      const armedRuleTimer = React.useRef(null);

      /** 显示提示；action 可选 { label, onClick }。 */
      const showToast = React.useCallback((message, action, duration = 4200) => {
        if (toastTimer.current !== null) clearTimeout(toastTimer.current);
        setToast({ message, action, id: Date.now() });
        toastTimer.current = setTimeout(() => setToast(null), duration);
      }, []);

      const applyState = React.useCallback((next) => {
        setState(next);
        if (!manualDirtyRef.current) {
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

      /** 深读状态轮询：上一次没回来就跳过这一拍。 */
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
          if (deepPollBusy.current) return;
          deepPollBusy.current = true;
          try {
            const data = await request('/deep/status', undefined, 'GET');
            if (data.job?.status === 'done') {
              clearInterval(deepPoll.current);
              deepPoll.current = null;
              const full = await request('/state.json', undefined, 'GET');
              applyState(full);
              setArchiveTab('rules');
              setArchiveOpen(true);
              showToast(t('deepDone'));
            } else if (data.job?.status === 'error') {
              clearInterval(deepPoll.current);
              deepPoll.current = null;
              showToast(`${t('deepFailed')}：${data.job.error ?? '未知错误'}`);
            } else {
              setState((previous) => (previous === null ? previous : { ...previous, deep: { ...previous.deep, job: data.job, pending: data.pending ?? previous.deep.pending } }));
            }
          } catch (caught) {
            clearInterval(deepPoll.current);
            deepPoll.current = null;
            showToast(caught instanceof Error ? caught.message : String(caught));
          } finally {
            deepPollBusy.current = false;
          }
        }, 950);
        return () => {
          if (deepPoll.current !== null) {
            clearInterval(deepPoll.current);
            deepPoll.current = null;
          }
        };
      }, [state?.deep?.job?.status, state?.deep?.job?.id, applyState, showToast, t]);

      React.useEffect(() => {
        void load();
        return () => {
          if (toastTimer.current !== null) clearTimeout(toastTimer.current);
          if (deepPoll.current !== null) clearInterval(deepPoll.current);
          if (armedRuleTimer.current !== null) clearTimeout(armedRuleTimer.current);
          if (testFlush.current !== null) {
            clearInterval(testFlush.current);
            testFlush.current = null;
          }
          if (testAbort.current !== null) {
            testAbort.current.abort();
            testAbort.current = null;
          }
          // 卸载时把还没到点的删除发出去，避免留下“看起来删了但没删”的状态。
          for (const [id, timer] of pendingDeletes.current) {
            clearTimeout(timer);
            void request('/entries/delete', { id }).catch(() => {});
          }
          pendingDeletes.current.clear();
        };
      }, [load]);

      /** 窄屏 Esc 关闭档案抽屉。 */
      React.useEffect(() => {
        if (!archiveOpen) return undefined;
        const onKey = (event) => {
          if (event.key === 'Escape') setArchiveOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
      }, [archiveOpen]);

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

      /** 删除：先从列表移除，5 秒后真正落盘，期间可撤销。 */
      const deleteEntry = (entry) => {
        if (pendingDeletes.current.has(entry.id)) return;
        setHiddenIds((ids) => (ids.includes(entry.id) ? ids : [...ids, entry.id]));
        const timer = setTimeout(() => {
          pendingDeletes.current.delete(entry.id);
          void (async () => {
            try {
              const payload = await request('/entries/delete', { id: entry.id });
              applyState(payload.state);
            } catch (caught) {
              showToast(caught instanceof Error ? caught.message : String(caught));
            } finally {
              setHiddenIds((ids) => ids.filter((id) => id !== entry.id));
            }
          })();
        }, 5000);
        pendingDeletes.current.set(entry.id, timer);
        showToast(
          t('deletedPending'),
          {
            label: t('undo'),
            onClick: () => {
              const pending = pendingDeletes.current.get(entry.id);
              if (pending !== undefined) clearTimeout(pending);
              pendingDeletes.current.delete(entry.id);
              setHiddenIds((ids) => ids.filter((id) => id !== entry.id));
              setToast(null);
            },
          },
          5000,
        );
      };

      const toggleRule = async (rule, enabled) => {
        try {
          const payload = await request('/rules/update', { id: rule.id, enabled });
          applyState(payload.state);
        } catch (caught) {
          showToast(caught instanceof Error ? caught.message : String(caught));
        }
      };

      /** 规则删除用“再点一次”，不用原生 confirm。 */
      const deleteRule = async (rule) => {
        if (armedRuleId !== rule.id) {
          setArmedRuleId(rule.id);
          if (armedRuleTimer.current !== null) clearTimeout(armedRuleTimer.current);
          armedRuleTimer.current = setTimeout(() => setArmedRuleId(null), 3200);
          return;
        }
        setArmedRuleId(null);
        if (armedRuleTimer.current !== null) clearTimeout(armedRuleTimer.current);
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

      const saveManual = React.useCallback(async () => {
        if (!manualDirtyRef.current) return;
        try {
          const payload = await request('/profile', { text: manualText, mode: manualMode });
          manualDirtyRef.current = false;
          setManualDirty(false);
          applyState(payload.state);
          showToast(t('saved'));
        } catch (caught) {
          showToast(caught instanceof Error ? caught.message : String(caught));
        }
      }, [applyState, manualMode, manualText, showToast, t]);

      /** ⌘S 保存手改层。 */
      React.useEffect(() => {
        const onKey = (event) => {
          if ((event.metaKey || event.ctrlKey) && String(event.key).toLowerCase() === 's') {
            if (!manualDirtyRef.current) return;
            event.preventDefault();
            void saveManual();
          }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
      }, [saveManual]);

      const startDeep = async () => {
        if (busy) return;
        setBusy(true);
        try {
          await request('/deep', {});
          const full = await request('/state.json', undefined, 'GET');
          applyState(full);
          setArchiveTab('rules');
          setArchiveOpen(true);
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

      /** 把缓冲的增量一次性写进 state，避免每个 token 触发整页重渲染。 */
      const flushTestOutput = () => {
        const chunk = testBuffer.current;
        if (chunk.length === 0) return;
        testBuffer.current = '';
        setTestOutput((previous) => previous + chunk);
      };

      const runTest = async () => {
        if (testRunning || scenario.trim().length < 2) return;
        if (testFlush.current !== null) {
          clearInterval(testFlush.current);
          testFlush.current = null;
        }
        if (testAbort.current !== null) {
          testAbort.current.abort();
          testAbort.current = null;
        }
        const controller = typeof AbortController === 'function' ? new AbortController() : null;
        testAbort.current = controller;
        testBuffer.current = '';
        setTestRunning(true);
        setTestError('');
        setTestOutput('');
        testFlush.current = setInterval(flushTestOutput, 80);
        try {
          const response = await fetch(`${API}/test`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ scenario }),
            signal: controller === null ? undefined : controller.signal,
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
                testBuffer.current += message.text;
              } else if (message.type === 'error') {
                throw new Error(message.error ?? '模型请求失败。');
              }
            }
          }
        } catch (caught) {
          if (!(caught !== null && typeof caught === 'object' && caught.name === 'AbortError')) {
            setTestError(caught instanceof Error ? caught.message : String(caught));
          }
        } finally {
          if (testFlush.current !== null) {
            clearInterval(testFlush.current);
            testFlush.current = null;
          }
          flushTestOutput();
          if (testAbort.current === controller) testAbort.current = null;
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
        try {
          const payload = await request('/reset', { confirm: 'reset' });
          applyState(payload.state);
          setSettingsOpen(false);
          setHiddenIds([]);
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

      const openArchive = (nextTab) => {
        setArchiveOpen(true);
        if (nextTab !== undefined) setArchiveTab(nextTab);
      };

      if (status === 'loading') {
        return h('div', { className: rootClass }, h('div', { className: 'dmp-boot' }, h('div', { className: 'dmp-boot-inner' }, h('span', { className: 'dmp-spinner' }), h('span', null, t('loading')))));
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
              { className: 'dmp-errorbox' },
              h('strong', null, t('error')),
              h('p', null, error),
              h('button', { type: 'button', className: 'dmp-btn primary small', onClick: load }, t('retry')),
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
      const pendingCount = (state.deep.pending ?? []).length;

      return h(
        'div',
        { className: rootClass },
        h(Topbar, {
          t,
          progress: state.progress,
          deepRunning,
          deepRatio: deepRatio(state.deep.job),
          phase: state.deep.job?.phase ?? '',
          deepTitle,
          deepDisabled: busy || deepRunning || !hasMaterial || state.settings.sendToModel === false,
          pendingCount,
          archiveOpen,
          onDeep: startDeep,
          onSettings: () => {
            settingsDirty.current = false;
            setSettingsOpen(true);
          },
          onOpenArchive: () => openArchive(),
        }),
        h(
          'div',
          { className: 'dmp-body' },
          h(Specimen, { t, progress: { ...state.progress, latestRule: state.latestRule?.text ?? null } }),
          h(Composer, {
            t,
            state,
            busy,
            tab,
            title,
            text,
            original,
            revised,
            note,
            hiddenIds,
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
          h(Archive, {
            t,
            state,
            open: archiveOpen,
            archiveTab,
            editingRule,
            editText,
            armedRuleId,
            manualText,
            manualMode,
            manualDirty,
            scenario,
            testOutput,
            testError,
            testRunning,
            onTab: setArchiveTab,
            onClose: () => setArchiveOpen(false),
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
              manualDirtyRef.current = true;
              setManualDirty(true);
              setManualText(value);
            },
            onManualMode: (value) => {
              manualDirtyRef.current = true;
              setManualDirty(true);
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
              setArchiveOpen(false);
              showToast(t('unlikeToast'));
            },
          }),
          h('div', {
            className: `dmp-backdrop${archiveOpen ? ' show' : ''}`,
            onClick: () => setArchiveOpen(false),
            'aria-hidden': 'true',
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
        toast !== null
          ? h(
              'div',
              { className: 'dmp-toast show', role: 'status', 'aria-live': 'polite', key: toast.id },
              h('span', null, toast.message),
              toast.action !== null && toast.action !== undefined
                ? h('button', { type: 'button', onClick: toast.action.onClick }, toast.action.label)
                : null,
            )
          : null,
        deepRunning
          ? h('span', { 'aria-live': 'polite', style: { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' } }, `${t('deepRunning')}：${state.deep.job?.phase ?? ''}`)
          : null,
      );
    }

    /** 插件入口：注册字典、侧栏入口与主区页面。 */
    function apply(ctx) {
      ensureStyles();
      // 正文是中文产品文案；英文界面只覆盖导航与标题，其余键回落到中文，
      // 否则缺失的键会直接显示成 feedTitle 这样的裸 key。
      ctx.effect(() => ctx.locale.register(NS, { zh, en: { ...zh, ...en } }), `${PLUGIN_ID}: dictionaries`);
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
