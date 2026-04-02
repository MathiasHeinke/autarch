# 🧠 Semantic Context — Autarch / Paperclip

> **Version:** v2.0 — Synthesized by /mt-arch Mastertable (Karpathy ∷ Carmack ∷ Elon ∷ Sherlock ∷ Mr. Robot ∷ Taleb)
> **Stand:** 2026-04-02 | Letztes Update: Deep Research v4.1 + Founder Vision Integration
> **Regel:** NIEMALS löschen — nur appenden. Bei Overflow (>400 Zeilen) → älteste Sessions in `archive/` verschieben.

---

## 0. Nordstern — Founder Vision (Architektonisches Leitprinzip)

> **🧠 Karpathy:** *"Autarch ist kein Framework-Experiment — es ist eine Wette darauf, dass organisches Community-Building die einzige Marketing-Strategie ist, die in einer misstrauischen Bildungsschicht funktioniert. Jede Architektur-Entscheidung muss diese Wette unterstützen."*

### Die Mission in einem Satz
**Autarch ist eine autonome Agenten-Armee, die für ARES Bio.OS tiefgründige Recherche betreibt, Content erstellt und organisch in Longevity-Communities (Reddit, X, Fachforen) postet — weil Paid Ads in dieser Zielgruppe (Attia-, Sinclair-, Huberman-Follower) nicht funktionieren.**

### Das Kerngesetz: "Go Native"

```
❌ VERBOTEN:                              ✅ ERLAUBT:
Eigener Orchestrator-Code                Paperclip-Core as-is verwenden
Custom State Machine                     Issues/Routines/Heartbeat nutzen
Fork von Paperclip-Kern-Klassen          Adapter-Pattern (hermes_cloud)
Eigene Auth-Logic                        Better Auth + API Keys
Eigenes Memory-System                    agent_memory Tabelle + Honcho
Eigenes Agent-Scheduling                 Routines + Heartbeat Cron
```

**Warum:** Jede Abweichung von Paperclip-Core macht Upstream-Updates unmöglich. Das kostet langfristig mehr als jeder kurzfristige Custom-Code-Vorteil.

### Die einzige legitime Modifikation
```
Paperclip (Körper) + Hermes (Gehirn) = Autarch
         ↑                   ↑
  bleibt upstream-nah    nahtlos integriert
  via Adapter Pattern    als hermes_cloud adapter
```

---

## 1. Index der Kern-Module

### 1.1 Orchestrierungs-Schicht (Was Paperclip ist)

| Modul | Datei | LoC | Autarch-Rolle |
|-------|-------|-----|---------------|
| **Heartbeat** | `server/src/services/heartbeat.ts` | 4.038 | Kern-Loop: Wakeup → Checkout → Memory Pre-Load → Execute → Memory Persist → Cost Record |
| **Issues** | `server/src/services/issues.ts` | 1.923 | Task-Pipeline (backlog→todo→in_progress→in_review→done) — Autarchs "Aufgaben" |
| **Routines** | `server/src/services/routines.ts` | 1.269 | Cron-Automations-Engine — für wiederkehrende Recherche-Tasks |
| **Budgets** | `server/src/services/budgets.ts` | 959 | Hard-Stop bei Cost-Cap Breach — schützt vor unkontrollierten LLM-Kosten |
| **Plugin System** | `server/src/services/plugin-loader.ts` | 1.955 | Erweiterbarkeit — 15 Module für Sandbox + Jobs + Events |
| **Adapter Registry** | `server/src/adapters/registry.ts` | ~80 | Wählt den richtigen Adapter (hermes_cloud, claude-local, …) per Agent-Typ |

### 1.2 Die Hermes-Integrationsschicht (Was Autarch hinzufügt)

