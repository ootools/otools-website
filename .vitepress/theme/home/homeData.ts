// 首页结构化数据：镜头、平替对标、滚动叙事、平台能力。
// 文案在 `.vitepress/theme/locales/<lang>.json` 的 `home.*` 下，这里只放「结构 + 取图」。
//
// 取图约定（与 PluginLanding.vue 共用 `.vitepress/theme/shots.ts`）：
//   ⚠️ **不要用 neutral 副本 `<scene>-dark.webp`**——它的界面语言不统一：
//      puter 系（documents/spreadsheet/presentation/ps/3d/audio）的 neutral 是**英文**，
//      craft 系与工具类（git/dbm/term/…）的 neutral 是**中文**。
//      曾因此在中文首页把 puter 系插件显示成英文界面。
//   正确做法：按站点语言取逐语言暗色副本 `<scene>-<lang>-dark.webp`，
//      并按插件实际拥有的语言（registry `shotLangs`）在渲染前选好，避免 404。
// 首页只登记 `public/plugins/<key>/` 真实存在的插件，避免出现 404 空图。

import type { PluginLandingKey } from '../plugins/registry';
import { pluginAccent, pluginLandingMeta } from '../plugins/registry';
import { NEUTRAL_ONLY_PLUGINS, pickShotLang, shotUrlFor } from '../shots';

/**
 * 该插件的暗色截图 URL。
 * @param localeKey 站点语言（useI18n 的 localeKey；'root' = 中文）
 *
 * 逐语言副本优先；只有 neutral 副本的插件（见 NEUTRAL_ONLY_PLUGINS）退回 neutral，
 * 否则会 404。
 */
export const shotUrl = (
  plugin: PluginLandingKey,
  scene: string,
  localeKey: string | undefined = 'root',
) => {
  if (NEUTRAL_ONLY_PLUGINS.has(plugin)) return `/plugins/${plugin}/${scene}-dark.webp`;
  const lang = pickShotLang(localeKey, pluginLandingMeta[plugin]?.shotLangs);
  return shotUrlFor(`/plugins/${plugin}`, scene, lang);
};

/** 插件 logo（根目录 logo.svg，插件市场硬契约）。 */
export const logoUrl = (plugin: PluginLandingKey) => `/plugin-logos/${plugin}.svg`;

export const accentOf = (plugin: PluginLandingKey): [string, string] => {
  const key = plugin.replace(/^otools-/, '');
  const table = pluginAccent as Record<string, [string, string]>;
  return table[key] ?? ['#3b82f6', '#0ea5e9'];
};

/** 插件展示名（与落地页 registry 保持一致的品牌名）。 */
export const pluginName: Record<string, string> = {
  'otools-puter-documents': 'Documents',
  'otools-puter-spreadsheet': 'Spreadsheet',
  'otools-puter-presentation': 'Presentation',
  'otools-pdfcraft': 'PdfCraft',
  'otools-designcraft': 'DesignCraft',
  'otools-puter-ps': 'Photo Studio',
  'otools-vectorcraft': 'VectorCraft',
  'otools-video': 'Video Studio',
  'otools-filmcraft': 'FilmCraft',
  'otools-effectcraft': 'EffectCraft',
  'otools-puter-audio': 'Audio Studio',
  'otools-lightcraft': 'LightCraft',
  'otools-puter-3d': '3D Studio',
  'otools-cadcraft': 'CADCraft',
  'otools-git': 'Git',
  'otools-dbm': 'DBM',
  'otools-term': 'Term',
  'otools-http': 'HTTP',
  'otools-servrun': 'Env',
  'otools-mqtt': 'MQTT',
  'otools-ftp': 'FTP',
  'otools-scrcpy': 'Android Mirror',
  'otools-pic-collage': 'Pic Collage',
  'otools-markdown': 'Markdown',
  'otools-ollama': 'Ollama',
};

// ── 首屏窗口轮播 ─────────────────────────────────────────────────────────────
// 精选「一眼看出在干什么」的旗舰镜头，覆盖办公 / 创意 / 开发三大类。
export interface HeroWindow {
  key: string;
  plugin: PluginLandingKey;
  scene: string;
}

export const heroWindows: HeroWindow[] = [
  { key: 'documents', plugin: 'otools-puter-documents', scene: 'report' },
  { key: 'ps', plugin: 'otools-puter-ps', scene: 'edit' },
  { key: 'git', plugin: 'otools-git', scene: 'workspace' },
  { key: 'video', plugin: 'otools-video', scene: 'template' },
  { key: 'dbm', plugin: 'otools-dbm', scene: 'tables' },
];

// ── 平替对标矩阵 ─────────────────────────────────────────────────────────────
export interface ReplaceItem {
  id: string;
  /** 被替代的商业软件（品牌名不翻译） */
  from: string;
  plugin: PluginLandingKey;
  scene: string;
}

export interface ReplaceGroup {
  key: string;
  /** 分组图标（emoji，无需额外资源） */
  icon: string;
  items: ReplaceItem[];
}

