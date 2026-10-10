/**
 * 构建期 SEO / GEO 注入。
 *
 * ## 为什么必须在构建期做，而不是运行时组件
 *
 * VitePress **1.x 没有 `useHead` API**。它的 head 管理全部走
 * `useUpdateHead(route, siteData)`：
 *
 *   1. `title` ← `createTitle(siteData, pageData)`（pageData.title + " | " + siteTitle）
 *   2. `description` ← `pageData.description || siteData.description`
 *   3. 其余 head 标签 ← `mergeHead(siteData.head, pageData.frontmatter.head)`，
 *      再用 `document.createElement` 逐个 append 到 document.head
 *
 * 也就是说 **head 的唯一合法入口是 `frontmatter.head`**。
 * 之前用 `<component :is="'head'">` 写进模板的 meta 全部无效——
 * Vue 只是渲染了一个普通 `<head>` 标签元素，浏览器不把它当文档头，
 * 于是 keywords / canonical / og / JSON-LD 一条都没进DOM（构建一直是绿的）。
 *
 * 改用 `transformPageData` 后，元信息直接写进静态 HTML，
 * 爬虫与 AI 抓取原始 HTML 就能拿到（运行时注入对 SPA 之后的爬虫不可靠）。
 *
 * 另：`<script type="application/ld+json">` 走frontmatter.head 时，
 * VitePress 会 `setAttribute` 后 `el.innerHTML = innerHTML`，能正确输出 JSON。
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  LOCALES,
  LOCALE_BY_PREFIX,
  PLUGIN_SEO,
  SITE_TERMS,
  VS_FORMAT,
  faqFor,
  localePrefixOf,
} from './data.mjs';

/** 部署在 gh-pages 分支根目录 → https://ootools.github.io/otools-website/ */
export const SITE_ORIGIN = 'https://ootools.github.io';
export const SITE_BASE = '/otools-website';

const PLUGIN_KEYS = Object.keys(PLUGIN_SEO);

/** 相对路径 → 站内 URL 路径（与 gen-seo.mjs 的推导保持一致）。 */
export function routeOf(relativePath, prefix) {
  let rel = String(relativePath);
  // ⚠️ 必须先剥掉**该文件自己的**语言前缀，否则 de/plugins/x.md 会算出 /de/de/plugins/x。
  if (prefix) rel = rel.replace(new RegExp(`^${prefix}/`), '');
  let route = rel.replace(/\.md$/, '');
  route = route.replace(/(^|\/)index$/, '$1');
  const prefixSeg = prefix ? `/${prefix}` : '';
  const joined = `${SITE_BASE}${prefixSeg}/${route}`.replace(/\/{2,}/g, '/');
  // 首页给尾斜杠（`/otools-website/en` 与 `/otools-website/en/` 是同一个页面，
  // 但 canonical 与 sitemap 必须完全一致，否则搜索引擎会当成两个 URL）
  return /\/en$|^\/otools-website$/.test(joined) || /\/[a-z]{2}$/.test(joined) ? `${joined}/` : joined;
}

/**
 * 某语言的站点默认 description。
 * ⚠️ locale 里的字段是 `hero.desc`，没有 `hero.sub` —— 取错键会静默退化成 "OTools"。
 * ⚠️ `readLocales` 用的key 就是 prefix（中文是空串 `''`，不是 `'zh'`），
 *    这里若写成 `locales[prefix || 'zh']` 会取到 undefined。
 */
function siteDescriptionOf(prefix, locales) {
  const loc = locales[prefix];
  const desc = loc?.hero?.desc;
  if (typeof desc === 'string' && desc.trim()) return desc.trim();
  const title = loc?.hero?.title;
  return typeof title === 'string' && title.trim() ? title.trim() : 'OTools';
}

/** 站点标题（hero.title 已经是「前缀 + 平台名 + 后缀」拼好的完整串）。 */
function siteTitleOf(prefix, locales) {
  const loc = locales[prefix];
  const t = loc?.hero?.title;
  return typeof t === 'string' && t.trim() ? t.trim() : 'OTools';
}

/**
 * 标题里的品类后缀。必须逐语言 —— 硬编码中文会让德语页标题变成
 * 「Git in deinem Arbeitsbereich · Git 客户端工具」（实测构建产物）。
 */
