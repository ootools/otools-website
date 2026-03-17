# 开发者模式

OTools 提供内置开发者中心，覆盖从创建插件到发布版本的完整流程。

## 1. 创建与绑定

1. 在开发者中心创建插件，填写 Pack ID、名称、摘要等基础信息。
2. 绑定插件开发目录，OTools 会读取 `plugin.json` 并管理运行时信息。
3. 启用调试后，插件会出现在首页 Tabs，可直接打开。

## 2. devUrl 调试

- `devUrl` 支持 `http/https`，适配 Vite、Webpack 等开发服务器。
- 也支持 `index.html` 形式的本地路径，适合纯静态或非框架插件。

## 3. Web/Vue 工程初始化

开发者工具内可一键生成 Vue + Vite 工程骨架：

- `package.json`、`vite.config.ts`、`tsconfig.json`
- `src/main.ts` / `src/App.vue`
- 绑定目录直接作为工程根目录

## 4. Native 原生能力

OTools 支持插件携带 Rust 动态库能力，提升性能上限。

- 初始化原生工程：在绑定目录下生成 `native/` Rust 工程。
- 构建原生库：生成 `lib/` 目录下的动态库文件。
- 独立构建：可在其他系统环境中单独构建对应平台的动态库。

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

## 5. 打包与发布

- 打包时要求插件根目录存在 `logo.png` 与 `plugin.json`。
- 打包成功后会生成插件包，并写入本地市场记录。
- 发布版本需提供下载地址（仅支持 `http/https`）。

## 6. 推荐流程

1. 创建插件并绑定目录
2. 初始化 Web/Vue 工程或纯 HTML
3. 配置 `devUrl` 并开启调试
4. 需要性能时添加 `native` 能力
5. 打包与发布到插件市场
