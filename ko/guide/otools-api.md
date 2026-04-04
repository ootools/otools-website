# OTools API

모든 플러그인은 `window.otools` 를 통해 기능을 호출합니다.

<ApiMatrix />

## 1. 런타임 및 환경 정보

```ts
const appName = otools.getAppName();
const appVersion = otools.getAppVersion();
const nativeId = otools.getNativeId();
const pluginUuid = otools.getPluginUuid();

const isDev = otools.isDev();
const platform = otools.isMacOS() ? 'macos' : otools.isWindows() ? 'windows' : 'linux';

const desktopPath = otools.getPath('desktop');
```

## 2. 클립보드 및 파일

```ts
otools.copyText('Hello OTools');
otools.copyFile(['/path/a.txt', '/path/b.png']);
otools.copyImage('data:image/png;base64,...');
const files = otools.getCopyedFiles();
```

## 3. 시스템 및 Shell

```ts
otools.showNotification('빌드 완료');
otools.shellOpenPath('/Users/you/Desktop');
otools.shellShowItemInFolder('/Users/you/Downloads/file.zip');
otools.shellTrashItem('/Users/you/Downloads/old.log');
otools.shellOpenExternal('https://otools.lingyun.net');
otools.shellBeep();
```

## 4. Native 기능 호출

```ts
const result = await otools.invokeNative('ping', { from: 'plugin' });
const raw = await otools.invokeNativeRaw('echo', { hello: 'world' });

await otools.reloadNative();
const probe = await otools.probeNative();
```

플러그인 간 호출:

```ts
await otools.invokeNativePlugin('plugin-uuid', 'ping');
await otools.reloadNativePlugin('plugin-uuid');
```

### 호스트 `host_dispatch`(마켓 동적 라이브러리)

동적 라이브러리가 **`otools_plugin_bind_host`**를 export하면 호스트는 로드 시 **`OtoolsNativeHostApiV1`**(`version >= 2`)을 전달합니다. 기존 **`invoke` / `free`** 외에 **`host_dispatch`**는 **`ot-host-dispatch`**의 **`dispatch_direct`**와 동일한 capability 라우팅(HTTP, 플러그인 로컬 상태 등)을 사용합니다.

- **입력**: `capability`는 UTF-8 이름, `request`는 JSON(내장 `dispatch_direct`와 동일 형태).
- **출력**: `{ "ok": true, "data": ... }` 또는 `{ "ok": false, "error": "..." }`.
- **해제**: 같은 API 구조체의 **`free`**로 `host_dispatch` 반환 버퍼 해제.

`capability` 예: `http.send`, `http.normalize_request`, `http.write_base64_file`, `plugin_state.read`, `plugin_state.save_local`(`ot_host_dispatch::caps`와 동일).

### Native 이벤트 구독 (`listenNative`)

마켓플레이스 동적 라이브러리용: 호스트가 **`poll_events`**를 주기 호출하고 **`otools-native:{uuid}`** 채널로 이벤트를 보냅니다.

```ts
const unlisten = await otools.listenNative((e) => {
  const { topic, payload } = e.payload;
}, { intervalMs: 200 });
await unlisten();
```

`otools_plugin_invoke`에서 **`poll_events`** 처리, `data.events`에 `{ topic, payload }` 배열. 메인 앱 내장 플러그인은 `invoke('command')` 계속 사용 가능.

## 5. 플러그인 상태 저장

**로컬 상태** 와 **동기 상태** 를 지원하며, `scheme` 으로 여러 JSON 저장소를 만들 수 있습니다.

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

> 팁: `scheme` 을 생략하면 기본값은 `state.json` 입니다. `workspace` 를 전달하면 `workspace.json` 이 생성됩니다.
