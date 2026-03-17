# Compatibility

This guide is for plugin authors who already have a native Tauri project and want the same codebase to support both:

- standalone desktop app distribution
- OTools plugin distribution

The recommended approach is not to maintain two frontends. Keep one Web project and add compatibility at the build layer and runtime layer.

## 1. Keep the frontend in standard Tauri style

Following the `otools-plugin-sdk` approach, the frontend can continue using the official Tauri API:

```ts
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
```

Then add the compatibility plugin in Vite:

```ts
import { defineConfig } from "vite";
import { otoolsTauriShimPlugin } from "otools-plugin-sdk/vite";

export default defineConfig({
  plugins: [otoolsTauriShimPlugin()],
});
```

Benefits of this setup:

- the standalone build still uses standard Tauri capabilities
- the plugin build automatically rewrites the underlying `invoke` / `listen` implementation
- business code does not need separate API calls for standalone and plugin modes

If your code directly accesses `window.otools`, add the type declaration:

```ts
/// <reference types="otools-plugin-sdk" />
```

For actions such as opening paths, opening browsers, and file selection, prefer the SDK compatibility wrappers instead of hard-coding one runtime:

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

## 2. Split native capabilities into a shared core plus two shells

If the original Tauri project already has `src-tauri` commands, move business logic into a shared Rust crate and expose it from:

- the standalone Tauri command layer
- the OTools plugin `native/` dynamic library layer

A more stable project layout looks like this:

```text
project-root/
  src/                 # shared frontend
  src-tauri/           # standalone Tauri shell
  native/              # OTools plugin native shell
  crates/app-core/     # shared Rust core
  plugin.json          # OTools plugin manifest
  vite.config.ts
```

Recommended boundaries:

- `src/` focuses on UI plus `invoke` / `listen`
- `crates/app-core/` contains the actual business logic
- `src-tauri/` handles desktop windows, menu, tray, and Tauri command registration
- `native/` exports the dynamic library interfaces required by OTools

This avoids maintaining duplicate Rust business logic in two places.

## 3. Let configuration and artifacts coexist

Keep the original Tauri configuration, for example:

- `src-tauri/tauri.conf.json`
- `Cargo.toml`

To support OTools plugin distribution, add:

- `plugin.json` at the project root
- `logo.png`
- `lib/` or `native/` build artifacts if native capability is needed

These two sets of configuration can coexist without conflict:

- standalone release uses `tauri build`
- plugin release uses the OTools packaging flow

In most cases the frontend can share the same `dist/` output, with only the host runtime being different.

## 4. Suggested compatibility boundaries

The best capabilities to adapt first:

- `invoke`
- `listen`
- file dialogs
- open path / open external URL

The least suitable capabilities to copy directly:

- multi-window management
- system tray
- auto start
- updater
- logic tightly bound to desktop window lifecycle

Keep those host-specific capabilities inside a runtime adapter layer instead of scattering them through UI pages.

## 5. A practical migration path

1. Keep the existing `src/ + src-tauri/` structure untouched so the standalone build stays available.
2. Add `otools-plugin-sdk` on the frontend and unify `invoke` / `listen` through the compatibility layer.
3. Move Rust business logic into a shared crate to avoid duplicate implementations between Tauri and plugin native code.
4. Add `plugin.json` at the root and fill in the metadata required by OTools plugins.
5. Handle host-specific capabilities such as windows, tray, and auto start at the end.
