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

### Host `host_dispatch` (Marketplace‑Dylibs)

Exportiert die Bibliothek **`otools_plugin_bind_host`**, übergibt der Host beim Laden **`OtoolsNativeHostApiV1`** (`version >= 2`). Neben **`invoke` / `free`** zeigt **`host_dispatch`** auf dieselbe Capability‑Tabelle wie **`dispatch_direct`** in **`ot-host-dispatch`** (HTTP, lokaler Plugin‑State usw.).

- **Eingabe**: `capability` als UTF‑8‑Name, `request` als JSON (wie eingebautes `dispatch_direct`).
- **Ausgabe**: `{ "ok": true, "data": ... }` oder `{ "ok": false, "error": "..." }`.
- **Freigabe**: Rückgabepuffer mit **`free`** derselben API‑Struktur freigeben.

Typische `capability`‑Strings: `http.send`, `http.normalize_request`, `http.write_base64_file`, `plugin_state.read`, `plugin_state.save_local` (siehe `ot_host_dispatch::caps`).

### Native‑Ereignisse (`listenNative`)

Für Marketplace‑Dynamic Libraries: der Host ruft **`poll_events`** auf und emittiert auf **`otools-native:{uuid}`**. Frontend: `listenNative`.

```ts
const unlisten = await otools.listenNative((e) => {
  const { topic, payload } = e.payload;
}, { intervalMs: 200 });
await unlisten();
```

In `otools_plugin_invoke` **`poll_events`** behandeln; `data.events` als `{ topic, payload }`‑Liste. In die App eingebettete Plugins können weiter `invoke('command')` nutzen.

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
