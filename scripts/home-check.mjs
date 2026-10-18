#!/usr/bin/env node
/**
 * 首页视觉检查：把预览站首页滚动截成多屏 PNG，用于人工核对。
 * 用法：node scripts/home-check.mjs [url] [outDir]
 */
import fs from 'node:fs';
import path from 'node:path';
import pw from '/Users/admin/.workbuddy/binaries/node/workspace/node_modules/playwright-core/index.js';

const { chromium } = pw;
const URL = process.argv[2] || 'http://localhost:4173/';
const OUT = process.argv[3] || '/tmp/home-check';
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
const failed = [];
page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });

await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(3000);

const total = await page.evaluate(() => document.body.scrollHeight);
const vh = 900;
let idx = 0;
for (let y = 0; y < total; y += vh * 0.92) {
  await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y);
  await page.waitForTimeout(1100);
  await page.screenshot({ path: path.join(OUT, `${String(idx).padStart(2, '0')}.png`) });
  idx += 1;
  if (idx > 22) break;
}

console.log('total height:', total, 'shots:', idx);
console.log('--- console errors ---');
console.log(errors.slice(0, 20).join('\n') || '(none)');
console.log('--- failed requests ---');
console.log([...new Set(failed)].slice(0, 30).join('\n') || '(none)');

await browser.close();
