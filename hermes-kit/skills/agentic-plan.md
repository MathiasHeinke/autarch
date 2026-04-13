---
description: Autonome Multi-Phase Plan Execution mit MAXIMALER Detailtiefe, Fortress-Gates, Feasibility Probes, EVAL-Harness, Post-Delivery Multi-Lens Audit (Sherlock + Mr. Robot + Elon + Carmack), Ramsay-Hotfix (ALLE Findings ALLER Linsen) und Missing Puzzle Piece Gate
---

// turbo-all

# 🏗️ Agentic Plan v2.0 — Maximum Detail Depth Execution

> **KERNPRINZIP: Jeder Plan ist so detailliert, dass ein fremder Agent ihn BLIND ausführen könnte — ohne eine einzige Rückfrage.**
>
> Wenn der Plan 3000 Zeilen lang wird — gut. Kein Plan mehr ohne maximale Details.
> Jedes Detail wird im Prozess nochmal beleuchtet ob es so wie angedacht gebaut werden kann.

Erstellt einen exhaustiven Implementierungsplan mit Dependency-Chain, Feasibility Probes, vollständigen Code-Spezifikationen pro Datei, EVAL-Harness pro Phase, und autonomer Execution mit Fortress-Gates.

> Auslöser: `/agentic-plan [Feature/Aufgabe]`
> Optionen: `--fortress` (erzwingt Fortress-Integration), `--no-fortress` (deaktiviert Fortress)
> Referenz-Format: `.antigravity/agentic-plan-template.md`

---

## 🔴 UNVERHANDELBARE REGELN (Verstoß = Plan ungültig)

> [!CAUTION]
> **Diese Regeln sind ABSOLUT. Es gibt KEINE Ausnahme, KEINE Abkürzung, KEIN "reicht schon".**

### Regel 1: MAXIMALE DETAILTIEFE
- Jede Phase MUSS so detailliert sein, dass ein Agent sie OHNE Rückfragen ausführen kann
- "Passe die Funktion an" ist VERBOTEN → Stattdessen: Exakte vorher/nachher Signatur, Parameter, Return-Typen, Error-Cases
- "Erstelle eine Komponente" ist VERBOTEN → Stattdessen: Props-Interface, State-Management, Render-Logik, Event-Handler, Styling-Spezifikation
- "Ändere die Datenbank" ist VERBOTEN → Stattdessen: Exaktes SQL mit Tabelle, Spalten, Typen, Constraints, RLS, Indizes, Migration-File
- Zeilenlänge des Plans ist IRRELEVANT — 500 Zeilen, 3000 Zeilen, 8000 Zeilen — Detail schlägt Kürze. IMMER.

### Regel 2: FEASIBILITY PROBE PRO DETAIL
- Jedes geplante Detail wird VOR Execution gegen den tatsächlichen Code geprüft
- "Ich nehme an, die Funktion existiert" ist VERBOTEN → Code lesen, verifizieren, Signatur dokumentieren
- "Das Interface hat wahrscheinlich…" ist VERBOTEN → Datei öffnen, exakte Typen extrahieren
- Jede Annahme die nicht gegen den echten Code verifiziert wurde = Planfehler = Abort-Risiko

### Regel 3: EVAL-GATES SIND BEWEISFÜHRUNG
- Kein vages "Build kompiliert" — Exakte Commands mit exakten erwarteten Outputs
- Kein "funktioniert wie erwartet" — Definiere WAS "wie erwartet" bedeutet, mit konkreten Werten
- Jedes EVAL ist ein Gerichtsverfahren: Beweise sammeln, Beweise vorlegen, Urteil sprechen

### Regel 4: FORTRESS NACH JEDER PHASE
- Auch bei "trivialen" Phasen — es gibt keine triviale Phase
- Fortress-Gate ist NICHT optional und NICHT abkürzbar
- Bei Failure: Fix ODER Abort — kein "ignorieren und weitermachen"

### Regel 5: KEIN CODE VOR USER-APPROVAL
- Plan präsentieren → User gibt "Go" → DANN ERST wird gebaut
- Dieses Gate ist absolut — keine Ausnahme, kein "ich fang schonmal an"

---

## Phase 0: Context & Deep Dependency-Analyse

### 0.1 Kontext laden (PFLICHT — IMMER, NICHT CONDITIONAL!)

> **Eiserne Regel:** Ohne Systemverständnis wird KEIN Plan geschrieben.

```text
PFLICHT-LEKTÜRE (in dieser Reihenfolge — KEINE überspringen):
1. memory-bank/activeContext.md       → Aktueller Arbeitsstand
2. memory-bank/progress.md            → Was fertig, was offen
3. memory-bank/system-index.md        → Boot-Index (Codebase-Karte)
   ODER ARCHITECTURE.md               → (falls system-index nicht existiert)
4. DESIGN.md                          → Design System (bei UI-Tasks)
5. AGENTS.md                          → Agent Brief + Coding Standards
6. .antigravity/logs/architect-memory.md → Active Directives + Post-Mortems
7. memory-bank/semantic-context.md    → Gewachsenes Systemverständnis (falls vorhanden)
```

ZUSÄTZLICH bei spezifischen Domänen:
- Backend/Engine → Relevante Wiki-Dateien aus system-index.md Wiki-Index laden
- UI/Design → `.antigravity/personas/steve-jobs.md` + `DESIGN.md` (PFLICHT!)
- AI/Coach → Wiki: `ai-coach-system.md`
- Security → `.antigravity/personas/mr-robot.md` + `cypher-sre.md`

### 0.2 Scope-Analyse (EXHAUSTIV, nicht "grob")

```text
Beantworte JEDE dieser Fragen — keine darf leer bleiben:

1. WAS will der User? (Feature, Bugfix, Umbau, Migration, Neubau?)
2. WARUM will der User das? (Business-Kontext, User-Pain, Tech-Debt?)
3. WELCHE Dateien/Module sind DIREKT betroffen?
   → Liste JEDE Datei mit absolutem Pfad
   → Pro Datei: Was wird geändert? (1 Satz)
4. WELCHE Dateien/Module sind INDIREKT betroffen?
   → Imports die sich ändern
   → Typen die erweitert werden
   → Tests die angepasst werden müssen
   → UI-Komponenten die die geänderten Daten konsumieren
5. WELCHE Dependencies hat der Task?
   → DB → Edge Function → Frontend?
   → Package Updates nötig?
   → Environment Variables?
   → MCP-Server Konfigurationen?
6. WELCHE Risiken gibt es?
   → Breaking Changes für bestehende User?
   → Performance-Risiken?
   → Security-Implikationen?
   → Datenbank-Migrationen die Downtime verursachen?
7. WAS ist NICHT im Scope? (Explizit ausschließen)
```

### 0.3 Dependency-Chain bestimmen (mit Begründung)

```text
Phase mit 0 Abhängigkeiten → zuerst
Phase die auf Ergebnis von Phase N baut → nach Phase N
Phase mit meisten Abhängigkeiten → zuletzt

PRO DEPENDENCY:
→ Warum hängt Phase X von Phase Y ab?
→ Was genau aus Phase Y braucht Phase X?
→ Kann diese Dependency aufgelöst werden (Parallel-Execution)?
```

Erstelle ein **detailliertes** ASCII-Diagramm der Phase-Abhängigkeiten:

```text
Phase 1 (DB Schema) ──→ Phase 2 (Edge Function)
                    ╲
                     ╲──→ Phase 3 (Types/Interfaces) ──→ Phase 4 (Frontend)
                                                    ╲
                                                     ╲──→ Phase 5 (Tests)
```

### 0.4 Fortress-Entscheidung

```text
Fortress-Integration aktivieren wenn:
  → User hat --fortress Flag gesetzt, ODER
  → Plan hat ≥5 Phasen (Default-Verhalten)
  → User kann mit --no-fortress explizit deaktivieren

Bei aktivierter Fortress:
  → Vor Phase 1: Stage 1 Baseline E2E durchführen
  → Nach letzter Phase: Stage 3–5 (Sherlock + Security + Targeted E2E)
```

---

## Phase 0.5: 🔬 FEASIBILITY PROBES (NEU — PFLICHT)

> [!CAUTION]
> **KEIN Plan wird geschrieben ohne vorher JEDEN geplanten Eingriff gegen den echten Code zu validieren.**
> Das ist der Unterschied zwischen einem Plan der funktioniert und einem Plan der beim ersten Kontakt mit der Realität zerbricht.

### Was ist ein Feasibility Probe?

Ein Feasibility Probe ist eine gezielte Code-Untersuchung die VOR dem Schreiben des Plans durchgeführt wird. Ziel: Sicherstellen dass jeder geplante Eingriff auf korrekten Annahmen basiert.

