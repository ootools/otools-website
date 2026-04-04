# OTools API

所有插件统一通过 `window.otools` 调用能力。

<ApiMatrix />

## 1. 运行时与环境信息

```ts
const appName = otools.getAppName();
const appVersion = otools.getAppVersion();
const nativeId = otools.getNativeId();
const pluginUuid = otools.getPluginUuid();

const isDev = otools.isDev();
const platform = otools.isMacOS() ? 'macos' : otools.isWindows() ? 'windows' : 'linux';

const desktopPath = otools.getPath('desktop');
```

## 2. 剪贴板与文件能力

```ts
otools.copyText('Hello OTools');
otools.copyFile(['/path/a.txt', '/path/b.png']);
otools.copyImage('data:image/png;base64,...');
const files = otools.getCopyedFiles();
```

## 3. 系统与 Shell

```ts
otools.showNotification('构建完成');
otools.shellOpenPath('/Users/you/Desktop');
otools.shellShowItemInFolder('/Users/you/Downloads/file.zip');
otools.shellTrashItem('/Users/you/Downloads/old.log');
otools.shellOpenExternal('https://otools.lingyun.net');
otools.shellBeep();
```

## 4. Native 能力调用

```ts
const result = await otools.invokeNative('ping', { from: 'plugin' });
const raw = await otools.invokeNativeRaw('echo', { hello: 'world' });

await otools.reloadNative();
const probe = await otools.probeNative();
```

跨插件调用：

```ts
await otools.invokeNativePlugin('plugin-uuid', 'ping');
await otools.reloadNativePlugin('plugin-uuid');
```

### 宿主 `host_dispatch`（市场动态库）

若动态库导出 **`otools_plugin_bind_host`**，宿主在加载时会传入 **`OtoolsNativeHostApiV1`**（`version >= 2`）。除既有的 **`invoke` / `free`**（例如宿主侧 AI 回调）外，字段 **`host_dispatch`** 与仓库内 **`ot-host-dispatch`** 的 **`dispatch_direct`** 使用同一路由表（HTTP、插件本地状态等），便于市场包与主程序行为一致。

- **入参**：`capability` 为 UTF-8 能力名；`request` 为 JSON 请求体（与内置 `dispatch_direct` 一致）。
- **返回**：JSON，`{ "ok": true, "data": ... }` 或 `{ "ok": false, "error": "..." }`。
- **释放**：用同一 API 结构体中的 **`free`** 释放 `host_dispatch` 返回的缓冲区。

常用 `capability` 字符串：`http.send`、`http.normalize_request`、`http.write_base64_file`、`plugin_state.read`、`plugin_state.save_local`（与 `ot_host_dispatch::caps` 一致）。

### Native 事件监听（listenNative）

适用于**通过插件市场安装、以动态库形式加载**的 native 插件：宿主按间隔调用动态库方法 **`poll_events`**，将返回的事件通过 Tauri 推送到频道 **`otools-native:{当前插件 uuid}`**，前端用 `listenNative` 订阅（内部会注册宿主命令并建立 `listen`）。

```ts
const unlisten = await otools.listenNative((e) => {
  const { topic, payload } = e.payload;
  console.log(topic, payload);
}, { intervalMs: 200 });

// 组件卸载时务必取消订阅（会停止宿主轮询引用计数）
await unlisten();
```

显式指定插件 uuid（例如调试跨插件场景）：

```ts
await otools.listenNativePlugin('other-plugin-uuid', handler, { intervalMs: 300 });
```

动态库需在 `otools_plugin_invoke` 中处理 **`method: "poll_events"`**，成功时建议返回：

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

也支持 `data` 为事件数组；单条事件可使用字段 **`topic`** 或 **`event`**。无事件时返回空数组即可。

> **说明**：内置进主程序的插件仍可优先使用 Tauri `invoke('某_command')`；仅动态库分发时，请使用 `invokeNative` / `listenNative` 与宿主约定的方法名（如 `poll_events`）。

## 5. 插件状态存储

支持 **本地状态** 与 **同步状态** 两套存储；同时支持 `scheme` 形成多份 JSON 存储。

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

> 提示：`scheme` 不传时默认 `state.json`，传入 `workspace` 会生成 `workspace.json`。

## 6. AI 能力

OTools 主程序已将 AI 调用统一封装，Git 提交信息、软著文档、JSON 修复等场景都复用同一套后端接口。

Web 插件可直接通过 `window.otools` 调用：

```ts
const text = await otools.aiGenerateText({
  systemPrompt: '你是一个严谨的 JSON 修复助手。',
  userPrompt: '请将以下内容修复为合法 JSON：{"name":"otools",}',
  temperature: 0.1,
  maxTokens: 1024,
});
```

也可以显式覆盖当前全局 AI 配置：

```ts
const summary = await otools.aiGenerateText({
  provider: 'ollama',
  baseUrl: 'http://127.0.0.1:11434/v1',
  apiKey: 'ollama',
  model: 'qwen2.5-coder:14b',
  systemPrompt: '你是资深 Git 提交信息助手。',
  userPrompt: '请根据以下 diff 生成提交信息：...',
  temperature: 0.2,
  maxTokens: 120,
});
```

说明：

- `provider` / `baseUrl` / `apiKey` / `model` 都是可选项；不传时会自动回落到 OTools 全局 AI 配置。
- `provider` 支持 `openai`、`ollama`、`azure`，以及 `aliyun-bailian` 这类 OpenAI 兼容别名。
- 返回值始终为纯文本字符串，结果清洗与结构化解析由插件自己决定。
