# UX Design System — Agent Knowledge File

> **Pflichtlektüre für:** Steve Jobs, Rauno Freiberg, Dan Abramov, Daniel Kahneman, Jonah Jansen  
> **Referenz-Wiki:** `docs/wiki/ux-architecture.md`  
> **Kanonische Token-Quelle:** `[APP_DIR]/DESIGN.md` — IMMER DORT NACHSCHLAGEN für aktuelle Tokens!  
> **Version:** 1.0.0 (Template)

---

## Zweck

Dieses Knowledge File enthält die **maschinenlesbaren UX-Patterns und Design-Regeln** für das Projekt-Dashboard. Jeder Agent, der UI-Code schreibt oder UI-Entscheidungen trifft, MUSS diese Datei konsultieren.

---

## 1. Kern-Paradigma

```yaml
paradigm: "[Board Member Dashboard / Consumer App / Internal Tool]"
user_is: "[Beschreibung der Nutzerrolle — z.B. Vorstandsmitglied einer autonomen KI-Firma]"
user_is_not: "[Was der User NICHT ist — z.B. Developer, DevOps-Engineer, Prompt-Engineer]"
primary_goal: "[Strategische Steuerung / Tracking / Content-Konsum / etc.]"
```

**Konsequenz:** Das UI zeigt ERGEBNISSE und ENTSCHEIDUNGSPUNKTE — nicht Konfigurationen oder Logs.

---

## 2. Progressive Disclosure (Nicht verhandelbar)

```typescript
// JEDE Komponente MUSS dies respektieren:
type InterfaceMode = 'beginner' | 'standard' | 'expert';

// Levels:
// Level 0 (Board):   KPIs, Status, Aktionen → ALLE User sehen das
// Level 1 (Manager): Details, Breakdowns, Timelines → Standard + Expert
// Level 2 (Expert):  Raw Data, Config, Memory → NUR Expert
```

### Sichtbarkeitsmatrix

> [!IMPORTANT]
> **Projekt-spezifisch befüllen:** Erstelle eine Tabelle aller Features mit ihrer Sichtbarkeit pro Mode.

| Feature | Beginner | Standard | Expert |
|---|---|---|---|
| Dashboard KPIs | ✅ | ✅ | ✅ |
| Primary Chat / Interaction | ✅ | ✅ | ✅ |
| List Views | ✅ | ✅ | ✅ |
| Entity Cards | ✅ | ✅ | ✅ |
| Kanban / Advanced Views | ❌ | ✅ | ✅ |
| System Logs / Raw Data | ❌ | ❌ | ✅ |
| Config Editors | ❌ | ❌ | ✅ |
| Advanced Features | ❌ | ❌ | ✅ |

---

## 3. Sidebar-Architektur

```yaml
sidebar_categories:
  MAIN:
    - { icon: "🏠", label: "[Landing Page]", route: "/", always: true }
    - { icon: "💬", label: "[Primary Chat]", route: "/chat", always: true }
  
  OPERATE:
    label: "OPERATE"
    items:
      - { icon: "📋", label: "[Core Entity 1]", route: "/[entity-1]", badge: "[count_type]" }
      - { icon: "🤖", label: "[Core Entity 2]", route: "/[entity-2]" }
      - { icon: "📁", label: "[Core Entity 3]", route: "/[entity-3]" }
  
  MONITOR:
    label: "MONITOR"
    items:
      - { icon: "📈", label: "Activity", route: "/activity" }
      - { icon: "💰", label: "Costs", route: "/costs", badge: "budget_warning" }
      - { icon: "📥", label: "Inbox", route: "/inbox", badge: "unread_count" }
  
  CONFIGURE:
    label: "CONFIGURE"
    collapsed_default: true
    items:
      - { icon: "⚙️", label: "Settings", route: "/settings" }
```

### Adaptive Sidebar (Einsteiger vs. Power User)

```
EINSTEIGER-MODUS:               POWER-USER-MODUS:
┌──────────────────────┐        ┌──────────────────────┐
│ 🏠 [Landing Page]    │        │ 🏠 [Landing Page]    │
│ 💬 [Primary Chat]    │        │ 💬 [Primary Chat]    │
│ 📋 [Core Entity]     │        │ ── OPERATE ───────── │
│ 🤖 [Secondary]       │        │ [Full Entity List]   │
│                      │        │ ── MONITOR ───────── │
│ ─ Mehr ↓ ────────── │        │ [Full Monitor List]  │
│ (collapsed)          │        │ ── CONFIGURE ─────── │
│                      │        │ [Full Config List]   │
└──────────────────────┘        └──────────────────────┘
```