### Probe-Typen

#### Probe Typ A: Signatur-Probe
```text
Für JEDE Funktion/Klasse/Hook die modifiziert werden soll:
1. Öffne die Datei → Lies die EXAKTE aktuelle Signatur
2. Dokumentiere: Name, Parameter (mit Typen), Return-Typ, Generics
3. Dokumentiere: Wo wird diese Funktion importiert/aufgerufen? (grep)
4. Dokumentiere: Welche Side Effects hat sie? (DB-Calls, API-Calls, State-Mutations)
5. Ergebnis: "Signatur X muss zu Y geändert werden → Impact auf Z Aufrufer"
```

#### Probe Typ B: Schema-Probe
```text
Für JEDE geplante Datenbankänderung:
1. Lies das aktuelle Schema (Supabase Dashboard / Migration Files)
2. Dokumentiere: Exakte Tabelle, Spalten, Typen, Constraints, Indizes
3. Dokumentiere: RLS Policies (wer darf was?)
4. Dokumentiere: Foreign Keys / Cascades
5. Dokumentiere: Edge Functions die diese Tabelle lesen/schreiben
6. Ergebnis: "Migration XY ist kompatibel mit bestehendem Schema"
```

#### Probe Typ C: Import-Graph-Probe
```text
Für JEDE Datei die strukturell geändert wird (neue Exports, geänderte Types):
1. grep: Wer importiert aus dieser Datei?
2. Dokumentiere: Alle Importeure + welche Exports sie nutzen
3. Dokumentiere: Welche Imports brechen bei der geplanten Änderung?
4. Ergebnis: "Änderung an X bricht Import in Y → Y muss auch geändert werden"
```

#### Probe Typ D: Runtime-Probe
```text
Für JEDE Annahme über Laufzeitverhalten:
1. Gibt es existierende Tests die das aktuelle Verhalten testen?
2. Was passiert aktuell bei Edge Cases (null, undefined, leere Arrays)?
3. Gibt es Error Boundaries / try-catch?
4. Ergebnis: "Aktuelles Verhalten bei Edge Case X ist Y → Plan berücksichtigt das"
```

#### Probe Typ E: Env/Config-Probe
```text
Für JEDE Annahme über Environment/Konfiguration:
1. Welche ENV-Variablen werden benötigt?
2. Existieren sie bereits? In welchen Environments (dev/staging/prod)?
3. Welche Config-Dateien müssen angepasst werden?
4. Ergebnis: "ENV X existiert/fehlt → wird in Phase Y angelegt"
```

### Probe-Dokumentation

```markdown
## 🔬 Feasibility Probes — Ergebnisse

### Probe 1: [Typ A] [Ziel]
- **Datei:** [absoluter Pfad]
- **Aktuelle Signatur:** `[exakte Signatur]`
- **Geplante Änderung:** `[neue Signatur]`
- **Impact:** [X Aufrufer müssen angepasst werden]
- **Feasibility:** ✅ Machbar / ⚠️ Machbar mit Anpassungen / ❌ Nicht machbar
- **Falls ⚠️/❌:** [Was muss am Plan geändert werden?]

### Probe 2: [Typ B] [Ziel]
...
```

> [!IMPORTANT]
> **Jede ❌-Probe stoppt den Plan.** Der Plan wird umgeschrieben bis alle Probes ✅ oder ⚠️ sind.
> **Jede ⚠️-Probe muss eine konkrete Lösung im Plan haben.**

---

## Phase 1: Plan schreiben (MAXIMALE DETAILTIEFE)

### 1.0 Detail-Standard Definition

> **Der Plan ist das Artefakt. Nicht der Code. Der Plan MUSS so präzise sein, dass der Code nur noch ein mechanisches Abtippen ist.**

Jede Phase im Plan MUSS folgende Abschnitte enthalten — KEINER darf fehlen:

```text
PFLICHT-ABSCHNITTE PRO PHASE:
├── Ziel (Was + Warum, 2-4 Sätze)
├── Vorbedingungen (Was muss VOR dieser Phase wahr sein?)
├── Änderungen (Pro Datei — JEDE Datei eigener Block)
│   ├── Datei-Pfad (absolut)
│   ├── Änderungstyp: [MODIFY/NEW/DELETE]
│   ├── Aktuelle Struktur (aus Feasibility Probe)
│   ├── Geplante Änderung (Diff-Format oder detaillierte Spezifikation)
│   ├── Neue/Geänderte Interfaces/Types (vollständig, mit JEDEM Property)
│   ├── Neue/Geänderte Funktionen (Signatur + Beschreibung der Logik)
│   ├── Error Handling (WELCHE Fehler, WIE behandelt)
│   ├── Edge Cases (Was passiert bei null/undefined/leere Daten?)
│   └── Import-Änderungen (Was wird wo neu importiert?)
├── Data Flow (Wie fließen die Daten durch die geänderten Module?)
├── Failure Modes (Was kann schiefgehen + Mitigation)
├── Feasibility-Referenz (Welche Probes validieren diese Phase?)
├── EVAL Gate (Acceptance + Rejection + Test Commands)
└── Geschätzter Aufwand + Complexity Rating
```

### 1.1 Plan-Struktur (Exhaustiv)

Erstelle den Plan im folgenden Format — JEDER Abschnitt ist PFLICHT:

```markdown
# [Plan-Titel]

> **[N] Phasen. [N] EVAL-Gates. 1 Final Session EVAL. [N] Feasibility Probes durchgeführt.**
> **Geschätzter Gesamtaufwand: ~[X]h. Fortress: [aktiviert/deaktiviert].**

---

## Zusammenfassung

### Was wird gebaut?
[3-5 Sätze: Business-Kontext + technische Lösung]

### Warum?
[2-3 Sätze: Problem das gelöst wird]

### Architektur-Überblick
[Mermaid-Diagramm oder ASCII-Art: Wie die Komponenten zusammenspielen]

### Betroffene Module (Impact-Matrix)
| Modul/Datei | Änderungstyp | Complexity | Risiko |
|-------------|-------------|------------|--------|
| [absoluter Pfad] | MODIFY/NEW/DELETE | ⭐-⭐⭐⭐⭐⭐ | 🟢/🟡/🔴 |

### Nicht im Scope
[Explizit ausschließen was NICHT gemacht wird]

---

## 🔬 Feasibility Probes — Zusammenfassung

[Alle Probe-Ergebnisse hier, gruppiert nach Typ]
[Nur Probes mit ⚠️ hervorheben + deren Lösung im Plan]

---

## Execution Order (Abhängigkeitskette)

[Detailliertes ASCII-Diagramm]

> [!IMPORTANT]
> Reihenfolge-Begründung:
> - Phase 1 zuerst weil: [Grund]
> - Phase 2 nach Phase 1 weil: [konkreter Output von Phase 1 der Phase 2 braucht]
> - ...

---

## Phase N: [Titel] (~Xh) — Complexity: [⭐–⭐⭐⭐⭐⭐] — Risiko: [🟢/🟡/🔴]

### Ziel
[2-4 Sätze: Was wird in dieser Phase erreicht und warum ist das nötig?]

### Vorbedingungen
[Was MUSS vor dieser Phase wahr sein? Welcher Output aus welcher vorherigen Phase wird benötigt?]
- [ ] Phase X EVAL bestanden
- [ ] [Konkreter Output] existiert und hat Format Y
- [ ] [Build/Test] kompiliert fehlerfrei

### Änderungen

#### [MODIFY/NEW/DELETE] [filename](file:///absolute/path)

**Aktuelle Struktur** (verifiziert durch Probe [N]):
```typescript
// EXAKTE aktuelle Signatur/Interface/Struktur
```

**Geplante Änderung:**
```diff
- [exakter Ist-Zustand]
+ [exakter Soll-Zustand]
```

**Neue/Geänderte Types/Interfaces:**
```typescript
// VOLLSTÄNDIGE Interface-Definition — JEDES Property, JEDER Type
interface NewType {
  id: string;           // UUID, auto-generated
  name: string;         // User-provided, max 255 chars
  status: 'active' | 'inactive';  // Default: 'active'
  createdAt: Date;      // Auto-set on insert
  // ... JEDE Property dokumentiert
}
```

**Neue/Geänderte Funktionen:**
```typescript
// Signatur + Beschreibung der internen Logik
async function newFunction(
  param1: Type1,     // [Beschreibung + Constraints]
  param2?: Type2,    // [Optional, Default-Wert, Beschreibung]
): Promise<ReturnType> {
  // Schritt 1: [Was passiert hier?]
  // Schritt 2: [Was passiert hier?]
  // Error: [Welcher Fehler kann hier auftreten?] → [Wie wird er behandelt?]
  // Edge Case: [Was wenn param1 null?] → [Verhalten]
}
```

**Error Handling:**
| Error-Szenario | Auslöser | Behandlung | User-Feedback |
|---------------|----------|------------|---------------|
| [Fehler 1] | [Wann] | [try/catch, Fallback, etc.] | [Toast, Error Boundary, etc.] |
| [Fehler 2] | [Wann] | [Wie] | [Was sieht der User?] |

**Edge Cases:**
| Edge Case | Input | Erwartetes Verhalten | Aktuelles Verhalten (Probe) |
|-----------|-------|----------------------|----------------------------|
| Leere Liste | `[]` | Leerer Zustand anzeigen | [aus Probe] |
| Null-Wert | `null` | Fallback auf Default | [aus Probe] |

**Import-Änderungen:**
```diff
+ import { NewType } from '@/types/newModule';
+ import { newFunction } from '@/lib/newModule';
- import { OldThing } from '@/lib/oldModule';  // Nicht mehr benötigt
```

### Data Flow
```text
[User Action] → [Component] → [Hook/State] → [API Call] → [Edge Function] → [DB]
                                                                            ↓
                                                                    [Response] → [State Update] → [UI Re-render]
