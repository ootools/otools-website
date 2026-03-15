# 개발자 모드

OTools는 플러그인 생성부터 배포까지 전체 과정을 포함하는 내장 개발자 센터를 제공합니다.

## 1. 생성 및 바인딩

1. 개발자 센터에서 플러그인을 생성하고 Pack ID, 이름, 요약 등을 입력합니다.
2. 개발 디렉터리를 바인딩하면 OTools가 `plugin.json`을 읽고 런타임 정보를 관리합니다.
3. 디버깅을 활성화하면 플러그인이 홈 Tabs에 표시되어 바로 열 수 있습니다.

## 2. devUrl 디버깅

- `devUrl`은 `http/https`를 지원하며 Vite, Webpack 등의 개발 서버에 대응합니다.
- `index.html` 형태의 로컬 경로도 지원해 정적/비프레임워크 플러그인에 적합합니다.

## 3. Web/Vue 프로젝트 초기화

개발자 도구에서 Vue + Vite 스캐폴딩을 원클릭으로 생성할 수 있습니다:

- `package.json`, `vite.config.ts`, `tsconfig.json`
- `src/main.ts` / `src/App.vue`
- 바인딩된 디렉터리를 프로젝트 루트로 사용

## 4. Native 원시 능력

OTools는 Rust 동적 라이브러리를 통한 성능 확장을 지원합니다.

- 원시 프로젝트 초기화: 바인딩 디렉터리에 `native/` Rust 프로젝트 생성
- 원시 라이브러리 빌드: `lib/` 아래 동적 라이브러리 생성
- 독립 빌드: 다른 OS에서 플랫폼별 라이브러리 빌드

`plugin.json` 설정:

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

기본 라이브러리 이름:

- macOS: `macOS.dylib`
- Windows: `Windows.dll`
- Linux: `Linux.so`

## 5. 패키징 및 배포

- 패키징 시 플러그인 루트에 `logo.png`와 `plugin.json`이 필요합니다.
- 성공 시 플러그인 패키지가 생성되고 로컬 마켓 기록에 저장됩니다.
- 배포 버전은 다운로드 URL(`http/https`만) 제공이 필요합니다.

## 6. 권장 흐름

1. 플러그인 생성 및 바인딩
2. Web/Vue 프로젝트 초기화 또는 순수 HTML
3. `devUrl` 설정 후 디버깅 활성화
4. 성능이 필요하면 `native` 기능 추가
5. 패키징 후 마켓에 배포