export const replaceGroups: ReplaceGroup[] = [
  {
    key: 'office',
    icon: '📄',
    items: [
      { id: 'word', from: 'WPS 文字 / Word', plugin: 'otools-puter-documents', scene: 'report' },
      { id: 'excel', from: 'WPS 表格 / Excel', plugin: 'otools-puter-spreadsheet', scene: 'sample' },
      { id: 'ppt', from: 'WPS 演示 / PowerPoint', plugin: 'otools-puter-presentation', scene: 'story' },
      { id: 'pdf', from: 'Adobe Acrobat / 福昕', plugin: 'otools-pdfcraft', scene: 'view' },
      { id: 'indesign', from: 'Adobe InDesign', plugin: 'otools-designcraft', scene: 'sample' },
    ],
  },
  {
    key: 'creative',
    icon: '🎨',
    items: [
      { id: 'photoshop', from: 'Adobe Photoshop', plugin: 'otools-puter-ps', scene: 'edit' },
      { id: 'illustrator', from: 'Adobe Illustrator', plugin: 'otools-vectorcraft', scene: 'artwork' },
      { id: 'premiere', from: 'Adobe Premiere / 剪映专业版', plugin: 'otools-video', scene: 'template' },
      { id: 'aftereffects', from: 'Adobe After Effects', plugin: 'otools-effectcraft', scene: 'demo' },
      { id: 'audition', from: 'Adobe Audition', plugin: 'otools-puter-audio', scene: 'session' },
      { id: 'lightroom', from: 'Adobe Lightroom', plugin: 'otools-lightcraft', scene: 'demo' },
      { id: 'blender', from: 'Blender / 3ds Max', plugin: 'otools-puter-3d', scene: 'layout' },
      { id: 'autocad', from: 'AutoCAD', plugin: 'otools-cadcraft', scene: 'sample' },
      { id: 'canva', from: 'Canva / 美图秀秀拼图', plugin: 'otools-pic-collage', scene: 'editor' },
    ],
  },
  {
    key: 'dev',
    icon: '🛠️',
    items: [
      { id: 'github-desktop', from: 'GitHub Desktop / Sourcetree', plugin: 'otools-git', scene: 'workspace' },
      { id: 'navicat', from: 'Navicat / DBeaver', plugin: 'otools-dbm', scene: 'tables' },
      { id: 'iterm', from: 'Xshell / Termius / iTerm', plugin: 'otools-term', scene: 'connected' },
      { id: 'laragon', from: 'Laragon / ServBay / MAMP', plugin: 'otools-servrun', scene: 'dashboard' },
      { id: 'mqttx', from: 'MQTTX / MQTT Explorer', plugin: 'otools-mqtt', scene: 'session' },
      { id: 'filezilla', from: 'FileZilla / Transmit', plugin: 'otools-ftp', scene: 'browse' },
      { id: 'scrcpy', from: 'Scrcpy GUI', plugin: 'otools-scrcpy', scene: 'mirror' },
    ],
  },
];

// ── 苹果式滚动叙事 ───────────────────────────────────────────────────────────
// 每一幕 = 一张真实截图 + 一组产品特性。下拉过程中逐幕切换。
export interface StoryScene {
  key: string;
  plugin: PluginLandingKey;
  scene: string;
  /** 所属皮（用于分组小标） */
  act: 'office' | 'creative' | 'dev';
}

export const storyScenes: StoryScene[] = [
  // 办公文档
  { key: 'documents', plugin: 'otools-puter-documents', scene: 'report', act: 'office' },
  { key: 'spreadsheet', plugin: 'otools-puter-spreadsheet', scene: 'sample', act: 'office' },
  { key: 'presentation', plugin: 'otools-puter-presentation', scene: 'story', act: 'office' },
  { key: 'pdfcraft', plugin: 'otools-pdfcraft', scene: 'view', act: 'office' },
  // 创意设计
  { key: 'ps', plugin: 'otools-puter-ps', scene: 'edit', act: 'creative' },
  { key: 'vectorcraft', plugin: 'otools-vectorcraft', scene: 'artwork', act: 'creative' },
  { key: 'video', plugin: 'otools-video', scene: 'template', act: 'creative' },
  { key: 'audio', plugin: 'otools-puter-audio', scene: 'session', act: 'creative' },
  { key: 'three', plugin: 'otools-puter-3d', scene: 'layout', act: 'creative' },
  { key: 'lightcraft', plugin: 'otools-lightcraft', scene: 'demo', act: 'creative' },
  // 开发运维
  { key: 'git', plugin: 'otools-git', scene: 'workspace', act: 'dev' },
  { key: 'dbm', plugin: 'otools-dbm', scene: 'tables', act: 'dev' },
  { key: 'term', plugin: 'otools-term', scene: 'connected', act: 'dev' },
  { key: 'servrun', plugin: 'otools-servrun', scene: 'dashboard', act: 'dev' },
  { key: 'scrcpy', plugin: 'otools-scrcpy', scene: 'mirror', act: 'dev' },
];

