// 插件落地页的**结构化**数据（配色、截图、下载链接、特性数量）。
// 文案在 `.vitepress/theme/locales/<lang>.json` 的 `pluginLanding.<key>` 下。

export type PluginLandingKey =
  | 'otools-git'
  | 'otools-dbm'
  | 'otools-term'
  | 'otools-mqtt'
  | 'otools-ftp'
  | 'otools-servrun'
  | 'otools-scrcpy';

export interface PluginLandingMeta {
  /** 展示名（品牌名不翻译） */
  name: string;
  /** 主题色（渐变起止） */
  colors: [string, string];
  /** 独立版下载地址（otools-publish 的版本化 tag） */
  releases: string;
  /** 截图场景（文件位于 /public/plugins/<key>/<scene>-{light,dark}.png） */
  screenshots: Array<{ key: string; label: string }>;
  /** 首页高亮点数量（文案在 locale 里） */
  highlights: string[];
  /** 功能特性；带 `shot` 的特性会在「功能实景」区以「图文交替」形式展示 */
  features: Array<{ key: string; shot?: string }>;
}

// ⚠️ 主题色必须逐段对齐 `public/plugin-logos/<key>.svg` 里的渐变 stop：
// 落地页 hero、功能图标、下载卡、首页 tab 全吃这一份数据，手写十六进制一旦
// 和 logo 漂移（git 就漂过：logo 是橙红，页面是深蓝），整页会像换了个产品。
// 新增插件时先读 logo 的 `stop-color` 再在这里登记，不要凭印象填色。
export const pluginAccent = {
  home: ['#1d4ed8', '#0ea5e9'],
  git: ['#fb923c', '#dc2626'],
  dbm: ['#14b8a6', '#0f766e'],
  ssh: ['#334155', '#0f172a'],
  ftp: ['#38bdf8', '#0284c7'],
  mqtt: ['#8b5cf6', '#7c3aed'],
  servrun: ['#a78bfa', '#7c3aed'],
  scrcpy: ['#38bdf8', '#2563eb'],
  ollama: ['#7c3aed', '#a855f7'],
  audio: ['#f43f5e', '#be123c'],
  http: ['#0ea5e9', '#2563eb'],
} satisfies Record<string, [string, string]>;

const RELEASES = 'https://github.com/ootools/otools-publish/releases/tag';

