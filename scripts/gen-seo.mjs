#!/usr/bin/env node
/**
 * 生成 sitemap.xml 与 llms.txt（AI 检索入口）。
 *
 * 为什么用脚本生成而不是手写：站点有 8 种语言 × 几十个页面，
 * 手写必然漏页/漏语言，而这个仓库里**路由完全由 .md 文件的目录结构决定**
 * （根=zh，en/ ja/ … 各一份）。所以直接扫 .md 就能得到权威路由表，
 * 新增页面后重跑一次即可，不会与实际路由脱节。
 *
 * SEO 数据源与 `.vitepress/seo/data.mjs` 共用一份（竞品词、对比优势、FAQ），
 * 避免「head 里的关键词」和「llms.txt 里写的关键词」对不上。
 *
 * 用法：node scripts/gen-seo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCALES, PLUGIN_SEO, faqFor, localePrefixOf } from '../.vitepress/seo/data.mjs';
import { RELEASE_BASE } from '../.vitepress/seo/index.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE_ORIGIN = 'https://ootools.github.io';
const SITE_BASE = '/otools-website';
const outBase = `${SITE_ORIGIN}${SITE_BASE}`;

const hreflangOf = (prefix) => LOCALES.find((l) => l.prefix === prefix)?.hreflang ?? 'zh-CN';

/** 递归收集所有 .md（排除 node_modules / .vitepress / public） */
const walk = (dir, acc = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'public') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith('.md')) acc.push(full);
  }
  return acc;
};

/** .md 路径 -> URL 路径。`route` 必须是**剥掉语言前缀后**的相对路径。 */
const toUrl = (routeRel, prefix) => {
  let route = routeRel.replace(/\.md$/, '');
  route = route.replace(/(^|\/)index$/, '$1');
  route = route.replace(/\/$/, '');
  const prefixSeg = prefix ? `/${prefix}` : '';
  return `${SITE_BASE}${prefixSeg}/${route}`.replace(/\/{2,}/g, '/');
};

const files = walk(repoRoot);

// 以中文（根）为基准建立「页面组」，用于 hreflang 互指
// ⚠️ 归一化只做一件事：剥掉**该文件自己的**语言前缀。
// 别用 `rel.startsWith('en/ ja/ ...')` 这种拼接判断——`de/plugins/x.md`
// 也会命中，害得每组只剩一种语言、hreflang 全填错。
const groups = new Map(); // 归一化 key -> { [prefix]: url }
for (const file of files) {
  const rel = path.relative(repoRoot, file).split(path.sep).join('/');
  const prefix = localePrefixOf(rel);
  const key = prefix ? rel.split('/').slice(1).join('/') : rel;

  if (!groups.has(key)) groups.set(key, {});
  groups.get(key)[prefix] = toUrl(key, prefix);
}

// ── sitemap.xml ────────────────────────────────────────────────
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const urls = [];
for (const [key, byPrefix] of groups) {
  const entries = Object.entries(byPrefix).filter(([, u]) => u);
  // alternate 必须是**绝对地址**，且 hreflang 要用该语言自己的代码
  // （踩过的坑：写成相对路径 + 统一填 zh-CN，德语页会宣称自己是中文页）
  const alternates = entries
    .map(([p, u]) => `    <xhtml:link rel="alternate" hreflang="${hreflangOf(p)}" href="${SITE_ORIGIN}${esc(u)}" />`)
    .join('\n');
  const xDefault = entries.find(([p]) => p === '') ?? entries[0];
  const altWithDefault = `${alternates}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}${esc(xDefault[1])}" />`;

  for (const [p, u] of entries) {
    const isPlugin = /(^|\/)plugins\/otools-[a-z]+\.md$/.test(key);
    const isHome = /(^|\/)index\.md$/.test(key);
    urls.push(
      `  <url>\n    <loc>${SITE_ORIGIN}${esc(u)}</loc>\n${altWithDefault}\n    <changefreq>${isHome ? 'weekly' : 'monthly'}</changefreq>\n    <priority>${isHome ? '1.0' : isPlugin ? '0.9' : p === '' ? '0.8' : '0.6'}</priority>\n  </url>`,
    );
  }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(repoRoot, 'public/sitemap.xml'), sitemap, 'utf8');

