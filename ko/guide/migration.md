# 호환

이 문서는 이미 네이티브 Tauri 프로젝트를 가지고 있으면서, 같은 코드베이스로 아래 두 가지를 동시에 지원하려는 플러그인 작성자를 위한 가이드입니다.

- 독립 실행형 데스크톱 앱 배포
- OTools 플러그인 배포

권장 방식은 프런트엔드를 두 벌로 유지하는 것이 아닙니다. 하나의 Web 프로젝트를 유지하고, 빌드 계층과 런타임 계층에서 호환 처리를 추가하는 편이 좋습니다.

## 1. 프런트엔드는 Tauri 공식 방식 유지

`otools-plugin-sdk`의 방식처럼 프런트엔드 코드는 계속 공식 Tauri API를 사용할 수 있습니다.

```ts
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
```

그다음 Vite 계층에 호환 플러그인을 연결합니다.

```ts
import { defineConfig } from "vite";
import { otoolsTauriShimPlugin } from "otools-plugin-sdk/vite";

export default defineConfig({
  plugins: [otoolsTauriShimPlugin()],
});
```

이 방식의 장점:

- 독립 버전은 계속 표준 Tauri 기능을 사용한다
- 플러그인 빌드에서는 `invoke` / `listen`의 내부 구현이 자동으로 치환된다
- 비즈니스 코드에서 독립 버전 / 플러그인 버전을 위해 API 호출을 두 벌로 나눌 필요가 없다

비즈니스 코드가 `window.otools`를 직접 사용한다면 타입 선언만 추가하면 됩니다.

```ts
/// <reference types="otools-plugin-sdk" />
```

경로 열기, 브라우저 열기, 파일 선택 같은 기능은 특정 런타임 하나에 고정하기보다 SDK의 호환 래퍼를 우선 사용하는 것을 권장합니다.

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

## 2. 네이티브 기능은 “공유 코어 + 두 개의 셸”로 분리

기존 Tauri 프로젝트에 `src-tauri` 명령이 있다면, 비즈니스 로직을 공유 Rust crate로 분리하고 다음 두 레이어에서 각각 노출하는 구성이 좋습니다.

- 독립 버전 Tauri 명령 레이어
- OTools 플러그인의 `native/` 동적 라이브러리 레이어

보다 안정적인 구조 예시는 다음과 같습니다.

```text
project-root/
  src/                 # 공용 프런트엔드
  src-tauri/           # 독립 버전 Tauri 셸
  native/              # OTools 플러그인 네이티브 셸
  crates/app-core/     # 공용 Rust 코어
  plugin.json          # OTools 플러그인 설명 파일
  vite.config.ts
```

권장 역할 분리:

- `src/`는 화면과 `invoke` / `listen` 호출만 담당
- `crates/app-core/`는 실제 비즈니스 로직 담당
- `src-tauri/`는 데스크톱 창, 메뉴, 트레이, Tauri 명령 등록 담당
- `native/`는 OTools가 요구하는 동적 라이브러리 인터페이스 담당

이렇게 하면 Rust 비즈니스 코드를 두 군데에서 중복 유지할 필요가 없습니다.

## 3. 설정과 산출물은 함께 공존할 수 있음

기존 Tauri 설정은 그대로 유지하면 됩니다. 예:

- `src-tauri/tauri.conf.json`
- `Cargo.toml`

OTools 플러그인 배포를 지원하려면 추가로 다음을 준비합니다.

- 프로젝트 루트의 `plugin.json`
- `logo.png`
- 네이티브 기능이 필요하다면 `lib/` 또는 `native/` 빌드 산출물

두 종류의 설정 파일은 충돌 없이 함께 존재할 수 있습니다.

- 독립 버전 배포는 `tauri build`
- 플러그인 버전 배포는 OTools 패키징 흐름 사용

프런트엔드는 보통 같은 `dist/` 출력물을 공유할 수 있고, 달라지는 것은 호스트 런타임뿐입니다.

## 4. 호환 개조 시 경계 제안

먼저 호환하기 좋은 기능:

- `invoke`
- `listen`
- 파일 대화상자
- 경로 열기 / 외부 링크 열기

직접 옮기기 덜 적합한 기능:

- 다중 창 관리
- 시스템 트레이
- 자동 시작
- Updater
- 데스크톱 창 생명주기에 강하게 의존하는 로직

이런 기능은 비즈니스 페이지 곳곳에 흩뿌리지 말고, 런타임 어댑터 계층에 모아두는 것을 권장합니다.

## 5. 추천 마이그레이션 경로

1. 기존 `src/ + src-tauri/` 구조는 유지해서 독립 버전이 계속 동작하게 둡니다.
2. 프런트엔드에 `otools-plugin-sdk`를 도입하고 `invoke` / `listen`을 호환 계층으로 통일합니다.
3. Rust 비즈니스 로직을 공유 crate로 옮겨 Tauri와 플러그인 native 사이의 중복 구현을 피합니다.
4. 루트에 `plugin.json`을 추가하고 OTools 플러그인에 필요한 메타데이터를 채웁니다.
5. 마지막에 창, 트레이, 자동 시작처럼 호스트 의존성이 큰 기능을 처리합니다.
