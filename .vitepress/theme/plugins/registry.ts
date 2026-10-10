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
  /** 功能特性数量（文案在 locale 里） */
  features: Array<{ key: string }>;
}

const RELEASES = 'https://github.com/ootools/otools-publish/releases/tag';

export const pluginLandingMeta: Record<PluginLandingKey, PluginLandingMeta> = {
  'otools-git': {
    name: 'Git',
    colors: ['#0f172a', '#1d4ed8'],
    releases: `${RELEASES}/plugin-app-otools-git-v0.2.6`,
    screenshots: [{ key: 'workspace', label: 'Workspace' }, { key: 'history', label: 'History' }],
    highlights: ['', '', ''],
    features: [{ key: 'repos' }, { key: 'diff' }, { key: 'ai' }],
  },
  'otools-dbm': {
    name: 'DBM',
    colors: ['#0f766e', '#2dd4bf'],
    releases: `${RELEASES}/plugin-app-otools-dbm-v0.2.3`,
    screenshots: [
      { key: 'connections', label: 'Connections' },
      { key: 'query', label: 'Query' },
    ],
    highlights: ['', '', ''],
    features: [{ key: 'multi' }, { key: 'query' }, { key: 'backup' }],
  },
  'otools-term': {
    name: 'Term',
    colors: ['#1d4ed8', '#38bdf8'],
    releases: `${RELEASES}/plugin-app-otools-term-v0.1.4`,
    screenshots: [{ key: 'workspace', label: 'Workspace' }],
    highlights: ['', '', ''],
    features: [{ key: 'ssh' }, { key: 'sftp' }, { key: 'forward' }],
  },
  'otools-mqtt': {
    name: 'MQTT',
    colors: ['#7c3aed', '#a78bfa'],
    releases: `${RELEASES}/plugin-app-otools-mqtt-v0.1.4`,
    screenshots: [
      { key: 'list', label: 'Connections' },
      { key: 'session', label: 'Session' },
      { key: 'form', label: 'New connection' },
    ],
    highlights: ['', '', ''],
    features: [{ key: 'multi' }, { key: 'payload' }, { key: 'subscribe' }],
  },
  'otools-ftp': {
    name: 'FTP',
    colors: ['#0ea5e9', '#22d3ee'],
    releases: `${RELEASES}/plugin-app-otools-ftp-v0.1.3`,
    screenshots: [
      { key: 'list', label: 'Connections' },
      { key: 'browse', label: 'Browse' },
    ],
    highlights: ['', '', ''],
    features: [{ key: 'dual' }, { key: 'transfer' }, { key: 'tls' }],
  },
  'otools-servrun': {
    name: 'Env',
    colors: ['#7c3aed', '#c084fc'],
    releases: `${RELEASES}/plugin-app-otools-servrun-v0.1.6`,
    screenshots: [{ key: 'dashboard', label: 'Dashboard' }],
    highlights: ['', '', ''],
    features: [{ key: 'services' }, { key: 'vhost' }, { key: 'php' }],
  },
  'otools-scrcpy': {
    name: 'Android Mirror',
    colors: ['#059669', '#34d399'],
    releases: `${RELEASES}/plugin-app-otools-scrcpy-v0.3.2`,
    screenshots: [{ key: 'devices', label: 'Devices' }],
    highlights: ['', '', ''],
    features: [{ key: 'mirror' }, { key: 'control' }, { key: 'wireless' }],
  },
};

export const pluginLandingKeys = Object.keys(pluginLandingMeta) as PluginLandingKey[];