```

### Failure Modes & Mitigation
| Failure Mode | Wahrscheinlichkeit | Impact | Mitigation |
|-------------|-------------------|--------|------------|
| [Was kann schiefgehen] | 🟢/🟡/🔴 | [Konsequenz] | [Plan B] |

### Feasibility-Referenz
- Probe [N] (Typ A): [Ergebnis] → ✅ Plan berücksichtigt
- Probe [M] (Typ C): [Ergebnis] → ⚠️ Zusätzliche Änderung in [Datei] nötig

### 🏰 EVAL Gate N

#### ✅ Acceptance Criteria (MINDESTENS 5 — binär prüfbar)
- [ ] [Konkretes Kriterium 1 — exakte Werte, nicht "funktioniert"]
- [ ] [Konkretes Kriterium 2 — z.B. "Typ X hat Properties a, b, c"]
- [ ] [Konkretes Kriterium 3 — z.B. "Funktion Y wirft TypeError bei null-Input"]
- [ ] [Funktionaler Test — "Wenn User X tut, passiert Y mit Wert Z"]
- [ ] [Integration — "Import in Datei A kompiliert fehlerfrei"]

#### 🚫 Rejection Criteria (MINDESTENS 3)
- [ ] [Anti-Pattern 1 — z.B. "Kein `any` in neuen/geänderten TypeScript-Dateien"]
- [ ] [Anti-Pattern 2 — z.B. "Keine hardcoded URLs/Secrets"]
- [ ] [Anti-Pattern 3 — z.B. "Kein try-catch ohne Logging"]
- [ ] [Architektur-Violation — z.B. "Kein direkter DB-Call aus Komponente"]

#### 🧪 Test Commands (MINDESTENS 3 — jeder mit exaktem Expected Output)
```bash
# Test 1: Build-Integrität
npm run build 2>&1 | tail -5
→ EXPECTED: "Build completed successfully" ODER "✓ compiled successfully"

# Test 2: Type-Safety
npx tsc --noEmit 2>&1 | grep -c "error TS"
→ EXPECTED: 0

# Test 3: Funktionaler Test
grep -r "newFunction" src/ --include="*.ts" --include="*.tsx" | wc -l
→ EXPECTED: ≥ [N] (für N erwartete Aufrufe)

# Test 4: Anti-Pattern Check
grep -rn "any" [neue-dateien] --include="*.ts" --include="*.tsx"
→ EXPECTED: keine Treffer

# Test 5: [Spezifischer funktionaler Test für diese Phase]
[Command] → [Exaktes erwartetes Ergebnis]
```

#### 🔬 Post-EVAL Feasibility Re-Check
```text
Nach dem EVAL: Prüfe ob die Outputs dieser Phase die Vorbedingungen
der NÄCHSTEN Phase korrekt erfüllen:
- [ ] Output-Format stimmt mit erwarteter Eingabe von Phase N+1 überein
- [ ] Keine unerwarteten Seiteneffekte die Phase N+1 blockieren
- [ ] Types/Interfaces die Phase N+1 benötigt sind korrekt exportiert
```

#### Verdict: ✅ PASS | ❌ FAIL → [Konkreter Fix-Plan oder Abort-Grund]

---

## 🏰 Final Session EVAL (Verschärft)

### ✅ Session-Acceptance (ALLE müssen PASS sein)
- [ ] `npm run build` / `tsc --noEmit` → 0 errors, 0 warnings in neuen Dateien
- [ ] Alle Phase-EVALs: PASS (mit dokumentierten Beweisen)
- [ ] Grep-Checks: Keine verbotenen Patterns in neuen/geänderten Dateien:
  ```bash
  grep -rn "any" [alle-geänderten-dateien] --include="*.ts" --include="*.tsx"
  grep -rn "console.log" [alle-geänderten-dateien] --include="*.ts" --include="*.tsx"
  grep -rn "TODO\|FIXME\|HACK\|XXX" [alle-geänderten-dateien]
  grep -rn "password\|secret\|api.key\|token" [alle-geänderten-dateien] --include="*.ts"
  ```
- [ ] Browser/App: [Konkreter User-Flow mit Schritt-für-Schritt-Anleitung]
- [ ] Data Flow: Datenfluss von Eingabe bis Persistenz einmal komplett durchgetestet
- [ ] Error Handling: Mindestens 1 Error-Pfad manuell verifiziert
- [ ] Performance: Keine offensichtlichen N+1 Queries, kein unnötiges Re-Rendering

### 🚫 Session-Rejection (EINE davon → FAIL)
- [ ] Unresolved `any` in neuen/geänderten TS-Dateien
- [ ] `console.log` in Production-Pfaden (nur `console.error`/`console.warn` erlaubt)
- [ ] Hardcoded Secrets/Keys/URLs
- [ ] Fehlende Error Boundaries / try-catch auf async Operationen
- [ ] Geänderte Dateien ohne entsprechenden EVAL-Nachweis
- [ ] Nicht-verifizierte Annahmen (Feasibility Probe fehlend oder ❌)
- [ ] Breaking Change ohne explizite Migration-Strategie
- [ ] Neue Dependency ohne Begründung

### 🧪 Final Test Suite
```bash
# 1. Full Build
npm run build 2>&1 | tail -10

# 2. Type Check
npx tsc --noEmit 2>&1

# 3. Anti-Pattern Sweep (alle geänderten Dateien)
git diff --name-only [start-commit] HEAD | xargs grep -n "any\|console\.log\|TODO\|FIXME"

# 4. Import-Integrität
npm run build 2>&1 | grep -i "cannot find module\|not found"

# 5. [Projekt-spezifische Tests]
[Commands]
```

### Verdict: ✅ SHIP IT | ❌ REWORK → [Welche Phase, welches Problem, welcher Fix]
```

### 1.2 Lead-Persona pro Phase bestimmen

| Task-Domäne | Lead-Persona | Wann |
|---|---|---|
| Backend/Engine/DB | 🖥️ John Carmack | Edge Functions, DB Schema, Compute Engines |
| UI/UX/Design | 🖤 Steve Jobs + ⚛️ Rauno Freiberg | Komponenten, Styling, User Flows |
| Fullstack | Carmack + Rauno (alternierend) | API + Frontend zusammen |
| Strategie/Architektur | 🧠 Karpathy | Systemdesign, große Refactorings |
| Deletion/Vereinfachung | 🚀 Elon Musk | Dead Code, Simplification |
| Security | 🕵️ Mr. Robot + Cypher | RLS, Auth, PII, DSGVO |
| Testing/Audit | 🔍 Sherlock Holmes | Code Review, Bug Hunting |

### 1.3 Detail-Checkliste vor Plan-Abgabe

> [!IMPORTANT]
> **Bevor der Plan dem User präsentiert wird, MUSS der Agent diese Checkliste durchgehen.**
> **Jede ❌ → Plan ist nicht bereit.**