| Modul | Datei | LoC | Zweck |
|-------|-------|-----|-------|
| **Execute Bridge** | `server/src/adapters/hermes-cloud/execute.ts` | 154 | HTTP POST zum Cloud Run Worker, NDJSON Parsing, Toolset-Whitelist |
| **Memory Lifecycle** | `server/src/adapters/hermes-cloud/memory-lifecycle.ts` | 141 | Pre-Load `agent_memory` DB → Worker-Context; Post-Persist `save_memory` NDJSON Events → DB |
| **Honcho Client** | `server/src/adapters/hermes-cloud/honcho-client.ts` | 196 | Cross-Session Reasoning (non-fatal, self-hosted, company-scoped) |
| **PII Scrubbing** | `server/src/adapters/hermes-cloud/pii-scrub.ts` | 55 | DSGVO: Bereinigt Context Messages vor Worker-Dispatch |
| **Worker (Cloud Run)** | `workers/hermes-cloud/main.py` | 292 | Stateless FastAPI Inference Engine — AIAgent v0.6.0 |
| **Worker Models** | `workers/hermes-cloud/models.py` | 79 | Pydantic: ExecuteRequest, MemoryEntry, ExecuteEvent |
| **Worker Config** | `workers/hermes-cloud/config.py` | 26 | ALLOWED/BLOCKED_TOOLSETS, MAX_ITERATIONS |

### 1.3 Datenschicht

| Tabelle | Datei | Zweck |
|---------|-------|-------|
| `agent_memory` | `packages/db/src/schema/agent_memory.ts` | Externalized Brain: key/content/category/importance — der persistente Gedächtnis-Speicher für Hermes |
| `issues` | schema/issues.ts | Autarchs Task-Pipeline — jede Recherche-Aufgabe ist ein Issue |
| `routines` | schema/routines.ts | Cron-basierte Automatisierungen (z.B. Daily Reddit Scan) |
| `cost_events` | schema/cost_events.ts | Token-Level Kosten-Tracking |
| `budget_policies` | schema/budget_policies.ts | Hard-Stop Regeln |
| `company_skills` | schema/company_skills.ts | Wiederverwendbare Skill-Templates |

### 1.4 Agent-Personas (23 Profil-Pakete in `workers/agents/`)

Jeder Agent hat 4 Markdown-Dateien: **SOUL.md** (Persönlichkeit), **AGENTS.md** (Tech-Brief), **HEARTBEAT.md** (Routine), **TOOLS.md** (Toolset).
Diese sind **Konfiguration, kein Code** — sie hydratisieren den System-Prompt des Hermes-Workers.

Für Autarchs Marketing-Mission besonders relevant:
- `don-draper` → Copy, Microcopy, Content-Planung
- `jonah-jansen` → Viral Growth, Community-Dynamiken
- `apollo` → Business Intelligence / Recherche
- `hermes` → Primärer Execution-Worker
- `sherlock-holmes` → Analyse, Audit, Quellen-Validierung

---

## 2. Architektur-Vorgaben (Enforced by /mt-arch Mastertable)

### DIRECTIVE-001: Hermes bleibt stateless (ABSOLUT)

```
❌ NIEMALS in workers/hermes-cloud/:     ✅ IMMER in heartbeat.ts / memory-lifecycle.ts:
- Lokale Datenbank                       - Memories aus DB laden (Pre-Load)
- SQLite / persist_session=True          - Memories in DB schreiben (Post-Persist)
- Eigene Session-Speicherung             - Conversation → Honcho ingestieren
- Lokale Datei-Caches                    - Cost Events schreiben
```

> **🖥️ Carmack:** *"Skip_memory=True, persist_session=False sind keine Optionen — sie sind invariante Eigenschaften des Workers. Bricht man diese, bricht man Multi-Tenancy."*

### DIRECTIVE-002: Paperclip-Kern NICHT modifizieren

Paperclip-Kern = alles außer:
1. `server/src/adapters/hermes-cloud/` ← Hermes Adapter (owned by Autarch)
2. `workers/hermes-cloud/` ← Worker (owned by Autarch)
3. `packages/db/src/schema/agent_memory.ts` ← Einzige DB-Erweiterung
4. `ui/src/lib/featureFlags.ts` ← HERMES_ONLY_MODE Flag
5. `workers/agents/` ← Agent Persona Configs (Markdown, kein Code)

