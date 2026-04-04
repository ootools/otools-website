# Entwicklermodus

OTools bietet ein integriertes Entwicklerzentrum, das den gesamten Ablauf von der Plugin‑Erstellung bis zur Veröffentlichung abdeckt.

## 1. Erstellen & Binden

1. Plugin im Entwicklerzentrum erstellen und Pack ID, Name, Zusammenfassung ausfüllen.
2. Entwicklungsverzeichnis binden; OTools liest `plugin.json` und verwaltet Runtime‑Infos.
3. Debugging aktivieren, damit das Plugin in den Home‑Tabs erscheint.

## 2. devUrl‑Debugging

- `devUrl` unterstützt `http/https` und ist kompatibel mit Vite, Webpack usw.
- Lokale `index.html`‑Pfade sind ebenfalls möglich (statische Plugins).

## 3. Web/Vue‑Initialisierung

Das Entwicklerzentrum kann mit einem Klick ein Vue + Vite‑Grundgerüst erzeugen:

- `package.json`, `vite.config.ts`, `tsconfig.json`
- `src/main.ts` / `src/App.vue`
- Das gebundene Verzeichnis dient als Projekt‑Root

## 4. Native‑Fähigkeiten

OTools unterstützt Rust‑Dynamic‑Libs für höhere Performance.

- Native‑Projekt initialisieren: `native/` Rust‑Projekt im gebundenen Verzeichnis.
- Native‑Library bauen: Dynamic‑Libs unter `lib/`.
- Standalone‑Build: Plattform‑Libs auf anderem System bauen.

`plugin.json`‑Konfiguration:

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

Standard‑Bibliotheksnamen:

- macOS: `macOS.dylib`
- Windows: `Windows.dll`
- Linux: `Linux.so`

### Repository: `native` und `tauri` (optional)

Im Hauptrepo gibt es **`plugins/<name>/native`** und optional **`plugins/<name>/tauri`** (nur Einbindung in die Desktop‑App). **Marktplatz‑Pakete** bleiben **`plugin.json` + Frontend + `lib/`** — ohne `tauri`‑Crate.

### Push‑Ereignisse (`poll_events`)

Bei reiner Dynamic Library **`poll_events`** implementieren; Frontend: **`window.otools.listenNative`** (siehe OTools‑API‑Dokumentation).

## 5. Packaging & Veröffentlichung

- Packaging erfordert `logo.png` und `plugin.json` im Plugin‑Root.
- Nach dem Packaging wird ein Paket erzeugt und im lokalen Marketplace registriert.
- Veröffentlichung benötigt eine Download‑URL (nur `http/https`).

## 6. Empfohlener Ablauf

1. Plugin erstellen und binden
2. Web/Vue‑Projekt initialisieren oder reines HTML
3. `devUrl` setzen und Debugging aktivieren
4. Bei Bedarf `native` hinzufügen
5. Packagen und im Marketplace veröffentlichen
