# API OTools

Все плагины вызывают возможности через `window.otools`.

<ApiMatrix />

## 1. Runtime и окружение

```ts
const appName = otools.getAppName();
const appVersion = otools.getAppVersion();
const nativeId = otools.getNativeId();
const pluginUuid = otools.getPluginUuid();

const isDev = otools.isDev();
const platform = otools.isMacOS() ? 'macos' : otools.isWindows() ? 'windows' : 'linux';

const desktopPath = otools.getPath('desktop');
```

## 2. Буфер обмена и файлы

```ts
otools.copyText('Hello OTools');
otools.copyFile(['/path/a.txt', '/path/b.png']);
otools.copyImage('data:image/png;base64,...');
const files = otools.getCopyedFiles();
```

## 3. Система и Shell

```ts
otools.showNotification('Сборка завершена');
otools.shellOpenPath('/Users/you/Desktop');
otools.shellShowItemInFolder('/Users/you/Downloads/file.zip');
otools.shellTrashItem('/Users/you/Downloads/old.log');
otools.shellOpenExternal('https://otools.lingyun.net');
otools.shellBeep();
```

## 4. Вызовы Native

```ts
const result = await otools.invokeNative('ping', { from: 'plugin' });
const raw = await otools.invokeNativeRaw('echo', { hello: 'world' });

await otools.reloadNative();
const probe = await otools.probeNative();
```

Вызовы между плагинами:

```ts
await otools.invokeNativePlugin('plugin-uuid', 'ping');
await otools.reloadNativePlugin('plugin-uuid');
```

### Хост `host_dispatch` (динамические библиотеки маркетплейса)

Если библиотека экспортирует **`otools_plugin_bind_host`**, хост при загрузке передаёт **`OtoolsNativeHostApiV1`** (`version >= 2`). Помимо **`invoke` / `free`**, поле **`host_dispatch`** использует ту же таблицу возможностей, что и **`dispatch_direct`** в **`ot-host-dispatch`** (HTTP, локальное состояние плагина и т.д.).

- **Вход**: `capability` — UTF‑8; `request` — JSON (как у встроенного `dispatch_direct`).
- **Выход**: `{ "ok": true, "data": ... }` или `{ "ok": false, "error": "..." }`.
- **Освобождение**: буфер, возвращённый `host_dispatch`, освобождать через **`free`** той же структуры API.

Типичные `capability`: `http.send`, `http.normalize_request`, `http.write_base64_file`, `plugin_state.read`, `plugin_state.save_local` (см. `ot_host_dispatch::caps`).

### События native (`listenNative`)

Для динамических библиотек из маркетплейса: хост вызывает **`poll_events`** и шлёт события в канал **`otools-native:{uuid}`**. На фронте — `listenNative`.

```ts
const unlisten = await otools.listenNative((e) => {
  const { topic, payload } = e.payload;
}, { intervalMs: 200 });
await unlisten();
```

Обработайте **`poll_events`** в `otools_plugin_invoke`; верните `data.events` как массив `{ topic, payload }`. Встроенные в приложение плагины по-прежнему могут использовать `invoke('command')`.

## 5. Хранение состояния плагина

Поддерживаются **локальное состояние** и **синхронное состояние**; `scheme` позволяет несколько JSON‑хранилищ.

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

> Подсказка: если `scheme` не указан, используется `state.json`. Передайте `workspace`, чтобы получить `workspace.json`.