Alles andere ist upstream Paperclip — **nicht anfassen**.

> **🚀 Elon:** *"Jede neue Funktion, die ich außerhalb dieser 5 Bereiche sehe, ist ein Upstream-Update-Blocker. Löschen."*

### DIRECTIVE-003: Company-ID = Sicherheits-Perimeter

```sql
-- IMMER in jeder DB-Query:
WHERE company_id = $companyId
-- NIEMALS:
SELECT * FROM agent_memory  -- ohne company_id filter = SICHERHEITSLÜCKE
```

> **🕶️ Mr. Robot:** *"Cross-tenant Leakage ist der einzige Angriff, den ich wirklich fürchte. Company_id fehlt in einer Query = sofortiger Showstopper."*

### DIRECTIVE-004: Toolset-Whitelist ist nicht verhandelbar

```python
ALLOWED_TOOLSETS = {web, file, memory, delegate_task}
BLOCKED_TOOLSETS = {terminal, process, shell, exec, subprocess}
```

Hermes darf in Cloud Run keine Shell-Commands ausführen. Das ist eine bewusste Security-Entscheidung — kein RCE-Risiko.

### DIRECTIVE-005: Honcho ist nie blockierend

```typescript
// RICHTIG:
const honchoInsight = await queryAgentInsights(...);  // 5s timeout, gibt null zurück bei Fehler
// FALSCH:
if (!honchoInsight) throw new Error("Honcho unavailable");  // blockiert den Agent
```

---

## 3. Abhängigkeits-Graph — Wie ein Task durchs System fließt

### 3.1 Der vollständige Hermes Execution Flow

```
[USER / ROUTINE CRON]
    │
    ▼ POST /api/companies/:id/issues
[issues.ts service] → INSERT (status: backlog) → auto-assign Agent
    │
    ▼ (5-Min Heartbeat Cron)
[heartbeat.ts]
    ├─ 1. loadAgentMemories(db, companyId, agentId)
    │       → SELECT FROM agent_memory WHERE company_id=$1 AND agent_id=$2
    │       → ORDER BY importance DESC LIMIT 50
    │       → split by category: {memorySnapshot[], skillsIndex[]}
    │
    ├─ 2. queryAgentInsights(companyId, agentId)  ← Honcho REST
    │       → PUT /v3/workspaces/autarch-company-{cId}/peers/agent-{aId}
    │       → POST /chat {query: "Summarize key context..."}
    │       → returns: {content, queriedAt} | null (non-fatal, 5s timeout)
    │
    ├─ 3. checkoutNextIssue() → atomic lock, status: in_progress
    │
    ├─ 4. scrubContextMessages() ← PII Scrubbing
    │
    ├─ 5. HTTP POST workers/hermes-cloud:8080/v1/execute
    │       headers: {X-Hermes-Secret: process.env.HERMES_CLOUD_SECRET}
    │       payload: {agentId, runId, profileName, model, systemPrompt,
    │                 context, enabledToolsets, maxIterations, costCapPerRun,
    │                 memorySnapshot, skillsIndex, honchoInsight?}
    │       ↓
    │   [WORKER: main.py]
    │       ├─ Validate X-Hermes-Secret
    │       ├─ Enforce ALLOWED_TOOLSETS (Pydantic validator, hard)
    │       ├─ Build system_prompt (memories + skills + honcho)
    │       ├─ AIAgent(skip_memory=True, persist_session=False)
    │       │   model: "nousresearch/hermes-4-405b" via OpenRouter
    │       ├─ agent.run_conversation(user_message, conversation_history, task_id)
    │       │   → max_iterations: min(request.maxIterations, 50) HARD CAP
    │       │   → Tools: web_search, web_extract, read_file, save_memory, delegate_task
    │       └─ NDJSON stream: system|thinking|response|tool_call|usage
    │
    ├─ 6. Parse NDJSON → persistNewMemories()
    │       → find tool_call events where name="save_memory"
    │       → INSERT INTO agent_memory (companyId, agentId, key, content, ...)
    │       → onConflictDoNothing (upgrade to upsert wenn nötig)
    │
    ├─ 7. ingestRunConversation() → Honcho (fire-and-forget, non-fatal)
    │       → POST /v3/workspaces/.../sessions/run-{runId}/messages
    │
    ├─ 8. recordCostEvent() → cost_events (synchron! Budget-Check)
    │
    └─ 9. updateIssueStatus() → done/failed
```