### Mode-Switch Trigger

```yaml
mode_switch:
  initial_detection: "Onboarding-Profilierung"
  manual_override: "Settings → Interface Mode → Beginner / Standard / Expert"
  progressive_unlock: "Nach N Aktionen → Prompt 'Power-User-Modus freischalten?'"
  persistence: "user_preferences.interface_mode in Supabase"
```

---

## 4. Design Tokens (Referenz → `[APP_DIR]/DESIGN.md`)

> ⚠️ **Kanonische Quelle ist `[APP_DIR]/DESIGN.md`.** Diese Zusammenfassung dient als Schnellreferenz.

### 4.1 Farben

```css
/* PRIMARY PALETTE — Dark Mode (Default) — "Calm Confidence" */
--bg-primary: #0a0a0f;                      /* Deepest background */
--bg-secondary: #12121a;                    /* Elevated surface */
--bg-card: rgba(255, 255, 255, 0.04);       /* Glass card */
--bg-glass: rgba(255, 255, 255, 0.06);      /* Input/Glass bg */

/* ACCENT — Projekt-spezifisch wählen */
--accent-primary: #[HEX];   /* Primary actions, Active states */
--accent-secondary: #[HEX]; /* Gradient endpoint */
--accent-gradient: linear-gradient(135deg, ...);
--accent-green: #10b981;     /* Emerald — Success, completion */
--accent-amber: #f59e0b;     /* Amber — Warnings, budget alerts */
--accent-red: #ef4444;       /* Red — Destructive actions, errors */
--accent-blue: #3b82f6;      /* Blue — Info, links */

/* TEXT */
--text-primary: #f0f0f5;
--text-secondary: #8b8b9e;
--text-muted: #5a5a6e;
```

### 4.2 Glassmorphism

```css
/* STANDARD GLASS PANEL */
.glass-panel {
  background: var(--bg-glass);
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-lg);
}

--blur-glass: blur(20px);
--border-glass: rgba(255, 255, 255, 0.08);
--shadow-card: 0 4px 24px rgba(0, 0, 0, 0.3);
```

### 4.3 Spacing Scale

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
```

---

## 5. Button-Hierarchie (Eisernes Gesetz)

```yaml
buttons:
  PRIMARY:
    use_for: "Die EINE wichtigste Aktion auf der Seite"
    examples: ["Erstellen", "Bestätigen", "Freigeben"]
    style: "Solid bg (--accent-primary), box-shadow glow, font-weight: 600"
    rule: "MAX 1 Primary Button pro sichtbarem Screen-Bereich"

  SECONDARY:
    use_for: "Alternative Aktionen"
    examples: ["Abbrechen", "Zurück", "Als Draft speichern"]
    style: "Glass background, subtle border, kein glow"

  GHOST:
    use_for: "Tertiäre Aktionen, Navigation"
    examples: ["Mehr anzeigen", "Collapse", "Filter zurücksetzen"]
    style: "Nur Text + Color, hover: bg-shift"

  DANGER:
    use_for: "Destruktive Aktionen"
    examples: ["Löschen", "Terminieren"]
    style: "Red bg ODER Red outline"
    rule: "IMMER mit Confirmation Dialog"
```

---

## 6. Micro-Interaktionen

```yaml
animation_rules:
  duration: "200-800ms (nie länger)"
  easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  reduced_motion: "PFLICHT: @media (prefers-reduced-motion) { animation: none }"
  no_sound: true
  no_spam: "Keine Animation bei wiederholter gleicher Aktion"

reward_moments:
  task_completed:
    type: "Sanftes Aufleuchten (emerald glow)"
    duration: "600ms"
    
  entity_created:
    type: "Avatar/Card fährt ein, pulsierender Ring"
    duration: "1200ms"
    
  milestone_reached:
    type: "Spring-Physics auf Progress Bar"
