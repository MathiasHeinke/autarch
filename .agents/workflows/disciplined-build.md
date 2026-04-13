---
description: Voller 6-Phase Build-Zyklus — Brainstorm → Plan → TDD → Review → Cleanup → Ship
---

# 🏗️ Disciplined Build — Superpowers-inspirierter Build-Zyklus

Systematischer 6-Phase Build-Zyklus mit **0 Abkürzungen**.
Jede Phase hat ein Gate. Kein Code vor Spec. Kein Code ohne Test. Kein Ship ohne Review.

> Auslöser: `/disciplined-build [Feature]`

---

## Phase 0: Context laden (PFLICHT — IMMER, NICHT CONDITIONAL!)

> **Eiserne Regel:** Ohne Systemverständnis wird KEIN Build gestartet.

// turbo
```
PFLICHT-LEKTÜRE (in dieser Reihenfolge):
1. memory-bank/activeContext.md       → Aktueller Arbeitsstand
2. memory-bank/progress.md            → Was fertig, was offen
3. memory-bank/system-index.md        → Boot-Index (Codebase-Karte)
   ODER ARCHITECTURE.md               → (falls system-index nicht existiert)
4. DESIGN.md                          → Design System (bei UI-Tasks)
5. AGENTS.md                          → Agent Brief + Coding Standards
6. .antigravity/logs/architect-memory.md → Active Directives
7. memory-bank/semantic-context.md    → Gewachsenes Systemverständnis (falls vorhanden)
8. .antigravity/agentic-plan-template.md → Plan-Template
```

---

## Phase 1: Brainstorm (🧠 Karpathy Lead)

Aktiviere den `/brainstorm` Workflow:

1. Karpathy stellt 3–5 klärende Fragen (KEINE Lösungen!)
2. Spec in Chunks formulieren (max. 200 Wörter/Chunk)
3. **Gate:** Jeder Chunk muss einzeln vom User approved werden
4. Kompakte Spec-Zusammenfassung mit Akzeptanzkriterien + Out of Scope

> [!IMPORTANT]
> **Kein Code vor Spec-Approval.** Das ist nicht verhandelbar.

---

## Phase 2: Plan (Dynamische Lead-Persona)

Erstelle einen Implementation Plan nach `.antigravity/agentic-plan-template.md`:

| Task-Domäne | Lead-Persona |
|---|---|
| Backend/Engine/DB | 🖥️ John Carmack |
| UI/UX/Design | 🖤 Steve Jobs + ⚛️ Rauno Freiberg |
| Fullstack | Carmack + Rauno (alternierend) |
| Strategie/Architektur | 🧠 Karpathy |

**Gate:** User gibt einmalig „Go" auf den Plan.

---

## Phase 3: Execute mit TDD (🖥️ Carmack Lead)

Pro Funktion/Methode im Plan:

```
🔴 RED:      Failing Test schreiben
             → Verifizieren: Test MUSS fehlschlagen
🟢 GREEN:   Minimalen Code schreiben
             → Verifizieren: Test MUSS bestehen
🔄 REFACTOR: Gordon Ramsay Cleanup
             → Verifizieren: Test MUSS immer noch bestehen
✅ COMMIT:   git commit
```

**Zwischen-Gate nach jeder Funktion:**
- Tests grün?
- Spec-Kriterium erfüllt?
- Keine Regression in bestehenden Tests?

> [!CAUTION]
> **Kein Code ohne Test.** Wurde Code ohne Test geschrieben? Sofort löschen.

---

## Phase 4: 2-Stage Review (🔍 Sherlock)

// turbo
```
Lies: .antigravity/personas/sherlock-holmes.md
```

### Stage 1: Spec Compliance
- Erfüllt der Code ALLE Akzeptanzkriterien aus Phase 1?
- Gibt es Scope Creep (Code der nicht in der Spec steht)?
- Fehlen Akzeptanzkriterien die nicht umgesetzt wurden?

### Stage 2: Code Quality
- Type Safety (kein `any`)?
- Error Handling komplett?
- Edge Cases abgedeckt?
- PII-Regeln eingehalten?
- RLS vorhanden (bei neuen Tabellen)?

**Bei Findings:** Zurück zu Phase 3 für Fixes (mit neuem TDD-Zyklus).

---

## Phase 5: Cleanup (👨‍🍳 Gordon Ramsay)

// turbo
```
Lies: .antigravity/personas/gordon-ramsay.md
```

1. **Dead Code entfernen** — keine auskommentierten Blöcke, keine unused Imports
2. **Duplikate eliminieren** — gemeinsame Logik nach `_shared/` extrahieren
3. **Wiki-Update** — Hat sich an Engines/Formeln/Architektur etwas geändert?
   - `docs/wiki/*.md` aktualisieren
   - `architect-memory.md` Session-Log schreiben
4. **Finale Test-Suite** — Alle Tests nochmal laufen lassen

---

## Phase 5.5: Memory Checkpoint (PFLICHT nach jeder Phase!)

> Lightweight Update — volles `/update-memory` erst am Session-Ende.

1. Aktualisiere `memory-bank/activeContext.md`:
   - ✅ Was wurde in dieser Phase erledigt (1-2 Sätze)
   - ⏳ Was ist die nächste Phase + deren Ziel
   - 🔑 Kritische Entscheidungen dieser Phase
   - 📁 Welche Dateien wurden angefasst

2. Semantic Context erweitern — `memory-bank/semantic-context.md`:
   ```markdown
   ### [Datum] — Disciplined Build: [Feature]
   **Geänderte Module:** [Liste der angefassten Dateien/Module]
   **Erkenntnisse:** [Was haben wir über das System gelernt?]
   **Abhängigkeiten entdeckt:** [Welche Module hängen wie zusammen?]
   **Entscheidungen:** [Was wurde entschieden und warum?]
   ```

---

## Phase 6: Ship Decision (User)

Präsentiere dem User:

```markdown
## 🏗️ Disciplined Build: [Feature] — Complete

### Was wurde gebaut
[Zusammenfassung der Änderungen]

### Test Coverage
[Anzahl Tests, alle grün? Edge Cases?]

### Review Status
- Spec Compliance: ✅
- Code Quality: ✅
- Wiki Updated: ✅/❌

### Nächster Schritt?
- `/ship-it` → Commit, Push, Deploy
- PR erstellen → Code Review durch Team
- Behalten → Noch nicht deployen
- Verwerfen → Rollback
```

---

## Eiserne Disciplined-Build-Regeln

> [!CAUTION]
> **0 Abkürzungen. 0 Ausnahmen.**

1. **Kein Code vor Spec-Approval** — Phase 1 Gate ist absolut.
2. **Kein Code ohne Test** — Phase 3 erzwingt TDD für jede Funktion.
3. **Kein Ship ohne Review** — Phase 4 ist Pflicht, auch bei „kleinen" Changes.
4. **Evidence over Claims** — Jede Behauptung muss mit Code, Test oder Datei belegt werden.
