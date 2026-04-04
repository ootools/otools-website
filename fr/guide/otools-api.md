# API OTools

Tous les plugins utilisent `window.otools` pour accéder aux capacités.

<ApiMatrix />

## 1. Runtime et environnement

```ts
const appName = otools.getAppName();
const appVersion = otools.getAppVersion();
const nativeId = otools.getNativeId();
const pluginUuid = otools.getPluginUuid();

const isDev = otools.isDev();
const platform = otools.isMacOS() ? 'macos' : otools.isWindows() ? 'windows' : 'linux';

const desktopPath = otools.getPath('desktop');
```

## 2. Presse‑papiers et fichiers

```ts
otools.copyText('Hello OTools');
otools.copyFile(['/path/a.txt', '/path/b.png']);
otools.copyImage('data:image/png;base64,...');
const files = otools.getCopyedFiles();
```

## 3. Système et Shell

```ts
otools.showNotification('Build terminé');
otools.shellOpenPath('/Users/you/Desktop');
otools.shellShowItemInFolder('/Users/you/Downloads/file.zip');
otools.shellTrashItem('/Users/you/Downloads/old.log');
otools.shellOpenExternal('https://otools.lingyun.net');
otools.shellBeep();
```

## 4. Appels Native

```ts
const result = await otools.invokeNative('ping', { from: 'plugin' });
const raw = await otools.invokeNativeRaw('echo', { hello: 'world' });

await otools.reloadNative();
const probe = await otools.probeNative();
```

Appels inter‑plugins :

```ts
await otools.invokeNativePlugin('plugin-uuid', 'ping');
await otools.reloadNativePlugin('plugin-uuid');
```

### Hôte `host_dispatch` (bibliothèques dynamiques marketplace)

Si la bibliothèque exporte **`otools_plugin_bind_host`**, l’hôte transmet **`OtoolsNativeHostApiV1`** au chargement (`version >= 2`). En plus de **`invoke` / `free`**, **`host_dispatch`** utilise la même table de capacités que **`dispatch_direct`** dans **`ot-host-dispatch`** (HTTP, état local du plugin, etc.).

- **Entrée** : `capability` en UTF‑8, `request` en JSON (même forme que `dispatch_direct` intégré).
- **Sortie** : `{ "ok": true, "data": ... }` ou `{ "ok": false, "error": "..." }`.
- **Libération** : utiliser **`free`** de la même structure API pour libérer le tampon renvoyé par `host_dispatch`.

Exemples de `capability` : `http.send`, `http.normalize_request`, `http.write_base64_file`, `plugin_state.read`, `plugin_state.save_local` (voir `ot_host_dispatch::caps`).

### Événements natifs (`listenNative`)

Pour les bibliothèques dynamiques du marketplace : l’hôte appelle **`poll_events`** et émet sur **`otools-native:{uuid}`**. Utilisez `listenNative` côté web.

```ts
const unlisten = await otools.listenNative((e) => {
  const { topic, payload } = e.payload;
}, { intervalMs: 200 });
await unlisten();
```

Implémentez **`poll_events`** dans `otools_plugin_invoke` ; renvoyez `data.events` comme tableau `{ topic, payload }`. Les plugins intégrés au binaire peuvent toujours utiliser `invoke('command')`.

## 5. Stockage d’état du plugin

Prend en charge **l’état local** et **l’état synchronisé** ; `scheme` permet plusieurs JSON.

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

> Astuce : si `scheme` est omis, la valeur par défaut est `state.json`. En passant `workspace`, on crée `workspace.json`.
