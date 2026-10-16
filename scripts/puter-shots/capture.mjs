#!/usr/bin/env node
/**
 * puter 插件落地页截图工具。
 * ------------------------------------------------------------------
 * 与宿主仓库 `otools/scripts/plugin-screenshots/capture.mjs`（给 otools-git 等
 * 工具插件用）**同一套思路**但独立成文件，原因：
 *   - 工具插件读 `plugins/<id>/i18n/*.json` 做 DOM 文本翻译；puter 插件用的是
 *     原生 i18n（`shell/src/otools/i18n.js` 读 `window.__OTOOLS_LOCALE__`），
 *     没有那个目录，也不需要 DOM hack —— 语言由注入的 `__OTOOLS_LOCALE__` 直接生效。
 *   - puter 插件的 dev 是 `node scripts/dev.mjs`（先合成 .build 再 vite），
 *     端口写在各自 `shell/overlay/vite.config.*` 里，没有 `--port`。
 *   - 主题由上游自己的 storage key 控制（见各插件 `app.js` 的 themeKey），
 *     种进 localStorage 再 reload 即生效（audio 无 themeKey，走 prefers-color-scheme）。
 *
 * 产物落到 otools-website 的 public/plugins/<key>/，命名与 PluginLanding.vue 对齐：
 *   <scene>-<lang>-<theme>.webp   （lang ∈ zh-CN / en-US；其余语种在组件里回退 neutral）
 *   <scene>-<theme>.webp          （neutral 副本 = en-US，供 SEO/OG 与缺语言兜底）
 *
 * 每个插件配 2~3 个场景：欢迎屏之外必须有「正在编辑」的真实工作画面
 * （打开模板 / 示例工程 / 新建文档后的编辑器态）。到达编辑态的通道全部是
 * 纯本地路径（模板生成 / 预设 / 原生 file input），不依赖宿主文件对话框——
 * mock 环境下后者只会静默失败。
 *
 * 用法：
 *   node scripts/puter-shots/capture.mjs                 # 跑配置里全部插件
 *   node scripts/puter-shots/capture.mjs --only otools-puter-presentation
 *   SHOT_KEEP=1 node scripts/puter-shots/capture.mjs     # 跑完不杀 dev server（调试）
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import pw from '/Users/admin/.workbuddy/binaries/node/workspace/node_modules/playwright-core/index.js';

const { chromium } = pw;
const require = createRequire(import.meta.url);
const sharp = require('/Users/admin/.workbuddy/binaries/node/workspace/node_modules/sharp');

const REPO = '/Users/admin/Documents/Repos/xyito/otools';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const NODE = '/Users/admin/.workbuddy/binaries/node/versions/22.22.2-6/bin/node';
const OUT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'plugins');
const ASSETS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'assets');
// mock 宿主文件命令的落盘根目录（playwright exposeFunction 代理到 node 侧真实 FS）。
// video 的 otools backend 靠它才能真正建工程目录、写工程 JSON、再读回来——
// 纯 null mock 下「用模板」会静默失败（toast「找不到这个项目」）。
const FS_ROOT = '/tmp/otools-shot-lib';

// 语言：puter 插件只自带 zh-CN 词条 + en-US（源码即英文）。其余站点语种在组件里回退 neutral。
const LANGS = ['zh-CN', 'en-US'];
const THEMES = ['light', 'dark'];
const VIEWPORT = { width: 1440, height: 900 };
const SCALE = 2;

// themeKey = 上游主题 storage key（app.js）。themeMode 决定怎么切主题：
//   'key'     —— 种 themeKey 再 reload（documents/spreadsheet/presentation，已验证）
//   'attr'    —— 载入后设 documentElement.dataset.theme（ps：dark/medium/light/system）
//   'shotgun' —— emulateMedia + data-theme + class 全上（3d/audio，机制不确定时兜底）
// themes = 实际要截的主题（默认 light+dark）；创作类软件站点只用暗黑图，截 dark 就够。
// scenes = 场景列表：{ key, hash?, waitMs?, extraMs?, actions? }。
//   hash    —— 该场景的 URL hash（documents/spreadsheet 靠 hash 路由直达模板/示例）
//   actions —— 页面稳定后执行的 UI 操作（点击模板卡、选模板、确认对话框等），
//              返回字符串会打进日志，便于核对是否真的进了目标编辑态。
const PLUGINS = {
  'otools-puter-ps': {
    dir: `${REPO}/otools-puter-ps`, port: 5518, themeKey: 'photo-theme', themeMode: 'attr',
    themes: ['dark'],
    scenes: [
      { key: 'edit', waitMs: 6500, actions: openSamplePhoto },
      { key: 'blank', waitMs: 5500, actions: (p) => clickByPreset(p, 'web-large') },
    ],
  },
  'otools-puter-3d': {
    dir: `${REPO}/otools-puter-3d`, port: 5519, themeKey: 'p3d.theme', themeMode: 'shotgun',
    themes: ['dark'],
    scenes: [
      { key: 'layout', waitMs: 6500 },
      { key: 'shading', waitMs: 5000, actions: (p) => switchWorkspace(p, ['shading', '着色']) },
      { key: 'geo-nodes', waitMs: 5000, actions: (p) => switchWorkspace(p, ['geometry nodes', '几何节点']) },
    ],
  },
  'otools-puter-documents': {
    dir: `${REPO}/otools-puter-documents`, port: 5520, themeKey: 'documents:theme', themeMode: 'key',
    scenes: [
      { key: 'report', hash: '#/new/report', waitMs: 4200 },
      { key: 'resume', hash: '#/new/resume', waitMs: 4200 },
    ],
  },
  'otools-puter-spreadsheet': {
    dir: `${REPO}/otools-puter-spreadsheet`, port: 5521, themeKey: 'spreadsheet:theme', themeMode: 'key',
    scenes: [
      { key: 'sample', hash: '#/sample', waitMs: 4800 },
      { key: 'budget', hash: '#/template/budget', waitMs: 4800 },
    ],
  },
  'otools-puter-presentation': {
    dir: `${REPO}/otools-puter-presentation`, port: 5522, themeKey: 'presentation:theme', themeMode: 'key',
    scenes: [
      { key: 'story', hash: '#/home', waitMs: 5200, actions: (p) => pickTemplateCard(p, 1) },
      { key: 'pitch', hash: '#/home', waitMs: 5200, actions: (p) => pickTemplateCard(p, 2) },
    ],
  },
  'otools-puter-audio': {
    dir: `${REPO}/otools-puter-audio`, port: 5523, themeKey: null, themeMode: 'shotgun',
    themes: ['dark'],
    scenes: [
      { key: 'session', waitMs: 4800, actions: newPodcastSession },
      { key: 'waveform', waitMs: 4200, actions: generateToneFile },
    ],
  },
  'otools-video': {
    dir: `${REPO}/otools-video`, port: 5517, themeKey: null, themeMode: 'shotgun',
    themes: ['dark'],
    scenes: [
      { key: 'template', waitMs: 6000, actions: openFirstTemplate },
      { key: 'editor', waitMs: 5500, actions: (p) => clickAndWait(p, 'button.new-banner', 'div.editor .tl-tracks') },
      { key: 'text', waitMs: 6000, actions: openTemplateWithText },
      { key: 'seek', waitMs: 6000, actions: openTemplateSeek2_3 },
    ],
  },
};

const argv = process.argv.slice(2);
const onlyIdx = argv.indexOf('--only');
const ONLY = onlyIdx >= 0 ? argv[onlyIdx + 1] : null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitPort(port, timeoutMs = 90000) {
  const start = Date.now();
  for (;;) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/`, { method: 'GET' });
      if (res.ok || res.status === 404) return true;
    } catch { /* not up yet */ }
    if (Date.now() - start > timeoutMs) return false;
    await sleep(500);
  }
}

