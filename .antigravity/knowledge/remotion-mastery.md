# 🎬 Remotion Mastery — Jonah Jansen Knowledge File

> **Zweck:** Ergänzendes Nischen-Wissen das im LLM-Training unterrepräsentiert ist.
> Remotion hat ~13K GitHub Stars vs React 228K — proportional weniger Trainingsdaten.
> Dieses File ist PFLICHTLEKTÜRE für Jonah UND jeden der Remotion-Code berührt.

---

## ⚠️ BREAKING CHANGES (v4.x → aktuell)

### `<Audio>` → `<Html5Audio>` Rename
```
ALT (deprecated):
import { Audio } from "remotion";
<Audio src={staticFile("music.mp3")} />

NEU:
import { Html5Audio } from "remotion";
<Html5Audio src={staticFile("music.mp3")} />

ALTERNATIV (für @remotion/web-renderer):
import { Audio } from "@remotion/media";
<Audio src={staticFile("music.mp3")} />
```

> **WICHTIG:** `<Html5Audio>` ist NICHT unterstützt in `@remotion/web-renderer`.
> Für Client-Side-Rendering: `<Audio>` aus `@remotion/media` verwenden.

---

## spring() — Vollständige API (v4.x)

```tsx
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

const value = spring({
  frame,                    // PFLICHT: useCurrentFrame() oder frame - delay
  fps,                      // PFLICHT: aus useVideoConfig()
  from: 0,                  // Optional: Start-Wert (default: 0)
  to: 1,                    // Optional: End-Wert (default: 1)
  reverse: false,           // Optional: Animation rückwärts (v3.3.92+)
  delay: 0,                 // Optional: Frame-Delay (v3.3.90+)
  durationInFrames: 40,     // Optional: Streckt Kurve auf exakte Dauer (v3.0.27+)
  durationRestThreshold: 0.001, // Optional: Wann gilt spring als "fertig"?
  config: {
    mass: 1,                // Gewicht (kleiner = schneller)
    damping: 10,            // Dämpfung (höher = weniger Bounce)
    stiffness: 100,         // Steifheit (höher = schnappiger)
    overshootClamping: false // NEU: Überschwingen verhindern (true = nie über "to")
  }
});
```

### Spring-Config Presets (Paperclip Standard)
```
PRESET       DAMPING  STIFFNESS  MASS  OVERSHOOT  WANN
──────────────────────────────────────────────────────────────
smooth       200      100        1     false      Premium-UI, subtile Entries
snappy       20       200        1     false      Buttons, Quick Actions
bouncy       8        100        1     false      Playful, Attention-Grabbing
heavy        15       80         2     false      Schwere Elemente, Panels
cinematic    100      100        0.5   false      Kamera-Moves, Slow Reveals
no-overshoot 10       100        1     true       Fortschrittsbalken, Zahlen
delayed      10       100        1     false      + delay: 15 für Stagger
```

---

## interpolate() — Vollständige API

```tsx
import { interpolate } from "remotion";

const value = interpolate(
  input,                    // Eingabe-Wert (z.B. frame oder spring-Wert)
  [0, 20],                  // Input-Range
  [0, 1],                   // Output-Range
  {
    extrapolateLeft: "clamp",   // "clamp" | "extend" | "wrap" | "identity"
    extrapolateRight: "clamp",  // IMMER "clamp" setzen!
    easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Optional: Easing-Kurve
  }
);
```

### Multi-Point Interpolation (Fade In + Out)
```tsx
const opacity = interpolate(
  frame,
  [0, 20, durationInFrames - 20, durationInFrames],
  [0, 1,  1,                     0],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
);
```

### Spring → interpolate Combo (Standard-Pattern)
```tsx
const driver = spring({ frame, fps, config: { damping: 200 } });
const translateX = interpolate(driver, [0, 1], [-800, 0]);
const scale = interpolate(driver, [0, 1], [0.8, 1]);
const opacity = interpolate(driver, [0, 1], [0, 1]);
```

---

## <Sequence> — API (v4.x)

```tsx
<Sequence
  from={30}                           // Start-Frame (optional)
  durationInFrames={90}               // Dauer in Frames
  name="HeroEntry"                    // Name im Timeline-Panel
  layout="none"                       // "none" = kein AbsoluteFill Wrapper
  premountFor={10}                    // Pre-mount N Frames VOR Start (v4.0.140+)
  postmountFor={10}                   // Post-mount N Frames NACH Ende (v4.0.340+)
  styleWhilePremounted={{ opacity: 0 }} // Style während Pre-Mount (v4.0.252+)
  showInTimeline={true}               // Im Timeline-Panel zeigen (v4.0.110+)
>
  <MyScene />
</Sequence>
```