```

---

## 7. Status UI Patterns

```yaml
status_mapping:
  idle:
    color: "var(--text-muted)"
    icon: "💤"
    label: "[Ruhend/Inaktiv]"
    animation: null
    
  running:
    color: "var(--accent-primary)"
    icon: "⚡"
    label: "[Aktiv/Arbeitet]"
    animation: "pulse 1.5s infinite"
    
  paused:
    color: "var(--accent-amber)"
    icon: "⏸️"
    label: "[Pausiert]"
    animation: null
    
  error:
    color: "var(--accent-red)"
    icon: "❌"
    label: "[Fehler]"
    animation: null

  completed:
    color: "var(--accent-green)"
    icon: "✅"
    label: "[Erledigt]"
    animation: null
```

---

## 8. Onboarding-Spezifikation

```yaml
onboarding_wizard:
  screens: 3-5
  skip_option: true  # Für Experten
  persistence: "user.onboarding_completed = true in Supabase"
  
  screen_1:
    title: "Willkommen bei [PRODUKT]"
    fields:
      - name: { type: "text", required: true }
      - description: { type: "textarea", max: 140 }
      - primary_use_case: { type: "radio", options: ["[use-case-1]", "[use-case-2]", "[use-case-3]"] }
  
  screen_2:
    title: "Deine Erfahrung"
    fields:
      - experience: { type: "radio", options: ["beginner", "standard", "expert"] }
    effect: "Sets interface_mode"
  
  screen_3:
    title: "[Kern-Setup]"
    fields:
      - core_entity: { type: "[wizard/form]", required: true }
    
  cold_start_resolution:
    problem: "Leeres Dashboard → Absprung"
    solution:
      1: "Pre-populated Templates basierend auf Use-Case"
      2: "3 Demo-Einträge im System (nie leer starten)"
      3: "Erste Nachricht vom System: Willkommensbriefing"
      4: "Guided Tour: 5 Highlight-Punkte (Tooltip-Overlays)"
```

---

## 9. Compliance UI Patterns

```yaml
compliance_indicators:
  processing_location:
    position: "Footer oder Header-Bar"
    content: "☁️ EU Processing | 🔒 PII-Scrubbing aktiv"
    visibility: "Immer sichtbar"
    
  data_provenance:
    trigger: "Klick auf generierte Daten"
    shows: ["Quelle", "Modell", "Timestamp", "Kosten"]
    
  consent:
    trigger: "Erster Login"
    type: "Cookie-Banner-Style mit Granular-Optionen"
```

---

## 10. Three-Pane Layout Standard

```yaml
three_pane:
  use_for: ["[Entity]Detail", "ApprovalDetail", "ItemDetail"]
  components:
    breadcrumb: "BreadcrumbBar — immer oben"
    left_pane: "Navigation / Back + Sidebar context"
    center_pane: "Main content (Form / Chat / Editor)"
    right_pane: "PropertiesPanel — Metadaten, Status, Actions"
  responsive: "Right pane collapses auf < 1200px"
```

---

## 11. Anti-Patterns (Verboten)

```yaml
forbidden:
  1_flat_buttons: "Niemals alle Buttons gleich stylen. Hierarchie ist Pflicht."
  2_naked_forms: "Kein Formular ohne Glassmorphism-Panel drum herum."
  3_loading_skeletons_missing: "Loading States sind Pflicht. Kein blanker Screen."
  4_console_in_ui: "Keine Terminal-Outputs oder JSON-Dumps im Standard-Mode."
  5_jargon: "Keine technischen Bezeichner in UI-Labels. Human-readable Labels Pflicht."
  6_choice_overload: "Max 5-7 Optionen pro Dropdown/Selection. Mehr → Suche/Filter."
  7_power_feature_removal: "NIEMALS Expert-Features entfernen. Nur Sichtbarkeit steuern."
  8_hardcoded_colors: "NIEMALS hardcoded hex in Komponenten. Immer Tokens."
  9_structural_borders: "Keine 1px solid Borders für Layout-Sektionen. Nur background-color shifts."
  10_empty_states: "NIE ein leeres Dashboard zeigen. Immer Pre-populated Content."
```

---

> **Änderungshistorie:**
> - v1.0.0 ([DATUM]): Template-Version aus Autarch Pattern Library extrahiert
