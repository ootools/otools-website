// 截图 URL 规则（首页与插件落地页共用）。
//
// 为什么需要这个模块：
//   站点固定浅色（`appearance:false`），但首页与落地页都是**深色沉浸**层，
//   所以截图一律取**暗色版** `<scene>-<lang>-dark.webp`。
//
// ⚠️ 关键坑：`<scene>-dark.webp`（neutral 副本）**语言不统一**——
//   · puter 系（documents / spreadsheet / presentation / ps / 3d / audio）
//     的 neutral 就是英文界面（与 `-en-US-dark.webp` 内容相同）；
//   · craft 系与工具类（git / dbm / term / …）的 neutral 是中文界面。
//   曾因此在中文首页把 puter 系插件显示成英文界面。⇒ **不要用 neutral**，
//   一律按站点语言取逐语言副本，并按插件实际拥有的语言（registry `shotLangs`）回退。

/** 站点语言 → 截图语言。 */
// 两边语言集合不同：截图有 zh-CN/en-US/de-DE/es-ES/ja-JP/ko-KR/ru-RU/ar-SA（无 fr），
// 站点是 zh/en/ja/ko/fr/es/de/ru（无 ar）。
export const SHOT_LANG: Record<string, string> = {
  root: 'zh-CN',
  en: 'en-US',
  ja: 'ja-JP',
  ko: 'ko-KR',
  fr: 'en-US', // 插件无 fr 截图，用英语（比中文更近）
  es: 'es-ES',
  de: 'de-DE',
  ru: 'ru-RU',
};

/** 插件缺省拥有的截图语言（多数插件只拍了中英）。 */
export const DEFAULT_SHOT_LANGS = ['zh-CN', 'en-US'];

/**
 * 在「插件实际拥有的语言」里挑一个最接近站点语言的。
 * 回退优先级：想要的语言 → 英语 → 中文 → 该插件首个可用语言。
 * 关键：**渲染前就选对**，不请求不存在的文件（否则浏览器先 404 再兜底）。
 */
export function pickShotLang(
  localeKey: string | undefined,
  availableLangs?: string[] | readonly string[],
): string {
  const want = SHOT_LANG[localeKey ?? 'root'] ?? 'zh-CN';
  const have = (availableLangs ?? DEFAULT_SHOT_LANGS) as string[];
  if (have.includes(want)) return want;
  if (have.includes('en-US')) return 'en-US';
  if (have.includes('zh-CN')) return 'zh-CN';
  return have[0] ?? 'zh-CN';
}

/** 逐语言暗色截图 URL。 */
export const shotUrlFor = (
  base: string,
  scene: string,
  shotLang: string,
): string => `${base}/${scene}-${shotLang}-dark.webp`;

/**
 * **只有 neutral 副本**（`<scene>-dark.webp`，无任何逐语言副本）的插件。
 *
 * 目前只有一个：`otools-pic-collage` 尚未收录进落地页 registry（`pluginLandingMeta`），
 * 所以拿不到 `shotLangs`，也**只拍了中文 neutral**（界面是中文）。
 * 对它只能退到 neutral；若将来补了逐语言截图且登记进 registry，请从这里删掉。
 *
 * 判断依据（可复核）：`ls public/plugins/<key>/ | grep -c '<scene>-.*-dark.webp'` 为 0。
 */
export const NEUTRAL_ONLY_PLUGINS = new Set<string>(['otools-pic-collage']);