> **WICHTIG:** `useCurrentFrame()` innerhalb einer `<Sequence>` gibt LOKALE Frames zurück (startet bei 0).

---

## <Img> — API (v4.x)

```tsx
import { Img, staticFile } from "remotion";

<Img
  src={staticFile("hero.png")}
  pauseWhenLoading={true}               // NEU (v4.0.111): Pausiert Render bis geladen
  maxRetries={3}                        // NEU (v3.3.82): Retry bei Ladefehler
  delayRenderTimeoutInMilliseconds={30000} // NEU (v4.0.140)
  style={{ width: "100%", height: "auto" }}
/>
```

> **REGEL:** IMMER `<Img>` aus Remotion verwenden. NIEMALS `<img>` HTML Tag.
> `<img>` führt zu Flicker und leeren Frames beim Render.

---

## <Html5Audio> — API (v4.x)

```tsx
import { Html5Audio, staticFile, interpolate } from "remotion";

<Html5Audio
  src={staticFile("music.mp3")}
  volume={(f) => interpolate(f, [0, 30], [0, 1], { extrapolateRight: "clamp" })}
  startFrom={0}                        // Start-Offset in Frames
  endAt={300}                          // End-Frame
  trimBefore={30}                      // NEU (v4.0.319): Audio trimmen (Start)
  trimAfter={270}                      // NEU (v4.0.319): Audio trimmen (Ende)
  playbackRate={1}                     // Abspielgeschwindigkeit
  muted={false}                        // Stumm schalten
  loop={false}                         // Loop
/>
```

---

## TransitionSeries — API (v4.x)

```tsx
import { TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";
import { linearTiming, springTiming } from "@remotion/transitions";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={90}>
    <Scene1 />
  </TransitionSeries.Sequence>
  
  <TransitionSeries.Transition
    presentation={slide({ direction: "from-right" })}
    timing={linearTiming({ durationInFrames: 15 })}
  />
  
  <TransitionSeries.Sequence durationInFrames={150}>
    <Scene2 />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

### Transition Presentations
```
slide({ direction: "from-left" | "from-right" | "from-top" | "from-bottom" })
fade()
wipe({ direction: "from-left" | "from-right" | "from-top" | "from-bottom" })
flip({ direction: "from-left" | "from-right" | "from-top" | "from-bottom" })
```

### Transition Timings
```
linearTiming({ durationInFrames: 15 })      // Gleichmäßig
springTiming({ config: { damping: 200 } })  // Physik-basiert
```

> **WICHTIG:** Transitions KÜRZEN die Timeline. Eine 15-Frame Transition zwischen 
> zwei 90-Frame Sequenzen ergibt 165 Frames total, nicht 195.

---

## CLI Render Commands

```bash
# Video rendern
npx remotion render src/index.ts CompositionId out/video.mp4

# Spezifische Frames
npx remotion render src/index.ts CompositionId --frames=0-90

# Codec wählen
npx remotion render src/index.ts CompositionId out/video.mp4 --codec=h264

# Audio-only
npx remotion render src/index.ts CompositionId out/audio.mp3 --codec=mp3

# GIF
npx remotion render src/index.ts CompositionId out/animation.gif --codec=gif

# Hohe Qualität
npx remotion render src/index.ts CompositionId out/video.mp4 \
  --codec=h264 \
  --image-format=jpeg \
  --jpeg-quality=100

# Concurrency (schneller rendern)
npx remotion render src/index.ts CompositionId out/video.mp4 --concurrency=8
```

---

## Fonts (Google Fonts Integration)

```tsx
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

// Verwendung:
<div style={{ fontFamily }}>Text</div>
```

---

## Häufige Fehler & Fixes

| Problem | Ursache | Fix |
|---|---|---|
| Leere Frames bei Bildern | `<img>` statt `<Img>` | `import { Img } from "remotion"` |
| Animation flickert | CSS transitions/animations | Nur `useCurrentFrame()` + `interpolate()`/`spring()` |
| Audio spielt nicht | Falscher Import | `Html5Audio` oder `Audio` aus `@remotion/media` |
| Werte gehen über Range | Fehlendes Clamping | `extrapolateRight: "clamp"` |
| Spring overshootet | Zu wenig Damping | `damping: 200` für smooth, `overshootClamping: true` |
| Build-Fehler mit Tailwind | JIT-Compiler Konflikt | Inline Styles in Remotion verwenden |
| Font nicht gerendert | Falsche Font-Loading | `@remotion/google-fonts` mit expliziten Weights |
