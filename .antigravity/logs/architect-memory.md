# 🧠 Architect Memory — Autarch / Paperclip

> **3-Layer Memory System für NOUS und alle Personas.**
> Letzte Aktualisierung: 2026-04-02 — /mt-arch Mastertable (Karpathy ∷ Carmack ∷ Elon ∷ Sherlock ∷ Mr. Robot ∷ Taleb)

---

## Layer 1: Strategic Guardrails

> *Geschrieben von: 🧠 Karpathy | Gelesen von: NOUS*
> *Nur bei Architektur-Entscheidungen aktualisieren.*

### SG-001: "Go Native" — Kein Custom Orchestrator (2026-04-01)
- **Decision:** Abkehr von "The Swarm". Paperclip-Core (Issues, Routines, Heartbeat) ist der Orchestrator.
- **Rationale:** Complexity/Value Ratio zu hoch. Upstream-Fähigkeit hat Priorität.
- **Constraint:** NIEMALS eigenen Scheduling-Daemon, State-Manager oder Agent-Router einführen.

### SG-002: Hermes = Einziger Adapter in Produktion (2026-04-01)
- **Decision:** `HERMES_ONLY_MODE=true` in Produktion. Claude, Codex, Cursor: im Code vorhanden, nicht exposed.
- **Rationale:** Fokus. Hermes 4 405B ist state-of-the-art für autonome Recherche-Tasks.
- **Constraint:** Neue Adapter nur über das definierte Adapter-Pattern. Nie als Hardcode.

### SG-003: Honcho = Cross-Session Memory, keine eigene Lösung (2026-03-31)
- **Decision:** Self-hosted Honcho (Docker, localhost:8100) statt eigenem Embedding-System.
- **Rationale:** Honcho ist spezialisiert, daten-souverän (self-host), non-fatal by design.
- **Constraint:** Honcho-Client bleibt non-fatal. Timeout = 5s. System läuft auch ohne.

### SG-004: Stateless Worker = Keine Datenbank im Worker (2026-03-31)
- **Decision:** `workers/hermes-cloud/migrations/001_hermes_persistence.sql` wurde GELÖSCHT und wird nicht wiederbelebt.
- **Rationale:** State im Worker = Multi-Tenancy-Problem + Scale-to-Zero-Inkompatibilität.
- **Constraint:** NIEMALS eine DB, SQLite oder Datei-Persistenz im Cloud Run Worker einführen.

---

## Layer 2: Active Directives

> *Geschrieben von: 🧬 NOUS | Gelesen von: Alle Personas*

- **HERMES_STATELESS:** Worker = `skip_memory=True, persist_session=False`. Immer. Keine Ausnahme.
- **COMPANY_SCOPING:** Jede DB-Query MUSS `company_id` filter haben. Cross-tenant Leakage = Showstopper.
- **TOOLSET_WHITELIST:** `{web, file, memory, delegate_task}` — kein `terminal`, `process`, `shell`.
- **UPSTREAM_NATIVITÄT:** Paperclip-Core-Dateien außerhalb der 5 Autarch-Bereiche sind tabu.
- **HONCHO_NON_FATAL:** Hermes-Execution blockiert NIE auf Honcho-Verfügbarkeit.
- **PII_SCRUBBING:** Context Messages IMMER durch `pii-scrub.ts` vor Dispatch zu externen LLMs.
- **COST_CAP:** `maxIterations ≤ 50`, `costCapPerRun ≤ $5.00` — hard enforced im Worker.

---

## Layer 3: Session Log

> *IMMER einen Eintrag schreiben — auch bei kleinen Fixes.*