```text
DETAIL-CHECKLISTE:

□ Hat JEDE Phase mindestens 5 Acceptance Criteria?
□ Hat JEDE Phase mindestens 3 Rejection Criteria?
□ Hat JEDE Phase mindestens 3 Test Commands mit Expected Output?
□ Ist JEDE betroffene Datei mit absolutem Pfad referenziert?
□ Sind ALLE neuen/geänderten Interfaces VOLLSTÄNDIG dokumentiert (jedes Property)?
□ Sind ALLE neuen/geänderten Funktionen mit Signatur + Logik-Beschreibung dokumentiert?
□ Sind ALLE Error-Szenarien pro Phase dokumentiert?
□ Sind ALLE Edge Cases pro Phase dokumentiert?
□ Hat JEDE Datei-Änderung eine Import-Änderungs-Sektion?
□ Gibt es ein Data-Flow-Diagramm pro Phase?
□ Gibt es eine Failure-Modes-Tabelle pro Phase?
□ Wurde JEDE Annahme durch einen Feasibility Probe validiert?
□ Gibt es KEINEN Probe mit ❌ Status?
□ Hat JEDER ⚠️-Probe eine dokumentierte Lösung?
□ Ist das Dependency-Diagramm vollständig und begründet?
□ Ist die Complexity-Bewertung pro Phase nachvollziehbar?
□ Gibt es ein Final Session EVAL mit verschärften Kriterien?
□ Gibt es einen Post-EVAL Feasibility Re-Check pro Phase?
```

---

## Phase 2: User-Approval

> [!IMPORTANT]
> **EINMALIGE Freigabe.** Der User reviewt den EXHAUSTIVEN Plan und gibt ein einziges Mal "Go". Danach läuft alles autonom.

Präsentiere dem User:
- Plan mit ALLEN Phasen (ungekürzt — der User sieht ALLES)
- Feasibility-Probe-Ergebnisse (Zusammenfassung, Details im Plan)
- Dependency-Diagramm mit Begründung
- Impact-Matrix (welche Module, welches Risiko)
- Geschätzte Gesamtdauer
- Fortress-Status (aktiviert/deaktiviert)
- Bekannte Risiken und Mitigations

**Gate:** Kein Code vor User-Approval. Das ist nicht verhandelbar.

---

## Phase 3: Fortress Baseline (Optional)

> **Skip wenn:** Fortress nicht aktiviert

Falls Fortress aktiviert:
1. Führe `/fortress-audit` Stage 1 durch (Baseline E2E + Engine Eval)
2. Speichere Baseline-Snapshot in `memory-bank/e2e-snapshots/`
3. Fixe Baseline-Failures sofort (Stage 2: Ramsay Hotfix)

**Gate:** Baseline muss sauber sein bevor Code gebaut wird.

---

## Phase 4: Autonome Execution (Pro Phase)

### 4.1 PRE-FLIGHT Check (NEU — vor JEDER Phase)

> [!CAUTION]
> **Vor jeder Phase wird ein Pre-Flight Check durchgeführt. KEIN SKIP möglich.**

```text
PRE-FLIGHT CHECKLIST:
1. □ Vorbedingungen der Phase prüfen (alle erfüllt?)
2. □ Dateien die geändert werden sollen existieren am erwarteten Pfad?
3. □ Aktuelle Signaturen/Types stimmen noch mit Feasibility Probes überein?
   (Code könnte sich seit Plan-Erstellung geändert haben!)
4. □ Keine uncommitted Changes die die Phase blockieren?
5. □ Build kompiliert aktuell fehlerfrei?

Bei IRGENDEINEM ❌:
  → STOP
  → Dokumentiere die Abweichung
  → Passe den Plan für DIESE Phase an (minimaler Fix, nicht den ganzen Plan umschreiben)
  → Dokumentiere die Anpassung
  → Dann erst starten
```

### 4.2 Git Snapshot erstellen

```bash
git tag agentic/phase-N-start
```

### 4.3 Phase ausführen

- Lead-Persona aktivieren (je nach Domäne der Phase)
- Code bauen **exakt** gemäß Plan-Spezifikation
- Jede Datei-Änderung gegen die Plan-Spezifikation abgleichen:
  - Stimmen die Interfaces?
  - Stimmen die Signaturen?
  - Ist das Error Handling wie geplant?
  - Sind die Edge Cases wie geplant abgedeckt?
- Build prüfen nach jeder signifikanten Änderung (nicht nur am Ende)

### 4.4 EVAL Gate durchführen (BEWEISFÜHRUNG)

```text
Für jedes Acceptance Criterion:
  1. Test Command ausführen
  2. Output dokumentieren (exakt, nicht paraphrasiert)
  3. Vergleich: Expected vs. Actual
  4. Verdict: ✅ oder ❌

Für jedes Rejection Criterion:
  1. Anti-Pattern-Check ausführen
  2. Output dokumentieren
  3. Verdict: ✅ (nicht gefunden) oder ❌ (gefunden → sofort fixen)

EVAL-Dokumentation:
```markdown
### 🏰 EVAL Gate [N] — Ergebnis

| # | Criterion | Command | Expected | Actual | Verdict |
|---|-----------|---------|----------|--------|---------|
| A1 | [Criterion] | [Command] | [Expected] | [Actual] | ✅/❌ |
| A2 | ... | ... | ... | ... | ... |
| R1 | [Anti-Pattern] | [Command] | keine Treffer | [Actual] | ✅/❌ |

**Gesamtverdikt:** ✅ PASS / ❌ FAIL
**Bei FAIL:** [Welches Criterion, warum, Fix-Plan]
```
```

### 4.5 Post-EVAL Feasibility Re-Check

```text
NACH dem EVAL, VOR dem Weiterarbeiten:
1. Prüfe: Outputs dieser Phase = erwartete Inputs der nächsten Phase?
2. Prüfe: Unerwartete Seiteneffekte?
3. Prüfe: Types/Interfaces die die nächste Phase braucht korrekt exportiert?

Bei Abweichung:
  → Dokumentiere
  → Passe den Plan für die NÄCHSTE Phase an
  → NICHT die nächste Phase blind starten
```

### 4.6 Fortress-Gate (nach jeder Phase)

```text
Lies: .antigravity/personas/sherlock-holmes.md

Sherlock prüft ALLE geänderten Dateien dieser Phase:
  ① Build kompiliert fehlerfrei?
  ② Keine Regressions in bestehenden Tests/Imports?
  ③ Error Handling KOMPLETT? (jeder async Call in try/catch, jeder throw gefangen)
  ④ Edge Cases bedacht? (null, undefined, leere Arrays, fehlerhafte Eingaben)
  ⑤ Type Safety (kein `any`, keine Type Assertions ohne Kommentar)?
  ⑥ Naming konsistent mit Codebase?
  ⑦ Keine Dead Code Erzeugung?
  ⑧ Keine Performance-Anti-Patterns? (N+1 Queries, unnötige Re-Renders)
  ⑨ Security: Keine PII-Leaks, keine hardcoded Secrets?
  ⑩ Stimmt die Implementierung mit der Plan-Spezifikation überein?

Dokumentiere Sherlock-Gate:
```markdown
### 🔍 Fortress Gate [N] — Sherlock Report

| # | Check | Status | Details |
|---|-------|--------|---------|
| 1 | Build | ✅/❌ | [Output] |
| 2 | Regressions | ✅/❌ | [Details] |
| 3 | Error Handling | ✅/❌ | [Details] |
| 4 | Edge Cases | ✅/❌ | [Details] |
| 5 | Type Safety | ✅/❌ | [Details] |
| 6 | Naming | ✅/❌ | [Details] |
| 7 | Dead Code | ✅/❌ | [Details] |
| 8 | Performance | ✅/❌ | [Details] |
| 9 | Security | ✅/❌ | [Details] |
| 10 | Plan-Konformität | ✅/❌ | [Details] |

**Gesamtverdikt:** ✅ CLEAR / ❌ BLOCKED
```
```

**Bei Erfolg:**
```bash
git tag -d agentic/phase-N-start
```
→ Weiter zur nächsten Phase.

**Bei Failure (inline fixbar):**
- Fix implementieren
- EVAL + Fortress-Gate erneut durchlaufen (komplett, nicht nur den fehlenden Punkt)
- Bei Erfolg: weiter

**Bei Failure (nicht inline fixbar = Abort):**

```markdown
## 💀 Post-Mortem: Phase [N] Abort

**Datum:** TT.MM.JJJJ HH:MM
**Phase:** [Name]
**Lead-Persona:** [Wer hat gearbeitet?]

### Was ging schief?
[1-3 Sätze: Kernproblem — NICHT "hat nicht funktioniert" sondern WARUM]

### Root Cause
[Warum konnte das nicht inline gefixt werden?]
[Welcher Feasibility Probe hat das nicht abgefangen? Warum nicht?]

### Divergenz zum Plan
[Was im Plan stand vs. was in der Realität passiert ist]

### Options für den User
[Option A: Beschreibung + Aufwand + Risiko]
[Option B: Beschreibung + Aufwand + Risiko]
[Option C (optional): Beschreibung + Aufwand + Risiko]

### Learnings
[Was sollte der Agent in Zukunft anders machen?]
[Welcher Probe-Typ hätte das abfangen können?]
```

