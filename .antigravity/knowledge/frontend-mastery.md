# Frontend Mastery — Kern-Wissen für Antigravity Personas

**Primär-Personas:** ⚛️ The React Architect, 🖤 Steve Jobs  
**Sekundär:** 📡 Cypher SRE, 🔍 Sherlock Holmes

> [!IMPORTANT]
> Diese Datei MUSS gelesen werden bevor Frontend-Arbeitsaufträge ausgeführt werden.
> React-Komponenten, Hooks, Animationen, Tailwind, Design System.

---

## Antigravity Tech Stack (Frontend)

| Technologie | Version | Rolle |
|---|---|---|
| React | 18.3.1 | UI Framework |
| TypeScript | 5.5.3 | Typsicherheit |
| Vite | 5.4.1 | Build Tool |
| Tailwind CSS | 3.4.11 | Styling |
| Radix UI | aktuell | Accessible Primitives |
| framer-motion | 12.33.0 | Animationen |
| Recharts | 2.12.7 | Charts/Graphs |
| TanStack Query | 5.56.2 | Server State |
| Capacitor | 8.2.0 | Mobile Bridge (SPM, new Plugin API) |

---

## Component Architecture

### Datei-Konventionen
```
src/
├── components/
│   ├── home/          ← Home-Screen Komponenten
│   │   ├── sheets/    ← Bottom Sheets (Modal-artig)
│   │   └── widgets/   ← Dashboard Widgets
│   ├── ui/            ← Shared UI Primitives (Button, Card, etc.)
│   └── shared/        ← Cross-Feature Komponenten
├── hooks/             ← Custom Hooks (Data + Logic)
├── lib/               ← Utility Functions (pure)
├── utils/             ← Helper Functions
└── pages/             ← Route-Pages
```

### Hook-Architektur (Separation of Concerns)
```typescript
// ✅ Korrekt: Trennung Data → Logic → UI
// hooks/useSleepData.ts      ← Daten holen (TanStack Query)
// hooks/useSleepCompute.ts   ← Berechnungen (pure logic)
// components/SleepWidget.tsx  ← Darstellung (nur UI)

// ❌ Falsch: Alles in der Komponente
// components/SleepWidget.tsx  ← fetch + compute + render
```

---

## Framer Motion Patterns

### Standard-Animationen
```typescript
// Page Transitions
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
>

// Layout-Animationen (für Reorder, Expand/Collapse)
<motion.div layout layoutId="unique-id">

// AnimatePresence für Mount/Unmount
<AnimatePresence mode="wait">
  {isVisible && <motion.div key="unique" exit={{ opacity: 0 }} />}
</AnimatePresence>
```

### Spring-Konfigurationen
```typescript
// Snappy (Buttons, Toggles)
{ type: "spring", stiffness: 500, damping: 30 }

// Smooth (Page Transitions, Modals)
{ type: "spring", stiffness: 300, damping: 30 }

// Bouncy (Attention, CTA)
{ type: "spring", stiffness: 400, damping: 15 }
```

### Antigravity-spezifisch: Bio.ORB Animation
```typescript
// Pulsierender Orb mit Gradient
<motion.div
  animate={{ scale: [1, 1.05, 1] }}
  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
/>
```

---

## Tailwind CSS Patterns

### Dark Mode (Antigravity Default)
```typescript
// Antigravity ist Dark-Mode-First
<div className="bg-zinc-950 text-zinc-100">
  <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl">
    <p className="text-zinc-400">Secondary Text</p>
  </div>
</div>
```

### Antigravity Farbpalette
```
Hintergrund:     zinc-950 (#09090b)
Card-BG:         zinc-900/50
Borders:         zinc-800/50
Primary Text:    zinc-100
Secondary Text:  zinc-400
Accent Blue:     blue-500
Accent Green:    emerald-500
Accent Red:      rose-500
Accent Amber:    amber-500
```

### Responsive (Mobile-First)
```typescript
// Antigravity ist primär Mobile (Capacitor iOS)
<div className="px-4 sm:px-6 lg:px-8">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
```

---

## TanStack Query Patterns

### Standard Query Hook
```typescript
export function useSleepData(userId: string) {
  return useQuery({
    queryKey: ['sleep', userId],
    queryFn: () => fetchSleepData(userId),
    staleTime: 5 * 60 * 1000,    // 5 Min (Cache-Dauer)
    gcTime: 30 * 60 * 1000,      // 30 Min (Garbage Collection)
    enabled: !!userId,
  });
}
```

### Optimistic Updates (Mutations)
```typescript
const mutation = useMutation({
  mutationFn: updateData,
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ['key'] });
    const previous = queryClient.getQueryData(['key']);
    queryClient.setQueryData(['key'], newData); // Optimistisch
    return { previous };
  },
  onError: (err, vars, context) => {
    queryClient.setQueryData(['key'], context?.previous); // Rollback
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['key'] });
  },
});
```

---

## Performance-Regeln

| Regel | Pattern |
|---|---|
| Memoize teure Berechnungen | `useMemo(() => compute(data), [data])` |
| Stabile Callback-Referenzen | `useCallback(fn, [deps])` |
| Prevent Re-Renders | `React.memo(Component)` bei statischen Kindern |
| Lazy Loading | `React.lazy(() => import('./Heavy'))` |
| Virtualisierung | `react-window` für lange Listen |
| Image Optimization | WebP, responsive `srcSet`, Lazy Loading |

