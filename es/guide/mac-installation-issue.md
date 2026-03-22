# Problema común de instalación en macOS - Solución a "la aplicación está dañada"

Cuando instale OTools u otras aplicaciones de terceros en macOS, puede encontrar un mensaje similar a "xxx.app está dañado, no se puede abrir, debería moverlo a la Papelera". Esto generalmente se debe a la configuración de seguridad de macOS.

## ¿Por qué sucede esto?

macOS tiene un control muy estricto sobre los programas en comparación con Windows. Las aplicaciones que no son de la App Store a menudo muestran mensajes como "xxx.app está dañado" durante la instalación. Desde macOS 10.15, Apple ha restringido aún más los permisos para aplicaciones sin firmar, lo que hace que estos problemas sean más frecuentes.

## Soluciones

### Método 1: Configuración para permitir aplicaciones descargadas desde "Cualquier lugar"

1. Abra "Preferencias del Sistema -> Seguridad y privacidad -> General"
2. Verifique si la opción "Permitir apps descargadas desde" ya tiene habilitada la opción "Cualquier lugar"
3. Si no está habilitada, haga clic en el pequeño icono de candado en la parte inferior izquierda para desbloquear, luego seleccione "Cualquier lugar"

![](../../image/mac-security-settings.png)

Si no ve la opción "Cualquier lugar" en la configuración, abra Terminal e introduzca el siguiente comando:

```bash
sudo spctl --master-disable
```

Introduzca la contraseña de inicio de sesión de su computadora según se solicite y presione Intro. Después de eso, verá aparecer la opción "Cualquier lugar" en la configuración.

Normalmente después de esta configuración, la aplicación se puede instalar normalmente. Sin embargo, si su versión de macOS es más reciente, aún podría necesitar intentar el siguiente método.

### Método 2: Evadir la notarización de Gatekeeper de Apple

Si el Método 1 aún no resuelve el problema, puede intentar los siguientes pasos:

1. Abra Terminal
2. Introduzca el siguiente comando, pero no pulse Intro todavía:

```bash
sudo xattr -rd com.apple.quarantine
```

3. En Finder, localice OTools.app en la carpeta Aplicaciones
4. Arrastre OTools.app a la ventana de Terminal, lo que agregará automáticamente la ruta de la aplicación al comando
5. Pulse Intro, introduzca su contraseña y después de completar, podrá ejecutar directamente la aplicación

### Método 3: Clic derecho para Abrir (Adecuado para primera instalación)

Para instalaciones por primera vez, también puede probar:

1. Busque OTools.app en Finder
2. Haga clic derecho (o mantenga presionada la tecla Control mientras hace clic)
3. Seleccione "Abrir"
4. Haga clic en "Abrir" en la ventana emergente de advertencia de seguridad

## Notas Importantes

- OTools es una aplicación de escritorio legítima construida usando el framework Tauri
- Su computadora no está afectada por software malicioso
- Este problema es causado por las políticas de seguridad de Apple, no por la aplicación en sí