→ Post-Mortem in `architect-memory.md` schreiben
→ `git reset --hard agentic/phase-N-start`
→ User informieren, auf Decision warten

> [!CAUTION]
> **Auf einem kaputten Fundament weiterbauen ist VERBOTEN.** Lieber 1 Phase Abort als 5 Phasen Müll.

### 4.7 Memory Checkpoint (nach JEDER Phase — PFLICHT)

> Lightweight Update — volles `/update-memory` erst am Session-Ende.

1. Aktualisiere `memory-bank/activeContext.md`:
   - ✅ Was wurde in dieser Phase erledigt (2-3 Sätze, NICHT nur "Phase 3 done")
   - ⏳ Was ist die nächste Phase + deren Ziel + deren Vorbedingungen
   - 🔑 Kritische Entscheidungen dieser Phase (mit Begründung)
   - 📁 Welche Dateien wurden angefasst (mit Änderungstyp)
   - ⚠️ Abweichungen vom Plan (falls zutreffend)

2. Semantic Context erweitern — `memory-bank/semantic-context.md`:
   ```markdown
   ### [Datum] — Phase [N]: [Titel]
   **Geänderte Module:** [Liste der angefassten Dateien/Module]
   **Erkenntnisse:** [Was haben wir über das System gelernt?]
   **Abhängigkeiten entdeckt:** [Welche Module hängen wie zusammen?]
   **Entscheidungen:** [Was wurde entschieden und warum?]
   **Plan-Abweichungen:** [Was musste angepasst werden und warum?]
   ```

3. Git Checkpoint:
   ```bash
   git add -A && git commit -m "checkpoint: Phase [N] — [summary]"
   ```

4. DANN ERST → nächste Phase starten.

---

## Phase 5: Final System Audit (VERSCHÄRFT)

### 5.1 Full Code Review — Sherlock + Ramsay

Sherlock + Ramsay prüfen **ALLE** geänderten Dateien im Kontext des **gesamten** Plans:

```text
Pro geänderte Datei:
  → Stimmt die Implementierung mit der Plan-Spezifikation überein?
  → Bugs, Edge Cases, Regressions?
  → Dead Code, Duplikate, Copy-Paste-Artefakte?
  → SOLID Violations?
  → Naming konsistent?
  → Error Handling vollständig?
  → Performance-Probleme?

Über alle Dateien hinweg:
  → Konsistente Patterns? (nicht in Phase 1 Pattern A und in Phase 4 Pattern B)
  → Import-Graph sauber? (keine Circular Dependencies eingeführt?)
  → API-Contracts konsistent? (Frontend erwartet was Backend liefert?)
```

### 5.2 Plan-Konformitäts-Audit (NEU)

```text
Vergleiche Plan-Spezifikation vs. tatsächliche Implementierung:

Pro Phase:
  → Was wurde wie geplant gebaut? ✅
  → Was weicht vom Plan ab? ⚠️ → Ist die Abweichung dokumentiert + begründet?
  → Was wurde NICHT gebaut? ❌ → Warum?
  → Was wurde zusätzlich gebaut (nicht im Plan)? → Warum?

Ergebnis: Plan-Konformitäts-Score [X/Y Phasen plankonform]
```

### 5.3 Wiki & Doku Update

- `architect-memory.md` — Session-Log (PFLICHT)
- `tech-stack-context.md` — Bei neuen Patterns/Architekturen
- `docs/wiki/*.md` — Bei Engine/Formel-Änderungen
- `memory-bank/progress.md` — Completed Items

### 5.4 Bug Hunting Pass (VERSCHÄRFT)

```bash
# Was darf NICHT (mehr) im Code stehen?

# 1. Console.log in Production
grep -rn "console\.log" [alle-geänderten-dateien] --include="*.ts" --include="*.tsx"

# 2. Any in TypeScript
grep -rn ": any\|as any\|<any>" [alle-geänderten-dateien] --include="*.ts" --include="*.tsx"

# 3. Unresolved TODOs
grep -rn "TODO\|FIXME\|HACK\|XXX\|TEMP" [alle-geänderten-dateien]

# 4. Hardcoded Secrets
grep -rn "password\|secret\|api.key\|bearer\|token.*=.*['\"]" [alle-geänderten-dateien] --include="*.ts"

# 5. Leere Catch-Blöcke
grep -A1 "catch" [alle-geänderten-dateien] --include="*.ts" --include="*.tsx" | grep -B1 "^\s*}"

# 6. Unused Imports (bei TypeScript-Projekten)
npx tsc --noEmit 2>&1 | grep "declared but"

# 7. Fehlende Export-Deklarationen (neue Module)
grep -rn "^function \|^const \|^class \|^interface \|^type \|^enum " [neue-dateien] | grep -v "export"
```

---

## Phase 6: Fortress Finalization (Optional)

> **Skip wenn:** Fortress nicht aktiviert

Falls Fortress aktiviert, führe die verbleibenden Fortress-Stages durch:

1. **Stage 3: Sherlock Audit** — hat im Final System Audit bereits stattgefunden ✅
2. **Stage 4: Security Sweep** — `/security-sweep` Schritte 1–9
3. **Stage 5: Targeted E2E** — Nur betroffene Steps re-testen

Speichere Post-Fortress Snapshot in `memory-bank/e2e-snapshots/`.

---

## Phase 7: User Delivery Briefing (INFORMATIV — KEIN SHIP)

> [!WARNING]
> **Phase 7 ist NICHT das Ende.** Der User wird informiert dass der Plan abgearbeitet ist,
> aber danach folgt ZWINGEND Phase 8 (Multi-Lens Audit) + Phase 9 (Hotfix) + Phase 10 (Puzzle Piece).
> Erst DANACH kommt `/ship-it`.

Präsentiere dem User:

```markdown
## 🏗️ Agentic Plan: [Feature] — Execution Complete

### Was wurde gebaut
[Zusammenfassung aller Phasen — WAS, nicht WIE]

### Plan-Konformität
[X/Y Phasen exakt wie geplant. Z Phasen mit dokumentierten Abweichungen.]

### Abweichungen vom Plan
| Phase | Abweichung | Begründung |
|-------|-----------|------------|
| [N] | [Was anders] | [Warum] |

### EVAL-Ergebnisse
| Phase | Acceptance | Rejection | Tests | Verdict |
|-------|-----------|-----------|-------|---------|
| 1 | 5/5 ✅ | 3/3 ✅ | 3/3 ✅ | ✅ PASS |
| 2 | ... | ... | ... | ... |

### Fortress-Gates
| Phase | Build | Regression | ErrorHandling | EdgeCases | TypeSafety | Naming | DeadCode | Performance | Security | PlanKonformität | Verdict |
|-------|-------|-----------|--------------|-----------|-----------|--------|---------|------------|---------|----------------|---------|
| 1 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ CLEAR |

### Review Status
- EVAL-Gates:        ✅ [N/N] Phasen bestanden
- Fortress-Gates:    ✅ [N/N] Phasen cleared
- Final Audit:       ✅
- Plan-Konformität:  ✅ [X/Y]
- Bug Hunting:       ✅ 0 Violations
- Security Sweep:    ✅ / ⏭️ skipped
- Fortress:          ✅ / ⏭️ skipped

### Fortress Harness (falls aktiv)
| Metric | Baseline | Post-Build | Delta |
|--------|----------|------------|-------|

### ⏭️ Nächster Schritt: Phase 8 — Multi-Lens Post-Delivery Audit
> [!IMPORTANT]
> **Der Plan ist abgearbeitet, aber NICHT fertig.**
> Jetzt folgen 3 unabhängige Audit-Linsen (🔍 Sherlock: Bugs, 🕵️ Mr. Robot: Security, 🚀 Elon: Dead Code)
> plus optional 🖥️ Carmack (Performance), gefolgt von einem Ramsay Hotfix der ALLE Findings
> ALLER Linsen (Critical + Warning + Info) ausmerzt. Erst danach ist Ship-Ready.
```

---

## Phase 8: 🔬 Multi-Lens Post-Delivery Audit (PFLICHT — KEIN SKIP)

