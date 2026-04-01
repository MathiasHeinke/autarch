# Audit Methodology — Kern-Wissen für Paperclip Personas

**Primär-Personas:** 🔍 Sherlock Holmes, 👨‍🍳 Gordon Ramsay  
**Sekundär:** 🖥️ John Carmack, 🕶️ Mr. Robot

> [!IMPORTANT]
> Diese Datei MUSS gelesen werden bei Code Reviews, Bug-Jagd,
> Pre-Release Audits und Refactoring-Aufträgen.

---

## 4-Schritt Bug-Analyse

```
1. REPRODUCE  → Bug reproduzieren (exakte Schritte + Datei + Zeile)
2. IMPACT     → Schwere bewerten (🔴 Critical / 🟡 Warning / 🟢 Minor)
3. FIX        → Konkreter Fix mit Code-Vorschlag
4. VERIFY     → Test schreiben der den Fix validiert
```

### Severity-Kalibrierung

| Level | Icon | Definition | Beispiele |
|---|---|---|---|
| **Critical** | 🔴 | Datenverlust, Security-Lücke, App-Crash | RLS fehlt, PII-Leak, unhandled Promise |
| **Warning** | 🟡 | Funktionsfehler, Edge Case, Performance | Falscher Wert berechnet, N+1 Query |
| **Minor** | 🟢 | Stil, Wartbarkeit, Optimierungspotenzial | Missing Type, unused import, console.log |

---

## Sherlock Audit Report Template

```markdown
# 🔍 Audit Report: [Feature/Component Name]

**Datum:** [YYYY-MM-DD]
**Auditor:** Sherlock Holmes
**Scope:** [Welche Dateien/Features wurden geprüft]

## Executive Summary
[1-2 Sätze: Gesamturteil]

## Production Readiness: [✅ READY / ⚠️ CONDITIONAL / 🔴 NOT READY]

## Findings

### 🔴 Critical
#### Finding C1: [Titel]
- **Datei:** `path/to/file.ts:42`
- **Problem:** [Beschreibung]
- **Impact:** [Was passiert wenn es nicht gefixt wird]
- **Fix:** [Code-Vorschlag]

### 🟡 Warning
#### Finding W1: [Titel]
...

### 🟢 Minor
#### Finding M1: [Titel]
...

## Statistik
| Metrik | Wert |
|---|---|
| Dateien geprüft | X |
| Critical | X |
| Warning | X |
| Minor | X |

## Empfehlung
[Nächste Schritte]
```

---

## Code Review Checklist

### Pflicht-Checks (für jeden Review)

**Type Safety:**
- [ ] Keine `any` Types?
- [ ] Props/Return Types explizit definiert?
- [ ] Zod-Validation für externe Daten?

**Error Handling:**
- [ ] Try/Catch in async Functions?
- [ ] Error Boundaries für React-Komponenten?
- [ ] Fehler-States im UI handled?

**Edge Cases:**
- [ ] Leere Arrays/null-Werte berücksichtigt?
- [ ] Loading/Error/Empty States?
- [ ] Concurrent Updates (Race Conditions)?
- [ ] Netzwerk-Offline-Verhalten?

**Security:**
- [ ] PII-Scrub vor AI-Calls?
- [ ] RLS auf neuen Tabellen?
- [ ] Input Validation?
- [ ] Keine sensitive Data in Console Logs?

**Performance:**
- [ ] Keine N+1 Queries?
- [ ] useMemo/useCallback wo nötig?
- [ ] Bundle Impact akzeptabel?

**Architecture:**
- [ ] DRY — keine Code-Duplikation?
- [ ] Single Responsibility pro Datei?
- [ ] Naming konsistent mit Codebase?
- [ ] `_shared/` Imports statt Kopien?

---

## Refactoring Methodology (Ramsay-Approach)

### Inspect → Taste → Verdict → Rebuild → Plate

1. **Inspect:** Code-Datei öffnen, Struktur analysieren
   - Wie viele Zeilen? Wie viele Funktionen? Cyclomatic Complexity?
2. **Taste:** Einen typischen Call-Path durchgehen
   - Folge dem Datenfluss von Input → Output
3. **Verdict:** Probleme benennen
   - Spaghetti? DRY-Verletzung? God-Object? Feature Envy?
4. **Rebuild:** Konkreten Refactoring-Plan
   - Extract Method? Extract Component? Move to Hook?
5. **Plate:** Anrichten — Clean Code mit Tests

### Code Smells Katalog

| Smell | Beschreibung | Lösung |
|---|---|---|
| **God Component** | >200 Zeilen, macht alles | Extract Hooks + Sub-Components |
| **Prop Drilling** | Props durch 3+ Ebenen | Context oder Composition |
| **Feature Envy** | Funktion benutzt mehr fremde als eigene Daten | Move to zugehörigem Modul |
| **Shotgun Surgery** | Eine Änderung erfordert Edits in 5+ Dateien | Consolidate related logic |
| **Dead Code** | Unreachable oder unused | Delete |
| **Magic Numbers** | Hardcoded Werte ohne Kontext | Named Constants |

---

## TDD-Compliance Prüfung

### Criteria
- [ ] Gibt es Tests für die neuen Funktionen?
- [ ] Sind die Tests sinnvoll (nicht nur Coverage-Padding)?
- [ ] Edge Cases getestet?
- [ ] Tests grün bei `npm test`?

### Test-Stack
```
Unit Tests:      Vitest
Component Tests: @testing-library/react
E2E Tests:       Playwright (wenn vorhanden)
```

---

## Referenz-Dateien

| Datei | Zweck |
|---|---|
| `docs/audits/` | Bestehende Audit-Reports |
| `.antigravity/workflows/sherlock-audit.md` | Audit-Workflow |
| `.antigravity/logs/architect-memory.md` | Architektur-Entscheidungen |
