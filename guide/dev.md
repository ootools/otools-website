# 开发者模式

OTools 提供内置开发者中心，覆盖从创建插件到发布版本的完整流程。

## 1. 创建与绑定

1. 在开发者中心创建插件，填写 Pack ID、名称、摘要等基础信息。
2. 绑定插件开发目录，OTools 会读取 `plugin.json` 并管理运行时信息。
3. 启用调试后，插件会出现在首页 Tabs，可直接打开。

## 2. devUrl 调试

- `devUrl` 支持 `http/https`，适配 Vite、Webpack 等开发服务器。
- 也支持 `index.html` 形式的本地路径，适合纯静态或非框架插件。

## 3. Web SDK 与权限

插件 WebView 默认注入 Node 风格兼容层，可在 `preload.js` 或业务代码中直接调用：

```js
const runtime = require("@otools/runtime");
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");
```

需要高权限能力时，在根目录 `plugin.json` 显式声明：

```json
{
  "permissions": ["fs", "dialog", "shell", "child_process"]
}
```

说明：

- `fs`：开放 `node:fs`、`node:fs/promises`、`@otools/fs`
- `dialog`：开放 `@otools/dialog`
- `shell`：开放 `@otools/shell`
- `child_process`：开放 `node:child_process`、`@otools/child_process`
- 未声明时默认拒绝上述高风险能力；`path`、`os`、`process`、`http/https` 默认可用
- 内置工具页与非插件页面不受该声明限制

## 4. Web/Vue 工程初始化

开发者工具内可一键生成 Vue + Vite 工程骨架：

- `package.json`、`vite.config.ts`、`tsconfig.json`
- `src/main.ts` / `src/App.vue`
- 绑定目录直接作为工程根目录

## 5. Native 原生能力

OTools 支持插件携带 Rust 动态库能力，提升性能上限。

- 初始化原生工程：在绑定目录下生成 `native/` Rust 工程。
- 构建原生库：生成 `lib/` 目录下的动态库文件。
- 独立构建：可在其他系统环境中单独构建对应平台的动态库。

### 仓库目录：`native` 与 `tauri`（可选）

主仓库中部分插件采用 **`plugins/<name>/native`**（业务与 `otools_plugin_invoke` 协议）+ **`plugins/<name>/tauri`**（仅用于**内置**进 OTools 桌面端时注册 `#[tauri::command]`）。  
**插件市场上架包**仍以 **`plugin.json` + 前端资源 + `lib/` 动态库** 为准，**不需要**、也不应打包 `tauri` 子工程：市场安装后走动态库 FFI；内置集成由主程序 Cargo 依赖 `*-tauri` crate 完成。

### 推送事件（`poll_events`）

若第三方希望在**仅动态库**场景下使用类似「监听」的能力，可在 native 中实现 **`poll_events`**，由宿主轮询并在前端通过 **`window.otools.listenNative`** 接收（详见《OTools API》中 Native 事件监听一节）。轮询间隔可由前端 `listenNative` 的 `intervalMs` 传入（宿主限制约 50～10000 ms）。

- Web 层优先仍可用 Tauri `listen` 订阅主程序 `emit` 的频道；**动态库侧**通过 `poll_events` 把待推送事项交给宿主统一 `emit`。

`plugin.json` 中配置：

```json
{
  "native": {
    "enabled": true,
    "libDir": "lib",
    "autoReload": true,
    "libName": "macOS.dylib"
  }
}
```

默认库名：

- macOS: `macOS.dylib`
- Windows: `Windows.dll`
- Linux: `Linux.so`

### 主程序统一 AI 接口

如果插件只需要在 Web 层调用 AI，直接使用 `window.otools.aiGenerateText(...)` 即可，主程序会自动复用全局 AI 配置。

```ts
const result = await window.otools.aiGenerateText({
  systemPrompt: '你是一个插件文档助手。',
  userPrompt: '请为当前插件生成一段更新说明。',
});
```

### Native 插件回调主程序

现在 native 动态库也可以回调 OTools 主程序的统一 AI 接口。宿主在加载动态库时，会尝试调用可选导出函数：

- `otools_plugin_bind_host(host_api_ptr)`

`host_api_ptr` 指向一个 `version=1` 的宿主 API 结构体，内含两个函数指针：

- `invoke(input_ptr, input_len, output_len) -> *mut u8`
- `free(ptr, len)`

native 插件可保存这两个函数指针，然后按 JSON 协议回调宿主：

```json
{
  "method": "ai.generateText",
  "payload": {
    "systemPrompt": "你是原生插件开发助手。",
    "userPrompt": "请总结这段日志。",
    "model": "qwen2.5-coder:14b"
  }
}
```

返回 JSON：

```json
{
  "ok": true,
  "data": {
    "text": "......",
    "provider": "ollama",
    "model": "qwen2.5-coder:14b"
  }
}
```

建议：

- Web 插件优先用 `window.otools.aiGenerateText`。
- native 动态库仅在必须由 Rust 侧直接发起 AI 调用时，再使用宿主回调接口。
- `payload` 中的 `provider` / `baseUrl` / `apiKey` / `model` 都可选；省略时自动继承主程序全局 AI 配置。

## 6. 打包与发布

- 打包时要求插件根目录存在 `logo.png` 与 `plugin.json`。
- 打包成功后会生成插件包，并写入本地市场记录。
- 发布版本需提供下载地址（仅支持 `http/https`）。

## 7. 推荐流程

1. 创建插件并绑定目录
2. 初始化 Web/Vue 工程或纯 HTML
3. 配置 `devUrl` 并开启调试
4. 需要性能时添加 `native` 能力
5. 打包与发布到插件市场
