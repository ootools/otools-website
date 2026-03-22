# Häufiges macOS-Installationsproblem - "App ist beschädigt" Lösung

Beim Installieren von OTools oder anderen Drittanbieter-Anwendungen unter macOS kann es vorkommen, dass Sie eine Meldung ähnlich wie "xxx.app ist beschädigt, kann nicht geöffnet werden, Sie sollten es in den Papierkorb verschieben" sehen. Dies liegt in der Regel an den Sicherheitseinstellungen von macOS.

## Warum tritt dieses Problem auf?

macOS hat im Vergleich zu Windows eine sehr strenge Kontrolle über Programme. Nicht aus dem App Store stammende Apps zeigen während der Installation häufig Meldungen wie "xxx.app ist beschädigt". Seit macOS 10.15 hat Apple die Berechtigungen für unsignierte Anwendungen weiter eingeschränkt, wodurch diese Probleme häufiger auftreten.

## Lösungen

### Methode 1: Einstellung zum Zulassen von Apps aus "Beliebigen Quellen"

1. Öffnen Sie "Systemeinstellungen -> Sicherheit und Datenschutz -> Allgemein"
2. Überprüfen Sie, ob bei der Option "Apps heruntergeladen von" bereits die Option "Beliebig" aktiviert ist
3. Falls nicht aktiviert, klicken Sie unten links auf das kleine Schlosssymbol zum Entsperren und wählen Sie dann "Beliebig"

![](../../image/mac-security-settings.png)

Wenn Sie die Option "Beliebig" in den Einstellungen nicht sehen, öffnen Sie das Terminal und geben Sie folgenden Befehl ein:

```bash
sudo spctl --master-disable
```

Geben Sie Ihr Computer-Anmeldekennwort ein und drücken Sie Enter. Danach sehen Sie in den Einstellungen die Option "Beliebig".

Normalerweise kann die App nach dieser Einstellung normal installiert werden. Wenn Ihre macOS-Version jedoch neuer ist, müssen Sie möglicherweise trotzdem die nächste Methode versuchen.

### Methode 2: Umgehen der Gatekeeper-Authentifizierung von Apple

Falls Methode 1 das Problem immer noch nicht löst, können Sie folgende Schritte versuchen:

1. Öffnen Sie das Terminal
2. Geben Sie den folgenden Befehl ein, drücken Sie aber noch nicht Enter:

```bash
sudo xattr -rd com.apple.quarantine
```

3. Suchen Sie im Finder den Ordner "Programme" und finden Sie dort OTools.app
4. Ziehen Sie OTools.app in das Terminalfenster, wodurch automatisch der Pfad der App an den Befehl angehängt wird
5. Drücken Sie Enter, geben Sie Ihr Passwort ein, danach können Sie die App direkt ausführen

### Methode 3: Rechtsklick zum Öffnen (geeignet für die Erstinstallation)

Für Erstinstallationen können Sie auch Folgendes versuchen:

1. Suchen Sie OTools.app im Finder
2. Klicken Sie mit der rechten Maustaste (oder halten Sie die Steuerungstaste gedrückt und klicken Sie)
3. Wählen Sie "Öffnen"
4. Klicken Sie im Sicherheitswarnfenster auf "Öffnen"

## Wichtige Hinweise

- OTools ist eine legitime Desktop-Anwendung, die mit dem Tauri Framework erstellt wurde
- Ihr Computer ist nicht durch Malware beeinträchtigt
- Dieses Problem wird durch die Sicherheitsrichtlinien von Apple verursacht, nicht durch die Anwendung selbst