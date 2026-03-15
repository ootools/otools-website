# OTools API

Alle Plugins greifen über `window.otools` auf Funktionen zu.

<ApiMatrix />

## 1. Runtime & Umgebung

```ts
const appName = otools.getAppName();
const appVersion = otools.getAppVersion();
const nativeId = otools.getNativeId();
const pluginUuid = otools.getPluginUuid();

const isDev = otools.isDev();
const platform = otools.isMacOS() ? 'macos' : otools.isWindows() ? 'windows' : 'linux';

const desktopPath = otools.getPath('desktop');
```

## 2. Zwischenablage & Dateien

```ts
otools.copyText('Hello OTools');
otools.copyFile(['/path/a.txt', '/path/b.png']);
otools.copyImage('data:image/png;base64,...');
const files = otools.getCopyedFiles();
```

## 3. System & Shell

```ts
otools.showNotification('Build abgeschlossen');
otools.shellOpenPath('/Users/you/Desktop');
otools.shellShowItemInFolder('/Users/you/Downloads/file.zip');
otools.shellTrashItem('/Users/you/Downloads/old.log');
otools.shellOpenExternal('https://otools.lingyun.net');
otools.shellBeep();
```

## 4. Native‑Aufrufe

```ts
const result = await otools.invokeNative('ping', { from: 'plugin' });
const raw = await otools.invokeNativeRaw('echo', { hello: 'world' });

await otools.reloadNative();
const probe = await otools.probeNative();
```

Aufrufe zwischen Plugins:

```ts
await otools.invokeNativePlugin('plugin-uuid', 'ping');
await otools.reloadNativePlugin('plugin-uuid');
```

## 5. Plugin‑Zustandsspeicher

Unterstützt **lokalen Zustand** und **Sync‑Zustand**; `scheme` ermöglicht mehrere JSON‑Stores.

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

> Tipp: Wenn `scheme` weggelassen wird, ist der Standard `state.json`. Mit `workspace` entsteht `workspace.json`.
