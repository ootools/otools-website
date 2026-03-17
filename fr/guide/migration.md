# Compatibilité

Ce guide s’adresse aux auteurs de plugins qui disposent déjà d’un projet Tauri natif et souhaitent qu’un même projet prenne en charge à la fois :

- la publication en application desktop autonome
- la publication en plugin OTools

L’approche recommandée n’est pas de maintenir deux frontends. Conservez un seul projet Web et ajoutez la compatibilité au niveau du build et du runtime.

## 1. Conserver le frontend dans le style officiel Tauri

En suivant l’approche de `otools-plugin-sdk`, le frontend peut continuer à utiliser les APIs officielles de Tauri :

```ts
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
```

Ajoutez ensuite le plugin de compatibilité côté Vite :

```ts
import { defineConfig } from "vite";
import { otoolsTauriShimPlugin } from "otools-plugin-sdk/vite";

export default defineConfig({
  plugins: [otoolsTauriShimPlugin()],
});
```

Avantages :

- la version autonome continue d’utiliser les capacités Tauri standard
- le build plugin réécrit automatiquement l’implémentation sous-jacente de `invoke` / `listen`
- le code métier n’a pas besoin de maintenir deux jeux d’appels API

Si votre code accède directement à `window.otools`, ajoutez la déclaration de types :

```ts
/// <reference types="otools-plugin-sdk" />
```

Pour l’ouverture de chemins, du navigateur ou les sélecteurs de fichiers, privilégiez les wrappers de compatibilité du SDK plutôt que de coder en dur un seul runtime :

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

## 2. Séparer les capacités natives en « cœur partagé + deux shells »

Si le projet Tauri d’origine possède déjà des commandes dans `src-tauri`, il est recommandé d’extraire la logique métier dans un crate Rust partagé, puis de l’exposer depuis :

- la couche de commandes Tauri de la version autonome
- la couche de bibliothèque dynamique `native/` du plugin OTools

Une organisation plus robuste ressemble à ceci :

```text
project-root/
  src/                 # frontend partagé
  src-tauri/           # shell Tauri autonome
  native/              # shell natif du plugin OTools
  crates/app-core/     # cœur Rust partagé
  plugin.json          # manifeste du plugin OTools
  vite.config.ts
```

Répartition conseillée :

- `src/` se limite à l’UI et aux appels `invoke` / `listen`
- `crates/app-core/` contient la vraie logique métier
- `src-tauri/` gère fenêtres desktop, menu, tray et enregistrement des commandes Tauri
- `native/` exporte les interfaces de bibliothèque dynamique requises par OTools

Cela évite de maintenir deux copies de la logique métier Rust.

## 3. Les configurations et artefacts peuvent coexister

La configuration Tauri d’origine peut rester en place, par exemple :

- `src-tauri/tauri.conf.json`
- `Cargo.toml`

Pour prendre en charge la publication en plugin OTools, ajoutez aussi :

- `plugin.json` à la racine du projet
- `logo.png`
- des artefacts `lib/` ou `native/` si des capacités natives sont nécessaires

Les deux ensembles de configuration peuvent coexister sans conflit :

- la version autonome se publie avec `tauri build`
- la version plugin suit le flux de packaging OTools

Le frontend peut généralement partager la même sortie `dist/`, seule la runtime hôte change.

## 4. Frontières de compatibilité recommandées

À adapter en priorité :

- `invoke`
- `listen`
- les dialogues de fichiers
- ouvrir un chemin / ouvrir un lien externe

À éviter de recopier directement :

- gestion multi‑fenêtres
- system tray
- démarrage automatique
- updater
- logique fortement liée au cycle de vie des fenêtres desktop

Ce type de capacité doit être centralisé dans une couche d’adaptation runtime et non dispersé dans les pages métier.

## 5. Un chemin de migration recommandé

1. Conserver `src/ + src-tauri/` tel quel afin que la version autonome continue de fonctionner.
2. Intégrer `otools-plugin-sdk` dans le frontend et unifier `invoke` / `listen` via la couche de compatibilité.
3. Déplacer la logique Rust dans un crate partagé pour éviter des implémentations dupliquées entre Tauri et le native plugin.
4. Ajouter `plugin.json` à la racine et compléter les métadonnées requises par OTools.
5. Traiter en dernier les capacités très dépendantes de l’hôte, comme les fenêtres, le tray et le démarrage automatique.
