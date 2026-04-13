---
description: NOUS Lifecycle — 4-phasiger Workflow von Ideation bis Ship mit Auto-Review-Gates
---

# /nous-lifecycle — Von der Idee zum Deploy

> **Trigger:** User hat eine Idee, ein Feature, einen Umbau — und will den vollen NOUS-geführten Lifecycle.
> **NOUS ist der rote Faden** durch alle 4 Phasen.

---

## Phase 0: IDEATION

1. **User beschreibt Idee/Problem** — NOUS hört zu und versteht was der User WIRKLICH will.
2. **NOUS lädt Kontext:**
   - `memory-bank/system-index.md` (Boot-Index)
   - `memory-bank/semantic-context.md` (Core Brain)
   - `memory-bank/activeContext.md` (Aktueller Stand)
   - `.antigravity/logs/architect-memory.md` (Active Directives)
   - `.antigravity/agentic-router.md` (Dispatch-Tabelle)
3. **NOUS routet:**
   - Einfache Idee → NOUS diskutiert 1:1 mit dem User
   - Komplexe Idee → `@mastertable:strategy` oder `@team:dynamic` für Brainstorming
4. **Output:** Klare Richtung + Frage an User: *"Sollen wir planen?"*

### 🧠 Memory Checkpoint
→ `activeContext.md` updaten: Richtungs-Entscheidung + gewählter Pfad

---

## Phase 1: PLAN

1. **NOUS delegiert Planung:**
   - Architektur → 🧠 Karpathy (Decision Protocol)
   - Relevante Spezialisten je nach Thema (Dispatch-Tabelle)
2. **Plan erstellen:**
   - Idiotensicherer Implementierungsplan
   - Phasen mit klaren Deliverables
   - Dateien, Dependencies, Reihenfolge
   - **Auto-Review-Gate nach jeder Phase definieren**
3. **Karpathy Decision Protocol:**
   - Reversibility Rating (1-5)
   - Layer 1 Update wenn nötig (Strategic Guardrails)
4. **Output:** Plan → User-Review → Freigabe

### 🧠 Memory Checkpoint
→ `activeContext.md` updaten: Plan-Decisions + Phasen-Übersicht
→ `semantic-context.md` erweitern (falls neue Architektur-Erkenntnisse)

---

## Phase 2: EXECUTE

1. **NOUS aktiviert den Bau-Trupp:**
   - UI-Feature → Chain 1 (Feature-Build)
   - Engine → `@mastertable:engine`
   - Komplexe Aufgabe → Passende Chain/Mastertable
2. **Pro Build-Phase:**
   ```
   BUILD → AUTO-REVIEW-GATE → NEXT PHASE
   
   Auto-Review-Gate:
   🔍 Sherlock  → Regressions? Edge Cases? Bugs?
   📐 Uncle Bob → SOLID? Tests? Naming?
   🚀 Hamilton  → Error Paths? Degradation? Idempotenz?
   
   CLEAN → weiter.
   FINDINGS → fix, dann weiter.
   ```
3. **Qualitäts-Ziel:** So sauber arbeiten, dass der Review NICHTS mehr findet.
4. **Output:** Fertiger Code, getestet, reviewed.

### 🧠 Memory Checkpoint (nach JEDER Build-Phase)
1. `activeContext.md` updaten: Was gebaut + was als Nächstes
2. `semantic-context.md` erweitern:
   ```markdown
   ### [Datum] — NOUS Lifecycle: [Feature] — Phase 2 Build
   **Geänderte Module:** [Liste]
   **Erkenntnisse:** [Was haben wir über das System gelernt?]
   **Entscheidungen:** [Was wurde entschieden und warum?]
   ```

---

## Phase 3: SHIP & REFLECT

// turbo-all

1. **Ship-Checkliste:**
   ```bash
   # Code
   git add -A && git commit -m "feat: [beschreibung]"
   git push origin main
   
   # Edge Functions (wenn geändert)
   supabase functions deploy [function-name] --project-ref $PROJECT_REF
   
   # Frontend Build
   npm run build
   
   # iOS Sync (wenn nötig)
   npx cap sync ios
   ```

2. **Memory Update (Die 2 Ebenen):**
   - **Operativ:** NOUS führt `/update-memory` aus (`activeContext.md`, `progress.md`, `sessionLog.md` der Memory Bank aktualisieren)
   - **Strategisch:** Karpathy schreibt `architect-memory.md` Layer 1 (nur bei großer Architektur-Entscheidung)
   - **Strategisch:** NOUS schreibt `architect-memory.md` Layer 2 (Active Directives anpassen falls sich Regeln geändert haben)
   - **Tech:** `tech-stack-context.md` updaten wenn neuer Tech/Pattern eingeführt wurde

3. **Retrospektive:**
   - Was lief gut?
   - Wo können wir besser werden?
   - Was wäre jetzt noch möglich mit dem was wir haben?

4. **Output:** Deployed, dokumentiert, reflektiert. ✅

---

## Quick-Reference

```
/nous-lifecycle     → Startet den vollen 4-Phasen-Lifecycle
@nous               → Aktiviert NOUS direkt für Orientierung
@mastertable:*      → Springt in spezifisches Mastertable-Meeting
@team:dynamic       → LLM stellt optimales Team zusammen
```