### 3.2 Routine → Issue → Heartbeat (Marketing-Automation)

```
CRON: "0 8 * * *" (täglich 08:00 UTC)
    │
    ▼ routines.ts evaluateRoutineTriggers()
    │
    ◆ Template "Longevity Reddit Scan":
    │   prompt = "Search r/longevity, r/biohacking for trending Peptid-Diskussionen.
    │             Save key insights to memory. Identify top 3 content angles."
    │
    ▼ Issue erstellen (status: backlog, assigned: apollo-agent)
    │
    ▼ Heartbeat picks up → Hermes Worker → Web Tools → save_memory
    │
    ◆ Ergebnis in agent_memory:
    │   {key: "trend_2026_04_02_peptide", content: "...", category: "insight", importance: 80}
    │
    ▼ Content-Folge-Issue: "Erstelle Reddit-Post basierend auf insight:trend_2026_04_02_peptide"
```

### 3.3 Memory → System Prompt Hydration (Wie Hermes "erinnert")

```typescript
// In execute.ts:
payload.memorySnapshot = [
  {key: "brand_voice", content: "Authentisch, wissenschaftlich, nicht verkäuferisch", importance: 95},
  {key: "ares_target_audience", content: "30-50 Jahre, hohes Bildungsniveau, Longevity-Affin", importance: 90},
  {key: "reddit_posting_rules", content: "Keine Produktlinks in ersten 3 Sätzen...", importance: 85},
]
// Im Worker wird daraus der System-Prompt:
// "Du bist [Agent-SOUL]. Dein Gedächtnis: [memorySnapshot]. Insights: [honchoInsight]. Task: [issue]"
```

---

## 4. Known Gotchas & Upstream-Bruchpunkte

### G-001: Heartbeat.ts ist ein 4.038 LoC Monolith — NICHT als Ganzes lesen
**Was:** Die Datei enthält die gesamte Orchestrierungslogik in einer Datei.
**Fix:** Grep zuerst nach dem relevanten Pipeline-Step. Pattern: `// --- Step X:` oder Funktionsname.
**Gefahr:** Falsches Verständnis führt zu doppelter Implementierung.

### G-002: `onConflictDoNothing()` in memory-lifecycle.ts droppt Updates silent
**Was:** Wenn ein Memory-Key bereits existiert und ein neuer Wert kommt, wird er **verworfen**.
**Fix:** Wenn Updates nötig: `.onConflictDoUpdate({target: [key, agentId], set: {content, importance}})`.
**Wann wichtig:** Wenn Agents Skills lernen sollen (aktuell: NOOP bei Konflikt).

### G-003: Hermes 70B hat KEIN Tool-Calling auf OpenRouter
**Was:** `nousresearch/hermes-4-70b` (Fallback) unterstützt keine Tool Calls auf OpenRouter.
**Fix:** 70B nur als reine Reasoning-Fallback-Kette ohne Tool-Execution nutzen.
**Gefahr:** Agent schlägt still fehl wenn auf 70B fallback + Tool-Einsatz erwartet.

