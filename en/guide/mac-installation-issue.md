# macOS Installation Common Issue - "App Damaged" Solution

When installing OTools or other third-party applications on macOS, you may encounter a prompt similar to "xxx.app is damaged, cannot be opened, you should move it to Trash". This is usually due to macOS security settings.

## Why does this happen?

macOS has very strict control over programs compared to Windows. Non-App Store apps often display prompts like "xxx.app is damaged" during installation. Since macOS 10.15, Apple has further tightened permissions for unsigned applications, making these issues more common.

## Solutions

### Method 1: Setting to allow Apps downloaded from "Anywhere"

1. Open "System Preferences -> Security & Privacy -> General" tab
2. Check if the "Allow apps downloaded from" option already has the "Anywhere" option enabled
3. If not enabled, click the small yellow lock icon at the bottom left to unlock, then select "Anywhere"

![](../../image/mac-security-settings.png)

If you don't see the "Anywhere" option in settings, open Terminal and enter the following command:

```bash
sudo spctl --master-disable
```

Enter your computer's login password as prompted, then press Enter. After this, you'll see the "Anywhere" option appear in the settings.

Usually after this setting, the app can be installed normally. However, if your macOS version is newer, you may still need to try the next method.

### Method 2: Bypass Apple's Gatekeeper Notarization

If Method 1 still doesn't solve the problem, you can try the following steps:

1. Open Terminal
2. Enter the following command, but don't press Enter yet:

```bash
sudo xattr -rd com.apple.quarantine
```

3. In Finder, locate OTools.app in your Applications folder
4. Drag OTools.app into the Terminal window, which will automatically append the app's path to the command
5. Press Enter, enter your password, and after completion you'll be able to run the app directly

### Method 3: Right-click to Open (Suitable for First-time Installation)

For first-time installations, you can also try:

1. Find OTools.app in Finder
2. Right-click (or hold the Control key and click)
3. Select "Open"
4. Click "Open" in the security warning popup

## Important Notes

- OTools is a legitimate desktop application built using the Tauri framework
- Your computer is not affected by malicious software
- This issue is caused by Apple's security policies, not by the application itself