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

// 语言：puter 插件只自带 zh-CN 词条 + en-US（源码即英文）。其余站点语种在组件里回退 neutral。
const LANGS = ['zh-CN', 'en-US'];
const THEMES = ['light', 'dark'];
const VIEWPORT = { width: 1440, height: 900 };
const SCALE = 2;

// themeKey = 上游主题 storage key（app.js）。themeMode 决定怎么切主题：
//   'key'     —— 种 themeKey 再 reload（documents/spreadsheet/presentation，已验证）
//   'attr'    —— 载入后设 documentElement.dataset.theme（ps：dark/medium/light/system）
//   'shotgun' —— emulateMedia + data-theme + class 全上（3d/audio，机制不确定时兜底）
const PLUGINS = {
  'otools-puter-ps': { dir: `${REPO}/otools-puter-ps`, port: 5518, themeKey: 'photo-theme', themeMode: 'attr' },
  'otools-puter-3d': { dir: `${REPO}/otools-puter-3d`, port: 5519, themeKey: 'p3d.theme', themeMode: 'shotgun' },
  'otools-puter-documents': { dir: `${REPO}/otools-puter-documents`, port: 5520, themeKey: 'documents:theme', themeMode: 'key' },
  'otools-puter-spreadsheet': { dir: `${REPO}/otools-puter-spreadsheet`, port: 5521, themeKey: 'spreadsheet:theme', themeMode: 'key' },
  'otools-puter-presentation': { dir: `${REPO}/otools-puter-presentation`, port: 5522, themeKey: 'presentation:theme', themeMode: 'key' },
  'otools-puter-audio': { dir: `${REPO}/otools-puter-audio`, port: 5523, themeKey: null, themeMode: 'shotgun' },
  'otools-video': { dir: `${REPO}/otools-video`, port: 5517, themeKey: null, themeMode: 'shotgun' },
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
  const log = fs.openSync(`/tmp/puter-dev-${port}.log`, 'w');
  const child = spawn(NODE, ['scripts/dev.mjs'], { cwd: pluginDir, stdio: ['ignore', log, log], detached: true });
  return child;
}

function stopDev(child) {
  try { process.kill(-child.pid, 'SIGTERM'); } catch { try { child.kill('SIGTERM'); } catch {} }
}

// Tauri mock：让 host.available()=true（插件以为在宿主里），库目录给空、读文件给 null。
const initFn = () => {
  const handle = async (cmd, args) => {
    switch (cmd) {
      case 'tools_webview_list_dir': return [];
      case 'tools_webview_read_file': return null;
      case 'tools_webview_join_path': return (args && args.parts ? args.parts.join('/') : '');
      case 'tools_webview_pick_files': return [];
      case 'tools_webview_pick_folder': return null;
      case 'tools_webview_pick_save_path': return null;
      case 'tools_webview_write_file': return null;
      case 'tools_webview_create_dir': return null;
      case 'tools_webview_remove_entry': return null;
      case 'tools_webview_rename_entry': return null;
      default: return null;
    }
  };
  window.__TAURI_INTERNALS__ = {
    invoke: (c, a) => handle(c, a),
    transformCallback: (cb) => cb,
    unregisterCallback: () => {},
    convertFileSrc: (v) => v,
  };
  // video 等插件靠 __OToolsEnv.paths 解析工程目录（knownPath）；补一份让首页能起来。
  window.__OToolsEnv = {
    appName: 'OTools', username: 'dev',
    paths: { videos: '/Users/dev/Movies', documents: '/Users/dev/Documents', home: '/Users/dev', appData: '/Users/dev/Library/Application Support' },
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

  console.log(`\n########## ${key}  (port ${cfg.port}, themeKey=${cfg.themeKey ?? 'prefers-color-scheme'}) ##########`);
  const dev = startDev(cfg.dir, cfg.port);
  try {
    const up = await waitPort(cfg.port);
    if (!up) { console.error(`  ✗ dev server 未在 ${cfg.port} 起来，日志：/tmp/puter-dev-${cfg.port}.log`); return; }
    console.log(`  dev ready on ${cfg.port}`);

    for (const theme of THEMES) {
      const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: SCALE, colorScheme: theme });
      const page = await context.newPage();
      await page.addInitScript(initFn);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

      for (const scene of scenes) {
        for (const lang of LANGS) {
          await page.evaluate(({ loc, themeKey, theme }) => {
            try {
              localStorage.setItem('otools.shot.locale', loc);
              if (themeKey) localStorage.setItem(themeKey, theme);
            } catch {}
          }, { loc: lang, themeKey: cfg.themeKey, theme });

          await page.reload({ waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(scene.waitMs || 5200);
          if (scene.actions) { try { await scene.actions(page); } catch (e) { console.log('    actions error:', String(e).split('\n')[0]); } }
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
          console.log(`    ${scene.key} ${lang}/${theme}: lang=${info.lang} bodyLen=${info.len} → ${path.basename(langWebp)} (${(sz / 1024).toFixed(0)}KB)`);
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
