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

### ホスト `host_dispatch`（マーケット向け動的ライブラリ）

動的ライブラリが **`otools_plugin_bind_host`** をエクスポートしている場合、ホストは読み込み時に **`OtoolsNativeHostApiV1`**（`version >= 2`）を渡します。既存の **`invoke` / `free`** に加え、**`host_dispatch`** は **`ot-host-dispatch`** の **`dispatch_direct`** と同じ能力ルーティング（HTTP、プラグインローカル状態など）を行います。

- **入力**：`capability` は UTF-8 名、`request` は JSON（ビルトインの `dispatch_direct` と同形）。
- **出力**：`{ "ok": true, "data": ... }` または `{ "ok": false, "error": "..." }`。
- **解放**：同じ API 構造体の **`free`** で `host_dispatch` の戻りバッファを解放。

`capability` の例：`http.send`、`http.normalize_request`、`http.write_base64_file`、`plugin_state.read`、`plugin_state.save_local`（`ot_host_dispatch::caps` と一致）。

### Native イベント購読（`listenNative`）

マーケット経由でインストールされた**動的ライブラリ**向け：ホストが一定間隔で **`poll_events`** を呼び、イベントを Tauri チャンネル **`otools-native:{プラグイン uuid}`** に配信します。フロントは `listenNative` で購読します。

```ts
const unlisten = await otools.listenNative((e) => {
  const { topic, payload } = e.payload;
}, { intervalMs: 200 });

await unlisten();
```

```ts
await otools.listenNativePlugin('other-plugin-uuid', handler, { intervalMs: 300 });
```

`otools_plugin_invoke` で **`poll_events`** を処理し、例：

```json
{
  "ok": true,
  "data": {
    "events": [{ "topic": "progress", "payload": { "percent": 50 } }]
  }
}
```

`topic` または `event` フィールドを使用可能。メインアプリ同梱プラグインは引き続き `invoke('command')` も利用可。

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
