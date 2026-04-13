---
description: 🏰 Fortress Audit — Full Quality Harness (E2E + Hotfix + Sherlock + Security + Regression)
---

// turbo-all

# 🏰 Fortress Audit — Full Quality Harness

Kombinierter 5-Stage Quality-Workflow der **alles** vereint: E2E Testing, sofortige Hotfixes, Code-Audit, Security-Sweep und Regressions-Schutz. Am Ende steht ein persistenter Harness-Snapshot.

> Auslöser: `/fortress-audit` oder `/fortress-audit [Feature-Scope]`
> Geschätzte Dauer: 1–3h (je nach Projektgröße)

---

## Übersicht: 5-Stage Pipeline

```
Stage 1: 🐝 Baseline E2E (+ Engine Eval bei ARES)
    ↓
Stage 2: 🔥 Ramsay Hotfix (sofortige Fixes für E2E Failures)
    ↓
Stage 3: 🔍 Sherlock Audit (Code-Analyse + Findings)
    ↓
Stage 4: 🔒 Security Sweep (RLS, PII, DSGVO, API Keys)
    ↓
Stage 5: 🐝 Targeted E2E (nur geänderte Scopes re-testen)
    ↓
✅ Fortress Cleared → Harness Snapshot speichern
```

---

## Stage 0: Context & Baseline Setup

### 0.1 Projekt-Kontext laden

```text
Lies: memory-bank/activeContext.md
Lies: memory-bank/progress.md
Lies: .antigravity/logs/architect-memory.md (Active Directives)
```

### 0.2 Vorherigen Harness-Snapshot laden (falls vorhanden)

```text
Lies: memory-bank/e2e-snapshots/_harness-index.md
→ Lade den neuesten Snapshot als Vergleichs-Baseline
→ Falls kein Snapshot existiert: Erster Durchlauf, kein Diff möglich
```

### 0.3 Änderungen seit letztem Snapshot identifizieren

```bash
git log --oneline -20
git diff --stat HEAD~10 HEAD
```

### 0.4 Scope bestimmen

```text
Falls User einen Scope angegeben hat:
  → Nur die genannten Features/Module testen
Falls kein Scope:
  → Full System Test
```

---

## Stage 1: 🐝 Baseline E2E + Engine Eval

> **Ziel:** IST-Zustand des gesamten Systems dokumentieren, BEVOR irgendwas angefasst wird.

### 1.1 Deep E2E durchführen

Führe den `/deep-e2e` Workflow **komplett** durch:

1. Master Test Plan generieren (`e2e-master-plan.md`)
2. DB Seeding / Test-Account vorbereiten
3. Pro Test-Step: Browser-Test via `browser_subagent`
4. Ergebnis pro Step: ✅ Passed / ❌ Failed

**Persona-Zuweisung:**
- 🔍 Sherlock → Analysiert Fehler, leitet Root Cause ab
- 🖥️ Carmack → Fixt Backend-Code (Edge Functions, DB)
- ⚛️ Rauno → Fixt Frontend-Code (Komponenten, CSS)

### 1.2 Engine Eval (ARES-spezifisch)

> **Skip-Bedingung:** Projekt hat keine deterministischen Engines → überspringen.

Für Projekte mit Compute-Engines (z.B. ARES):

1. Identifiziere alle Engines aus `memory-bank/edge-function-registry.md` oder via Code-Scan
2. Pro Engine: `/engine-eval` durchführen (Scenario Tables + Monte Carlo Stress)
3. Ergebnis: Score X/Y + Monte Carlo Crashes + p95 Timing

### 1.3 Baseline-Snapshot schreiben

Erstelle den **Baseline-Snapshot** in `memory-bank/e2e-snapshots/`:

```
Dateiname: [YYYY-MM-DD]_baseline_[scope].md
```

Verwende das Harness-Snapshot-Format (siehe "Harness Snapshot Format" unten).

### 1.4 Gate Check

```text
Zähle: Wie viele Steps sind ❌ Failed?
  → 0 Failures: Weiter zu Stage 3 (Sherlock) — Stage 2 wird übersprungen
  → ≥1 Failures: Weiter zu Stage 2 (Hotfix)
```

---

## Stage 2: 🔥 Ramsay Hotfix — Sofort-Fixes

> **Ziel:** Alle E2E Failures aus Stage 1 sofort fixen, bevor der Code-Audit beginnt.

### 2.1 Persona laden

```text
Lies: .antigravity/personas/gordon-ramsay.md
```

### 2.2 Pro Failed Step

Für jeden ❌ Step aus Stage 1:

1. **Sherlock analysiert:** Root Cause identifizieren (Datei + Zeile + Trigger)
2. **Ramsay fixt:** Minimaler, chirurgischer Fix — kein Refactoring!
3. **Re-Test:** Browser-Test für den spezifischen Step wiederholen
4. **Master Plan updaten:** Status auf 🛠️ Bugfixed setzen

**Ramsay-Regel:** "Fix the dish, don't redesign the kitchen!"

### 2.3 Auto-Review-Gate (per Fix)

Schneller 3-Persona-Check:

- 🖥️ Carmack: Ist der Fix korrekt? Seiteneffekte?
- 📐 Uncle Bob: Test für den Fix geschrieben?
- 🚀 Hamilton: Error Path abgedeckt?

### 2.4 Gate Check

```text
Alle vormals ❌ Steps sind jetzt ✅ oder 🛠️?
  → JA: Weiter zu Stage 3
  → NEIN: FIX LOOP — zurück zu 2.2 für verbleibende ❌ Steps
```

---

## Stage 3: 🔍 Sherlock Audit — Code-Analyse

> **Ziel:** Systematische Code-Qualitäts-Analyse mit der Baseline als zusätzlichem Kontext.

### 3.1 Persona laden

```text
Lies: .antigravity/personas/sherlock-holmes.md
```

### 3.2 Sherlock-Audit durchführen

Führe den `/sherlock-audit` Workflow durch (Schritte 1–8), mit folgendem **Zusatz-Kontext:**

```text
Zusätzlich verfügbar:
  → Baseline E2E Ergebnisse aus Stage 1
  → Hotfix-Liste aus Stage 2
  → Engine Eval Scores (falls ARES)
```

Sherlock prüft:
- Error Handling, Race Conditions, Type Safety
- State Management, Security, Edge Cases
- **NEU:** Korrelation mit E2E Failures ("War der Bug in Stage 1 ein Symptom eines tieferen Problems?")

### 3.3 Findings fixen

Für jedes Finding:
1. Reproduce → Impact → Fix → Verify (Sherlock Superpowers-Methodik)
2. Fix inline implementieren (Carmack für Backend, Rauno für Frontend)
3. Finding in Master Plan als 🛠️ markieren

### 3.4 Carmack Quality Gate

Carmack prüft den Audit-Report selbst:
- Sind die Findings tatsächlich Bugs oder False Positives?
- Sind die Fixes korrekt und vollständig?
- Performance-Implikationen übersehen?

### 3.5 Gate Check

```text
Alle Sherlock Findings gefixt?
  → JA: Weiter zu Stage 4
  → NEIN: Verbleibende Findings müssen 🔴 Critical oder 🟡 Warning sein
    → 🔴 Critical: MUSS gefixt werden, zurück zu 3.3
    → 🟡 Warning: Dokumentieren, weiter (wird Tech Debt)
```

---

## Stage 4: 🔒 Security Sweep

> **Ziel:** DSGVO, RLS, PII und API Keys systematisch prüfen.

### 4.1 Personas laden

```text
Lies: .antigravity/personas/mr-robot.md
Lies: .antigravity/personas/cypher-sre.md
```

### 4.2 Security-Sweep durchführen

Führe den `/security-sweep` Workflow durch (Schritte 1–9):

1. RLS Policy Audit (alle Tabellen)
2. PII-Scrubbing Audit (DIRECTIVE-002)
3. API Keys & Secrets Audit
4. DSGVO-Compliance Check
5. Supabase Advisor Check

### 4.3 Security Findings fixen

Für jedes Finding:
- 🔴 Critical → Sofort fixen (Mr. Robot + Carmack)
- 🟡 Warning → Fixen wenn möglich, sonst dokumentieren
- 🟢 Info → Dokumentieren

### 4.4 Gate Check

```text
0 offene 🔴 Critical Security Findings?
  → JA: Weiter zu Stage 5
  → NEIN: STOP — kein Ship mit offenen Security Criticals
```

---

## Stage 5: 🐝 Targeted E2E — Regressions-Check

> **Ziel:** NUR die durch Stage 2–4 Fixes betroffenen Module re-testen. Kein Full-System-Retest.

### 5.1 Scope-Detection

```bash
# Welche Dateien wurden seit der Baseline geändert?
git diff --name-only [baseline-commit] HEAD
```

```text
Für jede geänderte Datei:
  → Finde den/die Test-Steps in e2e-master-plan.md, die diese Datei testen
  → Markiere diese Steps als 🔄 Re-Test Required
```

### 5.2 Targeted Re-Test

Nur Steps mit `🔄 Re-Test Required` durchführen:
1. Browser-Test via `browser_subagent`
2. Ergebnis: ✅ Passed (Regression clear) / ❌ Failed (Regression!)

