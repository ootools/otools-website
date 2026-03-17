# Kompatibilität

Diese Anleitung richtet sich an Plugin-Autoren, die bereits ein natives Tauri-Projekt haben und denselben Codebestand gleichzeitig für folgende Ziele nutzen möchten:

- Veröffentlichung als eigenständige Desktop-App
- Veröffentlichung als OTools-Plugin

Die empfohlene Vorgehensweise ist nicht, zwei Frontends zu pflegen. Behalte ein gemeinsames Web-Projekt und ergänze die Kompatibilität in Build- und Runtime-Schicht.

## 1. Frontend im offiziellen Tauri-Stil belassen

Nach dem Ansatz von `otools-plugin-sdk` kann der Frontend-Code weiterhin die offiziellen Tauri-APIs verwenden:

```ts
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
```

Danach wird auf Vite-Ebene das Kompatibilitäts-Plugin eingebunden:

```ts
import { defineConfig } from "vite";
import { otoolsTauriShimPlugin } from "otools-plugin-sdk/vite";

export default defineConfig({
  plugins: [otoolsTauriShimPlugin()],
});
```

Vorteile davon:

- die Standalone-Version nutzt weiterhin die Standard-Tauri-Funktionen
- der Plugin-Build schreibt die interne Implementierung von `invoke` / `listen` automatisch um
- der Anwendungscode braucht keine doppelte API-Schicht für Standalone und Plugin

Wenn der Code direkt auf `window.otools` zugreift, ergänze die Typdefinition:

```ts
/// <reference types="otools-plugin-sdk" />
```

Für Funktionen wie Pfade öffnen, Browser öffnen oder Dateiauswahl sollte bevorzugt die SDK-Kompatibilitätsschicht verwendet werden, statt eine Runtime fest zu verdrahten:

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

## 2. Native Fähigkeiten in „Kernbibliothek + zwei Shells“ aufteilen

Wenn das bestehende Tauri-Projekt bereits `src-tauri`-Kommandos besitzt, sollte die Geschäftslogik in ein gemeinsames Rust-Crate verschoben und dann für folgende Ebenen freigegeben werden:

- die Standalone-Tauri-Kommandoebene
- die `native/`-Dynamic-Library-Ebene des OTools-Plugins

Eine robustere Projektstruktur sieht so aus:

```text
project-root/
  src/                 # gemeinsames Frontend
  src-tauri/           # Standalone-Tauri-Shell
  native/              # OTools-Plugin-Native-Shell
  crates/app-core/     # gemeinsamer Rust-Kern
  plugin.json          # OTools-Plugin-Manifest
  vite.config.ts
```

Empfohlene Aufteilung:

- `src/` kümmert sich nur um UI und `invoke` / `listen`
- `crates/app-core/` enthält die eigentliche Geschäftslogik
- `src-tauri/` verwaltet Desktop-Fenster, Menü, Tray und Tauri-Kommando-Registrierung
- `native/` exportiert die von OTools benötigten Dynamic-Library-Schnittstellen

So vermeidest du doppelte Rust-Geschäftslogik in zwei Projektschichten.

## 3. Konfigurationen und Artefakte können parallel existieren

Die ursprüngliche Tauri-Konfiguration bleibt erhalten, zum Beispiel:

- `src-tauri/tauri.conf.json`
- `Cargo.toml`

Für die Veröffentlichung als OTools-Plugin kommen zusätzlich hinzu:

- `plugin.json` im Projektwurzelverzeichnis
- `logo.png`
- `lib/`- oder `native/`-Build-Artefakte, falls native Fähigkeiten benötigt werden

Beide Konfigurationssätze können konfliktfrei nebeneinander existieren:

- die Standalone-Version wird mit `tauri build` veröffentlicht
- die Plugin-Version folgt dem OTools-Paketierungsprozess

Meistens kann das Frontend dieselbe `dist/`-Ausgabe teilen, nur die Host-Runtime unterscheidet sich.

## 4. Empfohlene Grenzen für die Kompatibilisierung

Am besten zuerst anpassen:

- `invoke`
- `listen`
- Dateidialoge
- Pfad öffnen / externen Link öffnen

Weniger geeignet zum direkten Übernehmen:

- Multi-Window-Management
- System-Tray
- Autostart
- Updater
- Logik, die stark an den Desktop-Fensterlebenszyklus gebunden ist

Solche Funktionen sollten in einer Runtime-Adapter-Schicht gekapselt werden und nicht direkt in UI-Seiten verstreut sein.

## 5. Ein empfohlener Migrationspfad

1. Die bestehende Struktur `src/ + src-tauri/` unverändert lassen, damit die Standalone-Version weiter funktioniert.
2. Im Frontend `otools-plugin-sdk` einbinden und `invoke` / `listen` über die Kompatibilitätsschicht vereinheitlichen.
3. Die Rust-Geschäftslogik in ein gemeinsames Crate auslagern, damit Tauri und Plugin-Native nicht doppelt implementiert werden.
4. Im Projektwurzelverzeichnis `plugin.json` hinzufügen und die für OTools-Plugins nötigen Metadaten ergänzen.
5. Host-spezifische Fähigkeiten wie Fenster, Tray und Autostart zuletzt behandeln.