### Session 2026-04-03 — feat(hermes): Gemini Migration v0.7.0 — NousResearch → Gemini Backend
- **Thema:** Hermes Cloud Worker Inference-Backend von NousResearch (hermes-4-405b) auf Google Gemini (gemini-3.1-pro-preview) migriert. `hermes-agent` Library vollständig erhalten — reiner 3-Parameter-Swap (base_url, api_key, model).
- **Ergebnis:** config.py (GOOGLE_API_KEY + GEMINI_BASE_URL), main.py (AIAgent constructor swap, v0.7.0), models.py (default model), hermes.json (provider: google), execute.ts (dual-model routing + task classifier), index.ts (model list). tsc Exit 0. Cloud Run Revision 00024-6jb deployed. Health: `{status: healthy, model: gemini-3.1-pro-preview, version: 0.7.0}`. Git: `f5f8cdca`.
- **Architektur-Entscheidung:** SG-005: Gemini via OpenAI-Compat-Endpoint als Hermes-Inference-Backend (2026-04-03). hermes-agent Library bleibt als Agentic-Framework — nur Backend-Swap. Dual-Model-Routing (Pro: komplex, Flash: simpel) im Adapter.
- **Offene Punkte:** E2E Smoke Test mit echtem Agent-Run über Paperclip UI. Streaming-Verhalten bei Tool-Calls beobachten. Preview-Model-IDs tracken (können sich ändern).

### Session 2026-04-02 — /hotfix: Context-Loss Bug — Hermes Agent bekommt Task-Kontext (KRITISCH)
- **Thema:** Hermes-4-405B Worker erhielt nie den Issue-Body oder Kommentare. Deep E2E Test (ARE-2) hat den Bug zweifelsfrei isoliert.
- **Ergebnis:** `heartbeat.ts`: `description` zu issueContext-Query hinzugefügt + Context-Hydration-Pipeline (Issue-Body + 20 Comments → context.messages). Import `issueComments` aus `@paperclipai/db`. `module-interaction-map.md` Step 0 dokumentiert. tsc clean. SG-016 in semantic-context.
- **Offene Punkte:** Deploy auf Cloud Run. ARE-2 Deep Thinking Retest. Memory-Persistence Validierung.

### Session 2026-04-02 — /ship-it: soul-loader.ts — G-008 CLOSED
- **Thema:** workers/agents/{profileName}/SOUL.md in Hermes-Execution verdrahten. "ok go" vom Founder.
- **Ergebnis:** soul-loader.ts (neu), execute.ts (soul prefix), heartbeat.ts (pre-load hook). typecheck Exit 0. 3 Commits. G-008 in semantic-context.md geschlossen. progress.md updated. Alle Memory-Dateien synchron.
- **Offene Punkte:** P1: Heartbeat-Cron, Custom MCP-Server, heartbeat.ts Refactoring.

### Session 2026-04-02 — /mt-arch: Semantic Context v2.0 + Founder Vision
- **Thema:** Founder Vision "Go Native" in semantic-context.md verankern. Mastertable: Karpathy, Carmack, Elon, Sherlock, Mr. Robot, Taleb.
- **Ergebnis:** `semantic-context.md` komplett neu geschrieben (v2.0 ~350 Zeilen): Nordstern-Section, 5 Directives, Dependency Graph, 9 Gotchas, 4 Strategic Guardrails, Session-Chronik-Template.
- **Offene Punkte:** P1: Worker-Agents-Profile in heartbeat.ts verdrahten (G-008); Heartbeat-Cron aktivieren; Agent JWT (pnpm paperclipai onboard).

### Session 2026-04-02 (früh) — Deep Research v4.1 — Deployment Status Sync
- **Thema:** Neuer Commit-Zyklus analysiert (4 Commits), Drift-Fixes.
- **Ergebnis:** `ground-of-truth.md` v4.1, `infrastructure-map.md` LIVE-Status, `hermes-agent.md` Drift-Fix.
- **Offene Punkte:** Progress.md P1-P3 weiterhin offen.

### Session 2026-04-01 — Deep Research v4.0 — Initial Ground of Truth
- **Thema:** 9-phasige exhaustive Excavation des gesamten Repos.
- **Ergebnis:** 8 neue Memory Bank Dateien. 27 Monster Files, 5 Orphans, 77 stale Docs katalogisiert.
- **Offene Punkte:** Cloud Run + Honcho damals noch pending → 2026-04-01 abend beides deployed.

### Session 2026-04-01 — Hermes Stateless Refactoring (6 Phasen)
- **Thema:** Hermes Worker von stateful auf stateless migrieren. 6 Fortress Gates bestanden.
- **Ergebnis:** Gateway Auth, Library Mode, HERMES_ONLY_MODE, agent_memory Schema, Memory Lifecycle Bridge, Honcho Client.
- **Offene Punkte:** War SG-003 und SG-004 Grundlage.
