# 開発者モード

OTools には、プラグインの作成から公開までをカバーする内蔵の開発者センターがあります。

## 1. 作成とバインド

1. 開発者センターでプラグインを作成し、Pack ID、名称、概要などを入力します。
2. 開発ディレクトリをバインドすると、OTools が `plugin.json` を読み取り、実行時情報を管理します。
3. デバッグを有効にすると、プラグインがホーム Tabs に表示され、すぐに開けます。

## 2. devUrl デバッグ

- `devUrl` は `http/https` をサポートし、Vite や Webpack などの開発サーバーに対応します。
- `index.html` のローカルパスにも対応し、静的/非フレームワークのプラグインに適しています。

## 3. Web/Vue 工程の初期化

開発者ツールから Vue + Vite のひな形をワンクリックで生成できます：

- `package.json`、`vite.config.ts`、`tsconfig.json`
- `src/main.ts` / `src/App.vue`
- バインドしたディレクトリをそのままプロジェクトルートに使用

## 4. Native 原生能力

OTools は Rust 動的ライブラリによる性能拡張に対応しています。

- 原生プロジェクト初期化：バインドディレクトリに `native/` Rust 工程を生成。
- 原生ライブラリ構築：`lib/` 配下に動的ライブラリを生成。
- 独立構築：他の OS で対象プラットフォームのライブラリをビルド。

`plugin.json` の設定：

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

デフォルトのライブラリ名：

- macOS: `macOS.dylib`
- Windows: `Windows.dll`
- Linux: `Linux.so`

## 5. パッケージングと公開

- パッケージングにはプラグインルートに `logo.png` と `plugin.json` が必要です。
- 成功するとプラグインパッケージが生成され、ローカル市場記録に書き込みます。
- 公開にはダウンロード URL（`http/https` のみ）が必要です。

## 6. 推奨フロー

1. プラグイン作成とバインド
2. Web/Vue 工程の初期化または純 HTML
3. `devUrl` を設定してデバッグ有効化
4. 必要に応じて `native` 能力を追加
5. パッケージングと市場公開
