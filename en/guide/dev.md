# Developer Mode

OTools provides a built-in developer center that covers the full workflow from plugin creation to release.

## 1. Create & Bind

1. Create a plugin in the developer center and fill in Pack ID, name, summary, etc.
2. Bind the plugin development directory; OTools reads `plugin.json` and manages runtime info.
3. Enable debugging to surface the plugin in the home Tabs for quick access.

## 2. devUrl Debugging

- `devUrl` supports `http/https`, compatible with Vite, Webpack, and other dev servers.
- Local `index.html` paths are also supported for static or non-framework plugins.

## 3. Web SDK & Permissions

Plugin webviews get a Node-style compatibility runtime by default, so plugin code or `preload.js` can call:

```js
const runtime = require("@otools/runtime");
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");
```

Declare elevated capabilities explicitly in `plugin.json`:

```json
{
  "permissions": ["fs", "dialog", "shell", "child_process"]
}
```

Notes:

- `fs`: enables `node:fs`, `node:fs/promises`, `@otools/fs`
- `dialog`: enables `@otools/dialog`
- `shell`: enables `@otools/shell`
- `child_process`: enables `node:child_process`, `@otools/child_process`
- If not declared, these privileged capabilities are denied by default; `path`, `os`, `process`, and `http/https` remain available
- Built-in tools and non-plugin pages are not restricted by this manifest field

## 4. Web/Vue Scaffolding

The developer tool can generate a Vue + Vite project scaffold with one click:

- `package.json`, `vite.config.ts`, `tsconfig.json`
- `src/main.ts` / `src/App.vue`
- The bound directory is used as the project root

## 5. Native Capability

OTools supports Rust dynamic libraries for higher performance.

- Initialize native project: creates `native/` Rust project under the bound directory.
- Build native library: generates dynamic libs under `lib/`.
- Standalone build: build platform-specific libs on another system.

### Repo layout: `native` vs `tauri` (optional)

In the main repository, some plugins use **`plugins/<name>/native`** (business logic + `otools_plugin_invoke`) plus an optional **`plugins/<name>/tauri`** crate used **only when the plugin is bundled inside the OTools desktop app** to register `#[tauri::command]`.  
**Marketplace packages** are still **`plugin.json` + frontend assets + `lib/` dynamic library** — do **not** ship the `tauri` sub-crate: after marketplace install, the host loads the dylib via FFI; built-in integration is done by the main app depending on the `*-tauri` crate.

### Push-style events (`poll_events`)

Third-party native code loaded **only as a dylib** can expose **`poll_events`**; the host polls it and the frontend consumes events via **`window.otools.listenNative`** (see the OTools API doc, “Native event subscription”). The polling interval can be set with `intervalMs` on `listenNative` (the host clamps roughly 50–10000 ms).

- Web code can still use Tauri `listen` for channels the main app `emit`s; the **dynamic library** feeds pending items through `poll_events`, and the host performs `emit` for the webview.

`plugin.json` configuration:

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

Default library names:

- macOS: `macOS.dylib`
- Windows: `Windows.dll`
- Linux: `Linux.so`

## 6. Packaging & Release

- Packaging requires `logo.png` and `plugin.json` at the plugin root.
- After packaging, a plugin package is generated and written to the local marketplace record.
- Releases require a download URL (only `http/https`).

## 7. Recommended Workflow

1. Create and bind a plugin
2. Initialize Web/Vue project or use pure HTML
3. Set `devUrl` and enable debugging
4. Add `native` capability for performance needs
5. Package and publish to the marketplace