> [!CAUTION]
> **UNVERHANDELBAR.** Dieses Audit ist KEIN optionaler Schritt. Es wird IMMER nach Abschluss des Plans ausgeführt.
> Die Selbst-Audits in Phase 4/5 (Fortress-Gates, EVAL-Gates) fangen Regressions ab, aber **SIE REICHEN NICHT.**
>
> **Warum Multi-Lens statt nur Sherlock?**
> Ein einzelner Generalist-Audit findet Bugs — aber **Security-Lücken sind keine Bugs** (sie sind architektonische Versäumnisse),
> **Dead Code ist kein Bug** (er ist Entropie), und **Performance-Probleme sind keine Bugs** (sie sind unsichtbar bis Production).
> Jede Linse ist auf ihre Domäne spezialisiert und findet Dinge die die anderen Linsen NICHT sehen.
>
> **Beweis:** In der Autarch Phase 9 (Hermes Agent) fand das Post-Delivery Audit:
> - 3 Critical Bugs (orphaned PTY, dead-end state machine, destructive stop button)
> - 7 Warnings (missing shell exit handler, unreliable OS detection, blind timers, etc.)
> - 4 Info items (confusing aliases, unused refs)
> - 1 Architectural Gap ("Missing Puzzle Piece" — reactive output parser statt blind polling)
> **KEINER davon wurde von den Plan-eigenen EVAL-Gates entdeckt.**

### 8.0 Audit-Scope bestimmen (EINMAL für alle Linsen)

```text
Alle geänderten (oder neu erstellten) Dateien seit Plan-Start:

git diff --name-only [plan-start-tag] HEAD

PLUS: Alle Dateien die von den geänderten Dateien IMPORTIERT werden (1 Level).
PLUS: Alle Store/State-Dateien die von den geänderten Komponenten genutzt werden.

Der Scope wird EINMAL bestimmt und an ALLE Linsen übergeben.
```

---

### 8.1 🔍 Linse 1: Sherlock — Bug Forensics (PFLICHT ~15min)

```text
Persona: .antigravity/personas/sherlock-holmes.md

Sherlock führt ein UNABHÄNGIGES forensisches Audit durch.
Er hat KEINEN Zugriff auf den Plan — er sieht NUR den Code.
Das ist absichtlich: Der Plan beeinflusst sein Urteil nicht.

FOKUS-BEREICHE:

ARCHITEKTUR-FORENSIK:
  → State-Machine-Vollständigkeit: Alle Transitions erreichbar? Dead Ends?
  → Lifecycle-Management: Alles was gestartet wird, wird auch gestoppt?
  → Error-Propagation: Fehler werden nicht verschluckt?
  → Resource-Leaks: PTYs, Intervals, Subscriptions, EventListener — alle aufgeräumt?
  → Race Conditions: Async-Flows die sich gegenseitig überholen?
  → Cancellation: useEffect-Cleanups, AbortController, Debounce?

CODE-QUALITÄT:
  → Type Safety: any, as unknown, Type Assertions ohne Kommentar?
  → Error Handling: catch ohne Logging? Unhandled Promise Rejections?
  → React Anti-Patterns: key={index}, missing cleanup, stale closures?
  → Naming: Confusing aliases, misleading variable names?
  → Contract-Brüche: Funktion verspricht X, liefert Y?

UX-FORENSIK:
  → Dead-End States? User-Flows die nirgendwo hinführen?
  → Missing Feedback? User klickt und nichts passiert?
  → Destructive Actions ohne Confirmation?
  → Loading State fehlt? Infinite Spinner möglich?

MISSING PUZZLE PIECE:
  → Gibt es ein architektonisches Pattern das die Lösung FUNDAMENTAL verbessern würde?
  → Kein Bug-Fix, sondern ein Design-Upgrade?
  → Dokumentiere es separat im Report.
```

**Output-Prefix:** Findings erhalten Prefix `S-` (S-C01, S-W01, S-I01)

---

### 8.2 🕵️ Linse 2: Mr. Robot — Security Sweep (PFLICHT ~10min)

```text
Persona: .antigravity/personas/mr-robot.md

Mr. Robot prüft AUSSCHLIESSLICH Security-relevante Aspekte.
Er bekommt denselben Scope wie Sherlock, sucht aber NUR nach Security-Lücken.

FOKUS-BEREICHE:

AUTHENTICATION & AUTHORIZATION:
  → Gibt es API-Calls ohne Auth-Check?
  → RLS Policies: Können User auf Daten anderer User zugreifen?
  → Token-Handling: Werden Tokens sicher gespeichert? Expiry geprüft?
  → Session-Management: Kann eine Session gekapert werden?

DATA SECURITY:
  → PII in Logs? (Usernamen, E-Mails, IP-Adressen in console.log/warn/error)
  → Hardcoded Secrets? (API Keys, Tokens, Passwörter im Code)
  → Unsanitized Input? (User-Input direkt in DB-Queries, HTML, Shell-Commands)
  → Data Exposure: Werden sensible Daten an den Client gesendet die dort nicht hingehören?

REMOTE CODE EXECUTION:
  → curl|bash ohne Confirmation? (Arbitrary code execution)
  → eval(), new Function(), innerHTML mit User-Input?
  → Dynamic import() mit User-kontrollierten Pfaden?
  → Shell-Commands mit User-Input? (Command Injection)

NETWORK SECURITY:
  → CORS-Konfiguration: Zu permissiv? Wildcard-Origins?
  → HTTPS erzwungen? Mixed Content möglich?
  → Rate Limiting auf kritischen Endpoints?
  → Error-Messages die interne Struktur leaken?

DSGVO / DATENSCHUTZ:
  → Werden personenbezogene Daten verarbeitet? Rechtsgrundlage vorhanden?
  → Datenminimierung: Werden nur nötige Daten erhoben?
  → Löschkonzept: Kann der User seine Daten löschen lassen?
```

**Output-Prefix:** Findings erhalten Prefix `R-` (R-C01, R-W01, R-I01)

---

### 8.3 🚀 Linse 3: Elon — Dead Code & Überreste (PFLICHT ~10min)

> [!IMPORTANT]
> **Diese Linse adressiert das "Überreste"-Problem direkt.**
> Nach jedem Refactoring, jeder Migration, jeder Feature-Deletion bleiben Artefakte zurück:
> Orphaned Types, unused Imports, deprecated Functions die niemand mehr ruft,
> Config-Einträge für gelöschte Features, Test-Files für gelöschten Code.
> **Das ist Dark Debt. Es verwirrt den nächsten Agent und den nächsten Dev.**
> Elon's Job ist: "If you can't explain why this exists — DELETE IT."

```text
Persona: .antigravity/personas/elon-musk.md

Elon sucht AUSSCHLIESSLICH nach überflüssigem Code, Überresten und
unnötiger Komplexität. Er ist der radikalste Simplifier.

FOKUS-BEREICHE:

UNUSED CODE (Leichen im Keller):
  → Unused Imports: import { X } from '...' wo X nie verwendet wird
  → Unused Exports: export function Y() die von KEINER Datei importiert wird
  → Unused Variables/Constants: Deklariert aber nie gelesen
  → Unused Types/Interfaces: Definiert aber nie als Typ-Annotation verwendet
  → Unused CSS Classes: Definiert aber nie im JSX referenziert
  → Dead Functions: Funktionen die von keiner Code-Path erreichbar sind
  → COMMAND: grep + IDE "Find References" + tsc --noUnusedLocals

ORPHANED ARTEFAKTE (Überreste von Refactoring):
  → Store-Properties die niemand mehr liest (State-Leichen)
  → Event-Handler/Callbacks die auf nichts mehr reagieren
  → Config-Einträge für Features die nicht mehr existieren
  → Environment-Variablen die nirgends gecheckt werden
  → Route-Definitionen für Seiten die gelöscht wurden
  → Test-Files die gelöschten Code testen
  → Migrations-Files die rückgängig gemachte Änderungen enthalten

DEPRECATED CODE (Zeitbomben):
  → Code der als "deprecated" markiert ist aber noch aktiv genutzt wird
  → Code der als "deprecated" markiert ist und NICHT mehr genutzt wird → LÖSCHEN
  → Code der deprecated SEIN SOLLTE aber nicht markiert ist
  → Wrapper-Funktionen die nur durchreichen ohne Logik hinzuzufügen
  → Abstraktionen die nur 1 Implementierung haben

UNNECESSARY COMPLEXITY (Ballast):
  → Funktionen die < 3 Zeilen haben und nur 1x aufgerufen werden → inlinen
  → Mehrfach verschachtelte Conditionals die vereinfacht werden können
  → Copy-Paste-Code der in eine shared Function extrahiert werden sollte
  → Over-Engineering: Abstraktionen die mehr Code erzeugen als sie sparen

VERIFICATION COMMANDS:
  # Unused exports (TypeScript)
  npx ts-prune [geänderte-dateien] 2>&1 | head -30

  # Unused variables
  npx tsc --noEmit --noUnusedLocals --noUnusedParameters 2>&1 | head -30

  # Dead imports (manual grep)
  for file in [geänderte-dateien]; do
    grep "^import" "$file" | while read line; do
      # Check if imported symbol is used in the file body
    done
  done

  # Orphaned store properties
  grep -rn "set({" [store-dateien] | # Check if each set property is ever read
```