### G-004: Papercip-Kern modifizieren bricht Upstream-Updates
**Was:** Jede Änderung außerhalb der 5 Autarch-eigenen Bereiche macht `git merge upstream` konflikthaft.
**Fix:** NIE Paperclip-Core anfassen. Immer Adapter-Pattern oder Feature Flags.
**Upstream Pull Strategie:**
```bash
git remote add upstream https://github.com/paperclipai/paperclip
git fetch upstream
git merge upstream/main  # Konflikte NUR in workers/hermes-cloud/ + memory-bank/ akzeptiert
```

### G-005: Honcho Workspace muss manuell initialisiert werden
**Was:** Workspace `autarch-company-{id}` und Peer `agent-{id}` werden lazily bei erstem Call erstellt (Honcho ist idempotent).
**Fix:** Kein extra Init nötig. Honcho-Client macht PUT vor jedem ingestRunConversation().

### G-006: `VITE_HERMES_ONLY_MODE` muss beim Build gesetzt sein (nicht zur Laufzeit)
**Was:** Vite baked Env-Vars zur Build-Zeit ein. Zur Laufzeit setzen hat keinen Effekt.
**Fix:** In `.env.production` oder Cloud Run Env-Var als Build Arg setzen.

### G-007: PGlite in Dev hat kein pgvector
**Was:** Embedded PGlite (Dev) unterstützt pgvector extension nicht vollständig.
**Fix:** Vector-abhängige Features (Knowledge Base Embedding) nur gegen Supabase testen.

### G-008: Worker Agents-Profile (workers/agents/) sind NICHT in heartbeat.ts verdrahtet
**Was:** Die 23 SOUL/AGENTS/HEARTBEAT/TOOLS Markdown-Dateien sind aktuell nur Docs, kein ausführbarer Code.
**Status:** P1 offenes Item — müssen in system_prompt Hydration eingebaut werden.
**Fix (wenn implementiert):** heartbeat.ts liest `workers/agents/{profileName}/SOUL.md` als Teil des System-Prompts.

### G-009: Paperclip UI-Updates sind komplex wegen der Monolith-Komponenten
**Was:** AgentDetail.tsx (4.078 LoC), Inbox.tsx (1.579 LoC) — schwer zu testen und zu patchen.
**Fix:** Nur das Adapter-Picker-Verhalten über `featureFlags.ts` steuern — nie in diese Komponenten greifen, außer für gezielte Bugfixes.

---

## 5. Architektur-Entscheidungen (Strategic Guardrails)

### SG-001: "Go Native" = Kein Custom Orchestrator (2026-04-01)
- **Decision:** Abkehr von "The Swarm" (eigenem Multi-Agent-Orchestrator). Paperclip-Issues, -Routines und -Heartbeat sind der Orchestrator.
- **Rationale:** Complexity/Value Ratio zu hoch. Paperclip löst das Problem bereits. 
- **Constraint:** NIEMALS einen eigenen Scheduling-Daemon, State-Manager oder Agent-Router einführen.

### SG-002: Hermes als einziger Adapter-Typ in Produktion (2026-04-01)
- **Decision:** `HERMES_ONLY_MODE=true` in Autarch-Produktions-Deploy. Alle anderen Adapter (claude, codex, cursor) sind present im Code aber nicht exposed.
- **Rationale:** Fokus. Hermes 4 405B ist state-of-the-art für autonome Tasks.
- **Constraint:** Neue Adapter NUR über das bestehende Adapter-Pattern einführen, NIE als Hardcode.

### SG-003: Honcho für Cross-Session Memory, nicht eigene Lösung (2026-03-31)
- **Decision:** Self-hosted Honcho (Docker, localhost:8100) statt eigenem Embedding/Search System.
- **Rationale:** Honcho ist spezialisiert auf genau dieses Problem. Datas-Souveränität via self-host.
- **Constraint:** Honcho-Client bleibt non-fatal. System läuft auch ohne Honcho.