const TITLE_SUFFIX = {
  '': '客户端工具',
  en: 'Desktop Client',
  ja: 'クライアントツール',
  ko: '클라이언트 도구',
  fr: 'logiciel client',
  es: 'cliente de escritorio',
  de: 'Desktop-Client',
  ru: 'клиентский инструмент',
};

/** JSON-LD ItemList 的名字（对比优势小节标题）。 */
const ADVANTAGE_LABEL = {
  '': '相比同类工具的优势',
  en: 'Advantages over comparable tools',
  ja: '類似ツールと比べての強み',
  ko: '유사 도구 대비 장점',
  fr: 'Avantages par rapport aux outils similaires',
  es: 'Ventajas frente a herramientas similares',
  de: 'Vorteile gegenüber vergleichbaren Werkzeugen',
  ru: 'Преимущества перед аналогами',
};

/** 拼 keywords：去标点、去重、限长（超长会被搜索引擎整体忽略）。 */
function buildKeywords(parts) {
  const seen = new Set();
  const out = [];
  for (const raw of parts) {
    if (typeof raw !== 'string') continue;
    const cleaned = raw.replace(/[。！？；，,.!?;:'"“”‘’()（）]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!cleaned || cleaned.length < 2) continue;
    const k = cleaned.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(cleaned);
    if (out.length >= 24) break;
  }
  return out.join(',');
}

/**
 * description 控制在 ~155 字符。
 *
 * ⚠️ 句号必须逐语言选：中文站 description 里混一个西文句点很难看，
 * 而且英文按**字符**算长度比中文按**字数**算短得多（同样的信息量英文只有一半长），
 * 所以上限对非中文语言放宽到 160，避免 sub 被整段砍掉只剩 tagline。
 */
function buildDescription(brand, tagline, sub, prefix) {
  const isCJK = prefix === '';
  const one = [brand, tagline].filter(Boolean).join(' — ');
  const short = isCJK ? `${one}。` : `${one}.`;
  const body = [one, sub].filter(Boolean).join(isCJK ? '。' : '. ');
  // 非中文语言的 tagline 更长（同义信息英文单词更多），上限放宽，
  // 否则会像「MQTT — Make MQTT debugging visual.」那样把 sub 整段砍掉。
  const limit = isCJK ? 155 : 200;
  if (body.length <= limit) return body;
  if (short.length <= limit) return short;
  return `${one.slice(0, limit - 1)}…`;
}

/** 读取 registry.ts 里每个插件的展示名 / 下载地址 / 首张截图场景。 */
/** 独立版下载仓库的 tag 前缀（registry.ts 里 `${RELEASES}` 的实际值）。 */
export const RELEASE_BASE = 'https://github.com/ootools/otools-publish/releases/tag';

export function readRegistry(rootDir) {
  const src = fs.readFileSync(path.join(rootDir, '.vitepress/theme/plugins/registry.ts'), 'utf8');
  const map = {};
  for (const m of src.matchAll(/'(otools-[a-z]+)':\s*\{([\s\S]*?)\n  \},/g)) {
    const [, key, body] = m;
    const name = body.match(/name:\s*'([^']+)'/)?.[1] ?? key;
    const rawReleases = body.match(/releases:\s*`([^`]+)`/)?.[1] ?? '';
    // ⚠️ registry.ts 里 releases 写的是模板串 `${RELEASES}/plugin-app-...`，
    // 正则读出来只是字面量，不展开会让 JSON-LD 的 downloadUrl 输出
    // `${RELEASES}/...` 这种对爬虫无效的链接。
    const releases = rawReleases.replace(/\$\{RELEASES\}/g, RELEASE_BASE);
    const firstScene = body.match(/screenshots:\s*\[\s*\{\s*key:\s*'([^']+)'/)?.[1] ?? 'workspace';
    map[key] = { name, releases, firstScene };
  }
  return map;
}

/** 读取 8 份 locale JSON。 */
export function readLocales(rootDir) {
  const dir = path.join(rootDir, '.vitepress/theme/locales');
  const out = {};
  for (const l of LOCALES) {
    const file = path.join(dir, `${l.prefix || 'zh'}.json`);
    try {
      out[l.prefix] = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
      out[l.prefix] = {};
    }
  }
  return out;
}

/** 该相对路径是不是插件落地页。 */
export function pluginKeyOf(relativePath) {
  const m = String(relativePath).match(/(?:^|\/)plugins\/(otools-[a-z]+)\.md$/);
  if (!m) return null;
  return PLUGIN_KEYS.includes(m[1]) ? m[1] : null;
}

/**
 * VitePress `transformPageData` 钩子。
 *
 * 返回值会 merge 进 **pageData 顶层**（不是 frontmatter）——
 * 这一点很关键：`titleTemplate` 必须放在顶层才会被 createTitle 读到，
 * 塞进 frontmatter 里只会变成一个没人读的自定义字段（拼一次站点名的 bug）。
 */
export function createSeoTransform(ctx = {}) {
  const rootDir = ctx.rootDir;
  const locales = ctx.locales ?? readLocales(rootDir);
  const registry = ctx.registry ?? readRegistry(rootDir);

  return function transformPageData(pageData) {
    const relativePath = pageData.relativePath ?? '';
    if (!relativePath) return {};

    const prefix = localePrefixOf(relativePath);
    const hreflang = LOCALE_BY_PREFIX[prefix]?.hreflang ?? 'zh-CN';
    const ogLocale = LOCALE_BY_PREFIX[prefix]?.ogLocale ?? 'zh_CN';
    const canonicalUrl = `${SITE_ORIGIN}${routeOf(relativePath, prefix)}`;

    const locale = locales[prefix] ?? {};
    const pluginKey = pluginKeyOf(relativePath);

    let title;
    let description;
    let keywords;
    let ogImagePath = `${SITE_BASE}/otools-logo.svg`;
    let jsonLd = [];

    if (pluginKey) {
      const seo = PLUGIN_SEO[pluginKey];
      const reg = registry[pluginKey] ?? { name: seo.name, releases: '', firstScene: 'workspace' };
      const brand = reg.name || seo.name;
      const copy = locale?.pluginLanding?.[pluginKey] ?? {};
      const tagline = typeof copy.tagline === 'string' ? copy.tagline : '';
      const sub = typeof copy.sub === 'string' ? copy.sub : '';
      const highlights = Array.isArray(copy.highlights) ? copy.highlights : [];
      const features = Array.isArray(copy.features) ? copy.features : [];

      title = `${tagline || brand} · ${brand} ${TITLE_SUFFIX[prefix] ?? TITLE_SUFFIX.en}`;
      description = buildDescription(brand, tagline, sub, prefix);
      // ⚠️ 品牌修饰词（「Git 客户端」/「Git client」）必须来自**本地化**的 terms，
      // 不能在这里硬编码中文——否则德语/日语页的 keywords 里会混进中文。
      keywords = buildKeywords([
        brand,
        tagline,
        sub,
        ...highlights,
        ...features.map((f) => f?.title),
        ...(seo.terms[prefix] ?? seo.terms.en ?? []),
        // 「X 替代」句式逐语言；竞品名本身不翻译
        ...seo.competitors.map((c) => (VS_FORMAT[prefix] ?? VS_FORMAT.en).replace('${c}', c)),
        ...seo.competitors,
      ]);

      ogImagePath = `${SITE_BASE}/plugins/${pluginKey}/${reg.firstScene}-light.webp`;

      jsonLd = [
        {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: `${brand} · OTools 插件`,
          alternateName: brand,
          applicationCategory: 'DeveloperApplication',
          applicationSubCategory: tagline,
          operatingSystem: 'Windows 10+, macOS 12+',
          description,
          url: canonicalUrl,
          downloadUrl: reg.releases || undefined,
          softwareVersion: reg.releases?.match(/v([\d.]+)$/)?.[1],
          inLanguage: hreflang,
          featureList: features.map((f) => [f?.title, f?.desc].filter(Boolean).join(': ')),
          keywords: keywords.split(','),
          isAccessibleForFree: true,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
          publisher: { '@type': 'Organization', name: 'OTools', url: `${SITE_ORIGIN}${SITE_BASE}/` },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'OTools', item: `${SITE_ORIGIN}${SITE_BASE}${prefix ? `/${prefix}` : ''}/` },
            { '@type': 'ListItem', position: 2, name: seo.name, item: canonicalUrl },
          ],
        },
      ];

      // 对比优势写成 ItemList，AI 更容易当成"差异点"引用
      if (seo.advantages?.length) {
        jsonLd.push({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `${brand} ${ADVANTAGE_LABEL[prefix] ?? ADVANTAGE_LABEL.en}`,
          itemListElement: seo.advantages.map((text, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: text,
          })),
        });
      }
    } else {
      // ⚠️ 非插件页**不要**覆盖 md 自带的标题。
      // 原来无条件写title = hero.title，导致 features/guide 各页全部显示成
      // 站点名（实测 features.html 的 title 变成了「OTools 高性能AI工作流平台…」）。
      title = pageData.title || siteTitleOf(prefix, locales);
      description = siteDescriptionOf(prefix, locales);
      keywords = buildKeywords([
        'OTools',
        ...(SITE_TERMS[prefix] ?? SITE_TERMS.en ?? []),
      ]);

      if (/\/guide\//.test(`/${relativePath}`) || /\/guide\/[^/]*\.md$/.test(relativePath)) {
        jsonLd = [
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: pageData.title || title,
            description,
            url: canonicalUrl,
            inLanguage: hreflang,
            author: { '@type': 'Organization', name: 'OTools' },
          },
        ];
      } else if (/(^|\/)features\.md$/.test(relativePath)) {
        // 功能总览页本质是能力清单，用 CollectionPage + ItemList 表达
        jsonLd = [
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: title,
            description,
            url: canonicalUrl,
            inLanguage: hreflang,
            isPartOf: { '@type': 'WebSite', name: 'OTools', url: `${SITE_ORIGIN}${SITE_BASE}${prefix ? `/${prefix}` : ''}/` },
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: PLUGIN_KEYS.map((k, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: PLUGIN_SEO[k].name,
                url: `${SITE_ORIGIN}${routeOf(`plugins/${k}.md`, prefix)}`,
              })),
            },
          },
        ];
      }
    }

    // FAQ 只挂在首页（问答型内容集中在一处，避免每个页面都稀释）
    const isHome = /(^|\/)index\.md$/.test(relativePath);
    if (isHome) {
      const faq = faqFor(prefix);
      if (faq.length) {
        jsonLd.push({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        });
      }
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'OTools',
        url: `${SITE_ORIGIN}${SITE_BASE}${prefix ? `/${prefix}` : ''}/`,
        inLanguage: hreflang,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_ORIGIN}${SITE_BASE}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      });
    }

    const head = [
      ['meta', { name: 'keywords', content: keywords }],
      ['meta', { name: 'author', content: 'OTools' }],
      ['link', { rel: 'canonical', href: canonicalUrl }],

      ['meta', { property: 'og:type', content: pluginKey ? 'website' : 'article' }],
      ['meta', { property: 'og:site_name', content: 'OTools' }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:url', content: canonicalUrl }],
      ['meta', { property: 'og:image', content: `${SITE_ORIGIN}${ogImagePath}` }],
      ['meta', { property: 'og:image:width', content: '2880' }],
      ['meta', { property: 'og:image:height', content: '1800' }],
      ['meta', { property: 'og:locale', content: ogLocale }],

      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: description }],
      ['meta', { name: 'twitter:image', content: `${SITE_ORIGIN}${ogImagePath}` }],

      // llms.txt：给 AI 检索的站点结构说明（规范： https://llmstxt.org）
      ['link', { rel: 'alternate', type: 'text/plain', href: `${SITE_BASE}/llms.txt`, title: 'OTools 站点说明（AI 检索）' }],
    ];

    for (const item of jsonLd) {
      head.push(['script', { type: 'application/ld+json' }, JSON.stringify(item)]);
    }

    return {
      title,
      description,
      // ⚠️ 顶层而非 frontmatter：createTitle 读的是 pageData.titleTemplate。
      // 插件页标题已自带品牌与品类词，再拼 " | OTools" 会变成
      // 「… · MQTT 客户端工具 | OTools 高性能AI工作流平台」（超长且重复）。
      titleTemplate: false,
      frontmatter: {
        ...pageData.frontmatter,
        head,
      },
    };
  };
}
