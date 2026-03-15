# Mode développeur

OTools propose un centre développeur intégré couvrant tout le flux, de la création du plugin à la publication.

## 1. Création et liaison

1. Créez un plugin dans le centre développeur et renseignez Pack ID, nom, résumé, etc.
2. Liez le répertoire de développement : OTools lit `plugin.json` et gère les infos runtime.
3. Activez le débogage pour afficher le plugin dans les Tabs de l’accueil.

## 2. Débogage devUrl

- `devUrl` supporte `http/https`, compatible Vite, Webpack, etc.
- Les chemins locaux `index.html` sont aussi pris en charge pour les plugins statiques.

## 3. Initialisation Web/Vue

Le centre développeur peut générer une base Vue + Vite en un clic :

- `package.json`, `vite.config.ts`, `tsconfig.json`
- `src/main.ts` / `src/App.vue`
- Le répertoire lié devient la racine du projet

## 4. Capacités Native

OTools supporte les bibliothèques dynamiques Rust pour augmenter les performances.

- Init projet natif : crée un projet Rust `native/` dans le répertoire lié.
- Build natif : génère les bibliothèques dynamiques dans `lib/`.
- Build autonome : compiler les libs sur un autre système.

Configuration `plugin.json` :

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

Noms de bibliothèques par défaut :

- macOS: `macOS.dylib`
- Windows: `Windows.dll`
- Linux: `Linux.so`

## 5. Packaging & publication

- Le packaging exige `logo.png` et `plugin.json` à la racine du plugin.
- Le package généré est enregistré dans le marketplace local.
- La publication requiert une URL de téléchargement (`http/https` uniquement).

## 6. Flux recommandé

1. Créer et lier un plugin
2. Initialiser un projet Web/Vue ou HTML statique
3. Configurer `devUrl` et activer le débogage
4. Ajouter `native` si besoin de performance
5. Packager et publier sur le marketplace