function startDev(pluginDir, port) {
  // .build 是可再生产物，但 copyInto 只合并不删除：上游文件增减后残留会超过
  // tree.mjs 的 SWEEP_LIMIT(40) 直接抛错（3d/documents 都踩过）。每次跑前清掉，
  // 让 dev.mjs 重新合成，最省心。
  fs.rmSync(path.join(pluginDir, '.build'), { recursive: true, force: true });
  const log = fs.openSync(`/tmp/puter-dev-${port}.log`, 'w');
  const child = spawn(NODE, ['scripts/dev.mjs'], { cwd: pluginDir, stdio: ['ignore', log, log], detached: true });
  return child;
}

function stopDev(child) {
  try { process.kill(-child.pid, 'SIGTERM'); } catch { try { child.kill('SIGTERM'); } catch {} }
}

// ── 场景动作库 ────────────────────────────────────────────────────────────────
// 每个动作返回一段描述字符串打进日志；抛错由调用方捕获（场景降级为欢迎屏，
// 不会中断整轮截图）。

// ps：点欢迎屏的快速预设磁贴（data-preset=web-large/web-post/print-a4/…），
// 一步建文档进编辑态（#empty 隐藏、画布出现）。
async function clickByPreset(page, preset) {
  await page.waitForSelector(`button.start-preset[data-preset="${preset}"]`, { timeout: 15000 });
  await page.click(`button.start-preset[data-preset="${preset}"]`);
  await page.waitForSelector('#empty[hidden], #stage canvas#canvas', { timeout: 15000 });
  await page.waitForTimeout(1600); // 等渲染器/图层面板稳定
  return `preset=${preset} emptyHidden=${await page.$('#empty[hidden]') ? 'y' : 'n'}`;
}

