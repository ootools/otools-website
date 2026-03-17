# Compatibilidad

Esta guía está dirigida a autores de plugins que ya tienen un proyecto Tauri nativo y quieren que el mismo proyecto soporte al mismo tiempo:

- publicación como aplicación de escritorio independiente
- publicación como plugin de OTools

La recomendación no es mantener dos frontends. Mantén un único proyecto Web y añade la compatibilidad en la capa de build y en la capa de runtime.

## 1. Mantener el frontend con el estilo oficial de Tauri

Siguiendo la idea de `otools-plugin-sdk`, el código frontend puede seguir usando las APIs oficiales de Tauri:

```ts
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
```

Después, conecta el plugin de compatibilidad en Vite:

```ts
import { defineConfig } from "vite";
import { otoolsTauriShimPlugin } from "otools-plugin-sdk/vite";

export default defineConfig({
  plugins: [otoolsTauriShimPlugin()],
});
```

Ventajas:

- la versión independiente sigue usando capacidades estándar de Tauri
- el build para plugin reescribe automáticamente la implementación base de `invoke` / `listen`
- el código de negocio no necesita dos versiones de llamadas API para modo independiente y modo plugin

Si el código accede directamente a `window.otools`, añade la declaración de tipos:

```ts
/// <reference types="otools-plugin-sdk" />
```

Para abrir rutas, abrir el navegador o seleccionar archivos, conviene priorizar los wrappers de compatibilidad del SDK en lugar de fijar una sola runtime:

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

## 2. Separar las capacidades nativas en “núcleo compartido + dos shells”

Si el proyecto Tauri original ya tiene comandos en `src-tauri`, se recomienda mover la lógica de negocio a un crate Rust compartido y exponerla desde:

- la capa de comandos Tauri de la versión independiente
- la capa de librería dinámica `native/` del plugin OTools

Una estructura más estable sería:

```text
project-root/
  src/                 # frontend compartido
  src-tauri/           # shell Tauri independiente
  native/              # shell nativo del plugin OTools
  crates/app-core/     # núcleo Rust compartido
  plugin.json          # manifiesto del plugin OTools
  vite.config.ts
```

Sugerencia de responsabilidades:

- `src/` solo se ocupa de la UI y de llamar a `invoke` / `listen`
- `crates/app-core/` contiene la lógica de negocio real
- `src-tauri/` se encarga de ventanas, menú, bandeja y registro de comandos Tauri
- `native/` exporta las interfaces de librería dinámica requeridas por OTools

Así se evita mantener la misma lógica Rust en dos lugares.

## 3. La configuración y los artefactos pueden coexistir

La configuración original de Tauri puede mantenerse, por ejemplo:

- `src-tauri/tauri.conf.json`
- `Cargo.toml`

Para soportar la publicación como plugin OTools, añade además:

- `plugin.json` en la raíz del proyecto
- `logo.png`
- artefactos de build en `lib/` o `native/` si se necesitan capacidades nativas

Ambos conjuntos de configuración pueden coexistir sin conflicto:

- la versión independiente se publica con `tauri build`
- la versión plugin sigue el flujo de empaquetado de OTools

Normalmente el frontend puede compartir la misma salida `dist/`; lo que cambia es el entorno host.

## 4. Límites recomendados para la adaptación

Lo más adecuado para adaptar primero:

- `invoke`
- `listen`
- diálogos de archivo
- abrir ruta / abrir enlace externo

Lo menos recomendable para copiar directamente:

- gestión multiventana
- bandeja del sistema
- autoarranque
- updater
- lógica fuertemente acoplada al ciclo de vida de ventanas de escritorio

Estas capacidades deberían concentrarse en una capa de adaptación de runtime y no dispersarse por las páginas de negocio.

## 5. Una ruta práctica de migración

1. Mantén intacta la estructura `src/ + src-tauri/` para que la versión independiente siga funcionando.
2. Integra `otools-plugin-sdk` en el frontend y unifica `invoke` / `listen` mediante la capa de compatibilidad.
3. Extrae la lógica Rust a un crate compartido para evitar implementaciones duplicadas entre Tauri y native del plugin.
4. Añade `plugin.json` en la raíz y completa los metadatos requeridos por los plugins OTools.
5. Deja para el final las capacidades muy dependientes del host, como ventanas, bandeja y autoarranque.