### SG-004: Stateless Worker = Keine Migration in workers/hermes-cloud/ (2026-03-31)
- **Decision:** `workers/hermes-cloud/migrations/001_hermes_persistence.sql` wurde GELÖSCHT.
- **Rationale:** State im Worker = Multi-Tenancy-Problem + Scale-to-Zero-Inkompatibilität.
- **Constraint:** NIEMALS wieder eine Datenbank oder Datei-Persistenz im Worker einführen.

---

## 6. Referenz-Matrix (Navigation bei Session-Start)

| Frage | Antwort | Datei |
|-------|---------|-------|
| Was ist Autarchs Mission? | Marketing-Engine für ARES Bio.OS | Section 0 dieses Dokuments |
| Wie läuft ein Agent-Task durch das System? | 9-Step Heartbeat Pipeline | Section 3.1 |
| Welche Module darf ich anfassen? | Nur die 5 Autarch-eigenen Bereiche | Section 2, DIRECTIVE-002 |
| Wie funktioniert Hermes als Stateless Worker? | FastAPI, skip_memory=True | `workers/hermes-cloud/main.py` |
| Wie persistiert Hermes seine Erkenntnisse? | save_memory Events → agent_memory Tabelle | `server/src/adapters/hermes-cloud/memory-lifecycle.ts` |
| Wie kommt Kontext in den System-Prompt? | memorySnapshot + skillsIndex + honchoInsight | `execute.ts` Zeile 59-82 |
| Warum gibt es einen heartbeat.ts Monolith? | Upstream-Paperclip-Design, nicht von uns | SG-001, G-001 |
| Was ist der Status der 23 Worker-Agents? | Docs vorhanden, noch nicht in heartbeat verdrahtet | G-008, P1 Todo |
| Wie zieht man Upstream-Updates? | git merge upstream/main, nur in definierten Bereichen | G-004 |
| Welche Env-Vars brauchen wir? | 9 kritische Vars | `memory-bank/infrastructure-map.md` |
| Was sind die nächsten P1-Items? | Cron, MCP-Server, Worker-Agents verdrahten | `memory-bank/progress.md` |

---

## 7. Session-Chronik (neueste zuerst)

### 2026-04-02 — /ship-it: Paperclip Server → Cloud Run LIVE

**Pilot:** Mathias Heinke
**Aufgabe:** Paperclip Server als Cloud Run Service deployen + Vercel API Proxy konfigurieren

**Geänderte Module:**
- `Dockerfile` — Multi-stage pnpm Docker Build, tsx aus `./node_modules/.bin/tsx`, WORKDIR /app/server
- `.gcloudignore` — dist/ inkludiert, node_modules exkludiert
- `server/Dockerfile` — Legacy Dockerfile Referenz
- `vercel.json` — API rewrites → `https://paperclip-server-61066913791.europe-west1.run.app/api/*`
- `server/src/adapters/hermes-cloud/execute.ts` — Cloud Worker URL Anpassung
- `workers/hermes-cloud/main.py` — Worker-Fixes
- `memory-bank/e2e-master-plan.md` — [NEU] E2E-Masterplan

**Erkenntnisse:**
- `tsx: not found` → `npx tsx` nicht global verfügbar in Docker, Lösung: `./node_modules/.bin/tsx`
- **127.0.0.1 vs 0.0.0.0:** Paperclip `local_trusted` mode enforced loopback. Cloud Run braucht 0.0.0.0. Fix: `PAPERCLIP_DEPLOYMENT_MODE=authenticated` + `HOST=0.0.0.0`
- Hostname-Whitelist: Cloud Run Domain muss über `PAPERCLIP_ALLOWED_HOSTNAMES` freigeschaltet werden
- `authenticated` public exposure braucht `auth.baseUrlMode=explicit` — für private reicht `auto`

**Abhängigkeiten entdeckt:**
- `config.ts:219` — `HOST` env var → `server.host` binding (nicht in fileConfig.server.host ohne HOST env)
- `index.ts:426` — `local_trusted` + non-loopback = throw Error (Guard Clause)
- `BETTER_AUTH_SECRET` oder `PAPERCLIP_AGENT_JWT_SECRET` erforderlich für authenticated mode