// ps：经原生 file input 打开一张合成示例照片，得到「正在修图」的真实画面。
// 不碰宿主对话框（mock 下 pick_files 只返回 []），是唯一能带内容的通道。
async function openSamplePhoto(page) {
  const photo = await ensureSamplePhoto();
  await page.waitForSelector('#empty', { timeout: 15000 });
  const chooser = page.waitForEvent('filechooser', { timeout: 15000 });
  await page.click('#empty .start-head .empty-actions button.primary[data-command="file.open"]');
  (await chooser).setFiles(photo);
  await page.waitForSelector('#empty[hidden], #stage canvas#canvas', { timeout: 20000 });
  await page.waitForTimeout(2600); // 等图片解码 + 首帧渲染
  const sz = await page.textContent('#tab-size').catch(() => null);
  return `photo=${path.basename(photo)} tabSize=${sz?.trim() ?? '?'}`;
}

// 3d：切换工作区标签（Layout/Modeling/Shading/UV Editing/…）。点击后**必须校验**
// 标签真的变激活（aria-selected=true），失败重试——首轮发布时 zh-CN 冷启动阶段
// 出现过点击未生效、三张截图全停在默认 Layout 的事故（用户 2026-10-16 反馈「一模一样」，
// md5 三图同哈希）。names 传中英文候选（dom-i18n 会把部分标签翻成中文：
// Shading→着色、Geometry Nodes→几何节点，单猜英文会在中文界面失配）。
async function switchWorkspace(page, names) {
  await page.waitForSelector('button.ws-tab', { timeout: 15000 });
  for (let attempt = 1; attempt <= 3; attempt++) {
    const hit = await page.evaluate((ns) => {
      const btn = [...document.querySelectorAll('button.ws-tab')].find((b) => {
        const txt = (b.textContent || '').trim().toLowerCase();
        return ns.some((n) => txt.includes(n));
      });
      if (!btn) return null;
      btn.click();
      return (btn.textContent || '').trim();
    }, names);
    if (!hit) return `ws-tab "${names.join('|')}" NOT FOUND`;
    const on = await page
      .waitForFunction(
        (name) => {
          const btn = [...document.querySelectorAll('button.ws-tab')].find((b) => (b.textContent || '').trim() === name);
          return btn?.getAttribute('aria-selected') === 'true';
        },
        hit,
        { timeout: 5000 },
      )
      .then(() => true)
      .catch(() => false);
    if (on) {
      await page.waitForTimeout(2600); // 视口/编辑器重建 + WebGL 软渲染首帧
      return `ws=${hit}${attempt > 1 ? ` (retry ${attempt})` : ''}`;
    }
  }
  return `ws-switch "${names.join('|')}" NOT EFFECTIVE`;
}

// presentation：欢迎屏（#/home）点第 n 张模板卡（0=blank, 1=The big idea, 2=The pitch），
// newDeck 后进编辑器（.slide-canvas 出现）。
async function pickTemplateCard(page, n) {
  await page.waitForSelector('.template-card', { timeout: 15000 });
  const name = await page.evaluate((i) => {
    const cards = document.querySelectorAll('.template-card');
    if (!cards[i]) return null;
    cards[i].click();
    return cards[i].querySelector('.template-name')?.textContent?.trim() ?? `#${i}`;
  }, n);
  await page.waitForSelector('.slide-canvas', { timeout: 15000 });
  await page.waitForTimeout(1800);
  const slides = await page.evaluate(() => document.querySelectorAll('.slide-item').length);
  return `template=${name} slides=${slides}`;
}

// 通用：确认当前打开的对话框。⚠️ 必须点 `.dialog-foot button.btn.primary`（主按钮，
// locale 无关），不能按文本找 'OK'——zh-CN 语言包把 OK 翻成「确定」（i18n.common.zh-CN.js），
// 按文本匹配在中文界面必然失配，对话框留在原地，截图就成了「只看见新建弹窗」。
async function confirmDialog(page, waitFor) {
  await page.waitForSelector('.dialog-foot button.btn.primary', { timeout: 10000 });
  await page.click('.dialog-foot button.btn.primary');
  if (waitFor) await page.waitForSelector(waitFor, { timeout: 20000 });
}

