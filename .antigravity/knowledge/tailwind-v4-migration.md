# 🎨 Tailwind CSS v4 Migration — Kern-Wissen

**Primär-Personas:** ⚛️ Rauno Freiberg, 🖤 Steve Jobs  
**Sekundär:** 🎬 Jonah Jansen, 📡 Cypher SRE

> [!WARNING]
> Paperclip nutzt aktuell **Tailwind v3.4.11**. Dieses File dokumentiert Tailwind v4.x
> für den Fall eines Upgrades. v4 ist ein **Paradigmenwechsel** (CSS-first).

---

## Was hat sich geändert? (v3 → v4)

| Aspekt | v3 (aktuell) | v4 (neu) |
|---|---|---|
| Config | `tailwind.config.js` | `@theme {}` in CSS |
| Import | `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| Content Detection | `content: ['./src/**/*.tsx']` | Automatisch |
| Bundler Plugin | PostCSS Plugin | First-Party Vite Plugin |
| Colors | sRGB | **P3 Wide Gamut** (oklch) |
| Custom Values | `extend: { ... }` in JS | CSS Custom Properties |
| Container Queries | Plugin nötig | **First-Class `@container`** |
| Cascade | Implicit | **Native Cascade Layers** |

---

## Installation (v4)

### Vite (Paperclip Setup)
```bash
npm install tailwindcss @tailwindcss/vite
```

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),  // Ersetzt PostCSS Plugin
    react(),
  ],
});
```

### CSS Entry Point
```css
/* src/index.css — DAS ist jetzt die gesamte Config */
@import "tailwindcss";

@theme {
  /* Custom Fonts */
  --font-display: "Inter", "sans-serif";
  
  /* Paperclip Dark Mode Palette (P3 oklch) */
  --color-ares-bg: oklch(0.13 0.01 260);       /* zinc-950 equivalent */
  --color-ares-card: oklch(0.19 0.01 260 / 0.5); /* zinc-900/50 */
  --color-ares-border: oklch(0.27 0.01 260 / 0.5); /* zinc-800/50 */
  --color-ares-text: oklch(0.96 0 0);            /* zinc-100 */
  --color-ares-muted: oklch(0.55 0.01 260);      /* zinc-400 */
  
  /* Custom Breakpoint */
  --breakpoint-3xl: 1920px;
  
  /* Custom Easings */
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-snappy: cubic-bezier(0.2, 0, 0, 1);
}
```

> **KEIN `tailwind.config.js` mehr nötig!** Alles ist im CSS.

---

## CSS-first Configuration (`@theme`)

```css
@theme {
  /* Farben — werden zu Utilities: bg-avocado-500, text-avocado-300 etc. */
  --color-avocado-100: oklch(0.99 0 0);
  --color-avocado-500: oklch(0.84 0.18 117.33);
  
  /* Fonts — werden zu font-display */
  --font-display: "Satoshi", sans-serif;
  
  /* Spacing, Radius, Shadows — alles via Custom Properties */
  --spacing-18: 4.5rem;
  --radius-4xl: 2rem;
}
```

### Theme Variables als CSS Custom Properties
```css
/* Alle @theme Werte sind automatisch als CSS Variables verfügbar: */
.my-component {
  background: var(--color-avocado-500);
  font-family: var(--font-display);
}
```

---

## Container Queries (First-Class)

```html
<!-- v4: Nativ, kein Plugin nötig -->
<div class="@container">
  <div class="@sm:grid-cols-2 @lg:grid-cols-3">
    <!-- Responsive basierend auf Container-Breite, nicht Viewport -->
  </div>
</div>
```

---

## Neue Features (v4)

### 3D Transform Utilities
```html
<div class="rotate-x-12 rotate-y-6 perspective-800">
  <!-- 3D Transformationen direkt als Utilities -->
</div>
```

### Gradient Angles
```html
<div class="bg-linear-45 from-blue-500 to-purple-500">
  <!-- Gradient mit 45° Winkel -->
</div>
```

### `not-*` Variant
```html
<div class="not-last:border-b">
  <!-- Border auf alle außer dem letzten Element -->
</div>
```

### `@starting-style` Support
```html
<div class="starting:opacity-0 opacity-100 transition-opacity">
  <!-- CSS-native Entry-Animation -->
</div>
```

### Dynamic Utility Values
```html
<div class="grid-cols-[1fr_2fr_1fr]">
  <!-- Beliebige Werte inline — auch in v3, aber v4 erweitert -->
</div>
```

---

## Migration Guide (v3 → v4)

### Schritt 1: Dependencies
```bash
npm install tailwindcss@latest @tailwindcss/vite
npm uninstall autoprefixer  # Nicht mehr nötig
```

### Schritt 2: Vite Config
```diff
// vite.config.ts
+ import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
+   tailwindcss(),
    react(),
  ],
- css: {
-   postcss: './postcss.config.js',
- },
});
```

### Schritt 3: CSS Entry Point
```diff
/* src/index.css */
- @tailwind base;
- @tailwind components;
- @tailwind utilities;
+ @import "tailwindcss";

+ @theme {
+   /* Custom tokens hier */
+ }
```

### Schritt 4: Config migrieren
```diff
- // tailwind.config.js (LÖSCHEN)
- module.exports = {
-   content: ['./src/**/*.tsx'],
-   theme: {
-     extend: {
-       colors: { brand: '#00ff00' },
-     },
-   },
- };

+ /* In index.css: */
+ @theme {
+   --color-brand: #00ff00;
+ }
```

### Schritt 5: Files löschen
```bash
rm tailwind.config.js
rm postcss.config.js  # Nicht mehr nötig
```

---

## Breaking Changes (Achtung!)

| Was | v3 | v4 | Impact für Paperclip |
|---|---|---|---|
| farben | `bg-zinc-950` (sRGB) | `bg-zinc-950` (P3 oklch) | Farben können minimal anders aussehen |
| `@apply` | Überall | Nur in `@layer` Kontexten | Prüfen ob Paperclip `@apply` außerhalb nutzt |
| `darkMode: 'class'` | In config | `@variant dark (&.dark)` | Paperclip muss Dark Mode Variant prüfen |
| Arbitrary properties | `[&>*]:` | Weiterhin verfügbar | 🟢 Kein Impact |
| JIT | Default | Immer | 🟢 Kein Impact |

---

## Paperclip-spezifische Entscheidung

> [!NOTE]
> **Upgrade JETZT nicht erzwingen.** Tailwind v3.4.11 funktioniert stabil.
> Upgrade empfohlen wenn:
> - Container Queries für Widgets gebraucht werden
> - P3 Color Support wichtig wird
> - Vite Plugin merkbaren Build-Speed-Vorteil bringt
> 
> **Vorbereitung:** `@apply` Audit durchführen, Custom Colors in oklch konvertieren.

---

## Offizielle Docs

| Thema | URL |
|---|---|
| v4 Announcement | https://tailwindcss.com/blog/tailwindcss-v4 |
| Installation (v4) | https://tailwindcss.com/docs/installation/vite |
| Theme Variables | https://tailwindcss.com/docs/theme |
| Upgrade Guide | https://tailwindcss.com/docs/upgrade-guide |
| Container Queries | https://tailwindcss.com/docs/responsive-design#container-queries |