**Output-Prefix:** Findings erhalten Prefix `E-` (E-C01, E-W01, E-I01)

---

### 8.4 🖥️ Linse 4: Carmack — Performance (OPTIONAL ~10min)

> **Trigger:** Diese Linse wird NUR aktiviert wenn:
> - Performance-sensitive Pfade angefasst wurden (Render-Loops, Data Pipelines, DB Queries)
> - Neue Subscriptions/Polling/Intervals eingeführt wurden
> - Bundle-Size signifikant gewachsen ist
> - Der User `--perf` Flag gesetzt hat

```text
Persona: .antigravity/personas/john-carmack.md

Carmack sucht NUR nach Performance-Problemen.

FOKUS-BEREICHE:

RENDERING:
  → Unnecessary Re-Renders: Components die bei jedem State-Change re-rendern
  → Missing useMemo/useCallback auf teure Berechnungen
  → Inline Objects/Arrays in JSX-Props (verursachen re-render bei jedem Cycle)
  → Large List Rendering ohne Virtualization

DATA FETCHING:
  → N+1 Query Pattern: Schleife mit DB-Call pro Iteration
  → Missing Cache: Gleiche Daten werden mehrfach gefetcht
  → Over-Fetching: Mehr Daten geladen als angezeigt
  → Polling ohne Backoff: Intervall-basiertes Polling ohne exponential backoff

MEMORY:
  → Memory Leaks: setInterval/setTimeout ohne clearInterval/clearTimeout
  → EventListener ohne removeEventListener in Cleanup
  → Growing Arrays/Maps ohne Bounds (unbegrenztes Wachstum)
  → Stale Closures die alte State-Referenzen halten

BUNDLE:
  → Neue Dependencies die den Bundle-Size aufblähen
  → Dynamic Import statt static wo möglich (Code Splitting)
  → Tree-Shaking blockers (barrel imports, side-effect imports)
```

**Output-Prefix:** Findings erhalten Prefix `P-` (P-C01, P-W01, P-I01)

---

### 8.5 Konsolidierter Audit-Report (PFLICHT)

```markdown
## 🔬 Multi-Lens Post-Delivery Audit — Konsolidierter Report

**Scope:** [N] Dateien analysiert
**Datum:** [Datum]
**Vorheriger Plan:** [Plan-Titel]
**Aktive Linsen:** 🔍 Sherlock ✅ | 🕵️ Mr. Robot ✅ | 🚀 Elon ✅ | 🖥️ Carmack [✅/⏭️]

---

### 📊 Findings-Übersicht

| Linse | 🔴 Critical | 🟡 Warning | 🔵 Info | Total |
|-------|------------|-----------|---------|-------|
| 🔍 Sherlock (Bugs) | [N] | [N] | [N] | [N] |
| 🕵️ Mr. Robot (Security) | [N] | [N] | [N] | [N] |
| 🚀 Elon (Dead Code) | [N] | [N] | [N] | [N] |
| 🖥️ Carmack (Performance) | [N] | [N] | [N] | [N] |
| **GESAMT** | **[N]** | **[N]** | **[N]** | **[N]** |

---

### Alle Findings (sortiert nach Severity)

| # | Linse | Finding | Severity | Datei | Status |
|---|-------|---------|----------|-------|--------|
| S-C01 | 🔍 | [Beschreibung] | 🔴 Critical | [Datei] | FIX REQUIRED |
| R-C01 | 🕵️ | [Beschreibung] | 🔴 Critical | [Datei] | FIX REQUIRED |
| E-W01 | 🚀 | [Beschreibung] | 🟡 Warning | [Datei] | RECOMMENDED |
| S-I01 | 🔍 | [Beschreibung] | 🔵 Info | [Datei] | NICE-TO-HAVE |

---

### Detail pro Finding

#### [S-C01] [Titel] — 🔍 Sherlock
**Datei:** [Pfad]
**Zeilen:** [Von-Bis]
**Problem:** [Was ist kaputt und WARUM ist das gefährlich?]
**Root Cause:** [Warum wurde das im Plan nicht abgefangen?]
**Fix:** [Exakter Fix-Vorschlag mit Code-Snippet]
**Risiko ohne Fix:** [Was passiert wenn man das ignoriert?]

#### [R-C01] [Titel] — 🕵️ Mr. Robot
**Datei:** [Pfad]
**Vulnerability Type:** [OWASP-Kategorie oder Custom]
**Problem:** [Security-Risiko + Angriffsszenario]
**Fix:** [Exakter Fix-Vorschlag]
**DSGVO-Relevanz:** [Ja/Nein + Begründung]

#### [E-W01] [Titel] — 🚀 Elon
**Datei:** [Pfad]
**Typ:** [Unused/Orphaned/Deprecated/Unnecessary]
**Problem:** [Warum ist das überflüssig?]
**Beweis:** [Keine Referenzen / 0 Imports / Dead Path]
**Aktion:** [DELETE / INLINE / REFACTOR]
**LOC entfernt:** [~N Zeilen]

---

### 🧩 Missing Puzzle Piece (Architektur-Vorschlag)

> "There is one more deduction, Watson..."

[Falls eine der Linsen ein architektonisches Pattern identifiziert hat das die Lösung
fundamental verbessern würde — kein Bug-Fix, sondern ein Design-Upgrade.]

**Problem:** [Aktuelle Architektur-Schwäche]
**Vorschlag:** [Architektonische Verbesserung]
**Identifiziert von:** [Welche Linse]
**Impact:** [Was wird dadurch besser?]
**Aufwand:** [Geschätzter Aufwand]
```

---

## Phase 9: 🔥 Ramsay Hotfix — ALLE Findings ALLER Linsen (PFLICHT — KEIN SKIP, KEIN CHERRY-PICK)

