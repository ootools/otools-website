# OTools API

すべてのプラグインは `window.otools` から機能を呼び出します。

<ApiMatrix />

## 1. 実行時と環境情報

```ts
const appName = otools.getAppName();
const appVersion = otools.getAppVersion();
const nativeId = otools.getNativeId();
const pluginUuid = otools.getPluginUuid();

const isDev = otools.isDev();
const platform = otools.isMacOS() ? 'macos' : otools.isWindows() ? 'windows' : 'linux';

const desktopPath = otools.getPath('desktop');
```

## 2. クリップボードとファイル

```ts
otools.copyText('Hello OTools');
otools.copyFile(['/path/a.txt', '/path/b.png']);
otools.copyImage('data:image/png;base64,...');
const files = otools.getCopyedFiles();
```

## 3. システムと Shell

```ts
otools.showNotification('構築が完了しました');
otools.shellOpenPath('/Users/you/Desktop');
otools.shellShowItemInFolder('/Users/you/Downloads/file.zip');
otools.shellTrashItem('/Users/you/Downloads/old.log');
otools.shellOpenExternal('https://otools.lingyun.net');
otools.shellBeep();
```

## 4. Native 機能呼び出し

```ts
const result = await otools.invokeNative('ping', { from: 'plugin' });
const raw = await otools.invokeNativeRaw('echo', { hello: 'world' });

await otools.reloadNative();
const probe = await otools.probeNative();
```

プラグイン間呼び出し：

```ts
await otools.invokeNativePlugin('plugin-uuid', 'ping');
await otools.reloadNativePlugin('plugin-uuid');
```

## 5. プラグイン状態ストレージ

**ローカル状態** と **同期状態** の両方をサポートし、`scheme` で複数の JSON ストアを作成できます。

```ts
const plugin = otools.getPluginUuid();

// local state
await otools.savePluginLocalState(plugin, { mode: 'focus' }, 'workspace');
const localState = await otools.getPluginLocalState(plugin, 'workspace');

// local state value
await otools.savePluginLocalStateValue(plugin, 'theme', 'dark', 'workspace');
const theme = await otools.getPluginLocalStateValue(plugin, 'theme', 'workspace');

// sync state
await otools.savePluginSyncState(plugin, { version: 1 }, 'profile');
const syncState = await otools.getPluginSyncState(plugin, 'profile');
```

> ヒント：`scheme` を省略すると `state.json` が使われます。`workspace` を渡すと `workspace.json` が生成されます。