**Entscheidungen:**
- Server deployed als `authenticated` + `private` (Cloud Run IAM = unauthenticated, App-Level Auth via Better Auth)
- `PAPERCLIP_ALLOWED_HOSTNAMES` als Env-Var statt config.json

---

### 2026-04-02 — /ship-it: soul-loader.ts — G-008 CLOSED

**Pilot:** Mathias Heinke ("ok go")
**Aufgabe:** workers/agents/{profileName}/SOUL.md in Hermes-Execution verdrahten (G-008)

**Geänderte Module:**
- `server/src/adapters/hermes-cloud/soul-loader.ts` [NEU] — loadAgentSoul(), buildSoulSystemPrompt()
- `server/src/adapters/hermes-cloud/execute.ts` — soulPrefix + configSystemPrompt → systemPrompt
- `server/src/services/heartbeat.ts` — Soul pre-load nach Honcho-Block in hermes_cloud guard
- `memory-bank/semantic-context.md` — v2.0 (diese Session + vorige in einem Push)
- `.antigravity/logs/architect-memory.md` — SG-001–004 + 7 Directives + Session Log

**Erkenntnisse:**
- `adapterConfig.profileName` ist das einzige Konfigurationsfeld das Autarch an heartbeat.ts übergeben muss
- Path Traversal: `[a-z0-9_-]` regex + AGENTS_ROOT assertion macht den Loader sicher
- Soul ist non-fatal: fehlende Profile = Agent läuft ohne Persona (graceful degradation)
- Soul setzt die Persona (WORUM bin ich?) — config.systemPrompt setzt die Task (WAS tue ich?)

**Abhängigkeiten entdeckt:**
- `agent.adapterConfig` (DB JSON) → `profileName` → `workers/agents/{name}/SOUL.md`
- Soul → `context.hermesAgentSoul` (JSON string) → execute.ts → `systemPrompt` prefix → Worker

**Entscheidungen:**
- Soul prepends (Persona first), dann config.systemPrompt (Task-Override danach)
- SOUL.md + AGENTS.md + HEARTBEAT.md werden alle injiziert (vollständiger Kontext)
- TOOLS.md wird NICHT injiziert (Tools sind über enabledToolsets konfiguriert, nicht via Prompt)

### 2026-04-02 — /mt-arch: Semantic Context v2.0 — Founder Vision Integration

**Pilot:** Mathias Heinke (Founder)
**Mastertable:** Karpathy (Vorsitz), Carmack, Elon, Sherlock, Mr. Robot, Taleb
**Aufgabe:** Founder Vision destillieren + vollumfängliches semantic-context.md schreiben

**Verarbeitete Quellen:**
- AGENTS.md (Root) — Identity + Critical Directives
- activeContext.md — Current Focus, Navigation Map
- techContext.md — Tech Stack, Hermes Integration Details
- systemPatterns.md — 12 Architektur-Patterns
- progress.md — P0 Done, P1-P3 offen
- paperclip-glossar.md — Autarch vs. Paperclip Begriffe
- ground-of-truth.md v4.1 — Kompletter Architektur-Atlas
- .antigravity/logs/architect-memory.md — Strategische Guardrails (leer → befüllt)

**Key Findings:**
- Founder-Vision "Go Native" war nicht explizit im Code verankert — jetzt in Section 0+2
- 5 Strategic Guardrails formalisiert (SG-001 bis SG-004)
- 9 Known Gotchas katalogisiert (G-001 bis G-009)
- Worker-Agents-Profile (23 Personas) noch nicht in heartbeat.ts verdrahtet — P1 blocker
- Dependency Graph für vollständigen Task-Flow ausgearbeitet (Section 3.1)