// audio：空态按钮无稳定属性（纯文本且随语言变），但顺序固定：
// Open(0) / New Audio File(1) / New Multitrack Session(2) / Record(3) —— 用索引点。
// New Multitrack Session → 对话框选 Podcast 模板 → OK，得 6 轨多轨编辑器（.mt-headers）。
// 模板下拉的 aria-label 也随语言变（Template/模板），改用「含 podcast 选项的 select」定位。
async function newPodcastSession(page) {
  await page.waitForSelector('.editor-empty-actions button', { timeout: 15000 });
  await page.evaluate(() => {
    document.querySelectorAll('.editor-empty-actions button')[2]?.click(); // New Multitrack Session
  });
  await page.waitForFunction(
    () => [...document.querySelectorAll('select')].some((s) => [...s.options].some((o) => o.value === 'podcast')),
    { timeout: 8000 },
  );
  await page.evaluate(() => {
    const sel = [...document.querySelectorAll('select')].find((s) => [...s.options].some((o) => o.value === 'podcast'));
    if (sel) {
      sel.value = 'podcast';
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await confirmDialog(page, '.mt-headers');
  await page.waitForTimeout(1800);
  const tracks = await page.evaluate(() => document.querySelectorAll('.mt-headers [role="group"], .mt-headers .mt-track').length);
  return `tracks≈${tracks}`;
}

// audio：波形编辑器场景。直接从空态跑 Generate Tones（Effects > Generate > Tones）——
// 无打开文件时它会自建新文件并插入 5s 默认音调，得到**有真实波形**的编辑器，
// 比空文件（一条平线）有说服力得多。app 全局在 overlay main.js 暴露为 window.audioStudio。
// 若生成流程失败（对话框没出现等），退回普通「新建音频文件」空编辑器，保证场景可用。
async function generateToneFile(page) {
  await page.waitForSelector('.editor-empty-actions button', { timeout: 15000 });
  try {
    // ⚠️ 必须 fire-and-forget：commands.run 返回的 Promise 要等生成完成（对话框关闭）
    // 才 resolve，await 它会和「等对话框出现 → 点 Generate」形成死锁（首轮就卡在这）。
    await page.evaluate(() => { void window.audioStudio?.commands?.run('gen.tones'); });
    await page.waitForSelector('.dialog-foot button.btn.primary', { timeout: 8000 });
    await confirmDialog(page, '.wf-lanes');
    await page.waitForTimeout(1500);
    const peaks = await page.evaluate(() => {
      const lanes = document.querySelectorAll('.wf-lanes canvas, .wf-lanes svg').length;
      return lanes;
    });
    return `gen.tones ok lanes=${peaks}`;
  } catch (e) {
    // 兜底：Escape 关掉可能残留的对话框，再走 New Audio File（索引 1）
    await page.keyboard.press('Escape').catch(() => {});
    await page.evaluate(() => {
      document.querySelectorAll('.editor-empty-actions button')[1]?.click(); // New Audio File
    });
    await confirmDialog(page, '.wf-lanes');
    await page.waitForTimeout(1500);
    return `fallback newfile (${String(e).split('\n')[0]})`;
  }
}

// video：点首页第一张模板卡 → "Use template" 确认 → 等时间线出现 clip
// （模板本地生成：背景 canvas 绘制 + 音效合成，全不依赖宿主）。
async function openFirstTemplate(page) {
  await page.waitForSelector('button.tpl-card', { timeout: 15000 });
  const name = await page.evaluate(() => {
    const card = document.querySelector('button.tpl-card');
    if (!card) return null;
    card.click();
    return card.querySelector('.tpl-name')?.textContent?.trim() ?? 'first';
  });
  await page.waitForSelector('.tpl-dialog-wrap button.btn.primary', { timeout: 10000 });
  await page.click('.tpl-dialog-wrap button.btn.primary');
  await page.waitForSelector('div.editor .tl-clip', { timeout: 25000 });
  await page.waitForTimeout(2200); // 播放器首帧 + 时间线 clip 渲染
  const clips = await page.evaluate(() => document.querySelectorAll('.tl-clip').length);
  return `template=${name} clips=${clips}`;
}

// video：打开模板（时间线已有内容）→ 加一段文本（actions.addText 会自建文本轨并选中
// 该文本 clip），得到「文本轨被选中」的真实编辑画面——时间线文本轨上的文本 clip 高亮、
// 右侧弹出文本检查器（字体/字号/对齐/描边等）。比空工程更贴近真实使用。
// app 在 dev 模式暴露 window.vs.ctx（main.js:250），actions.addText 是稳定入口。
async function openTemplateWithText(page) {
  const r1 = await openFirstTemplate(page); // 开模板，时间线出现 clip
  await page.waitForTimeout(700);
  const added = await page.evaluate(() => {
    try { window.vs?.ctx?.actions?.addText('plain'); return true; } catch { return false; }
  });
  if (!added) return `${r1} | addText NOT available`;
  await page.waitForSelector('.tl-clip.type-text.selected', { timeout: 12000 });
  await page.waitForTimeout(1600); // 文本检查器展开 + 播放器首帧
  const ok = await page.evaluate(() => !!document.querySelector('.tl-clip.type-text.selected'));
  return `${r1} | textSelected=${ok}`;
}

// video：打开模板（时间线已有内容）→ 把播放头定位到工程总时长的 2/3 处。
// 用 dev 模式暴露的 window.vs.ctx.store：seek(t) 立即移动播放头（emit 'time'），
// duration 是工程总时长；2/3 处播放器显示对应帧、时间线标尺 + 播放头也落在 2/3，
// 直观体现「定位到 2/3 播放处」。比空工程更真实——时间线多轨内容齐全。
async function openTemplateSeek2_3(page) {
  const r1 = await openFirstTemplate(page); // 开模板，时间线出现 clip
  await page.waitForTimeout(700);
  const res = await page.evaluate(() => {
    try {
      const s = window.vs?.ctx?.store;
      if (!s) return { ok: false, reason: 'store unavailable' };
      const d = s.duration;
      if (!d || d <= 0) return { ok: false, reason: 'duration=0' };
      const t = Math.round(d * 2 / 3);
      s.seek(t);
      return { ok: true, dur: d, t };
    } catch (e) {
      return { ok: false, reason: String(e) };
    }
  });
  if (!res.ok) return `${r1} | seek NOT applied (${res.reason})`;
  await page.waitForTimeout(1600); // 播放头移动 + 播放器对应帧渲染（可能带过渡）
  return `${r1} | seek=${res.t}/${res.dur}`;
}

// 通用：点一个选择器，等目标选择器出现。
async function clickAndWait(page, selector, waitFor) {
  await page.waitForSelector(selector, { timeout: 15000 });
  await page.click(selector);
  await page.waitForSelector(waitFor, { timeout: 20000 });
  await page.waitForTimeout(1800);
  return `clicked ${selector}`;
}

// 合成一张 1600×1000 的「示例照片」给 ps 打开（SVG → PNG，一次生成全程复用）。
// 内容：黄昏天空渐变 + 落日 + 云层 + 双层山峦 + 湖面倒影，颜色层次丰富，
// 修图界面的图层/直方图/滤镜才有得看。
async function ensureSamplePhoto() {
  fs.mkdirSync(ASSETS, { recursive: true });
  const out = path.join(ASSETS, 'sample-photo.png');
  if (fs.existsSync(out)) return out;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1a1446"/><stop offset=".38" stop-color="#7b2d6b"/>
      <stop offset=".62" stop-color="#e06a4c"/><stop offset=".82" stop-color="#f7b267"/>
    </linearGradient>
    <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e8935f"/><stop offset=".35" stop-color="#9c5a78"/>
      <stop offset="1" stop-color="#241a4e"/>
    </linearGradient>
    <linearGradient id="m1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4a2a63"/><stop offset="1" stop-color="#2a1740"/>
    </linearGradient>
    <radialGradient id="sun" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#fff6d8"/><stop offset=".55" stop-color="#ffd166"/>
      <stop offset="1" stop-color="#ff9f43"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="620" fill="url(#sky)"/>
  <circle cx="1080" cy="470" r="120" fill="url(#sun)"/>
  <circle cx="1080" cy="470" r="190" fill="#ffd166" opacity=".18"/>
  <ellipse cx="360" cy="200" rx="240" ry="42" fill="#f7b267" opacity=".5"/>
  <ellipse cx="520" cy="270" rx="190" ry="30" fill="#e06a4c" opacity=".45"/>
  <ellipse cx="1280" cy="150" rx="210" ry="34" fill="#f7b267" opacity=".38"/>
  <path d="M0 620 L0 470 Q180 380 340 455 T640 420 Q780 350 920 440 T1240 400 Q1420 440 1600 390 L1600 620 Z" fill="url(#m1)" opacity=".92"/>
  <path d="M0 620 L0 540 Q260 480 470 545 T900 520 Q1150 470 1360 540 T1600 515 L1600 620 Z" fill="#1d1132" opacity=".95"/>
  <rect y="620" width="1600" height="380" fill="url(#lake)"/>
  <ellipse cx="1080" cy="660" rx="110" ry="26" fill="#ffd166" opacity=".55"/>
  <ellipse cx="1080" cy="720" rx="70" ry="14" fill="#ffd166" opacity=".3"/>
  <path d="M0 700 Q400 680 800 705 T1600 690" stroke="#f7b267" stroke-width="3" fill="none" opacity=".35"/>
  <path d="M0 790 Q500 765 1000 795 T1600 775" stroke="#e8935f" stroke-width="2.5" fill="none" opacity=".3"/>
  <path d="M0 880 Q600 855 1200 885 T1600 865" stroke="#9c5a78" stroke-width="2" fill="none" opacity=".28"/>
  <g fill="#241a4e" opacity=".9">
    <path d="M120 620 l26 -90 l26 90 Z"/><path d="M210 620 l20 -70 l20 70 Z"/>
    <path d="M1420 620 l30 -100 l30 100 Z"/><path d="M1520 620 l18 -64 l18 64 Z"/>
  </g>
</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(out);
  console.log(`  · 合成示例照片 → ${out} (${(fs.statSync(out).size / 1024).toFixed(0)}KB)`);
  return out;
}

// ── mock 宿主文件系统 ─────────────────────────────────────────────────────────
// 浏览器里没有 fs，用 page.exposeFunction 把 tools_webview_* 文件命令代理到
// node 侧：所有路径映射到 FS_ROOT 下（防越界），read/write 走真实文件 IO。
// video 的 otools backend 因此完整可用（建目录 → 写 index.json/projects →
// 读回来打开工程），首页显示「本机文件夹」形态，与桌面宿主一致。
const MIME = {
  '.json': 'application/json', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.webp': 'image/webp', '.mp4': 'video/mp4',
  '.mov': 'video/quicktime', '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
  '.m4a': 'audio/mp4', '.aac': 'audio/aac', '.txt': 'text/plain', '.md': 'text/markdown',
};

function sandboxPath(p) {
  const mapped = path.resolve(path.join(FS_ROOT, String(p || '')));
  if (mapped !== FS_ROOT && !mapped.startsWith(FS_ROOT + path.sep)) {
    throw new Error(`path escapes fs sandbox: ${p}`);
  }
  return mapped;
}

async function bindFsBridge(page) {
  await page.exposeFunction('__otoolsFs', async (op, payload) => {
    const p = payload || {};
    try {
      switch (op) {
        case 'write': {
          const fp = sandboxPath(p.path);
          fs.mkdirSync(path.dirname(fp), { recursive: true });
          fs.writeFileSync(fp, Buffer.from(String(p.dataBase64 || ''), 'base64'));
          return { path: String(p.path) };
        }
        case 'read': {
          const fp = sandboxPath(p.path);
          if (!fs.existsSync(fp) || !fs.statSync(fp).isFile()) return null;
          const st = fs.statSync(fp);
          return {
            path: String(p.path), name: path.basename(fp), size: st.size,
            mime: MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream',
            lastModified: st.mtimeMs, dataBase64: fs.readFileSync(fp).toString('base64'),
          };
        }
        case 'list': {
          const fp = sandboxPath(p.path);
          if (!fs.existsSync(fp) || !fs.statSync(fp).isDirectory()) return [];
          return fs.readdirSync(fp, { withFileTypes: true }).map((e) => {
            const full = path.join(fp, e.name);
            const st = fs.statSync(full);
            return {
              name: e.name, path: path.join(String(p.path), e.name),
              isDir: e.isDirectory(), size: st.size,
              mime: e.isDirectory() ? '' : (MIME[path.extname(e.name).toLowerCase()] || ''),
              modified: st.mtimeMs,
            };
          });
        }
        case 'mkdir': fs.mkdirSync(sandboxPath(p.path), { recursive: true }); return true;
        case 'remove': fs.rmSync(sandboxPath(p.path), { recursive: Boolean(p.recursive), force: true }); return true;
        case 'rename': fs.mkdirSync(path.dirname(sandboxPath(p.to)), { recursive: true }); fs.renameSync(sandboxPath(p.from), sandboxPath(p.to)); return true;
        default: return null;
      }
    } catch (err) {
      console.error(`[fs-bridge] ${op} failed:`, String(err).split('\n')[0]);
      return null;
    }
  });
}

// Tauri mock：让 host.available()=true（插件以为在宿主里）。文件类命令走
// exposeFunction 代理的真实 FS；对话框类（pick_files/pick_folder/pick_save_path）
// 保持空返回——自动化截图不需要真弹窗。
const initFn = () => {
  const handle = async (cmd, args) => {
    switch (cmd) {
      // 文件类：代理到 node 侧真实 FS（bindFsBridge 注入的 window.__otoolsFs）。
      case 'tools_webview_list_dir': return window.__otoolsFs ? window.__otoolsFs('list', args) : [];
      case 'tools_webview_read_file': return window.__otoolsFs ? window.__otoolsFs('read', args) : null;
      case 'tools_webview_write_file': return window.__otoolsFs ? window.__otoolsFs('write', args?.request ?? args) : null;
      case 'tools_webview_create_dir': return window.__otoolsFs ? window.__otoolsFs('mkdir', args) : null;
      case 'tools_webview_remove_entry': return window.__otoolsFs ? window.__otoolsFs('remove', args) : null;
      case 'tools_webview_rename_entry': return window.__otoolsFs ? window.__otoolsFs('rename', args?.request ?? args) : null;
      case 'tools_webview_join_path': return (args && args.parts ? args.parts.join('/') : '');
      // 对话框类：截图不需要真弹窗。
      case 'tools_webview_pick_files': return [];
      case 'tools_webview_pick_folder': return null;
      case 'tools_webview_pick_save_path': return null;
      default: return null;
    }
  };
  window.__TAURI_INTERNALS__ = {
    invoke: (c, a) => handle(c, a),
    transformCallback: (cb) => cb,
    unregisterCallback: () => {},
    convertFileSrc: (v) => v,
  };
  // video 等插件靠 __OToolsEnv.paths 解析工程目录（knownPath → defaultRoot）；
  // 路径指向 FS_ROOT 沙箱（bindFsBridge 已把文件命令映射过去），createDir 真的能建。
  window.__OToolsEnv = {
    appName: 'OTools', username: 'dev',
    paths: { videos: '/tmp/otools-shot-lib/Movies', documents: '/tmp/otools-shot-lib/Documents', home: '/tmp/otools-shot-lib', appData: '/tmp/otools-shot-lib/appData' },
  };
  try { window.__OTOOLS_LOCALE__ = { locale: localStorage.getItem('otools.shot.locale') || 'zh-CN' }; }
  catch { window.__OTOOLS_LOCALE__ = { locale: 'zh-CN' }; }
};

async function toWebp(pngPath, webpPath) {
  await sharp(pngPath).webp({ quality: 84 }).toFile(webpPath);
}

// 按插件机制强制主题（在 UI 稳定后、截图前调用）。
async function forceTheme(page, theme, cfg) {
  const mode = cfg.themeMode || 'key';
  if (mode === 'key') return; // 已在 reload 前种好 themeKey，载入即生效
  if (mode === 'attr') {
    await page.evaluate((t) => {
      const r = document.documentElement;
      try { r.dataset.theme = t; } catch {}
      try { r.setAttribute('data-theme', t); } catch {}
    }, theme);
  } else { // shotgun
    await page.emulateMedia({ colorScheme: theme });
    await page.evaluate((t) => {
      const r = document.documentElement;
      try { r.dataset.theme = t; r.setAttribute('data-theme', t); } catch {}
      try { r.dataset.themeResolved = t; r.setAttribute('data-theme-resolved', t); } catch {}
      r.classList.remove('light', 'dark'); r.classList.add(t);
      if (document.body) { document.body.classList.remove('light', 'dark'); document.body.classList.add(t); }
    }, theme);
  }
  await page.waitForTimeout(800);
}

async function capturePlugin(key, cfg, browser) {
  const url = `http://127.0.0.1:${cfg.port}/`;
  const outDir = path.join(OUT_ROOT, key);
  fs.mkdirSync(outDir, { recursive: true });
  const scenes = cfg.scenes || [{ key: 'main', waitMs: 5200 }];
  const themes = cfg.themes || THEMES;

  // 清理上一次运行残留的场景文件（场景增减后目录里不留孤儿）。
  const sceneKeys = new Set(scenes.map((s) => s.key));
  for (const f of fs.readdirSync(outDir)) {
    const m = f.match(/^(.+?)-(?:zh-CN|en-US|ja-JP|ko-KR|es-ES|de-DE|ru-RU|fr-FR|ar-SA)?-?(light|dark)\.webp$/);
    if (m && !sceneKeys.has(m[1])) {
      fs.unlinkSync(path.join(outDir, f));
      console.log(`  · 清理过期截图 ${f}`);
    }
  }

  console.log(`\n########## ${key}  (port ${cfg.port}, themeKey=${cfg.themeKey ?? 'prefers-color-scheme'}, themes=${themes.join('/')}, scenes=${scenes.map((s) => s.key).join('/')}) ##########`);
  const dev = startDev(cfg.dir, cfg.port);
  try {
    const up = await waitPort(cfg.port);
    if (!up) { console.error(`  ✗ dev server 未在 ${cfg.port} 起来，日志：/tmp/puter-dev-${cfg.port}.log`); return; }
    console.log(`  dev ready on ${cfg.port}`);

    for (const theme of themes) {
      const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: SCALE, colorScheme: theme });
      const page = await context.newPage();
      await bindFsBridge(page);
      await page.addInitScript(initFn);

      for (const scene of scenes) {
        for (const lang of LANGS) {
          // 每次迭代都从干净状态开始：goto 场景 URL（含 hash）→ 种 localStorage → reload
          // 让 locale/themeKey 生效。hash 场景（模板/示例）每次重新进入，动作可重放。
          await page.goto(`${url}${scene.hash || ''}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
          await page.evaluate(({ loc, themeKey, theme }) => {
            try {
              localStorage.setItem('otools.shot.locale', loc);
              if (themeKey) localStorage.setItem(themeKey, theme);
            } catch {}
          }, { loc: lang, themeKey: cfg.themeKey, theme });

          await page.reload({ waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(scene.waitMs || 5200);
          let actionNote = '';
          if (scene.actions) {
            try { actionNote = (await scene.actions(page)) || ''; }
            catch (e) { actionNote = `ERROR ${String(e).split('\n')[0]}`; }
          }
          await page.waitForTimeout(scene.extraMs ?? 1400);
          await forceTheme(page, theme, cfg);

          const warmPng = `/tmp/puter-${key}-${scene.key}-${lang}-${theme}-warm.png`;
          const finalPng = `/tmp/puter-${key}-${scene.key}-${lang}-${theme}.png`;
          await page.screenshot({ path: warmPng, type: 'png' });
          await page.waitForTimeout(700);
          await page.screenshot({ path: finalPng, type: 'png' });

          const langWebp = path.join(outDir, `${scene.key}-${lang}-${theme}.webp`);
          await toWebp(finalPng, langWebp);
          // neutral 副本 = en-US
          if (lang === 'en-US') {
            await toWebp(finalPng, path.join(outDir, `${scene.key}-${theme}.webp`));
          }
          const info = await page.evaluate(() => ({ lang: document.documentElement.getAttribute('lang'), len: (document.body.innerText || '').length }));
          const sz = fs.statSync(langWebp).size;
          console.log(`    ${scene.key} ${lang}/${theme}: lang=${info.lang} bodyLen=${info.len} ${actionNote}→ ${path.basename(langWebp)} (${(sz / 1024).toFixed(0)}KB)`);
        }
      }
      await context.close();
    }
  } finally {
    if (process.env.SHOT_KEEP) console.log(`  (SHOT_KEEP) 保留 dev server pid=${dev.pid}`);
    else stopDev(dev);
  }
}

async function main() {
  // 文件沙箱每次重建：video 的工程库（index.json / projects / covers / media）
  // 落在里面，旧的工程列表会污染「Recent projects」区。
  fs.rmSync(FS_ROOT, { recursive: true, force: true });
  fs.mkdirSync(FS_ROOT, { recursive: true });

  const keys = ONLY ? [ONLY] : Object.keys(PLUGINS).filter((k) => k !== 'scenes');
  // 软件 WebGL：3d 插件的视口依赖 WebGL2，无头 Chrome 默认拿不到 GL 上下文，
  // 整个视口会是黑的。SwiftShader 让 CPU 软件渲染兜底。
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  try {
    for (const key of keys) {
      const cfg = PLUGINS[key];
      if (!cfg) { console.error(`未知插件：${key}`); continue; }
      await capturePlugin(key, cfg, browser);
    }
  } finally {
    await browser.close();
  }
  console.log('\nALL DONE');
}

main();