---

## Radix UI Primitives (shadcn/ui Pattern)

### Architektur
```
@radix-ui/react-*       ← Headless, unstyled Primitives (Accessibility + Logik)
  └── src/components/ui/  ← shadcn/ui Wrapper (Tailwind Styling + cn())
       └── App Components  ← Importieren NUR aus ui/, NIE direkt aus @radix-ui
```

### Installierte Radix Primitives (27 Packages)
| Primitive | UI Wrapper | Verwendung |
|---|---|---|
| `react-dialog` | `dialog.tsx` | Modals, Formulare |
| `react-alert-dialog` | `alert-dialog.tsx` | Bestätigungsdialoge |
| `react-dropdown-menu` | `dropdown-menu.tsx` | Kontextmenüs |
| `react-popover` | `popover.tsx` | Floating Content |
| `react-tooltip` | `tooltip.tsx` | Hover-Tooltips |
| `react-select` | `select.tsx` | Dropdowns |
| `react-tabs` | `tabs.tsx` | Tab Navigation |
| `react-accordion` | `accordion.tsx` | Collapsible Sections |
| `react-checkbox` | `checkbox.tsx` | Checkboxen |
| `react-radio-group` | `radio-group.tsx` | Radio Buttons |
| `react-switch` | `switch.tsx` | Toggle Switches |
| `react-slider` | `slider.tsx` | Range Slider |
| `react-progress` | `progress.tsx` | Progress Bars |
| `react-scroll-area` | `scroll-area.tsx` | Custom Scrollbars |
| `react-sheet` | `sheet.tsx` | Bottom/Side Sheets |
| `react-toast` | `toast.tsx` | Notifications |
| `react-label` | `label.tsx` | Form Labels |
| `react-separator` | `separator.tsx` | Visueller Trenner |
| `react-avatar` | `avatar.tsx` | User Avatars |
| `react-toggle` | `toggle.tsx` | Toggle Buttons |
| `react-toggle-group` | `toggle-group.tsx` | Segmented Controls |
| `react-collapsible` | `collapsible.tsx` | Aufklappbare Bereiche |
| `react-slot` | intern in `button.tsx` | `asChild` Pattern |

### Component Wrapper Pattern (shadcn/ui)
```typescript
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

// 1. Re-export Root + Trigger (unverändert)
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;

// 2. Styled Wrapper mit forwardRef
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Content
    ref={ref}
    className={cn(
      "fixed left-[50%] top-[50%] z-[70] ...",  // Basis-Styles
      className  // Override ermöglichen
    )}
    {...props}
  >
    {children}
  </DialogPrimitive.Content>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;
```

### Data Attributes (Animation Hooks)
```css
/* Radix setzt data-state auf Primitives: */
data-[state=open]:animate-in       /* Einblenden */
data-[state=closed]:animate-out    /* Ausblenden */
data-[state=open]:fade-in-0        /* Opacity 0→1 */
data-[state=closed]:fade-out-0     /* Opacity 1→0 */
data-[state=open]:zoom-in-95       /* Scale 0.95→1 */
```

### Anti-Pattern: Radix
| ❌ Don't | ✅ Do |
|---|---|
| `@radix-ui` direkt importieren | `@/components/ui/dialog` nutzen |
| Eigene Modal-Logik bauen | Radix Dialog mit Overlay + Portal |
| `z-index` Chaos | Alle Radix Portals auf `z-[70]` standardisieren |
| `displayName` vergessen | Immer `Component.displayName = Primitive.displayName` |

---

## Anti-Patterns

| ❌ Don't | ✅ Do | Warum |
|----------|-------|-------|
| CSS `transition` für sichtbare UI | Framer Motion | Konsistenz, Kontrolle, Performance |
| `any` in Props/State | Explizite Types/Interfaces | Type Safety |
| Inline Styles | Tailwind Klassen | Konsistenz, Bundle |
| Business Logic im Component Body | Custom Hooks | Separation of Concerns |
| `useEffect` für Derived State | `useMemo` | Weniger Re-Renders |
| Prop Drilling >2 Ebenen | Context oder Composition | Maintainability |
| `index` als Key in Listen | Stabile IDs | React Reconciliation |

---

## Antigravity Design System Tokens

### Spacing
```
4px-Raster: p-1(4px) p-2(8px) p-3(12px) p-4(16px) p-6(24px) p-8(32px)
Card Padding: p-4 (Mobile), p-6 (Desktop)
Section Gap: space-y-4, gap-4
```

### Typography
```
Headlines:  text-xl font-semibold text-zinc-100
Body:       text-sm text-zinc-300
Caption:    text-xs text-zinc-500
Mono/Data:  font-mono text-sm
```

### Border Radius
```
Cards:      rounded-2xl
Buttons:    rounded-xl
Inputs:     rounded-lg
Badges:     rounded-full
```

---

## Referenz-Dateien

| Datei | Zweck |
|---|---|
| `.antigravity/copy-rules.md` | Wording im UI (Pflicht-Vokabular) |
| `.antigravity/tech-stack-context.md` | Vollständiger Tech Stack |
| `src/components/ui/` | Shared UI Primitives |
| `src/hooks/` | Existing Custom Hooks |
