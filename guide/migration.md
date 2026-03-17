# 兼容

本文面向已经有原生 Tauri 工程的插件作者，目标是让同一套项目同时支持：

- 独立桌面应用发布
- OTools 插件发布

推荐做法不是维护两套前端，而是保留一套 Web 工程，在构建层和运行时做兼容适配。

## 1. 前端层保持 Tauri 官方写法

参考 `otools-plugin-sdk` 的思路，前端代码继续使用官方 Tauri API：

```ts
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
```

然后在 Vite 层接入兼容插件：

```ts
import { defineConfig } from "vite";
import { otoolsTauriShimPlugin } from "otools-plugin-sdk/vite";

export default defineConfig({
  plugins: [otoolsTauriShimPlugin()],
});
```

这样做的好处：

- 独立版运行时仍然走标准 Tauri 能力
- 插件版构建后会自动改写 `invoke` / `listen` 的底层实现
- 业务代码不需要为“独立版 / 插件版”写两套 API 调用

如果业务代码直接访问 `window.otools`，补上类型声明即可：

```ts
/// <reference types="otools-plugin-sdk" />
```

对于打开路径、打开浏览器、文件选择等能力，推荐优先走 SDK 的兼容封装，而不是直接写死某一侧运行时：

```ts
import {
  isOtoolsPluginRuntime,
  openExternal,
  openPath,
  pickDirectory,
  pickFile,
  saveFile,
} from "otools-plugin-sdk";
```

## 2. 原生能力建议拆成“核心库 + 两层壳”

如果原 Tauri 工程有 `src-tauri` 命令，推荐把业务逻辑抽到共享 Rust crate，再分别给：

- 独立版 Tauri 命令层
- OTools 插件 `native/` 动态库层

一个更稳的组织方式如下：

```text
project-root/
  src/                 # 共用前端
  src-tauri/           # 独立版 Tauri 壳
  native/              # OTools 插件原生壳
  crates/app-core/     # 共用 Rust 核心能力
  plugin.json          # OTools 插件描述
  vite.config.ts
```

建议：

- `src/` 只关心页面和调用 `invoke` / `listen`
- `crates/app-core/` 放真正的业务逻辑
- `src-tauri/` 负责桌面窗口、菜单、托盘、Tauri 命令注册
- `native/` 负责导出 OTools 需要的动态库接口

这样可以避免以后修一个功能，要同时改两份 Rust 业务代码。

## 3. 配置与产物可以并存

原 Tauri 工程本身的配置继续保留，例如：

- `src-tauri/tauri.conf.json`
- `Cargo.toml`

要支持 OTools 插件发布时，再额外补充：

- 根目录 `plugin.json`
- `logo.png`
- 如需原生能力则提供 `lib/` 或 `native/` 构建产物

两套配置文件可以同时存在，并不冲突：

- 独立版发布走 `tauri build`
- 插件版发布走 OTools 的打包流程

前端通常可以共用同一份 `dist/` 输出，只是在宿主环境不同。

## 4. 兼容改造时的边界建议

最适合先做兼容的能力：

- `invoke`
- `listen`
- 文件对话框
- 打开路径 / 打开外链

最不建议直接硬搬的能力：

- 多窗口管理
- 系统托盘
- 自启动
- Updater
- 强依赖桌面窗口生命周期的逻辑

建议把这类能力收敛到运行时适配层，不要散落在业务页面里。

## 5. 一个推荐迁移路径

1. 保留原有 `src/ + src-tauri/` 不动，先让独立版继续可用。
2. 前端接入 `otools-plugin-sdk`，把 `invoke` / `listen` 统一到兼容层。
3. 将 Rust 业务逻辑抽到共享 crate，避免 Tauri 与插件 native 双份实现。
4. 在根目录新增 `plugin.json`，补齐 OTools 插件所需元信息。
5. 最后再处理窗口、托盘、自启动等强宿主相关能力。