export const pluginLandingMeta: Record<PluginLandingKey, PluginLandingMeta> = {
  'otools-git': {
    name: 'Git',
    colors: pluginAccent.git,
    releases: `${RELEASES}/plugin-app-otools-git-v0.2.6`,
    // files / history / terminal 三个都要进画廊并挂进功能实景：
    // 用户第一轮就点名「git 缺少文件、终端的功能实景」。terminal 是 git 插件的
    // 差异化能力（内置终端跑 git 命令），只放画廊不放实景等于白拍。
    screenshots: [
      { key: 'workspace', label: 'Workspace' },
      { key: 'files', label: 'Files' },
      { key: 'history', label: 'History' },
      { key: 'terminal', label: 'Terminal' },
    ],
    highlights: ['', '', ''],
    features: [
      { key: 'repos', shot: 'workspace' },
      { key: 'files', shot: 'files' },
      { key: 'diff' },
      { key: 'ai' },
      { key: 'terminal', shot: 'terminal' },
    ],
  },
  'otools-dbm': {
    name: 'DBM',
    colors: pluginAccent.dbm,
    releases: `${RELEASES}/plugin-app-otools-dbm-v0.2.3`,
    // ⚠️ 第一张用 **tables** 而不是 connections：
    // connections 只填了上方一张连接信息卡，下半屏全空；
    // tables 有 12 行真实数据 + 左侧展开的数据库/表树，也是用户点名要的形态。
    screenshots: [
      { key: 'tables', label: 'Tables' },
      { key: 'query', label: 'Query' },
      { key: 'structure', label: 'Schema' },
    ],
    highlights: ['', '', ''],
    features: [
      { key: 'multi', shot: 'connections' },
      { key: 'query', shot: 'query' },
      { key: 'tables', shot: 'tables' },
      { key: 'backup' },
    ],
  },
  'otools-term': {
    name: 'Term',
    colors: pluginAccent.ssh,
    releases: `${RELEASES}/plugin-app-otools-term-v0.1.4`,
    // ⚠️ 不要用workspace（未连接态，画面 90% 是「请选择一个服务器」的空白色块）。
    // 主图与功能实景都用连接后的状态，这也是用户明确要求过的（「截图太空了」）。
    screenshots: [
      { key: 'connected', label: 'Connected' },
      { key: 'sftp', label: 'SFTP' },
    ],
    highlights: ['', '', ''],
    features: [
      { key: 'ssh', shot: 'connected' },
      { key: 'sftp', shot: 'sftp' },
      { key: 'forward' },
    ],
  },
  'otools-mqtt': {
    name: 'MQTT',
    colors: pluginAccent.mqtt,
    releases: `${RELEASES}/plugin-app-otools-mqtt-v0.1.4`,
    // ⚠️ 第一张必须是 **session**（会话打开、消息流visible），这是用户明确要求的
    // （「把会话打开的那种作为主图」）。list是未打开会话的空态，
    // 大半屏是「从左侧选择连接并打开会话」的占位图。
    screenshots: [
      { key: 'session', label: 'Session' },
      { key: 'list', label: 'Connections' },
      { key: 'form', label: 'New connection' },
    ],
    highlights: ['', '', ''],
    features: [
      { key: 'multi', shot: 'list' },
      { key: 'payload', shot: 'session' },
      { key: 'subscribe' },
    ],
  },
  'otools-ftp': {
    name: 'FTP',
    colors: pluginAccent.ftp,
    releases: `${RELEASES}/plugin-app-otools-ftp-v0.1.3`,
    screenshots: [
      { key: 'list', label: 'Connections' },
      { key: 'browse', label: 'Browse' },
    ],
    highlights: ['', '', ''],
    features: [
      { key: 'dual', shot: 'list' },
      { key: 'transfer', shot: 'browse' },
      { key: 'tls' },
    ],
  },
  'otools-servrun': {
    name: 'Env',
    colors: pluginAccent.servrun,
    releases: `${RELEASES}/plugin-app-otools-servrun-v0.1.6`,
    // 用户要求「ENV 可以每个服务都截图」—— 9 个服务场景全部拍完（产物里
    // detail-* 共 9 个），画廊这里就全列出来，别只挑 3 个藏着。
    screenshots: [
      { key: 'dashboard', label: 'Dashboard' },
      { key: 'detail-nginx', label: 'Nginx' },
      { key: 'detail-mysql', label: 'MySQL' },
      { key: 'detail-php', label: 'PHP' },
      { key: 'detail-redis', label: 'Redis' },
      { key: 'detail-mongodb', label: 'MongoDB' },
      { key: 'detail-postgresql', label: 'PostgreSQL' },
      { key: 'detail-memcached', label: 'Memcached' },
      { key: 'detail-rabbitmq', label: 'RabbitMQ' },
    ],
    highlights: ['', '', ''],
    features: [
      { key: 'services', shot: 'dashboard' },
      { key: 'vhost', shot: 'detail-nginx' },
      { key: 'php', shot: 'detail-php' },
      { key: 'detail', shot: 'detail-mysql' },
    ],
  },
  'otools-scrcpy': {
    name: 'Android Mirror',
    colors: pluginAccent.scrcpy,
    releases: `${RELEASES}/plugin-app-otools-scrcpy-v0.3.2`,
    screenshots: [
      { key: 'devices', label: 'Devices' },
      { key: 'mirror', label: 'Mirror' },
    ],
    highlights: ['', '', ''],
    features: [
      { key: 'mirror', shot: 'devices' },
      { key: 'control', shot: 'mirror' },
      { key: 'wireless' },
    ],
  },
};

export const pluginLandingKeys = Object.keys(pluginLandingMeta) as PluginLandingKey[];
