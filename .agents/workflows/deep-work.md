---
description: Deep Work — Autonomer Multi-Phase Execution Workflow mit Fortress Gates
---

# /deep-work — Autonomous Multi-Phase Execution

## Trigger
- `/deep-work [Task]` im Prompt
- User gibt "Go" auf einen Plan mit ≥3 Phasen

## Schritte

1. **Lead-Persona routen** basierend auf Task-Domäne:
   - Backend/Engine/DB → 🖥️ Carmack (`john-carmack.md`)
   - Strategie/Architektur → 🧠 Karpathy (`andrej-karpathy.md`)
   - Deletion/Vereinfachung → 🚀 Elon (`elon-musk.md`)
   - UI/UX/Design → 🖤 Steve Jobs + ⚛️ Rauno
   - Deep Audit → 🔍 Sherlock (Carmack als Gate)

2. **System-Kontext laden (PFLICHT!):**
   ```text
   Lies: memory-bank/system-index.md ODER ARCHITECTURE.md
   Lies: DESIGN.md (bei UI-Tasks)
   Lies: AGENTS.md
   Lies: memory-bank/activeContext.md
   Lies: memory-bank/semantic-context.md (falls vorhanden)
   ```

3. **Plan erstellen:** Nutze `.antigravity/agentic-plan-template.md`. Zerlege in nummerierte Phasen.

4. **Autonome Execution:** Führe Phase für Phase aus. KEIN User-Prompt zwischen Phasen.

5. **Fortress-Gate nach JEDER Phase:**
   - Lies `.antigravity/personas/sherlock-holmes.md`
   - Prüfe Build, Bugs, Edge-Cases
   - Bei Failure → Fix inline, dann weiter

6. **Memory Checkpoint nach JEDER Phase:**
   - Aktualisiere `memory-bank/activeContext.md`:
     - ✅ Was wurde in dieser Phase erledigt (1-2 Sätze)
     - ⏳ Was ist die nächste Phase + deren Ziel
     - 🔑 Kritische Entscheidungen dieser Phase
   - Erweitere `memory-bank/semantic-context.md`:
     ```markdown
     ### [Datum] — Phase [N]: [Titel]
     **Geänderte Module:** [Liste]
     **Erkenntnisse:** [Was haben wir über das System gelernt?]
     **Entscheidungen:** [Was wurde entschieden und warum?]
     ```
   - Git Checkpoint: `git add -A && git commit -m "checkpoint: Phase [N] — [summary]"`

7. **Final Audit:** Sherlock + Gordon Ramsay gemeinsam. System-Audit + Cleanup.

8. **Report:** Melde dich erst nach dem Final Audit beim User. Erstelle Audit-Report unter `docs/audits/Audit-[Fall-ID].md`.

> **Regel:** Agent feuert autonom durch alle Phasen. Fortress-Gate + Memory Checkpoint sind autonom.
> **Unterschied zu `/agentic-plan`:** `/deep-work` ist leichter + vollständig autonom. `/agentic-plan` hat User-Approval-Gate, Fortress-Integration und Post-Mortem-System.