export const actMeta = {
  office: { icon: '📄', accent: ['#5b8def', '#2f5bb0'] as [string, string] },
  creative: { icon: '🎨', accent: ['#ec4899', '#8b5cf6'] as [string, string] },
  dev: { icon: '🛠️', accent: ['#fb923c', '#dc2626'] as [string, string] },
};

// ── MCP 网关：环绕的插件节点 ─────────────────────────────────────────────────
export const mcpNodes: PluginLandingKey[] = [
  'otools-puter-documents',
  'otools-puter-ps',
  'otools-vectorcraft',
  'otools-pdfcraft',
  'otools-video',
  'otools-git',
  'otools-dbm',
  'otools-term',
  'otools-http',
  'otools-servrun',
  'otools-puter-3d',
  'otools-puter-audio',
];

/** MCP 指令演示：一个自然语言指令 → 多个插件被驱动。 */
export interface McpCommand {
  prompt: string;
  calls: Array<{ plugin: PluginLandingKey; tool: string }>;
}

export const mcpCommands: McpCommand[] = [
  {
    prompt: '把季度报告导出 PDF，并生成一份配套演示稿',
    calls: [
      { plugin: 'otools-puter-documents', tool: 'documents.export_pdf' },
      { plugin: 'otools-puter-presentation', tool: 'presentation.generate' },
      { plugin: 'otools-pdfcraft', tool: 'pdf.optimize' },
    ],
  },
  {
    prompt: '检查这批图片，批量调色后导出 WebP',
    calls: [
      { plugin: 'otools-lightcraft', tool: 'lightcraft.develop' },
      { plugin: 'otools-puter-ps', tool: 'photo.batch_export' },
    ],
  },
  {
    prompt: '看下当前分支改动，写一条提交信息并提交',
    calls: [
      { plugin: 'otools-git', tool: 'git.status' },
      { plugin: 'otools-git', tool: 'git.commit' },
    ],
  },
];

// ── 平台能力 ─────────────────────────────────────────────────────────────────
export interface PlatformCard {
  key: string;
  icon: string;
  /** 数值 / 关键词，做数字滚动或强调 */
  metric: string;
}

export const platformCards: PlatformCard[] = [
  { key: 'free', icon: '🎁', metric: '¥0' },
  { key: 'mcp', icon: '🔌', metric: '1' },
  { key: 'tabs', icon: '🗂️', metric: 'Tabs' },
  { key: 'rust', icon: '⚡', metric: 'Rust' },
];

/** 底部大数字统计条 */
export const heroStats = [
  { key: 'plugins', value: '40+' },
  { key: 'free', value: '¥0' },
  { key: 'mcp', value: '1' },
  { key: 'size', value: '~20MB' },
];

// ── 开发者 / 移植（OTools 是平台，插件多移植自开源项目）─────────────────────
// 事实依据（勿凭印象改）：
//   · puter 系（documents / spreadsheet / presentation / ps / 3d / audio）
//     上游为 HeyPuter 开源应用（github.com/HeyPuter/*）。
//   · craft 系（cadcraft / pdfcraft / designcraft / vectorcraft /
//     filmcraft / effectcraft / lightcraft）上游为 ArtCraft（getartcraft.com，
//     MIT / Apache-2.0 双许可），各插件仓库自带 `upstream/` 目录即其源码。
export interface PortSource {
  /** 上游项目/组织名 */
  from: string;
  /** 上游许可或性质标签 */
  license: string;
  /** 映射到的 OTools 插件（用于显示 logo） */
  plugin: PluginLandingKey;
}

export const portSources: PortSource[] = [
  { from: 'HeyPuter / documents', license: 'MIT', plugin: 'otools-puter-documents' },
  { from: 'HeyPuter / spreadsheet', license: 'MIT', plugin: 'otools-puter-spreadsheet' },
  { from: 'HeyPuter / presentation', license: 'MIT', plugin: 'otools-puter-presentation' },
  { from: 'HeyPuter / photo editor', license: 'MIT', plugin: 'otools-puter-ps' },
  { from: 'ArtCraft / CAD', license: 'MIT · Apache-2.0', plugin: 'otools-cadcraft' },
  { from: 'ArtCraft / PDF', license: 'MIT · Apache-2.0', plugin: 'otools-pdfcraft' },
  { from: 'ArtCraft / Vector', license: 'MIT · Apache-2.0', plugin: 'otools-vectorcraft' },
  { from: 'ArtCraft / Film', license: 'MIT · Apache-2.0', plugin: 'otools-filmcraft' },
  { from: 'ArtCraft / Effect', license: 'MIT · Apache-2.0', plugin: 'otools-effectcraft' },
  { from: 'ArtCraft / Light', license: 'MIT · Apache-2.0', plugin: 'otools-lightcraft' },
];

/** 移植三步（开发者区块的流程示意） */
export const portSteps = ['choose', 'port', 'publish'] as const;

