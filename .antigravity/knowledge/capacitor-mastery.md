# 📱 Capacitor 8.x Mastery — Kern-Wissen

**Primär-Personas:** ⚛️ Rauno Freiberg, 🖥️ John Carmack  
**Sekundär:** 📡 Cypher SRE, 🕶️ Mr. Robot

> [!IMPORTANT]
> Diese Datei MUSS gelesen werden bei allen Mobile-relevanten Arbeitsaufträgen.
> Capacitor hat ~14K Stars — LLM-Training ist stark limitiert.

---

## Paperclip Capacitor Setup

```
Version:     Capacitor 8.2.0
App ID:      com.[projekt].[app]
App Name:    Paperclip
Web Dir:     dist (Vite Build Output)
iOS Scheme:  https
iOS Target:  iOS 15+
SPM:         Swift Package Manager (NICHT CocoaPods!)
```

### capacitor.config.ts
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.[projekt].[app]',
  appName: 'Paperclip',
  webDir: 'dist',
  server: {
    iosScheme: 'https',     // PFLICHT für CORS + secure APIs
    androidScheme: 'https',
  },
  plugins: {
    Keyboard: { resize: 'none', style: 'dark', resizeOnFullScreen: false },
    StatusBar: { style: 'dark', backgroundColor: '#09090b' },
    SplashScreen: {
      launchAutoHide: false,  // App ruft SplashScreen.hide() explizit
      launchFadeDuration: 200,
      backgroundColor: '#09090b',
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#09090b',
    allowsLinkPreview: false,
  },
};
```

---

## Architektur: Web → Native Bridge

```
┌─────────────────────────┐
│  React App (TypeScript)  │
│  └── Capacitor.Plugins   │
│      └── registerPlugin  │
└───────────┬─────────────┘
            │ JSON over Bridge
┌───────────▼─────────────┐
│  Capacitor Bridge        │
│  (WKWebView ↔ Swift)     │
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│  Swift Plugins           │
│  ├── HealthKitHRVPlugin  │  ← Custom (HealthKit + CoreMotion)
│  ├── AresOrbPlugin       │  ← Custom (SwiftUI Overlay)
│  ├── AudioSessionPlugin  │  ← Custom (AVFoundation)
│  ├── LiquidGlassPlugin   │  ← Custom (iOS 26 Liquid Glass)
│  └── 17 SPM Packages     │  ← Official + Community
└─────────────────────────┘
```

---

## Installierte Capacitor Plugins

### Offizielle (@capacitor/)
| Plugin | Version | Zweck |
|---|---|---|
| `@capacitor/core` | 8.2.0 | Core Runtime |
| `@capacitor/ios` | 8.2.0 | iOS Platform |
| `@capacitor/app` | 8.0.1 | App Lifecycle, URL Handling |
| `@capacitor/camera` | 8.0.2 | Kamera-Zugriff |
| `@capacitor/filesystem` | 8.1.2 | Dateisystem |
| `@capacitor/geolocation` | 8.1.0 | GPS Location |
| `@capacitor/haptics` | 8.0.1 | Haptisches Feedback |
| `@capacitor/keyboard` | 8.0.1 | Keyboard Events |
| `@capacitor/local-notifications` | 8.0.2 | Lokale Notifications |
| `@capacitor/preferences` | 8.0.1 | Key-Value Store |
| `@capacitor/push-notifications` | 8.0.2 | Remote Push (APNs) |
| `@capacitor/splash-screen` | 8.0.1 | Splash Screen Control |
| `@capacitor/status-bar` | 8.0.1 | StatusBar Styling |

### Community
| Plugin | Zweck |
|---|---|
| `@capawesome/capacitor-apple-sign-in` | Apple Sign In |
| `@capawesome/capacitor-background-task` | Background Tasks |
| `@capgo/capacitor-native-biometric` | Face ID / Touch ID |
| `@independo/capacitor-voice-recorder` | Sprachaufnahme |
| `capacitor-native-settings` | iOS Settings öffnen |

---

## SPM (Swift Package Manager) — Capacitor 8

> [!WARNING]
> Capacitor 8 verwendet SPM statt CocoaPods. KEIN `Podfile` mehr!

### Package.swift (ios/App/CapApp-SPM/)
```swift
// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.2.0"),
        .package(name: "CapacitorApp", path: "../../../node_modules/@capacitor/app"),
        // ... weitere Plugins referenzieren ihren node_modules Pfad
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapacitorApp", package: "CapacitorApp"),
                // ...
            ]
        )
    ]
)
```

**WICHTIG:** Diese Datei wird von `npx cap sync` und `npx cap add` automatisch verwaltet.
Manuelle Änderungen NUR für Custom Plugins die NICHT aus npm kommen.

---

## Custom Plugin erstellen (Capacitor 8 Pattern)

### Swift-Seite (ios/App/App/)
```swift
import Foundation
@preconcurrency import Capacitor  // @preconcurrency für Sendable-Compliance