// ── llms.txt（llmstxt.org 规范：给 AI 检索的结构化站点说明）──────────────
// 写法要点：AI 检索匹配的是「明确的实体 + 能力清单 + 差异点」，
// 所以每个插件都要写清「是什么 / 能干什么 / 相比同类好在哪 / 下载在哪」，
// 而不是营销形容词。
const readLocale = (p) => {
  const f = path.join(repoRoot, '.vitepress/theme/locales', `${p || 'zh'}.json`);
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return {}; }
};
const regSrc = fs.readFileSync(path.join(repoRoot, '.vitepress/theme/plugins/registry.ts'), 'utf8');
const regInfo = {};
for (const m of regSrc.matchAll(/'(otools-[a-z]+)':\s*\{([\s\S]*?)\n {2}\},/g)) {
  const [, key, body] = m;
  regInfo[key] = {
    name: body.match(/name:\s*'([^']+)'/)?.[1] ?? key,
    releases: body.match(/releases:\s*`([^`]+)`/)?.[1] ?? '',
    firstScene: body.match(/screenshots:\s*\[\s*\{\s*key:\s*'([^']+)'/)?.[1] ?? 'workspace',
  };
}
const zhCopy = readLocale('').pluginLanding ?? {};
// registry.ts 里 releases 写的是模板串 `${RELEASES}/plugin-app-...`，
// 直接当文本读出来会得到字面量 `${RELEASES}` —— 必须自己展开（复用 SEO 模块的定义）。
const resolveReleases = (raw) => raw.replace(/\$\{RELEASES\}/g, RELEASE_BASE);

const pluginLines = [];
for (const [key, seo] of Object.entries(PLUGIN_SEO)) {
  const reg = regInfo[key] ?? { name: seo.name, releases: '', firstScene: 'workspace' };
  const copy = zhCopy[key] ?? {};
  const feats = Array.isArray(copy.features)
    ? copy.features.map((f) => `- 功能：${f.title} —— ${f.desc}`).join('\n')
    : '';
  // 竞品只提一次，后面用「相对同类」承接，避免每条优势都重复一长串产品名
  const rivals = seo.competitors.slice(0, 4).join(' / ');
  const adv = seo.advantages.map((a) => `- 相比同类（${rivals} 等）：${a}`).join('\n');
  const releases = resolveReleases(reg.releases ?? '');
  pluginLines.push(
    [
      `### ${reg.name}（${key}）`,
      copy.tagline ? `> ${copy.tagline}。${copy.sub}` : '',
      `- 落地页：${SITE_BASE}/plugins/${key}/`,
      releases ? `- 独立版下载：${releases}` : '',
      `- 界面预览图：${SITE_BASE}/plugins/${key}/${reg.firstScene}-light.webp（明）/ ${reg.firstScene}-dark.webp（暗）`,
      feats,
      `- 对比对象：${seo.competitors.join('、')}`,
      adv,
    ]
      .filter(Boolean)
      .join('\n'),
  );
}

const faq = faqFor('');

const llms = `# OTools

> OTools 是一个高性能桌面AI 工作流平台，核心是「Tabs 多任务化」：
> 常用桌面工具收进同一个工作台，多个工具并行打开、保持上下文、随时切换。
> 平台与内置插件均可免费下载，支持 Windows 与 macOS。
> 每个工具都有**独立版**，可脱离平台单独下载运行，功能不阉割。

## 站点结构

- 首页：${SITE_BASE}/
- 功能总览：${SITE_BASE}/features
- 插件总览：${SITE_BASE}/plugins/
- 开发文档：${SITE_BASE}/guide/overview
- OTools API：${SITE_BASE}/guide/otools-api

## 插件能力与对比

${pluginLines.join('\n\n')}

## 常见问答

${faq.map((f) => `### ${f.q}\n${f.a}`).join('\n\n')}

## 说明

- 多语言：en/ ja/ ko/ fr/ es/ de/ ru/，每个语言下均有对应的 plugins/ 与 guide/ 页面。
- 截图统一为 WebP，明/暗主题各一张，语言副本命名为 \`<插件>-<场景>-<语言>-<主题>.webp\`。
- 每个页面的 head 内含 JSON-LD（SoftwareApplication / FAQPage / BreadcrumbList），
  结构化数据可直接被检索工具解析。
`;
fs.writeFileSync(path.join(repoRoot, 'public/llms.txt'), llms, 'utf8');

// ── llms-full.txt（把站点所有页面的文案铺平，方便 AI 一次性读完）─────────
// llms.txt 是索引，llms-full.txt 才是正文。很多 AI 爬虫两个都会抓。
const fullSections = [];
for (const [key, byPrefix] of groups) {
  if (!byPrefix['']) continue; // 只以中文为源，翻译版本靠 hreflang 关联
  const file = files.find((f) => {
    const rel = path.relative(repoRoot, f).split(path.sep).join('/');
    return (localePrefixOf(rel) ? rel.split('/').slice(1).join('/') : rel) === key;
  });
  if (!file) continue;
  const md = fs.readFileSync(file, 'utf8');
  const body = md
    .replace(/^---[\s\S]*?---\n/, '')
    // 页面正文由组件渲染，md 里没有实质内容；这种情况只留标题
    .replace(/<PluginLanding[^>]*\/>/g, `_（页面正文由组件渲染；结构化数据见 ${outBase}${byPrefix['']} 的 JSON-LD）_`)
    .replace(/<[^>]+>\/[^\n]*/g, '')
    .trim();
  fullSections.push(`## ${byPrefix['']}\n\n${body || '_（同上，见 JSON-LD）_'}`);
}

fs.writeFileSync(
  path.join(repoRoot, 'public/llms-full.txt'),
  `# OTools 完整文档\n\n> 本文件是 ${SITE_BASE}/llms.txt 的展开版，包含全部页面文本。\n\n${fullSections.join('\n\n')}\n`,
  'utf8',
);

console.log(`sitemap.xml: ${urls.length} 条 URL（${groups.size} 个页面 × 语言）`);
console.log(`llms.txt: ${pluginLines.length} 个插件 + ${faq.length} 条 FAQ`);
console.log(`llms-full.txt: ${fullSections.length} 个页面正文`);
