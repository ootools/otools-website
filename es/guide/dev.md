# Modo desarrollador

OTools ofrece un centro de desarrollo integrado que cubre todo el flujo desde la creación del plugin hasta su publicación.

## 1. Crear y vincular

1. Crea un plugin en el centro de desarrollo y completa Pack ID, nombre, resumen, etc.
2. Vincula el directorio de desarrollo; OTools lee `plugin.json` y gestiona la info de runtime.
3. Activa la depuración para que el plugin aparezca en las Tabs de inicio.

## 2. Depuración con devUrl

- `devUrl` soporta `http/https`, compatible con Vite, Webpack, etc.
- También admite rutas locales tipo `index.html` para plugins estáticos.

## 3. Inicialización Web/Vue

El centro de desarrollo puede generar un proyecto Vue + Vite con un clic:

- `package.json`, `vite.config.ts`, `tsconfig.json`
- `src/main.ts` / `src/App.vue`
- El directorio vinculado se usa como raíz del proyecto

## 4. Capacidades Native

OTools admite bibliotecas dinámicas Rust para ampliar el rendimiento.

- Inicializar proyecto nativo: genera `native/` en el directorio vinculado.
- Compilar librería nativa: genera librerías dinámicas en `lib/`.
- Compilación independiente: construir librerías en otro sistema.

Configuración en `plugin.json`:

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

Nombres por defecto:

- macOS: `macOS.dylib`
- Windows: `Windows.dll`
- Linux: `Linux.so`

### Repositorio: `native` y `tauri` (opcional)

En el monorepo puede haber **`plugins/<name>/native`** y un crate **`tauri`** opcional (solo integración en la app). El **paquete del marketplace** sigue siendo **`plugin.json` + front + `lib/`** sin el crate `tauri`.

### Eventos push (`poll_events`)

Con solo biblioteca dinámica, implemente **`poll_events`**; en el front use **`window.otools.listenNative`** (véase la API OTools).

## 5. Empaquetado y publicación

- El empaquetado requiere `logo.png` y `plugin.json` en la raíz del plugin.
- Tras empaquetar, se genera el paquete y se registra en el marketplace local.
- La publicación requiere URL de descarga (solo `http/https`).

## 6. Flujo recomendado

1. Crear y vincular el plugin
2. Inicializar proyecto Web/Vue o HTML puro
3. Configurar `devUrl` y activar depuración
4. Añadir capacidad `native` si se requiere rendimiento
5. Empaquetar y publicar en el marketplace
