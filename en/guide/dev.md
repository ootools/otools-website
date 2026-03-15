# Developer Mode

OTools provides a built-in developer center that covers the full workflow from plugin creation to release.

## 1. Create & Bind

1. Create a plugin in the developer center and fill in Pack ID, name, summary, etc.
2. Bind the plugin development directory; OTools reads `plugin.json` and manages runtime info.
3. Enable debugging to surface the plugin in the home Tabs for quick access.

## 2. devUrl Debugging

- `devUrl` supports `http/https`, compatible with Vite, Webpack, and other dev servers.
- Local `index.html` paths are also supported for static or non-framework plugins.

## 3. Web/Vue Scaffolding

The developer tool can generate a Vue + Vite project scaffold with one click:

- `package.json`, `vite.config.ts`, `tsconfig.json`
- `src/main.ts` / `src/App.vue`
- The bound directory is used as the project root

## 4. Native Capability

OTools supports Rust dynamic libraries for higher performance.

- Initialize native project: creates `native/` Rust project under the bound directory.
- Build native library: generates dynamic libs under `lib/`.
- Standalone build: build platform-specific libs on another system.

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

## 5. Packaging & Release

- Packaging requires `logo.png` and `plugin.json` at the plugin root.
- After packaging, a plugin package is generated and written to the local marketplace record.
- Releases require a download URL (only `http/https`).

## 6. Recommended Workflow

1. Create and bind a plugin
2. Initialize Web/Vue project or use pure HTML
3. Set `devUrl` and enable debugging
4. Add `native` capability for performance needs
5. Package and publish to the marketplace
