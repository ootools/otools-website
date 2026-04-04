# OTools API

All plugins access capabilities through `window.otools`.

<ApiMatrix />

## 1. Runtime & Environment

```ts
const appName = otools.getAppName();
const appVersion = otools.getAppVersion();
const nativeId = otools.getNativeId();
const pluginUuid = otools.getPluginUuid();

const isDev = otools.isDev();
const platform = otools.isMacOS() ? 'macos' : otools.isWindows() ? 'windows' : 'linux';

const desktopPath = otools.getPath('desktop');
```

## 2. Clipboard & File

```ts
otools.copyText('Hello OTools');
otools.copyFile(['/path/a.txt', '/path/b.png']);
otools.copyImage('data:image/png;base64,...');
const files = otools.getCopyedFiles();
```

## 3. System & Shell

```ts
otools.showNotification('Build completed');
otools.shellOpenPath('/Users/you/Desktop');
otools.shellShowItemInFolder('/Users/you/Downloads/file.zip');
otools.shellTrashItem('/Users/you/Downloads/old.log');
otools.shellOpenExternal('https://otools.lingyun.net');
otools.shellBeep();
```

## 4. Native Capability Calls

```ts
const result = await otools.invokeNative('ping', { from: 'plugin' });
const raw = await otools.invokeNativeRaw('echo', { hello: 'world' });

await otools.reloadNative();
const probe = await otools.probeNative();
```

Cross-plugin calls:

```ts
await otools.invokeNativePlugin('plugin-uuid', 'ping');
await otools.reloadNativePlugin('plugin-uuid');
```

### Host `host_dispatch` (marketplace dylibs)

If the library exports **`otools_plugin_bind_host`**, the host passes **`OtoolsNativeHostApiV1`** at load time (`version >= 2`). Besides **`invoke` / `free`** (e.g. host AI callbacks), the **`host_dispatch`** field routes to the same capability table as **`dispatch_direct`** in **`ot-host-dispatch`** (HTTP, plugin local state, etc.), so marketplace builds match the app.

- **Input**: `capability` is a UTF-8 name; `request` is JSON (same shape as built-in `dispatch_direct`).
- **Output**: JSON, `{ "ok": true, "data": ... }` or `{ "ok": false, "error": "..." }`.
- **Free**: use the same struct’s **`free`** to release buffers returned by `host_dispatch`.

Common `capability` strings: `http.send`, `http.normalize_request`, `http.write_base64_file`, `plugin_state.read`, `plugin_state.save_local` (see `ot_host_dispatch::caps`).

### Native event subscription (`listenNative`)

For **marketplace-installed plugins loaded as dynamic libraries**, the host periodically calls the library method **`poll_events`** and forwards events via Tauri to the channel **`otools-native:{current plugin uuid}`**. Use `listenNative` on the frontend (this registers host commands and sets up `listen`).

```ts
const unlisten = await otools.listenNative((e) => {
  const { topic, payload } = e.payload;
  console.log(topic, payload);
}, { intervalMs: 200 });

// Always call unlisten on teardown (stops host polling ref-count)
await unlisten();
```

To target another plugin uuid explicitly:

```ts
await otools.listenNativePlugin('other-plugin-uuid', handler, { intervalMs: 300 });
```

The dynamic library must handle **`method: "poll_events"`** inside `otools_plugin_invoke`. A typical success body:

```json
{
  "ok": true,
  "data": {
    "events": [
      { "topic": "progress", "payload": { "percent": 50 } }
    ]
  }
}
```

`data` may also be a bare array of events; each item may use **`topic`** or **`event`**. Return an empty array when there is nothing to push.

> **Note**: Plugins **linked into the main app** can still use Tauri `invoke('some_command')`. **Dynamic-library-only** distribution should use `invokeNative` / `listenNative` and the agreed method names (e.g. `poll_events`).

## 5. Plugin State Storage

Supports **local state** and **sync state**; `scheme` can be used for multiple JSON stores.

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

> Tip: if `scheme` is omitted, it defaults to `state.json`. Passing `workspace` will create `workspace.json`.
