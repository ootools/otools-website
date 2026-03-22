# Problème courant d'installation sur macOS - Solution à "l'application est endommagée"

Lorsque vous installez OTools ou d'autres applications tierces sur macOS, vous pouvez rencontrer un message similaire à "xxx.app est endommagé, impossible de l'ouvrir, vous devriez le déplacer dans la corbeille". Cela est généralement dû aux paramètres de sécurité de macOS.

## Pourquoi cela se produit-il ?

macOS a un contrôle très strict sur les programmes par rapport à Windows. Les applications non issues de l'App Store affichent souvent des messages comme "xxx.app est endommagé" lors de l'installation. Depuis macOS 10.15, Apple a encore restreint les autorisations pour les applications non signées, ce qui rend ces problèmes plus fréquents.

## Solutions

### Méthode 1 : Paramétrage permettant d'autoriser les applications téléchargées depuis "N'importe où"

1. Ouvrez "Préférences Système -> Sécurité et confidentialité -> Général"
2. Vérifiez si l'option "Autoriser les apps téléchargées depuis" a déjà activé l'option "N'importe où"
3. Si ce n'est pas activé, cliquez sur l'icône du petit cadenas en bas à gauche pour déverrouiller, puis sélectionnez "N'importe où"

![](../../image/mac-security-settings.png)

Si vous ne voyez pas l'option "N'importe où" dans les paramètres, ouvrez le Terminal et entrez la commande suivante :

```bash
sudo spctl --master-disable
```

Entrez le mot de passe de connexion de votre ordinateur comme demandé, puis appuyez sur Entrée. Après cela, vous verrez apparaître l'option "N'importe où" dans les paramètres.

Normalement, après ce paramétrage, l'application peut être installée normalement. Cependant, si votre version de macOS est plus récente, vous devrez peut-être toujours essayer la méthode suivante.

### Méthode 2 : Contourner l'authentification Gatekeeper d'Apple

Si la Méthode 1 ne résout toujours pas le problème, vous pouvez essayer les étapes suivantes :

1. Ouvrez le Terminal
2. Entrez la commande suivante, mais n'appuyez pas encore sur Entrée :

```bash
sudo xattr -rd com.apple.quarantine
```

3. Dans le Finder, localisez OTools.app dans le dossier Applications
4. Glissez OTools.app dans la fenêtre du Terminal, ce qui ajoutera automatiquement le chemin de l'application à la commande
5. Appuyez sur Entrée, entrez votre mot de passe, et une fois terminé, vous pourrez exécuter directement l'application

### Méthode 3 : Clic droit pour ouvrir (adapté pour la première installation)

Pour les premières installations, vous pouvez également essayer :

1. Trouvez OTools.app dans le Finder
2. Cliquez avec le bouton droit (ou maintenez la touche Contrôle enfoncée tout en cliquant)
3. Sélectionnez "Ouvrir"
4. Cliquez sur "Ouvrir" dans la fenêtre contextuelle d'avertissement de sécurité

## Remarques importantes

- OTools est une application de bureau légitime construite à l'aide du framework Tauri
- Votre ordinateur n'est pas affecté par des logiciels malveillants
- Ce problème est causé par les politiques de sécurité d'Apple, et non par l'application elle-même