**Offene Punkte:**
- P1: Heartbeat-Cron aktivieren (5-Min-Intervall)
- P1: worker_agents/{profileName}/SOUL.md → System-Prompt Hydration
- P1: Custom Autarch-MCP-Server für Supabase-Zugriff
- P2: C-001 Issue Status-Mutation verdrahten
- P1: pnpm paperclipai onboard → Agent JWT generieren

**Entscheidungen:**
- SG-001 bis SG-004 jetzt als explizite Constraints verankert
- `HERMES_ONLY_MODE=true` ist die Produktions-Erwartung

---

### 2026-04-02 (früh) — Deep Research v4.1 — Deployment Status Sync

**Pilot:** Antigravity (Autonomous)
**Neue Erkenntnisse:** Cloud Run DEPLOYED, Honcho LIVE, E2E 16/16 PASSED
**Drift gefixt:** hermes-agent.md "Next Steps" war 100% veraltet
**Output:** ground-of-truth.md v4.1, infrastructure-map.md LIVE-Status

---

### 2026-04-01 — Deep Research v4.0 — Initial Ground of Truth

**Pilot:** Antigravity (Deep Research Workflow, 9 Phasen)
**Scope:** 1.467 Dateien, 1.846 Commits, 66 Tabellen, 48 Migrations
**Key Findings:** 27 Monster Files, 5 Orphans, 77 stale Docs
**Output:** 8 neue Memory Bank Dateien

---

## 8. /update-memory Template

> Kopiere diesen Block und fülle ihn am Session-Ende aus:

```markdown
### [DATUM] — [Thema / Feature]

**Pilot:** [Wer hat diese Session durchgeführt?]
**Mastertable:** [Welche Personas waren aktiv? (optional)]
**Aufgabe:** [Was war das Ziel?]

**Verarbeitete Quellen:**
- [Datei 1] — [Was wurde gelernt]
- [Datei 2] — [Was wurde gelernt]

**Key Findings:**
- [Erkenntnis 1]
- [Erkenntnis 2]

**Offene Punkte:**
- [Was ist noch offen / blocked]

**Entscheidungen:**
- [Was wurde entschieden — wenn strategisch relevant: als SG-XXX eintragen]
```

---

> **Maschinelle Lesbarkeit:** Dieses Dokument ist maschinenlesbar optimiert.
> Alle Future Agents: Lies Section 0 zuerst (Nordstern), dann Section 6 (Navigation), dann die relevante Section.
> DIRECTIVE-003: Ruthless Efficiency — No Feature Creep.

---

### 2026-04-02 — Ship: Cloud-Native Stack Live (Vercel + Cloud Run + Supabase + Hermes)
**Geänderte Module:** `.gitignore`, `memory-bank/progress.md`, `memory-bank/e2e-master-plan.md`
**Infrastruktur:** Cloud Run Worker API Key Fix (`NOUSRESEARCH_API_KEY` → `autarch_os` Key), Supabase MCP Token in Antigravity IDE
**Erkenntnisse:**
- NousResearch API Key Validierung: `/v1/models` geht auch mit ungültigem Key durch, nur `/v1/chat/completions` gibt 401
- Instance Admin Bootstrapping erfordert direkten DB-Insert — kein CLI/UI-Pfad im `authenticated` Deployment Mode
- Agent Memory wird NICHT automatisch geschrieben — Agent muss explizit Memory-Tool aufrufen
- Onboarding-Wizard Company Name Bug: Doppelpaste "ARES Bio.OSARES Bio.OS" (UI Issue)
**Abhängigkeiten entdeckt:**
- Hermes Cloud Worker → NousResearch Inference API (nicht OpenRouter!)
- Paperclip Server → Worker via `HERMES_CLOUD_WORKER_URL` + `HERMES_CLOUD_SECRET`
- `instance_user_roles` → `companies.create` Permission Gate
**Entscheidungen:**
- SG-014: NousResearch API direkt (nicht über OpenRouter) für Hermes-4-405B
- SG-015: Supabase MCP Token in Antigravity IDE für direkte DB-Inspektion