@objc(MyPlugin)
public class MyPlugin: CAPPlugin, CAPBridgedPlugin, @unchecked Sendable {

    public let identifier = "MyPlugin"
    public let jsName = "MyPlugin"          // ← Muss zum registerPlugin() JS-Name matchen
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "doSomething", returnType: CAPPluginReturnPromise),
    ]

    @objc func doSomething(_ call: CAPPluginCall) {
        let value = call.getString("key") ?? "default"
        
        // Async work auf Main Thread:
        DispatchQueue.main.async {
            call.resolve(["result": value])
        }
    }
}
```

### TypeScript-Seite (src/)
```typescript
import { registerPlugin } from '@capacitor/core';

export interface MyPluginPlugin {
  doSomething(options: { key: string }): Promise<{ result: string }>;
}

const MyPlugin = registerPlugin<MyPluginPlugin>('MyPlugin');
export default MyPlugin;
```

### Plugin registrieren (AppDelegate oder automatisch)
```
Ab Capacitor 8: Plugins die CAPBridgedPlugin implementieren werden
AUTOMATISCH registriert. Kein manueller Bridge-Eintrag nötig.
```

---

## CLI Commands

```bash
# Web Assets → iOS kopieren
npx cap sync ios

# Nur Web Assets kopieren (kein Plugin-Update)
npx cap copy ios

# Xcode öffnen
npx cap open ios

# Live Reload (Entwicklung)
npx cap run ios --livereload --external

# Build für TestFlight
# → Xcode: Product → Archive → Distribute (App Store Connect)
```

---

## Paperclip Custom Plugins Übersicht

| Plugin | File | Zweck | Frameworks |
|---|---|---|---|
| `HealthKitHRV` | HealthKitHRVPlugin.swift | HRV, Sleep, Steps, Background Sync | HealthKit, CoreMotion |
| `AresOrb` | AresOrbPlugin.swift | Native SwiftUI Orb Overlay | SwiftUI, UIKit, CoreMotion |
| `AudioSession` | AudioSessionPlugin.swift | AVAudioSession Management | AVFoundation |
| `LiquidGlass` | LiquidGlassPlugin.swift | iOS 26 Liquid Glass Effect | UIKit |

---

## FAQ & Häufige Fehler

| Problem | Ursache | Fix |
|---|---|---|
| Plugin nicht gefunden | jsName stimmt nicht mit registerPlugin überein | jsName und registerPlugin('Name') abgleichen |
| Build-Fehler nach npm install | SPM Packages nicht synchronisiert | `npx cap sync ios` |
| Weißer Screen nach Build | webDir zeigt auf falsches Verzeichnis | `npx cap copy ios` + webDir prüfen |
| StatusBar überlagert Content | contentInset nicht gesetzt | `ios: { contentInset: 'always' }` in config |
| Keyboard schiebt Layout | resize: 'native' auf iOS | `Keyboard: { resize: 'none' }` |
| Audio nur mit Lautstärke | Hardware Mute Switch ignoriert nicht | `AVAudioSession.setCategory(.playback)` |
| Sendable Warning | Capacitor 8 Swift Concurrency | `@preconcurrency import Capacitor` + `@unchecked Sendable` |

---

## Offizielle Docs (für Deep Dive)

| Thema | URL |
|---|---|
| Capacitor Overview | https://capacitorjs.com/docs |
| iOS Platform | https://capacitorjs.com/docs/ios |
| Plugin Creation | https://capacitorjs.com/docs/plugins/creating-plugins |
| iOS Plugin Guide | https://capacitorjs.com/docs/plugins/ios |
| Configuration | https://capacitorjs.com/docs/config |
| CLI Reference | https://capacitorjs.com/docs/cli |
| v8 Migration | https://capacitorjs.com/docs/next/updating/8-0 |
| All Official APIs | https://capacitorjs.com/docs/apis |