> [!CAUTION]
> **ALLE Findings werden gefixt. Von ALLEN Linsen. Nicht nur Criticals. ALLE.**
> Warnings sind der Humus aus dem die Criticals der nächsten Session wachsen.
> Info-Items sind der Dark Debt der sich stillschweigend ansammelt.
> Dead Code (Elon's Findings) ist der Nebel der den nächsten Agent verwirrt.
> **Wenn die Küche gereinigt wird, wird JEDE Ecke gereinigt. Nicht nur die sichtbaren.**
>
> **Beweis:** In Autarch Phase 9 wurden nach dem Hotfix zunächst NUR 3 Criticals gefixt.
> Erst auf explizites Drängen des Users wurden die 7 Warnings + 4 Infos + das Puzzle Piece nachgeliefert.
> Das darf NIE WIEDER passieren. Der Workflow erzwingt jetzt VOLLSTÄNDIGE Remediation.

### 9.1 Gordon Ramsay Persona aktivieren

```text
Lies: .antigravity/personas/gordon-ramsay.md

Ramsay fixt ALLE Findings aus dem konsolidierten Multi-Lens-Report.
Reihenfolge: 🔴 Critical (alle Linsen) → 🟡 Warning (alle Linsen) → 🔵 Info (alle Linsen)
Innerhalb gleicher Severity: Security (R-) zuerst, dann Bugs (S-), dann Dead Code (E-), dann Performance (P-)
Pro Fix: Implementieren → Build-Check → Nächster Fix
Am Ende: Full Build-Check (tsc + cargo/build)

SPEZIALREGELN für Elon-Findings (E-Prefix):
  → Unused Code: LÖSCHEN, nicht auskommentieren, nicht markieren
  → Orphaned Artefakte: LÖSCHEN + zugehörige Imports bereinigen
  → Deprecated Code der nicht mehr genutzt wird: LÖSCHEN
  → Deprecated Code der NOCH genutzt wird: Migration-Kommentar + architect-memory.md Eintrag
  → Unnecessary Complexity: INLINEN oder VEREINFACHEN
```

### 9.2 Fix-Execution

```text
Pro Finding (von JEDER Linse):
  1. Fix implementieren (exakt wie im Audit-Report vorgeschlagen, oder besser)
  2. Build-Check nach jedem Fix (Schnell-Check: tsc --noEmit oder äquivalent)
  3. Fix-Status in der Audit-Tabelle aktualisieren: FIX REQUIRED → ✅ FIXED

NACH ALLEN FIXES:
  1. Full Build: npm run build / tsc --noEmit + cargo check (bei Tauri)
  2. Dead Code Verification (Elon Re-Check):
     npx tsc --noEmit --noUnusedLocals --noUnusedParameters 2>&1 | head -20
  3. Security Verification (Mr. Robot Re-Check):
     grep -rn "console.log\|console.warn" [geänderte-dateien] --include="*.ts" | grep -i "user\|email\|token\|password"
  4. Grep-Checks:
     grep -rn "console.log" [geänderte-dateien] --include="*.ts" --include="*.tsx"
     grep -rn ": any" [geänderte-dateien] --include="*.ts" --include="*.tsx"
  5. Finale Audit-Tabelle mit allen ✅ FIXED Einträgen
```

### 9.3 Hotfix-Report an User

```markdown
## 🔥 Ramsay Hotfix — Complete (Multi-Lens)

### Alle Findings gefixt:

| # | Linse | Finding | Severity | Status | Fix |
|---|-------|---------|----------|--------|-----|
| S-C01 | 🔍 | [Titel] | 🔴 Critical | ✅ FIXED | [1-Satz] |
| R-C01 | 🕵️ | [Titel] | 🔴 Critical | ✅ FIXED | [1-Satz] |
| E-W01 | 🚀 | [Titel] | 🟡 Warning | ✅ FIXED | [1-Satz] |
| S-I01 | 🔍 | [Titel] | 🔵 Info | ✅ FIXED | [1-Satz] |

### Elon Dead Code Report
- **LOC entfernt:** [N] Zeilen
- **Dateien bereinigt:** [N]
- **Orphaned Artefakte gelöscht:** [N]

### Build-Status
- TypeScript: ✅ 0 errors
- Rust/Backend: ✅ 0 errors
- Dead Code Check: ✅ 0 unused locals/parameters

### Geänderte Dateien (Hotfix):
[Liste aller durch den Hotfix geänderten Dateien]
```

---

## Phase 10: 🧩 Missing Puzzle Piece Gate (USER-ENTSCHEIDUNG)

> [!IMPORTANT]
> **Dieser Schritt gibt dem User die Kontrolle über architektonische Verbesserungen.**
> Die Multi-Lens-Audits haben möglicherweise ein "Missing Puzzle Piece" identifiziert — ein Design-Upgrade
> das über Bug-Fixing hinausgeht. Der User entscheidet ob das jetzt implementiert wird
> oder ob es für die nächste Session aufbewahrt wird.

### 10.1 Puzzle Piece Präsentation

```text
WENN eine Linse ein Missing Puzzle Piece identifiziert hat:

  Präsentiere dem User:
  - Was ist das Puzzle Piece?
  - Welche Linse hat es identifiziert?
  - Warum würde es die Lösung verbessern?
  - Geschätzter Aufwand
  - Risiko wenn man es NICHT macht (jetzt oder später)

  Frage explizit:
  > "Das Multi-Lens-Audit hat ein architektonisches Verbesserungspotential identifiziert:
  > [1-Satz-Beschreibung]. (Identifiziert von: [Linse])
  > Soll das JETZT implementiert werden (vor /ship-it) oder auf die nächste Session verschoben?"

WENN KEIN Missing Puzzle Piece identifiziert wurde:
  → Informiere den User:
  > "Das Multi-Lens-Audit hat kein architektonisches Verbesserungspotential identifiziert.
  > Alle [N] Findings von [N] Linsen wurden gefixt. Ready for /ship-it."
```

### 10.2 Bei Zustimmung: Implementierung

```text
1. Implementiere das Puzzle Piece
2. Build-Check
3. Quick Multi-Lens Re-Check (nur auf die neuen Änderungen, kein Full Audit)
4. Kurzer Report an User

Dann weiter zu Phase 11 (Ship).
```

### 10.3 Bei Ablehnung: Dokumentation

```text
1. Dokumentiere das Puzzle Piece in architect-memory.md:
   → Was: [Beschreibung]
   → Identifiziert von: [Linse]
   → Warum postponed: [User-Entscheidung]
   → Priorität: [Empfohlene Priorität für nächste Session]
2. Weiter zu Phase 11 (Ship).
```

---

## Phase 11: Ship & Memory

### 11.1 Final Delivery Briefing

Präsentiere dem User:

```markdown
## 🏗️ Agentic Plan: [Feature] — READY TO SHIP

### Zusammenfassung
[Was wurde gebaut — Phasen-Zusammenfassung]

### Quality Gates — Alle bestanden
| Gate | Status |
|------|--------|
| Plan-Execution | ✅ [N/N] Phasen completed |
| EVAL-Gates | ✅ [N/N] passed |
| Fortress-Gates | ✅ [N/N] cleared |
| Final System Audit | ✅ |
| 🔍 Sherlock (Bugs) | ✅ [N] Findings → [N] fixed |
| 🕵️ Mr. Robot (Security) | ✅ [N] Findings → [N] fixed |
| 🚀 Elon (Dead Code) | ✅ [N] Findings → [N] fixed, [N] LOC entfernt |
| 🖥️ Carmack (Performance) | ✅ [N] Findings → [N] fixed / ⏭️ skipped |
| Ramsay Hotfix | ✅ [N/N] Total Findings fixed |
| Missing Puzzle Piece | ✅ Implementiert / 📋 Postponed / ➖ Keine |
| Build | ✅ TypeScript + Rust/Backend clean |

### Test-Anweisungen für User
> [!IMPORTANT]
> **Teste folgende Flows:**

1. [Schritt-für-Schritt: Was tun → Was sehen → Was erwarten]
2. [Schritt-für-Schritt: Edge Case testen]
3. [Schritt-für-Schritt: Error-Pfad testen]

### Nächster Schritt?
- `/ship-it` → Commit, Push, Deploy + Memory Update
- PR erstellen → Code Review durch Team
- Behalten → Noch nicht deployen
```

### 11.2 Memory Update

```text
1. `/update-memory` ausführen
2. Post-Mortem in architect-memory.md (falls Abweichungen/Learnings)
3. Semantic Context mit Multi-Lens-Findings erweitern
4. Elon Dead Code Report als Referenz ablegen (verhindert dass gelöschter Code wiederauftaucht)
5. Git Commit + Push
```

---

## Anti-Halluzination Protokoll (VERSCHÄRFT)

### Context Checkpoints

Nach JEDER abgeschlossenen Phase:
1. **Memory Checkpoint** (Schritt 4.7) ausführen — activeContext.md + semantic-context.md
2. **Git Checkpoint** — `git add -A && git commit -m "checkpoint: Phase [N]"`
3. **Plan re-lesen** — relevante Abschnitte der NÄCHSTEN Phase neu laden
4. Informiere User bei langen Plans (>4 Phasen):
   > "Phase [X/N] fertig. Antworte mit 'Weiter' für frischen Kontext."
5. Beim Neustart: Plan RE-LESEN, ✅ Phasen überspringen, letzte Phase Status prüfen.

### Harte Regeln

1. **Kein Code vor User-Approval** — Phase 2 Gate ist absolut
2. **Pre-Flight Check vor JEDER Phase** — auch bei "trivialen" Phasen
3. **EVAL-Gate ist BEWEISFÜHRUNG** — nicht "sieht OK aus" sondern Terminal-Output
4. **Post-EVAL Feasibility Re-Check** — nächste Phase nicht blind starten
5. **Fortress-Gate nach JEDER Phase** — 10-Punkte-Check, kein Skip
6. **Memory Checkpoint nach JEDER Phase** — mit Abweichungs-Dokumentation
7. **Abort > Weiterbauen** — kaputtes Fundament → STOP
8. **Post-Mortems werden IMMER geschrieben** — mit Probe-Lessons
9. **Fortress ist Default bei ≥5 Phasen** — deaktivierbar mit `--no-fortress`
10. **Plan-Konformität wird geprüft** — Abweichungen sind OK wenn dokumentiert + begründet
11. **JEDE Annahme muss durch einen Feasibility Probe belegt sein** — "ich nehme an" ist VERBOTEN
12. **Detail-Checkliste muss bestanden sein** bevor der Plan dem User gezeigt wird
13. **Multi-Lens Audit ist PFLICHT nach Plan-Completion** — 3 Linsen mandatory (Sherlock + Mr. Robot + Elon), 1 optional (Carmack bei Perf-Changes)
14. **Ramsay Hotfix fixt ALLE Findings ALLER Linsen** — nicht nur Criticals, ALLE (🔴 + 🟡 + 🔵), von JEDER Linse
15. **Missing Puzzle Piece Gate ist PFLICHT** — User entscheidet, aber die Frage wird IMMER gestellt
16. **Dead Code wird GELÖSCHT, nicht markiert** — Elon-Findings mit Typ "Unused/Orphaned" werden entfernt, nicht deprecated
17. **Security-Findings haben IMMER Priority** — Bei Ressourcen-Knappheit: Mr. Robot (R-) vor Sherlock (S-) vor Elon (E-)
