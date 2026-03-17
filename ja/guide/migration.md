# 互換

このガイドは、すでにネイティブな Tauri プロジェクトを持っていて、同じコードベースで次の両方をサポートしたいプラグイン作者向けです。

- 独立したデスクトップアプリとしての配布
- OTools プラグインとしての配布

推奨されるやり方は、フロントエンドを 2 つ保守することではありません。1 つの Web プロジェクトを維持し、ビルド層と実行時層で互換対応を加えます。

## 1. フロントエンドは Tauri 公式の書き方を維持する

`otools-plugin-sdk` の考え方に合わせて、フロントエンドは引き続き公式の Tauri API を使えます。

```ts
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
```

そのうえで、Vite 側に互換プラグインを追加します。

```ts
import { defineConfig } from "vite";
import { otoolsTauriShimPlugin } from "otools-plugin-sdk/vite";

export default defineConfig({
  plugins: [otoolsTauriShimPlugin()],
});
```

この構成の利点:

- 独立版は引き続き標準の Tauri 能力を使える
- プラグイン版ビルドでは `invoke` / `listen` の内部実装が自動で差し替わる
- 業務コード側で独立版 / プラグイン版の 2 系統 API を書き分けなくてよい

もし `window.otools` を直接使うなら、型定義を追加します。

```ts
/// <reference types="otools-plugin-sdk" />
```

パスを開く、ブラウザを開く、ファイル選択などの機能では、どちらか一方の実行時に固定するのではなく SDK の互換ラッパーを優先するのがおすすめです。

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

## 2. ネイティブ能力は「共通コア + 2 つのシェル」に分ける

元の Tauri プロジェクトに `src-tauri` のコマンドがあるなら、業務ロジックを共通 Rust crate に切り出し、次の 2 層から使えるようにするのがおすすめです。

- 独立版 Tauri のコマンド層
- OTools プラグインの `native/` 動的ライブラリ層

より安定した構成例:

```text
project-root/
  src/                 # 共通フロントエンド
  src-tauri/           # 独立版 Tauri シェル
  native/              # OTools プラグイン用ネイティブシェル
  crates/app-core/     # 共通 Rust コア
  plugin.json          # OTools プラグイン記述
  vite.config.ts
```

役割分担の目安:

- `src/` は画面と `invoke` / `listen` 呼び出しに集中する
- `crates/app-core/` に本当の業務ロジックを置く
- `src-tauri/` はデスクトップウィンドウ、メニュー、トレイ、Tauri コマンド登録を担当する
- `native/` は OTools が必要とする動的ライブラリのインターフェースを公開する

こうすると Rust の業務コードを 2 箇所で重複保守せずに済みます。

## 3. 設定と成果物は共存できる

元の Tauri 設定はそのまま残せます。たとえば:

- `src-tauri/tauri.conf.json`
- `Cargo.toml`

OTools プラグイン配布に対応するためには、追加で次を用意します。

- プロジェクトルートの `plugin.json`
- `logo.png`
- ネイティブ能力が必要な場合の `lib/` または `native/` ビルド成果物

2 系統の設定は競合せず共存できます。

- 独立版の配布は `tauri build`
- プラグイン版の配布は OTools のパッケージングフロー

多くの場合、フロントエンドは同じ `dist/` 出力を共有でき、違うのはホスト実行環境だけです。

## 4. 互換化で切り分けるべき境界

先に対応しやすい能力:

- `invoke`
- `listen`
- ファイルダイアログ
- パスを開く / 外部リンクを開く

そのまま持ち込みにくい能力:

- マルチウィンドウ管理
- システムトレイ
- 自動起動
- Updater
- デスクトップウィンドウのライフサイクルに強く依存するロジック

こうした能力は業務ページに散らさず、実行時アダプタ層へ集約するのがおすすめです。

## 5. おすすめの移行手順

1. まず既存の `src/ + src-tauri/` はそのままにして、独立版が引き続き動く状態を保つ。
2. フロントエンドに `otools-plugin-sdk` を導入し、`invoke` / `listen` を互換層へ統一する。
3. Rust の業務ロジックを共通 crate へ移し、Tauri とプラグイン native の二重実装を避ける。
4. ルートに `plugin.json` を追加し、OTools プラグインに必要なメタ情報を埋める。
5. 最後に、ウィンドウ、トレイ、自動起動などホスト依存の強い能力を処理する。
