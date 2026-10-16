#!/usr/bin/env node
/**
 * craft 系列插件落地页截图工具。
 * ------------------------------------------------------------------
 * 与 puter 系列（`scripts/puter-shots/capture.mjs`）的关键差异：
 *   - craft 是 **Rust→WASM**（trunk 构建），没有 vite dev server。流程是
 *     `node scripts/build-wasm.mjs` 产出 dist/，再用 `scripts/serve-dist.mjs`
 *     起静态服务，本脚本只负责起服务 + 截图。
 *   - UI 是 **egui canvas**（不是 DOM）：无法用选择器点菜单，场景只能靠
 *     URL 查询参数（?sample 示例工程 / ?theme=dark|light）与浏览器 locale 驱动。
 *     所以每个场景 = 一组 query，而不是一串 DOM 动作。
 *   - UI 语言走 `navigator.languages`（main.rs 里 app.system_languages），
 *     由 Playwright context 的 locale 决定 → 中/英双语是真实渲染出来的。
 *   - debug 版 wasm 动辄上百 MB，首帧很慢，等待时间给得比 puter 宽得多。
 *
 * 产物（与 PluginLanding.vue 对齐）：
 *   public/plugins/<key>/<scene>-<lang>-<theme>.webp   （lang ∈ zh-CN / en-US）
 *   public/plugins/<key>/<scene>-<theme>.webp          （neutral 副本 = en-US）
 *
 * 用法：
 *   node scripts/craft-shots/capture.mjs --only otools-cadcraft
 *   SHOT_KEEP=1 node scripts/craft-shots/capture.mjs   # 跑完不杀 server（调试）
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

const VIEWPORT = { width: 1440, height: 900 };
const SCALE = 2;
const LANGS = ['zh-CN', 'en-US'];
const THEMES = ['dark']; // craft 是创作/设计类工具，与 puter 的创作类一致只拍暗色

/**
 * 每个插件的场景 = URL query 组合（canvas 应用无法用 DOM 交互造场景）。
 * waitMs 要比 puter 大：debug wasm 上百 MB，首帧可能要十几秒。
 * loadingId：各插件的加载遮罩 id（用于判断首帧就绪）。
 */
const PLUGINS = {
  'otools-cadcraft': {
    dir: `${REPO}/otools-cadcraft`,
    port: 6482,
    loadingId: 'cadcraft_loading',
    // 上游 UI 是纯英文（无 i18n），locale 不影响画面 → 只截一次复制三份
    langAgnostic: true,
    scenes: [
      { key: 'sample', query: '?sample&theme=dark', waitMs: 22000 },
      { key: 'blank', query: '?theme=dark', waitMs: 18000 },
    ],
  },
  'otools-pdfcraft': {
    dir: `${REPO}/otools-pdfcraft`,
    port: 6483,
    loadingId: 'pdfcraft_loading',
    langAgnostic: true,
    // 浏览器里宿主桥不可用，主题停在默认 Light：预置上游的持久化偏好强制暗色
    // （eframe web 的 storage 就是 localStorage，key 是 app 自己的 "pdfcraft"）。
    seed: { pdfcraft: '{"theme":"Dark"}' },
    // view 场景：egui 消费 raw.dropped_files → 合成 drop 注入示例 PDF 打开阅读态
    scenes: [
      { key: 'open', query: '', waitMs: 20000 },
      { key: 'view', query: '', waitMs: 20000, dropWaitMs: 10000,
        drop: [{ file: '/tmp/craft-assets/sample-report.pdf', name: 'Quarterly Report.pdf', type: 'application/pdf' }] },
    ],
  },
  'otools-designcraft': {
    dir: `${REPO}/otools-designcraft`,
    port: 6484,
    loadingId: 'designcraft_loading',
    langAgnostic: true,
    // ?sample 标志（值忽略）打开示例文档
    scenes: [
      { key: 'sample', query: '?sample', waitMs: 20000 },
      { key: 'blank', query: '', waitMs: 16000 },
    ],
  },
  'otools-vectorcraft': {
    dir: `${REPO}/otools-vectorcraft`,
    port: 6485,
    loadingId: 'vectorcraft_loading',
    langAgnostic: true,
    // 默认 MediumDark（Illustrator 式四档亮度），无 ?theme。blank=空画布；
    // artwork=合成 drop 注入示例 SVG（wasm shell 把 drop 字节交给 Inbox → 开成文档）。
    scenes: [
      { key: 'blank', query: '', waitMs: 20000 },
      { key: 'artwork', query: '', waitMs: 20000, dropWaitMs: 10000,
        drop: [{ file: '/tmp/craft-assets/sample-artwork.svg', name: 'Sunrise Poster.svg', type: 'image/svg+xml' }] },
    ],
  },
  'otools-filmcraft': {
    dir: `${REPO}/otools-filmcraft`,
    port: 6486,
    loadingId: 'filmcraft_loading',
    langAgnostic: true,
    // 默认自动加载 demo 工程；`?empty` 是 shell 支持的开关：不加载，出空白工程
    scenes: [
      { key: 'demo', query: '', waitMs: 24000 },
      { key: 'blank', query: '?empty', waitMs: 20000 },
    ],
  },
  'otools-effectcraft': {
    dir: `${REPO}/otools-effectcraft`,
    port: 6487,
    loadingId: 'effectcraft_loading',
    langAgnostic: true,
    // 注意：shell 的 index.html 会把不带 noworkers 的 query 重写成 '?noworkers'
    //（worker 与 trunk hash 产物文件名不兼容的规避），其它 flag 必须与 noworkers 同给。
    // 默认自动加载 demo 合成；`?home` 出 Welcome 起始页（`?empty` 空工程顶部会挂着
    // Composition 菜单，画面不干净，弃用）。
    scenes: [
      { key: 'demo', query: '', waitMs: 24000 },
      { key: 'home', query: '?noworkers&home', waitMs: 22000 },
    ],
  },
  'otools-lightcraft': {
    dir: `${REPO}/otools-lightcraft`,
    port: 6488,
    loadingId: 'lightcraft_loading',
    // 注意：lightcraft 有真 i18n（跟随 navigator.language，14 种语言），
    // 中英画面不同 → 不能像其它 craft 一样复制，zh-CN 必须真截。
    // 前提：dist/fonts/ 里要有中文字体（scripts/fetch-fonts.mjs），否则中文是豆腐块。
    langAgnostic: false,
    // demo=内置示例图库；library=合成 drop 注入三张示例照片（web.rs 的
    // import_dropped 消费 raw.dropped_files → 存 OPFS 并导入图库）
    scenes: [
      { key: 'demo', query: '', waitMs: 24000 },
      { key: 'library', query: '', waitMs: 22000, dropWaitMs: 15000,
        drop: [
          { file: '/tmp/craft-assets/photo-01.jpg', name: 'Sunset Ridge.jpg', type: 'image/jpeg' },
          { file: '/tmp/craft-assets/photo-02.jpg', name: 'City Lights.jpg', type: 'image/jpeg' },
          { file: '/tmp/craft-assets/photo-03.jpg', name: 'Coastline.jpg', type: 'image/jpeg' },
        ] },
    ],
  },
};

