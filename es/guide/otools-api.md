# API de OTools

Todos los plugins acceden a las capacidades mediante `window.otools`.

<ApiMatrix />

## 1. Runtime y entorno

```ts
const appName = otools.getAppName();
const appVersion = otools.getAppVersion();
const nativeId = otools.getNativeId();
const pluginUuid = otools.getPluginUuid();

const isDev = otools.isDev();
const platform = otools.isMacOS() ? 'macos' : otools.isWindows() ? 'windows' : 'linux';

const desktopPath = otools.getPath('desktop');
```

## 2. Portapapeles y archivos

```ts
otools.copyText('Hello OTools');
otools.copyFile(['/path/a.txt', '/path/b.png']);
otools.copyImage('data:image/png;base64,...');
const files = otools.getCopyedFiles();
```

## 3. Sistema y Shell

```ts
otools.showNotification('Compilación finalizada');
otools.shellOpenPath('/Users/you/Desktop');
otools.shellShowItemInFolder('/Users/you/Downloads/file.zip');
otools.shellTrashItem('/Users/you/Downloads/old.log');
otools.shellOpenExternal('https://otools.lingyun.net');
otools.shellBeep();
```

## 4. Llamadas Native

```ts
const result = await otools.invokeNative('ping', { from: 'plugin' });
const raw = await otools.invokeNativeRaw('echo', { hello: 'world' });

await otools.reloadNative();
const probe = await otools.probeNative();
```

Llamadas entre plugins:

```ts
await otools.invokeNativePlugin('plugin-uuid', 'ping');
await otools.reloadNativePlugin('plugin-uuid');
```

### Host `host_dispatch` (bibliotecas dinámicas del marketplace)

Si la biblioteca exporta **`otools_plugin_bind_host`**, el host pasa **`OtoolsNativeHostApiV1`** al cargar (`version >= 2`). Además de **`invoke` / `free`**, **`host_dispatch`** usa la misma tabla de capacidades que **`dispatch_direct`** en **`ot-host-dispatch`** (HTTP, estado local del plugin, etc.).

- **Entrada**: `capability` en UTF‑8; `request` JSON (igual forma que `dispatch_direct` integrado).
- **Salida**: `{ "ok": true, "data": ... }` o `{ "ok": false, "error": "..." }`.
- **Liberación**: usar **`free`** de la misma estructura API para liberar el búfer devuelto por `host_dispatch`.

`capability` habituales: `http.send`, `http.normalize_request`, `http.write_base64_file`, `plugin_state.read`, `plugin_state.save_local` (ver `ot_host_dispatch::caps`).

### Eventos nativos (`listenNative`)

Para bibliotecas dinámicas del marketplace: el host llama **`poll_events`** y emite en **`otools-native:{uuid}`**. Use `listenNative` en el frontend.

```ts
const unlisten = await otools.listenNative((e) => {
  const { topic, payload } = e.payload;
}, { intervalMs: 200 });
await unlisten();
```

Implemente **`poll_events`** en `otools_plugin_invoke`; devuelva `data.events` como lista `{ topic, payload }`. Los plugins embebidos pueden seguir usando `invoke('command')`.

## 5. Almacenamiento de estado del plugin

Admite **estado local** y **estado sincronizado**; `scheme` permite múltiples JSON.

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

> Consejo: si no se proporciona `scheme`, el valor por defecto es `state.json`. Con `workspace` se crea `workspace.json`.
