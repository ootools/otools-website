#!/usr/bin/env node
/**
 * SEO 审计：遍历 dist 里所有 HTML，检查每页的 head 完整性。
 * 用法：node scripts/audit-seo.mjs [distDir]
 */
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve(process.argv[2] ?? '.vitepress/dist');
const ORIGIN = 'https://ootools.lingyun.net';

const walk = (dir, acc = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (e.name.endsWith('.html')) acc.push(full);
  }
  return acc;
};

const issues = [];
const stats = { pages: 0, withKeywords: 0, withCanonical: 0, withOg: 0, withLd: 0, descTooLong: 0, descTooShort: 0 };

for (const file of walk(dist)) {
  const rel = path.relative(dist, file).split(path.sep).join('/');
  if (rel === '404.html') continue;
  const html = fs.readFileSync(file, 'utf8');
  const head = html.slice(0, html.indexOf('</head>'));
  const g = (re) => head.match(re)?.[1];
  const url = `${ORIGIN}/${rel.replace(/index\.html$/, '').replace(/\.html$/, '')}`;

  stats.pages++;
  const title = g(/<title>([^<]*)<\/title>/);
  const desc = g(/<meta name="description" content="([^"]*)"/);
  const kw = g(/<meta name="keywords" content="([^"]*)"/);
  const canon = g(/<link rel="canonical" href="([^"]*)"/);
  const og = g(/<meta property="og:image" content="([^"]*)"/);
  const ldCount = (head.match(/application\/ld\+json/g) ?? []).length;

  const bad = (m) => issues.push(`${rel}  ${m}`);
  if (!title) bad('缺 title');
  if (!desc) bad('缺 description');
  else if (desc.length > 200) { stats.descTooLong++; bad(`description ${desc.length} 字符`); }
  else if (desc.length < 20) { stats.descTooShort++; bad(`description 仅 ${desc.length} 字符`); }
  if (kw) stats.withKeywords++; else bad('缺 keywords');
  if (canon) {
    stats.withCanonical++;
    // canonical 必须与本页真实路径一致，且不能出现重复语言前缀
    if (canon !== url) bad(`canonical 不匹配：${canon} ≠ ${url}`);
    if (/\/(en|ja|ko|fr|es|de|ru)\/\1\//.test(canon)) bad(`canonical 语言前缀重复：${canon}`);
  } else bad('缺 canonical');
  if (og) stats.withOg++; else bad('缺 og:image');
  if (ldCount) stats.withLd++; else bad('缺 JSON-LD');
}

console.log(`页面总数        ${stats.pages}`);
console.log(`有 keywords     ${stats.withKeywords} / ${stats.pages}`);
console.log(`有 canonical    ${stats.withCanonical} / ${stats.pages}`);
console.log(`有 og:image     ${stats.withOg} / ${stats.pages}`);
console.log(`有 JSON-LD${' '.repeat(3)}${stats.withLd} / ${stats.pages}`);
console.log(`\n问题 ${issues.length} 条`);
for (const i of issues.slice(0, 60)) console.log('  ' + i);
if (issues.length > 60) console.log(`  …还有 ${issues.length - 60} 条`);