const argv = process.argv.slice(2);
const onlyIdx = argv.indexOf('--only');
const ONLY = onlyIdx >= 0 ? argv[onlyIdx + 1] : null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitPort(port, timeoutMs = 60000) {
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

/** 起 serve-dist.mjs（静态服务 dist/），返回子进程。 */
function startServe(pluginDir, port) {
  const log = fs.openSync(`/tmp/craft-serve-${port}.log`, 'w');
  const child = spawn(NODE, ['scripts/serve-dist.mjs', String(port)], {
    cwd: pluginDir,
    stdio: ['ignore', log, log],
    detached: false,
  });
  return child;
}

async function toWebp(png, out) {
  await sharp(png).webp({ quality: 84 }).toFile(out);
}

/** 等首帧：canvas 出现 + 加载遮罩消失（遮罩有的插件不移除，兜底靠 waitMs）。 */
async function waitReady(page, cfg, waitMs) {
  try {
    await page.waitForSelector('canvas', { timeout: 60000 });
  } catch {
    return 'no-canvas';
  }
  if (cfg.loadingId) {
    try {
      await page.waitForFunction(
        (id) => {
          const el = document.getElementById(id);
          return !el || el.style.display === 'none' || el.hidden;
        },
        cfg.loadingId,
        { timeout: 60000 },
      );
    } catch { /* 遮罩不消失就靠 waitMs 兜底 */ }
  }
  await page.waitForTimeout(waitMs);
  return 'ok';
}

/**
 * 合成 drop 事件注入文件（egui 的 raw.dropped_files 链路）。
 * craft 系 UI 全画在 canvas 里，rfd 的 <input type=file> 点不中，
 * 但 egui 消费 window/canvas 上的真实 drop 事件 → 构造 DataTransfer 直接派发即可。
 * headless Chrome 支持构造 DragEvent + DataTransfer（File 对象为真字节）。
 */
async function injectDrop(page, files) {
  const payload = files.map((f) => ({
    name: f.name,
    type: f.type || 'application/octet-stream',
    b64: fs.readFileSync(f.file).toString('base64'),
  }));
  return page.evaluate(async (payload) => {
    const dt = new DataTransfer();
    for (const f of payload) {
      const bin = atob(f.b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      dt.items.add(new File([bytes], f.name, { type: f.type }));
    }
    const canvas = document.querySelector('canvas');
    const targets = [...(canvas ? [canvas] : []), document, window];
    for (const t of targets) {
      t.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
    }
    return targets.length;
  }, payload);
}

async function capturePlugin(key, cfg, browser) {
  const outDir = path.join(OUT_ROOT, key);
  fs.mkdirSync(outDir, { recursive: true });
  const base = `http://127.0.0.1:${cfg.port}/`;

  // 清理上一次运行残留的场景文件（场景增减后目录里不留孤儿）
  const sceneKeys = new Set(cfg.scenes.map((s) => s.key));
  for (const f of fs.readdirSync(outDir)) {
    const m = f.match(/^(.+?)-(?:zh-CN|en-US)?-?(light|dark)\.webp$/);
    if (m && !sceneKeys.has(m[1])) {
      fs.unlinkSync(path.join(outDir, f));
      console.log(`  · 清理过期截图 ${f}`);
    }
  }

  console.log(`\n########## ${key}  (port ${cfg.port}, scenes=${cfg.scenes.map((s) => s.key).join('/')}) ##########`);
  const serve = startServe(cfg.dir, cfg.port);
  try {
    const up = await waitPort(cfg.port);
    if (!up) {
      console.error(`  ✗ 服务未在 ${cfg.port} 起来，日志：/tmp/craft-serve-${cfg.port}.log`);
      return;
    }
    console.log(`  serve ready on ${cfg.port}`);

    for (const theme of THEMES) {
      for (const lang of LANGS) {
        const ctx = await browser.newContext({
          viewport: VIEWPORT,
          deviceScaleFactor: SCALE,
          locale: lang,
          colorScheme: theme,
        });
        // eframe web 的 app storage 就是裸 localStorage（key 为各 app 自己的键）。
        // 浏览器里宿主桥不可用的插件（如 pdfcraft 不跟随 ?theme），用预置偏好补齐
        // 主题等设置，与全站暗色截图风格一致。
        if (cfg.seed) {
          await ctx.addInitScript((seed) => {
            for (const [k, v] of Object.entries(seed)) {
              try { localStorage.setItem(k, v); } catch { /* 忽略 */ }
            }
          }, cfg.seed);
        }
        // lightcraft 的语言回退链是 documentElement.lang → navigator.language，
        // 而 shell 的 index.html 写死 <html lang="zh-CN">，且 init script 时机太早
        // （documentElement 尚未解析，写入会被吞掉）。改为加载后设置并派发宿主的
        // otools-locale-changed 事件：shell 的监听器下一帧把新 locale 写进 ui.language。
        await ctx.addInitScript((lang) => {
          const apply = () => {
            document.documentElement.lang = lang;
            window.dispatchEvent(new Event('otools-locale-changed'));
          };
          if (document.documentElement) apply();
          else document.addEventListener('DOMContentLoaded', apply, { once: true });
        }, lang);
        const page = await ctx.newPage();
      for (const scene of cfg.scenes) {
        if (cfg.langAgnostic && lang !== 'zh-CN') {
          // UI 不随 locale 变：直接复制 zh-CN 的产物，省一次 wasm 加载
          const src = path.join(outDir, `${scene.key}-zh-CN-${theme}.webp`);
          if (fs.existsSync(src)) {
            await fs.promises.copyFile(src, path.join(outDir, `${scene.key}-${lang}-${theme}.webp`));
            await fs.promises.copyFile(src, path.join(outDir, `${scene.key}-${theme}.webp`));
            console.log(`    ${scene.key} ${lang}/${theme}: (copied from zh-CN)`);
            continue;
          }
        }
        await page.goto(`${base}${scene.query || ''}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
          let state = await waitReady(page, cfg, scene.waitMs ?? 18000);
          if (scene.drop?.length) {
            const n = await injectDrop(page, scene.drop);
            console.log(`    · drop 注入 ${scene.drop.length} 个文件 → ${n} 个目标`);
            await page.waitForTimeout(scene.dropWaitMs ?? 9000);
            state = `${state}+drop`;
          }
          const finalPng = `/tmp/craft-${key}-${scene.key}-${lang}-${theme}.png`;
          await page.screenshot({ path: finalPng, type: 'png' });
          const out = path.join(outDir, `${scene.key}-${lang}-${theme}.webp`);
          await toWebp(finalPng, out);
          if (lang === 'en-US') {
            await toWebp(finalPng, path.join(outDir, `${scene.key}-${theme}.webp`));
          }
          const size = fs.statSync(out).size;
          console.log(`    ${scene.key} ${lang}/${theme}: ${state} → ${path.basename(out)} (${(size / 1024).toFixed(0)}KB)`);
        }
        await ctx.close();
      }
    }
  } finally {
    if (process.env.SHOT_KEEP) console.log(`  (SHOT_KEEP) 保留 server pid=${serve.pid}`);
    else { try { serve.kill(); } catch {} }
  }
}

async function main() {
  const keys = ONLY ? [ONLY] : Object.keys(PLUGINS);
  // 软件 WebGL：egui 走 wgpu/WebGL，无头 Chrome 默认拿不到 GL 上下文会全黑，
  // SwiftShader 用 CPU 软渲染兜底。
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
