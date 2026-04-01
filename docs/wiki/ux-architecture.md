# UX Architecture — Autarch Dashboard

> **Version:** 1.0.0  
> **Stand:** 29.03.2026  
> **Zweck:** UI/UX-Referenz für alle Build-Personas (Steve Jobs, Rauno, Dan Abramov, Kahneman)  
> **Scope:** User Flows, Progressive Disclosure, Design Patterns, Compliance UI, Onboarding  
> **Abhängigkeiten:** [paperclip-integration.md](./paperclip-integration.md) · [hermes-agent.md](./hermes-agent.md)

---

## Inhaltsverzeichnis

1. [Paradigmenwechsel: Operator → Board Member](#1-paradigmenwechsel-operator--board-member)
2. [Zielgruppen-Personas & Adaptive UI](#2-zielgruppen-personas--adaptive-ui)
3. [UX-Grundprinzipien für Agentische Systeme](#3-ux-grundprinzipien-für-agentische-systeme)
4. [Visuelles Design System: Calm Confidence](#4-visuelles-design-system-calm-confidence)
5. [Onboarding-Architektur](#5-onboarding-architektur)
6. [Navigation & Information Architecture](#6-navigation--information-architecture)
7. [Mission Control: Die erste Interaktion](#7-mission-control-die-erste-interaktion)
8. [Daily Dashboard: Asynchrones Projektmanagement](#8-daily-dashboard-asynchrones-projektmanagement)
9. [Cognitive Persistence: Knowledge Base UI](#9-cognitive-persistence-knowledge-base-ui)
10. [Agent Marketplace & HR UI](#10-agent-marketplace--hr-ui)
11. [Roundtable UX: Kollaborative KI-Debatten](#11-roundtable-ux-kollaborative-ki-debatten)
12. [Maximizer Mode: UX für Hochrisiko](#12-maximizer-mode-ux-für-hochrisiko)
13. [Compliance & Governance UI](#13-compliance--governance-ui)
14. [Aktueller Ist-Zustand vs. Soll-Zustand](#14-aktueller-ist-zustand-vs-soll-zustand)
15. [Implementation Priorities](#15-implementation-priorities)

---

## 1. Paradigmenwechsel: Operator → Board Member

### 1.1 Das Neue Mental Model

| Aspekt | Altes Paradigma (Chat-UI) | Neues Paradigma (Board Dashboard) |
|---|---|---|
| Nutzer-Rolle | Operator: Prompt → Response | Board Member: Strategie, Werte, Budget |
| Interaktion | Synchron, pro Nachricht | Asynchron, über Heartbeat-Zyklen |
| Kontrolle | Manuell, jeder Schritt | Governance Gates, Budget Limits |
| Komplexität | Ein Agent, ein Chat | N Agents, hierarchische Organisation |
| Persistenz | Chat-Verlauf (linear) | PARA Memory System (mehrdimensional) |

### 1.2 Implikationen für die UI

```
Der User muss zu KEINEM Zeitpunkt:
  ❌ Docker starten
  ❌ API-Keys in .env-Dateien schreiben
  ❌ npm/pnpm Befehle kennen
  ❌ PostgreSQL-Queries lesen
  ❌ YAML-Konfigurationen editieren

Der User MUSS zu jedem Zeitpunkt:
  ✅ Wissen, was seine Agents gerade tun
  ✅ Wissen, was es kostet
  ✅ Das Recht haben, alles sofort zu stoppen
  ✅ Verstehen, warum ein Agent eine Entscheidung getroffen hat
  ✅ Die volle Kontrolle über seine Daten behalten
```

---

## 2. Zielgruppen-Personas & Adaptive UI

### 2.1 Persona-Matrix

| Persona | Profil | Erwartung ans UI | Feature-Sichtbarkeit |
|---|---|---|---|
| **Der Einsteiger** ("Word-Nutzer") | Keine KI-Erfahrung, mittelständisches Unternehmen | "Zeig mir was möglich ist" — geführter Wizard | 30% der Features sichtbar. Rest versteckt. |
| **Der Manager** ("Asana/Monday-User") | Kennt Projektmanagement-Tools, aber kein Dev | Issues, Kanban, Timeline — vertraute Patterns | 60% der Features sichtbar. Technische Parameter versteckt. |
| **Der Power-User** ("Paperclip-Pro") | Dev/Architect, will volle Kontrolle | Orgchart, Heartbeat-Details, Adapter-Config, Memory Editor | 100% der Features sichtbar. Expert Mode an. |

### 2.2 Adaptive Sidebar

```
EINSTEIGER-MODUS:               POWER-USER-MODUS:
┌──────────────────────┐        ┌──────────────────────┐
│ 🏠 Dashboard         │        │ 🏠 Command Center    │
│ 💬 CEO Chat          │        │ 💬 CEO Chat          │
│ 📋 Aufgaben          │        │ ── OPERATE ───────── │
│ 🤖 Team              │        │ 📋 Issues            │
│ 💰 Budget            │        │ 🤖 Agents            │
│                      │        │ 📁 Projects          │
│ ─ Mehr ↓ ────────── │        │ 📊 OrgChart          │
│ (collapsed)          │        │ ── MONITOR ───────── │
│                      │        │ 📈 Activity           │
│                      │        │ 💰 Costs             │
│                      │        │ ✅ Approvals          │
│                      │        │ 📥 Inbox             │
│                      │        │ ── CONFIGURE ─────── │
│                      │        │ 🧠 Knowledge         │
│                      │        │ 🔑 Secrets           │
│                      │        │ ⚡ Routines          │
│                      │        │ 🎯 Goals             │
│                      │        │ ⚙️ Settings          │
│                      │        │ 🏛️ Roundtable       │
└──────────────────────┘        └──────────────────────┘
```

### 2.3 Mode-Switch Trigger

```yaml
mode_switch:
  initial_detection: "Onboarding-Profilierung (Frage 1)"
  manual_override: "Settings → Interface Mode → Beginner / Standard / Expert"
  progressive_unlock: "Nach 5 Agents erstellt → Prompt 'Power-User-Modus freischalten?'"
  persistence: "user_preferences.interface_mode in Supabase"
```

---

## 3. UX-Grundprinzipien für Agentische Systeme

### 3.1 Progressive Disclosure (Pflicht-Pattern)

> **Definition:** Das System zeigt ZUERST die einfachste Ebene. Komplexität wird NUR bei expliziter Nutzeraktion offengelegt.

```
Level 0: Board-Ebene
  → "3 Agents aktiv, $47 ausgegeben, 12 Issues erledigt"
  → KEIN Detail über Heartbeats, Token, Adapter

Level 1: Manager-Ebene (Klick auf Agent)
  → Agent-Status, zugewiesene Issues, Budget-Nutzung
  → Heartbeat-Intervall als "Prüft alle 15 Minuten" (kein intervalSec)

Level 2: Expert-Ebene (Expand / "Show Details")
  → adapterConfig, PARA Memory Inhalt, Token-Breakdown
  → Direct YAML/JSON Editor für Agent-Spezifikationen
```

**Implementierungsregel:** Jede Komponente MUSS einen `level: 0|1|2` Prop unterstützen, der die Detailtiefe steuert.

### 3.2 Mixed-Initiative Interface Patterns

```yaml
mixed_initiative:
  agent_proposes:
    - "CEO möchte Senior Dev einstellen" → Approval-Card
    - "Budget bei 80%" → Soft-Alarm Notification
    - "Issue #47 fertig — Review?" → Inline-Review-Button
  
  user_overrides:
    - Drag-and-Drop für Issue-Priorisierung im Kanban
    - Manuelles Budget-Override via Slider
    - Kill Switch für sofortigen Agent-Stopp
    - Issue-Reassignment per Drag auf anderen Agent

  seamless_handoff:
    - Chat-Input JEDERZEIT verfügbar (Bottom Bar)
    - Shortcuts: "P" = Pause Agent, "R" = Resume
    - Right-Click → Context Menu auf jeder Entity
```

### 3.3 Confidence Visualization

```
Wenn ein Agent einen Vorschlag macht:

  HIGH CONFIDENCE (>90%):
    → Grüner Outline, kein zusätzlicher Badge
    → "Marketing-Kampagne fertig. Hier der Entwurf."

  MEDIUM CONFIDENCE (60-90%):
    → Gelber Outline + "Vorschlag" Badge
    → "Basierend auf bisherigen Daten empfehle ich..."
    → Button: "Übernehmen" | "Anpassen" | "Verwerfen"

  LOW CONFIDENCE (<60%):
    → Roter Outline + "Unsicher" Badge + Human-Review-Gate
    → "Ich bin nicht sicher ob das korrekt ist. Bitte prüfen."
    → Kein "Übernehmen" Button — nur "Prüfen & Bestätigen"
```

---

## 4. Visuelles Design System: Calm Confidence

### 4.1 Design-Token-Architektur

```css
/* KERN-TOKENS — Bereits implementiert */
:root {
  /* Neutrals (Dark Mode: Elevated Neutrals) */
  --bg-primary: #0d0d0f;         /* Tiefes Schwarz mit Blauton */
  --bg-secondary: #1a1a2e;       /* Elevated Surface */
  --bg-surface: #16213e;         /* Card Background */
  --bg-glass: rgba(26, 26, 46, 0.72);  /* Glassmorphism Base */

  /* Glassmorphism */
  --glass-blur: blur(20px);
  --glass-border: 1px solid rgba(255, 255, 255, 0.06);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

  /* Akzentfarben — hyper-saturiert für CTAs */
  --accent-primary: #7c3aed;     /* Vivid Purple */
  --accent-success: #10b981;     /* Emerald */
  --accent-warning: #f59e0b;     /* Amber */
  --accent-danger: #ef4444;      /* Red */
  --accent-info: #3b82f6;        /* Blue */

  /* Text */
  --text-primary: rgba(255, 255, 255, 0.95);
  --text-secondary: rgba(255, 255, 255, 0.55);
  --text-muted: rgba(255, 255, 255, 0.3);
}
```

### 4.2 Button-Hierarchie (Strikt)

```
PRIMARY (Hyper-saturiert, lebendige Akzentfarbe):
  → "Agent einstellen", "Budget freigeben", "Strategie genehmigen"
  → Styling: Solid bg, --accent-primary, box-shadow glow
  → Der User muss zu JEDEM Zeitpunkt wissen wo die wichtigste Aktion liegt

SECONDARY (Glass-Button, transparent):
  → "Abbrechen", "Zurück", "Details"
  → Styling: glass bg, subtle border, kein glow

GHOST (Nur Text, kein Hintergrund):
  → "Mehr anzeigen", "Collapse", Navigation-Links
  → Styling: Nur color, hover: underline oder bg-shift

DANGER (Rot, mit Confirmation):
  → "Agent terminieren", "Maximizer aktivieren", "Firma löschen"
  → Styling: Red bg ODER Red outline, IMMER mit Confirmation Dialog
```

### 4.3 Micro-Interaktionen & Dopamin-Steuerung

```yaml
reward_moments:
  agent_completes_task:
    animation: "Sanftes Aufleuchten der Issue-Karte (emerald glow, 600ms)"
    sound: false  # Kein Sound — wir sind kein Spiel
    badge: "✅ Erledigt — erstellt von [Agent Name]"
    
  new_agent_hired:
    animation: "Persona-Avatar fährt von rechts ein, pulsierender Ring (1200ms)"
    notification: "Neues Teammitglied: [Name] ist bereit."

  budget_milestone:
    animation: "Progress Bar springt mit Spring-Physics"
    notification_50: "💰 Halbzeit — Budget-Status healthy"
    notification_80: "⚠️ 80% Budget erreicht — Review empfohlen"

  roundtable_consensus:
    animation: "Alle Avatare leuchten gleichzeitig auf (synchronized glow)"
    notification: "Konsens erreicht. Strategie bereit zur Genehmigung."

micro_interaction_rules:
  - Dauer: 200-800ms (nie länger)
  - Easing: cubic-bezier(0.4, 0, 0.2, 1) — Material Design Standard
  - Keine Animation bei wiederholten Aktionen (Anti-Spam)
  - Respektiere prefers-reduced-motion
```

### 4.4 Light Mode Spezifikation

```css
/* Light Mode — für daten-intensive Arbeit am Tag */
@media (prefers-color-scheme: light) {
  :root {
    --bg-primary: #f8f9fc;
    --bg-secondary: #ffffff;
    --bg-surface: #f1f3f9;
    --bg-glass: rgba(255, 255, 255, 0.82);
    --glass-border: 1px solid rgba(0, 0, 0, 0.06);
    --glass-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    --text-primary: rgba(0, 0, 0, 0.87);
    --text-secondary: rgba(0, 0, 0, 0.55);
    --text-muted: rgba(0, 0, 0, 0.3);
  }
}
```

> **Implementierungsstatus:** Dark Mode ist primär. Light Mode ist GEPLANT, nicht implementiert.

---

## 5. Onboarding-Architektur

### 5.1 Willkommens-Sequenz

```
Screen 1: "Willkommen bei Autarch"
  → Name des Unternehmens
  → Kurze Beschreibung (1 Satz)
  → "Was möchtest du als erstes automatisieren?"
    [ ] Marketing & Content
    [ ] Softwareentwicklung
    [ ] Datenanalyse & Reporting
    [ ] Kundenservice
    [ ] Andere: ___________

Screen 2: "Wie viel Erfahrung hast du mit KI-Tools?"
  → Anfänger: "Ich nutze manchmal ChatGPT"
  → Fortgeschritten: "Ich nutze KI-Assistenten täglich"
  → Experte: "Ich baue KI-Systeme / kenne Paperclip"
  → Bestimmt: interface_mode (beginner | standard | expert)

Screen 3: "Richte dein Budget ein"
  → Slider: Monatliches Budget ($10 - $10,000+)
  → Vorauswahl basierend auf Screen 1:
    Marketing: $200/Monat empfohlen
    Software: $500/Monat empfohlen
    Analyse: $100/Monat empfohlen
  → Erklärung: "Dein Budget ist ein sicheres Limit. Wir stoppen alle Agenten bevor es überschritten wird."

Screen 4: "Dein erster KI-CEO"
  → CEO-Persona wird basierend auf Screen 1 gewählt
  → Animations-Sequenz: Avatar wird "generiert"
  → User bestätigt: "CEO einstellen" (Primary CTA)
  → Psychologisch wichtig: User manifestiert Autorität

Screen 5: "Fast geschafft — verbinde deine KI"
  → API-Key Eingabe (OpenRouter oder Anthropic oder OpenAI)
  → Sichere Eingabe: Passwort-Feld, AES-256 Verschlüsselung
  → "Ohne API-Key kann dein CEO nicht denken. Du kannst dies auch später nachholen."
  → Skip-Option für Einsteiger (Demo-Modus)
```

### 5.2 Kaltstart-Überwindung

```yaml
cold_start_resolution:
  problem: "Leeres Dashboard → Absprung"
  solution:
    1. Pre-populated Company Template basierend auf Use-Case
    2. CEO-Agent + 2 Starter-Agents automatisch erstellt
    3. 3 Demo-Issues im Backlog (Kanban ist nicht leer)
    4. Erste Nachricht vom CEO im Chat: "Willkommen! Ich habe mir dein Unternehmen angesehen und drei Aufgaben vorbereitet..."
    5. Guided Tour: 5 Highlight-Punkte im Dashboard (Tooltip-Overlays)

  template_mapping:
    marketing:
      agents: [CEO, Content-Writer, SEO-Analyst]
      issues: ["Erstelle eine Content-Strategie", "Analysiere Top-Keywords", "Verfasse einen Blog-Entwurf"]
    
    software:
      agents: [CEO, Lead-Developer, QA-Engineer]
      issues: ["Erstelle eine Architektur-Übersicht", "Implementiere Login-Flow", "Schreibe Unit Tests"]
    
    analysis:
      agents: [CEO, Data-Analyst, Report-Writer]
      issues: ["Analysiere Verkaufsdaten Q1", "Erstelle Dashboard-Prototyp", "Generiere Executive Summary"]
```

### 5.3 Secret Management UX

```
Sicherheits-Flow für API-Keys:
┌─────────────────────────────────│
│  🔒 API-Key sicher speichern   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ●●●●●●●●●●●●●●●●●●●●●  │   │  ← Passwort-Feld (keine Klartext-Anzeige)
│  │      [Augen-Icon]       │   │  ← Toggle Sichtbarkeit
│  └─────────────────────────┘   │
│                                 │
│  ✅ AES-256 verschlüsselt      │  ← Statischer Vertrauensindikator
│  ✅ Nur bei Ausführung geladen  │
│  ✅ Wird nie an Dritte gesendet │
│                                 │
│  [Abbrechen]  [Sicher speichern │  ← Primary CTA
│                                 │
└─────────────────────────────────┘
```

---

## 6. Navigation & Information Architecture

### 6.1 Sidebar-Kategorisierung (Neu)

```
┌──────────────────────────────────┐
│  AUTARCH                         │
│  ─────────────────────────────── │
│                                  │
│  🏠 Command Center              │  ← Primäre Landingpage (ehemals Overview)
│  💬 CEO Chat                    │  ← Immer sichtbar, expandable
│                                  │
│  ── OPERATE ──────────────────── │
│  📋 Issues                      │  
│  🤖 Agents                     │  
│  📁 Projects                   │  
│  📊 Org Chart                  │  
│                                  │
│  ── MONITOR ──────────────────── │
│  📈 Activity                   │  
│  💰 Costs                      │  
│  ✅ Approvals                  │  
│  📥 Inbox                      │  ← Badge für ungelesene Items
│                                  │
│  ── STRATEGIZE ────────────────  │
│  🏛️ Roundtable                │  
│  🎯 Goals                      │  
│                                  │
│  ── CONFIGURE ─────────────────  │  ← Collapsed by Default für Einsteiger
│  🧠 Knowledge                  │  
│  🔑 Secrets                    │  
│  ⚡ Routines                   │  
│  👷 Workers                    │  
│  ⚙️ Settings                  │  
│                                  │
└──────────────────────────────────┘
```

### 6.2 Navigations-Prinzipien

```yaml
navigation_rules:
  1_max_depth: "Maximal 2 Klicks bis zum Ziel-Content"
  2_breadcrumbs: "Immer sichtbar auf Detail-Pages (Three-Pane BreadcrumbBar)"
  3_context_preservation: "Sidebar-State (collapsed/expanded) wird persistiert"
  4_badge_policy:
    inbox: "Ungelesene Notifications"
    approvals: "Pending Approvals"
    costs: "Budget >80% → Warning Badge"
    issues: "In-Progress Count"
  5_keyboard_shortcuts:
    "G then I": "Go to Issues"
    "G then A": "Go to Agents"
    "G then C": "Go to Costs"
    "P": "Pause selected Agent"
    "R": "Resume selected Agent"
    "K": "Kill Switch (Maximizer only)"
    "/": "Global Search"
```

---

## 7. Mission Control: Die erste Interaktion

### 7.1 Command Center (ehemals Overview)

```
┌────────────────────────────────────────────────────────────┐
│  COMMAND CENTER                                             │
│                                                             │
│  ┌─── STATUS CARDS ────────────────────────────────────┐  │
│  │ 🤖 5 Agents    │ 📋 23 Issues   │ 💰 $127/$500    │  │
│  │ 3 active       │ 7 in-progress  │ ████░░░░ 25%    │  │
│  │ 2 sleeping     │ 12 done        │ [Details →]     │  │
│  └────────────────┴────────────────┴─────────────────┘  │
│                                                             │
│  ┌─── CEO BRIEFING (Primäres Interaktionselement) ────┐  │
│  │                                                      │  │
│  │  🧠 CEO "Helena"                        14:23 heute │  │
│  │  ─────────────────────────────────────────           │  │
│  │  "Guten Tag! 3 Issues wurden seit heute Morgen      │  │
│  │  erledigt. Der SEO-Agent hat eine Keyword-Analyse   │  │
│  │  fertiggestellt die dein Review benötigt.            │  │
│  │                                                      │  │
│  │  Außerdem: Das Content-Team liegt 2 Tage hinter     │  │
│  │  dem Zeitplan. Soll ich umpriorisieren?"             │  │
│  │                                                      │  │
│  │  [Keyword-Analyse reviewen]  [Ja, priorisiere um]  │  │
│  │                                                      │  │
│  │  ┌────────────────────────────────────────┐         │  │
│  │  │ Schreibe an deinen CEO...              │         │  │
│  │  └────────────────────────────────────────┘         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─── RECENT ACTIVITY (3 Items) ──────────────────────┐  │
│  │ ✅ SEO-Agent: Keyword-Analyse fertig       12 min  │  │
│  │ 🔄 Content-Writer: Blog-Entwurf v2        laufend  │  │
│  │ ⏸️ QA: Pausiert (Budget 95%)               2h ago  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### 7.2 Cognitive Verifier Pattern (CEO-Chat)

```yaml
cognitive_verifier:
  trigger: "User gibt eine neue Anweisung an den CEO"
  flow:
    1. CEO analysiert die Anweisung
    2. Statt sofortiger Ausführung: Strukturierte Rückfrage
    3. UI zeigt Rückfrage als interaktive Karte:
       - Dropdown-Felder statt Freitextantworten (wo möglich)
       - Vorausgefüllte Defaults basierend auf USER.md
       - "Sofort starten" Button für erfahrene User
    4. Nach Beantwortung: CEO erstellt Masterplan als Issue-Kaskade

  example:
    user_input: "Erstelle eine Inbound-Marketing-Kampagne"
    ceo_response:
      question_1: "Welches Budget steht für Media-Spend zur Verfügung?"
      type: "slider"
      default: "$500"
      question_2: "Gibt es Brand-Guidelines die ich beachten soll?"
      type: "file_upload"
      optional: true
      question_3: "Bis wann muss die Kampagne live sein?"
      type: "date_picker"
      default: "+14 Tage"
```

---

## 8. Daily Dashboard: Asynchrones Projektmanagement

### 8.1 Kanban-Board Spezifikation

```
┌──────────┬────────────┬──────────────┬───────────┬────────┐
│ BACKLOG  │    TODO    │ IN PROGRESS  │ IN REVIEW │  DONE  │
│          │            │              │           │        │
│ ┌──────┐ │ ┌────────┐ │ ┌──────────┐ │ ┌───────┐ │        │
│ │PAP-15│ │ │PAP-12  │ │ │PAP-09    │ │ │PAP-07 │ │        │
│ │──────│ │ │────────│ │ │──────────│ │ │───────│ │        │
│ │Blog  │ │ │SEO     │ │ │🤖 Content│ │ │Review │ │        │
│ │Draft  │ │ │Report  │ │ │ Writer   │ │ │needed │ │        │
│ │      │ │ │        │ │ │ 🟢 aktiv  │ │ │[👁️]   │ │        │
│ └──────┘ │ │[→]     │ │ │ ████░ 73%│ │ └───────┘ │        │
│          │ └────────┘ │ └──────────┘ │           │        │
└──────────┴────────────┴──────────────┴───────────┴────────┘
```

**Kanban-Regeln:**
- Drag-and-Drop zwischen Spalten (außer IN_PROGRESS → nur Agent darf das)
- Agent-Avatar auf der Karte wenn zugewiesen
- Live-Progress-Indikator bei laufenden Issues
- Farbcodierte Labels (Priorität, Projekt, Agent)

### 8.2 Heartbeat-Zeitleiste (Expert Mode)

```
AGENT: Marketing-CEO                    Interval: 30 min
────────────────────────────────────────────────────────────
14:00   14:30   15:00   15:30   16:00   16:30   17:00
  │       │       │       │       │       │       │
  ●───────●───────●───────○───────●───────○───────○
  │       │       │       │       │
  ✅      ✅      ✅      ⏭️      ✅
  3 tok   5 tok   2 tok   SKIP    8 tok
  $0.02   $0.04   $0.01   (budget)$0.06

Legend:
  ● = Successful heartbeat
  ○ = Scheduled (future)
  ⏭️ = Skipped (budget/concurrent limit)
  
Detail-Expand (Click auf ●):
┌─────────────────────────────────────┐
│ Heartbeat #4527 — 15:00:03          │
│ ──────────────────────────────────  │
│ Phase 1: Trigger ✅     (2ms)       │
│ Phase 2: Context Load ✅ (340ms)    │
│ Phase 3: Inbox Check ✅  (89ms)     │
│ Phase 4: Execution ✅    (4.2s)     │
│ Phase 5: Commit ✅       (120ms)    │
│                                     │
│ Model: hermes-4-405b                │
│ Tokens: 2,340 in / 890 out         │
│ Cost: $0.04                         │
│ Issue: PAP-09 → status: in_review   │
└─────────────────────────────────────┘
```

### 8.3 Agent Status Patterns

```yaml
agent_status_ui:
  idle:
    color: "--text-muted"
    icon: "💤"
    label: "Schläft"
    detail: "Nächster Check in X Min"
    
  running:
    color: "--accent-primary"
    icon: "⚡"
    label: "Arbeitet"
    detail: "An Issue PAP-XXX"
    animation: "Pulsierender Ring (1.5s loop)"
    
  paused:
    color: "--accent-warning"
    icon: "⏸️"
    label: "Pausiert"
    detail: "Budget/Manual → [Resume]"
    
  error:
    color: "--accent-danger"
    icon: "❌"
    label: "Fehler"
    detail: "Letzter Fehler + [Logs anzeigen]"
```

### 8.4 Orchestrierungs-Topologien (OrgChart)

```yaml
topologies:
  sequential:
    label: "Pipeline (Sequential)"
    layout: "Links → Rechts"
    use_case: "Content-Produktion (Research → Draft → Edit)"
    visual: "Pfeil-Kette mit Outputs an Übergabe-Punkten"
    
  parallel:
    label: "Hub & Spoke"
    layout: "Stern-Struktur"
    use_case: "Massen-Recherche, paralleles Web-Scraping"
    visual: "CEO in der Mitte, Worker drumherum, gleichzeitige Spinner"
    
  hierarchical:
    label: "Organigramm"
    layout: "Baum von oben nach unten"
    use_case: "Software-Entwicklung, komplexe Projekte"
    visual: "Klassisches Org-Chart mit reportsTo Linien"
```

---

## 9. Cognitive Persistence: Knowledge Base UI

### 9.1 Knowledge Hub Layout

```
┌─────────────────────────────────────────────────────────┐
│  KNOWLEDGE BASE                                          │
│                                                          │
│  Tabs: [ Profiling ] [ Daily Notes ] [ Knowledge Graph ] │
│                                                          │
│  ── PROFILING (USER.md / MEMORY.md) ──────────────────  │
│  ┌────────────────────────────────────────────────────┐ │
│  │ USER.md (Board Member Profile)           [Edit ✏️] │ │
│  │ ──────────────────────────────                     │ │
│  │ • Bevorzugt kurze, direkte Antworten               │ │
│  │ • Arbeitet primär abends (19:00-01:00)             │ │
│  │ • Nutzt Mermaid-Diagramme                          │ │
│  │ • Tokens: 340/500 (██████░░ 68%)                   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ── DAILY NOTES ───────────────────────────────────────  │
│  │ 📅 29.03.2026                                       │ │
│  │ • CEO: Keyword-Analyse fertiggestellt               │ │
│  │ • Content-Writer: Blog Draft v2 erstellt            │ │
│  │ • Budget: $47 von $500 verbraucht                   │ │
│  │ 📅 28.03.2026                                       │ │
│  │ • SEO-Agent: 3 neue Skills gelernt                  │ │
│  │ • Compounding: 4 Fakten extrahiert                  │ │
│                                                          │
│  ── KNOWLEDGE GRAPH ───────────────────────────────────  │
│  │ 🔎 Suche in 247 Fakten...                          │ │
│  │ ┌─────────────────────────────┬─────────┬────────┐ │ │
│  │ │ Fakt                        │ Score   │ Alter  │ │ │
│  │ ├─────────────────────────────┼─────────┼────────┤ │ │
│  │ │ Dashboard Phase 6 done      │ ████ 95%│ heute  │ │ │
│  │ │ RLS auf allen 71 Tabellen   │ ███░ 87%│ 1 Tag  │ │ │
│  │ │ Hermes 405B als Primary     │ ██░░ 50%│ 30 Tage│ │ │  ← Ausgegraut
│  │ └─────────────────────────────┴─────────┴────────┘ │ │
└─────────────────────────────────────────────────────────┘
```

### 9.2 Decay-Visualisierung

```css
/* Knowledge Graph Zeilen: Opacity basierend auf Decay Score */
.knowledge-fact[data-score="high"]  { opacity: 1.0; }   /* Score > 0.8  */
.knowledge-fact[data-score="mid"]   { opacity: 0.65; }  /* Score 0.4-0.8 */
.knowledge-fact[data-score="low"]   { opacity: 0.35; }  /* Score < 0.4  */
.knowledge-fact[data-score="low"]::after {
  content: "archiviert";
  font-size: 0.7rem;
  color: var(--text-muted);
}
```

---

## 10. Agent Marketplace & HR UI

### 10.1 Rekrutierungs-Flow

```
Step 1: "Neuen Agent einstellen"
  → Marketplace: Kuratierte Agent-Templates
  → ODER Custom: Blank Agent + Wizard
  → Progressive Disclosure: Zunächst nur Name + Kurzbeschreibung

Step 2: Profiling
  → Rolle wählen (CEO, Manager, Spezialist, Support)
  → reportsTo: Dropdown aus Organigramm
  → Heartbeat-Intervall: Slider mit Human-Labels
    "Schnell (10 min)" ← ─── → "Gemütlich (60 min)"

Step 3: Budget & Constraints
  → Monatliches Budget: Slider
  → Max Concurrent Runs: 1 (Default, Expert-Only changeable)

Step 4: Persönlichkeit (SOUL.md)
  → Template oder Custom
  → Vorschau: "So wird dein Agent kommunizieren"

Step 5: Bestätigung
  → Zusammenfassung aller Einstellungen
  → "Agent einstellen" (Primary CTA)
  → Animation: Agent "kommt an Bord"
```

### 10.2 Skill-Evolution Notification

```
┌──────────────────────────────────────────────────────┐
│  🧬 Neuer Skill entdeckt!                            │
│  ──────────────────────────                          │
│  Dein SEO-Agent hat einen wiederholten Workflow       │
│  optimiert und als neuen Skill gespeichert:           │
│                                                       │
│  📦 "Keyword-Cluster-Analyse"                        │
│  Schritte: Web-Suche → Keyword-Extraktion → Cluster  │
│  Erfolgsrate: 94% (8 von 9 Runs erfolgreich)         │
│                                                       │
│  [Als Skill speichern]  [Verwerfen]  [Details →]     │
└──────────────────────────────────────────────────────┘
```

---

## 11. Roundtable UX: Kollaborative KI-Debatten

> **Status:** ✅ Implementiert (v9, 29.03.2026). Existierende Roundtable.tsx + Roundtable.css.

### 11.1 Meeting-Raum-Analogie

```yaml
roundtable_ui:
  layout: "WhatsApp-style Chat mit Avatar-Leiste oben"
  participants: "Avatare am oberen Rand mit Status-Indikator"
  discussion_flow:
    1_briefing: "Moderator-Nachricht mit Scope"
    2_solo: "Jeder Agent analysiert (Live-Typing Animation)"
    3_confrontation: "Gegenseitige Referenzen (@Agent antwortet auf @Agent)"
    4_consensus: "Moderator fasst zusammen"
    5_approval: "Board Member klickt 'Strategie genehmigen'"
  post_approval:
    - "CEO bricht Strategie in Issues herunter"
    - "Issues erscheinen automatisch im Kanban"
  
  visual_equity:
    rule: "Alle Teilnehmer haben gleiche visuelle Präsenz (Equal Visual Salience)"
    implementation: "Identische Avatar-Größe, gleicher Platz im Chat"
```

### 11.2 Template-System

```
Bereits implementierte Templates (6):
  1. Strategic Planning — Vision, Markt, Risiken
  2. Product Review — Feature-Bewertung, Priorisierung
  3. Risk Assessment — Taleb-inspirierte Risikoanalyse
  4. Technical Architecture — System-Design-Entscheidungen
  5. Budget Review — Kosten-Nutzen, ROI
  6. Custom — Freie Agenda-Definition
```

---

## 12. Maximizer Mode: UX für Hochrisiko

### 12.1 Aktivierungs-Flow (Maximum Friction Design)

```
Step 1: VERSTECKTE NAVIGATION
  → Nicht im Hauptmenü
  → Zugang nur via: Settings → Advanced → Maximizer
  → Alternative: Keyboard Shortcut Ctrl+Shift+M (nur Expert Mode)

Step 2: VISUELLER KONTEXTWECHSEL
  → Farbschema wechselt: Dark → Deep Red / Dark
  → Header-Bar wird rot: "⚠️ MAXIMIZER MODE"
  → Alle anderen UI-Elemente werden gedimmt

Step 3: ZIEL-DEFINITION (Boolean Stopp-Bedingung)
  → Pflichtfeld: "Stoppe wenn:"
  → Dropdown: Maschinenlesbare Bedingung
    "Alle Issues in Projekt X sind done"
    "Budget erreicht $___"
    "Custom: [Freitext → wird vom CEO interpretiert]"
  → KEIN "Stoppe nie" — immer eine Bedingung

Step 4: KRYPTOGRAFISCHES APPROVAL
  → 2FA: Email-Code oder Authenticator
  → Bestätigungssatz tippen: "MAXIMIZER AKTIVIEREN"

Step 5: TELEMETRIE-DASHBOARD
  → Echtzeit: Tokens/Minute, Kosten/Minute, Issues/Stunde
  → Prominenter Kill Switch: Großer roter Button
  → Auto-Pause bei Anomalien (Circuit Breaker)
```

### 12.2 Kill Switch Spezifikation

```yaml
kill_switch:
  visual:
    size: "80px x 80px — dominantes UI-Element"
    color: "Red pulsing (#ef4444 → #dc2626, 2s loop)"
    position: "Fixed bottom-right, immer sichtbar"
    label: "STOPP"
  action:
    1: "Sofortiger DB-Flag: maximizer_active = false"
    2: "Alle laufenden Heartbeats: abort signal"
    3: "Ausstehende Webhooks: terminiert"
    4: "Agent-Status: alle → paused"
    5: "Notification: 'Maximizer gestoppt. X Issues in-progress eingefroren.'"
  confirmation: false  # Kein Confirm-Dialog beim Kill — sofort!
```

---

## 13. Compliance & Governance UI

### 13.1 Datensouveränitäts-Anzeige

```
┌──────────────────────────────────────────┐
│  🔒 Datenverarbeitung                    │
│  ──────────────────────                  │
│  Processing: ☁️ Cloud (eu-central-1)     │
│  LLM Provider: OpenRouter (US-Relay)     │
│  Daten-Residenz: 🇩🇪 Frankfurt           │
│  PII-Scrubbing: ✅ Aktiv                 │
│                                          │
│  [Governance-Details →]                  │
└──────────────────────────────────────────┘
```

### 13.2 Compliance-Indikatoren

| Indikator | Position | Sichtbarkeit |
|---|---|---|
| "Processing in EU" Badge | Footer oder Header | Immer |
| PII-Scrubbing-Status | Settings + Agent Detail | Expert Mode |
| RLS-Isolation Badge | Settings | Expert Mode |
| Data Provenance Link | Knowledge Graph Items | Klick auf Fakt |
| Consent Banner | Erster Login | Einmalig |
| DPA-Status | Settings → Privacy Panel | Admin Only |

### 13.3 Audit Trail UI

```yaml
data_provenance:
  accessible_via: "Klick auf beliebigen Knowledge-Fakt → 'Woher?' Link"
  shows:
    - Quell-Heartbeat-Run (ID, Timestamp)
    - Genutztes LLM-Modell
    - Input-Kontext (anonymisiert)
    - Token-Count und Kosten
    - Agent der den Fakt generiert hat
  format: "Expandable Detail-Panel (nicht neues Fenster)"
```

---

## 14. Aktueller Ist-Zustand vs. Soll-Zustand

### 14.1 Page-by-Page Assessment

| Page | LOC | Ist-Zustand | Soll-Zustand | Gap |
|---|---|---|---|---|
| `Overview.tsx` | 4.6KB | Leere KPI-Cards | Command Center mit CEO-Chat | 🔴 Major |
| `Agents.tsx` | 7.5KB | Card-Grid, funktional | Marketplace-Feeling, Kategorie-Filter | 🟡 Medium |
| `AgentDetail.tsx` | 27.8KB | Three-Pane, solide | + Heartbeat-Zeitleiste, + Confidence Bars | 🟡 Medium |
| `Issues.tsx` | 15.8KB | List + Filter | + Kanban-View Toggle | 🟡 Medium |
| `IssueDetail.tsx` | 36.7KB | Three-Pane, solide | + Inline-Code-Viewer für Work Products | 🟢 Minor |
| `Costs.tsx` | 28.7KB | Tabellen + Charts | + Circuit Breaker Visual, + Budget Slider | 🟡 Medium |
| `Roundtable.tsx` | 34.9KB | WhatsApp-Chat, Templates | ✅ Feature-Complete (v9) | ✅ Done |
| `Knowledge.tsx` | 23.8KB | 3 Tabs, Upload | + Decay Visualization, + FTS Search | 🟡 Medium |
| `OrgChart.tsx` | 21KB | Statisch | + Topologie-Switch (Seq/Hub/Hier) | 🟡 Medium |
| `Inbox.tsx` | 23KB | Tab-basiert | ✅ Solide | 🟢 Minor |
| `Approvals.tsx` | 10.8KB | List + Detail | + Bulk Actions | 🟢 Minor |
| `Settings.tsx` | 12KB | Tabs | + Interface Mode Switch + Compliance Panel | 🟡 Medium |
| **Onboarding** | 0KB | ❌ Nicht existent | 5-Screen Wizard | 🔴 Critical |
| **Maximizer** | 0KB | ❌ Nicht existent | Friction-basierter Hochrisiko-Flow | 🔴 Critical |

### 14.2 Priorisierte Roadmap

```
PRIORITY 1 (UX-Critical — nächste Iteration):
  □ Onboarding Wizard (5 Screens)
  □ Sidebar Kategorisierung (OPERATE / MONITOR / CONFIGURE)
  □ Overview → Command Center (CEO-Chat Integration)
  □ Settings: Interface Mode Switch

PRIORITY 2 (Daily Driver Improvements):
  □ Issues: Kanban-View Toggle
  □ Agents: Heartbeat-Zeitleiste (Expert Mode)
  □ Costs: Budget Circuit Breaker Visual
  □ OrgChart: Topologie-Switch

PRIORITY 3 (Power Features):
  □ Maximizer Mode
  □ Knowledge: Decay Visualization
  □ Agent Marketplace Templates
  □ Skill Evolution Notifications

PRIORITY 4 (Compliance Polish):
  □ Data Provenance Links
  □ Processing Location Badge
  □ PII-Scrubbing Status Indicator
  □ Consent Management Panel
```

---

## 15. Implementation Priorities

### 15.1 Implementierungs-Checkliste für Build-Agents

```yaml
when_building_new_pages:
  1_check_this_wiki: "docs/wiki/ux-architecture.md — Ist-vs-Soll Tabelle"
  2_respect_disclosure: "Level 0/1/2 — welcher Detail-Level für welche Persona?"
  3_button_hierarchy: "PRIMARY hyper-saturiert → SECONDARY glass → GHOST text-only"
  4_micro_interactions: "200-800ms, cubic-bezier(0.4,0,0.2,1), prefers-reduced-motion"
  5_mobile_first: false  # Desktop-First — B2B SaaS
  6_dark_mode_primary: true
  7_glassmorphism: "bg-glass + glass-blur + glass-border für Cards"
  8_three_pane: "Wiederverwendbar: ThreePaneLayout, BreadcrumbBar, PropertiesPanel"

when_modifying_existing_pages:
  1_no_regression: "Bestehende Funktionalität NICHT brechen"
  2_progressive: "Neues Feature = neue Detailebene, nicht Front-and-Center"
  3_power_user_safe: "NIEMALS Power-User-Features entfernen — nur verstecken für Einsteiger"
```

### 15.2 Component-Level Patterns

```typescript
// Standard-Pattern für Progressive Disclosure
interface DisclosureLevel {
  level: 'board' | 'manager' | 'expert';
}

// Jede Page MUSS dies respektieren:
const { interfaceMode } = useUserPreferences();
// → 'beginner' | 'standard' | 'expert'

// Beispiel:
{interfaceMode === 'expert' && (
  <HeartbeatTimeline agentId={agent.id} />
)}
```

---

> **Änderungshistorie:**
> - v1.0.0 (29.03.2026): Initiale Version aus Paperclip+Hermes UX Report