### 5.3 Engine Re-Eval (ARES-spezifisch)

Falls Engine-Code geändert wurde:
- Nur betroffene Engines re-evaluieren
- Score-Vergleich mit Baseline

### 5.4 Gate Check

```text
0 Regressionen gefunden?
  → JA: ✅ Fortress Cleared!
  → NEIN: Zurück zu Stage 2 (Ramsay Hotfix für Regressionen)
```

---

## Finalisierung: Harness Snapshot & Report

### F.1 Post-Fortress Snapshot speichern

Erstelle den **Post-Fortress-Snapshot** in `memory-bank/e2e-snapshots/`:

```
Dateiname: [YYYY-MM-DD]_fortress_[scope].md
```

### F.2 Harness Index updaten

Aktualisiere `memory-bank/e2e-snapshots/_harness-index.md`:
- Neuen Snapshot-Eintrag hinzufügen
- Trend-Zeile berechnen (Passed% im Vergleich zu vorherigen Snapshots)

### F.3 Diff-Report erstellen

Vergleiche Post-Fortress-Snapshot mit Baseline:

```text
| Step | Baseline | Post-Fortress | Delta |
|------|----------|---------------|-------|
| 1.1  | ❌       | ✅             | 🛠️ Fixed |
| 2.3  | ✅       | ✅             | —     |
```

### F.4 Memory Update

```text
Aktualisiere: memory-bank/progress.md
  → Fortress-Audit Ergebnis dokumentieren
Aktualisiere: memory-bank/activeContext.md
  → Fortress-Status und nächste Schritte
```

### F.5 User Report

Melde dem User:

> "🏰 **Fortress Audit abgeschlossen.**
>
> | Metric | Wert |
> |--------|------|
> | E2E Steps | X total, Y passed, Z bugfixed |
> | Engine Eval | 100/100 (oder N/A) |
> | Sherlock Findings | X fixed, Y documented |
> | Security | 0 Critical, X Warnings |
> | Regressionen | 0 |
>
> Harness Snapshot: `memory-bank/e2e-snapshots/[datei]`
> System Status: ✅ Battle-Tested"

---

## Harness Snapshot Format

```markdown
# 🧪 E2E Harness Snapshot
Projekt: [Name] | Datum: [ISO] | Scope: [Full/Targeted]
Trigger: [fortress-audit/deep-e2e/agentic-plan]

## Summary
| Metric | Wert |
|--------|------|
| Total Steps | X |
| ✅ Passed | Y |
| 🛠️ Bugfixed (in-session) | Z |
| ❌ Failed (open) | W |
| Engine Eval Score | X/Y (nur bei Engines) |
| Security Sweep | X Critical / Y Warnings |
| Duration | ~Xmin |

## Step Registry
| Phase | ID | Beschreibung | Status | Betroffene Dateien | Bugs/Fixes |
|-------|-----|-------------|--------|-------------------|------------|

## Engine Eval Results (falls applicable)
| Engine | Scenario Score | Monte Carlo | p95 |
|--------|---------------|-------------|-----|

## Security Results
| Check | Status | Details |
|-------|--------|---------|

## Diff to Previous Snapshot
| Step | Previous | Current | Delta |
|------|----------|---------|-------|
```

---

## Anti-Halluzination Protokoll

> **KRITISCH:** Dieser Workflow läuft 1–3 Stunden. Kontext-Overflow ist garantiert.

### Context Checkpoints (nach JEDER Stage)

1. **SPEICHERE** alle bisherigen Ergebnisse in `e2e-master-plan.md`
2. **SCHREIBE** Checkpoint-Block:
   ```
   ### 🧹 Context Checkpoint — Stage [X]
   - Abgeschlossen: [Datum/Uhrzeit]
   - Passed: X | Bugfixed: Y | Failed: Z
   - Nächste Stage: [Stage Y Titel]
   ```
3. **MELDE** dem User:
   > "Stage [X] fertig. [Statistik]. Antworte mit 'Weiter' für Stage [Y]."
4. **BEIM NEUSTART:** `e2e-master-plan.md` RE-LESEN. Überspringe ✅ Steps.

### Harte Regeln

1. **Kein Ship mit offenen 🔴 Critical Findings** — weder Sherlock noch Security
2. **Hotfix ≠ Refactoring** — Stage 2 fixt nur, redesignt nicht
3. **Targeted > Full** — Stage 5 testet NUR was sich geändert hat
4. **Snapshots sind PFLICHT** — nach jedem Fortress-Durchlauf wird gespeichert
5. **Bei Unsicherheit: Stoppen und User fragen** — nie raten
