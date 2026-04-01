# Hermes Agent — Vollständige Referenz

> **Status:** Integriert via `hermes-paperclip-adapter` + Cloud Run Worker + Python Library Mode
> **Docs:** [hermes-agent.nousresearch.com/docs](https://hermes-agent.nousresearch.com/docs/)
> **Repo:** [github.com/NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) (17.8k⭐ | v0.5.0 | 2026-03-28)

---

## Was ist Hermes?

Hermes ist der **selbstlernende autonome Agent** von NousResearch — **nicht nur ein Chat-Wrapper**, sondern eine vollständige Agentic-Execution-Engine mit:

- Eingebautem **Learning Loop** (Skills werden aus Erfahrung erstellt & verbessert)
- **40+ nativen Tools** (Web, Terminal, File, Browser, Code, Vision, Memory, Cron…)
- **MCP-Support** (externe Tool-Server via Model Context Protocol)
- **Python Library API** — `AIAgent` kann direkt in eigene Pipelines embedded werden
- **Messaging Gateway** — Telegram, Discord, Slack, WhatsApp, Signal, Email
- **Session Persistence** — SQLite-basierte FTS5-Suche über Session-History
- **Context Compression** — Automatisch bei langen Runs; Prompt-Caching für Kosten-Effizienz
- **RL Environment** — Trajectory-Saving in ShareGPT-Format für Finetuning

Im Autarch-Stack fungiert er als **Ausführungs-Engine**: Paperclip (Orchestrator) delegiert Tasks an Hermes-Instanzen, die diese über Tool Calls abarbeiten.

---

## Architektur im Autarch-Stack

```
Paperclip Orchestrator (heartbeat.ts)
    │
    ├── Pre-Load: agent_memory DB → memorySnapshot/skillsIndex
    ├── Pre-Load: Honcho Server → honchoInsight (5s timeout)
    │
    ↓ (REST / X-Hermes-Secret)
hermes-cloud adapter (execute.ts)
    ↓ (HTTP POST /v1/execute)
Cloud Run Worker (main.py)          ← 100% Stateless Inference Engine
    ├── AIAgent Library             ← skip_memory=True, persist_session=False
    ├── System Prompt Assembly      ← memories + skills + honcho insight
    ├── Tool Registry (filtered)    ← web, file, memory, delegate_task
    ├── NDJSON Streaming            ← thinking, response, tool_call, usage
    └── Usage Reporting             ← tokens + cost per run
    │
    ↓ (NDJSON Response)
Paperclip Orchestrator (heartbeat.ts)
    ├── Post-Persist: save_memory events → agent_memory DB
    └── Post-Ingest: messages → Honcho Server (fire-and-forget)
```

---

## LLM-Konfiguration

```json
{
  "model": {
    "provider": "openrouter",
    "model": "nousresearch/hermes-4-405b"
  },
  "model_fallback": {
    "provider": "nousresearch",
    "api_base": "https://inference-api.nousresearch.com/v1",
    "model": "Hermes-4-405B"
  }
}
```

**OpenRouter** = Primary (200+ Modelle, Routing, Fallbacks). **NousResearch Direct** = Fallback (direkte Inference-API).

---

## Core Loop — AIAgent Internals

Der Core ist `run_agent.py`'s `AIAgent` — **vollständig synchron**, kein Async.

```python
class AIAgent:
    def __init__(self,
        model: str = "nousresearch/hermes-4-405b",  # via OpenRouter
        max_iterations: int = 90,
        enabled_toolsets: list = None,      # whitelist
        disabled_toolsets: list = None,     # blacklist
        quiet_mode: bool = True,            # IMMER True in embedded mode
        save_trajectories: bool = False,    # für Finetuning-Daten
        ephemeral_system_prompt: str = None,# Custom System Prompt (nicht in Trajectory)
        skip_context_files: bool = False,   # AGENTS.md aus CWD überspringen
        skip_memory: bool = False,          # Memory Read/Write deaktivieren
        platform: str = None,              # "cli", "telegram", "discord", etc.
        session_id: str = None,
        # + provider, api_key, base_url, callbacks...
    ): ...

    def chat(self, message: str) -> str:
        """Simple Interface — gibt final response string zurück."""

    def run_conversation(self, user_message: str, system_message: str = None,
                         conversation_history: list = None, task_id: str = None) -> dict:
        """Full Interface — gibt dict zurück: {final_response, messages, task_id}"""
```

**Turn Lifecycle:**
```
run_conversation()
  → generate effective task_id
  → append current user message
  → load/build cached system prompt
  → maybe preflight-compress
  → build api_messages
  → inject ephemeral prompt layers
  → apply prompt caching
  → make interruptible API call
  → if tool_calls: execute (sequential or concurrent), append results, loop
  → if final text: persist, cleanup, return response
```

**Callback Surfaces** (für Streaming & Approval UIs):
`tool_progress_callback`, `thinking_callback`, `reasoning_callback`, `clarify_callback`, `step_callback`, `stream_delta_callback`, `tool_gen_callback`, `status_callback`

---

## 🔑 NEU: Python Library Mode — Direkte Einbindung

> **Das ist die wichtigste neue Erkenntnis für unseren Stack!**
> Hermes kann **direkt als Python-Library** in FastAPI, Worker-Jobs etc. verwendet werden — ohne CLI/Gateway-Overhead.

### Installation

```bash
pip install git+https://github.com/NousResearch/hermes-agent.git
# oder in requirements.txt:
# hermes-agent @ git+https://github.com/NousResearch/hermes-agent.git
```

### Embedding in FastAPI (für unsere Worker)

```python
from run_agent import AIAgent

# Pro Thread/Task eine neue Instanz — NICHT teilen (nicht thread-safe)!
agent = AIAgent(
    model="openrouter/nousresearch/hermes-4-405b",
    quiet_mode=True,           # IMMER True in embedded mode
    skip_context_files=True,   # AGENTS.md nicht laden
    skip_memory=True,          # Stateless für API-Endpoints
    max_iterations=20,         # Niedrig für einfache Tasks
    ephemeral_system_prompt="Du bist ein Autarch-Worker-Agent. Bearbeite Task: ...",
    enabled_toolsets=["web", "file"],  # Nur was der Worker braucht
)
result = agent.run_conversation(
    user_message="Investigate competitor pricing for health apps",
    task_id="task-uuid-123",
)
print(result["final_response"])
print(result["messages"])  # Full conversation history
```

### Batch Processing (Parallel Worker Fleet)

```python
import concurrent.futures
from run_agent import AIAgent

def run_worker_task(task: dict) -> dict:
    agent = AIAgent(
        model="openrouter/nousresearch/hermes-4-405b",
        quiet_mode=True,
        skip_memory=True,
        max_iterations=30,
    )
    result = agent.run_conversation(
        user_message=task["prompt"],
        task_id=task["id"],
    )
    return {"task_id": task["id"], "result": result["final_response"]}

with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
    results = list(executor.map(run_worker_task, tasks))
```

### Multi-Turn Conversations (für NOUS Persistenz)

```python
agent = AIAgent(model="openrouter/nousresearch/hermes-4-405b", quiet_mode=True)

# Turn 1
result1 = agent.run_conversation("Analysiere unsere Q1 KPIs")
history = result1["messages"]

# Turn 2 — Agent erinnert Kontext
result2 = agent.run_conversation(
    "Erstelle jetzt einen Bericht basierend darauf",
    conversation_history=history,
)
```

---

## Tool-Kategorien (40+ Tools)

### Papercip-Relevante Tools

| Kategorie | Tools | Paperclip-Nutzung |
|-----------|-------|-------------------|
| `web` | `web_search`, `web_extract` | Competitor-Watch, Research-Skills |
| `terminal` | `terminal`, `process` | Shell-Commands in Docker-Isolation |
| `file` | `read_file`, `patch`, `write_file` | Issue-Artefakte, Report-Generierung |
| `code_execution` | `execute_code` | Python-Sandboxing, Data-Processing |
| `browser` | `browser_navigate`, `browser_snapshot` | Web-Scraping mit JS-Support |
| `memory` | `memory`, `session_search`, `honcho_*` | Cross-Session-Memory via Honcho |
| `delegate_task` | `delegate_task` | **Sub-Agent Delegation!** |
| `cronjob` | `cronjob` | Scheduled Agent Tasks |
| `send_message` | `send_message` | Telegram/Discord/Slack Notifications |
| `rl_*` | RL Tools | RLHF / Feedback Loop |

### Terminal Backends

```yaml
backends:
  - local       # Lokale Shell
  - docker      # Isolierte Container
  - ssh         # Remote SSH
  - modal       # Serverless Cloud (fast idle)
  - daytona     # Dev-Environments
  - singularity # HPC/GPU Cluster
```

---

## Skills-System

Hermes lernt aus Erfahrung und speichert bewährte Abläufe als **Skills** — wiederverwendbare Prozeduren in `~/.hermes/skills/`.

### Unsere Autarch-Skills

| Skill | Trigger | Cron | Apify Actors |
|-------|---------|------|-------------|
| `longevity-research` | `/longevity-research` | Daily 08:00 UTC | `google-search-scraper`, `web-scraper` |
| `competitor-watch` | `/competitor-watch` | Weekly Mo 09:00 | `web-scraper`, `cheerio-scraper` |
| `social-listening` | `/social-listening` | Daily 10:00 UTC | `reddit-scraper`, `twitter-scraper` |

### SKILL.md Format

```yaml
---
name: autarch-report
description: Wöchentlicher Business-Report für Autarch-Companies
version: 1.0.0
platforms: [linux, docker]
metadata:
  hermes:
    tags: [business, analytics, reporting]
    category: business-intelligence
---
# Autarch Weekly Report Skill
## When to Use → Trigger conditions
## Procedure → Schritt-für-Schritt
## Pitfalls → Bekannte Fehlerquellen
## Verification → Wie prüfen ob's geklappt hat
```

### Progressive Disclosure (Token-Effizienz)

```
Level 0: skills_list() → [{name, description}, ...]  (~3k tokens)
Level 1: skill_view(name) → Vollständiger SKILL.md Content
Level 2: skill_view(name, path) → Spezifische Referenz-Datei
```

---

## MCP Integration

Hermes kann externe Tool-Server via **Model Context Protocol** einbinden.

### Konfiguration in `config.yaml`

```yaml
mcp_servers:
  apify:
    command: "npx"
    args: ["-y", "@apify/mcp-server"]
    env:
      APIFY_API_KEY: "${APIFY_API_KEY}"
  custom-autarch:
    command: "python"
    args: ["/app/autarch-mcp-server.py"]
    env:
      SUPABASE_URL: "${SUPABASE_URL}"
      SUPABASE_KEY: "${SUPABASE_KEY}"
```

### Features

- Auto-Discovery: Tools werden beim Start automatisch registriert
- Per-Server Filtering: Whitelist/Blacklist einzelner Tools
- Utility Wrappers: Resources + Prompts des MCP Servers nutzbar
- Toolset: `mcp-<servername>` (z.B. `mcp-apify`, `mcp-custom-autarch`)

---

## Cron Scheduling (Native Agent Jobs)

Cron Jobs sind **first-class agent tasks**, nicht nur Shell-Crons!

```json
{
  "daily_research": {
    "schedule": "0 8 * * *",
    "prompt": "Run the longevity-research skill and save results to Supabase"
  },
  "weekly_report": {
    "schedule": "0 9 * * 1",
    "prompt": "Collect all competitor changes from this week and create a summary"
  },
  "heartbeat": {
    "schedule": "*/5 * * * *",
    "prompt": "Check pending Autarch tasks and pick up new work"
  }
}
```

---

## Gateway (Messaging)

Hermes hat ein **Messaging Gateway** — erreichbar via Telegram, Discord, Slack, WhatsApp, Signal, Email.

```bash
hermes gateway setup   # Plattformen konfigurieren
hermes gateway start   # Gateway starten (Port 8080)
```

Im Autarch-Stack: Docker-Container auf Cloud Run mit `hermes gateway start --port 8080`.

---

## Paperclip-Native Integration

### Adapter-System (bestehend)

Der `hermes-paperclip-adapter` (npm-Modul) verbindet Paperclip mit Hermes:

- **Stdout-Parsing:** `parseHermesStdoutLine()` — interpretiert Hermes-Output für die Paperclip-UI
- **Config-Builder:** `buildHermesConfig()` — generiert Hermes-Config aus Paperclip Agent-Settings
- **UI Adapter:** `HermesLocalConfigFields` — React-Component für Agent-Konfiguration

```typescript
export const hermesLocalUIAdapter: UIAdapterModule = {
  type: "hermes_local",
  label: "Hermes Agent",
  parseStdoutLine: parseHermesStdoutLine,
  ConfigFields: HermesLocalConfigFields,
  buildAdapterConfig: buildHermesConfig,
};
```

### 🆕 Empfehlung: Python Library Mode für Worker Fleet

Statt jede Worker-Instanz über CLI zu spawnen, können Worker direkt `AIAgent` importieren:

```python
# autarch-worker/worker.py
from run_agent import AIAgent

class PaperclipWorker:
    def __init__(self, agent_config: dict):
        self.agent = AIAgent(
            model="openrouter/nousresearch/hermes-4-405b",
            quiet_mode=True,
            skip_context_files=True,
            skip_memory=False,           # Memory für persistente Agents
            max_iterations=agent_config.get("max_iterations", 30),
            ephemeral_system_prompt=agent_config.get("soul_md"),
            enabled_toolsets=agent_config.get("toolsets", ["web", "file"]),
        )
        self.conversation_history = []

    def execute_task(self, task_prompt: str, task_id: str) -> dict:
        result = self.agent.run_conversation(
            user_message=task_prompt,
            conversation_history=self.conversation_history,
            task_id=task_id,
        )
        # Kontext für nächsten Turn erhalten (Multi-Turn Worker)
        self.conversation_history = result["messages"]
        return result
```

### 🆕 Empfehlung: Autarch MCP Server

Ein eigener MCP-Server würde Hermes-Agents direkten Zugriff auf Supabase geben:

```python
# autarch-mcp-server.py
from mcp_serve import MCPServer

server = MCPServer()

@server.tool("get_open_tasks")
def get_open_tasks(company_id: str) -> list:
    """Hole alle offenen Tasks für eine Company aus Autarch."""
    ...

@server.tool("update_task_status")
def update_task_status(task_id: str, status: str, result: str) -> dict:
    """Aktualisiere Task-Status in Autarch."""
    ...
```

---

## Trajectory Saving (Finetuning Data)

```python
agent = AIAgent(
    model="openrouter/nousresearch/hermes-4-405b",
    save_trajectories=True,   # Speichert in trajectory_samples.jsonl
    quiet_mode=True,
)
agent.chat("Analysiere unsere Weekly KPIs")
# → ShareGPT-Format für Finetuning auf Hermes 5
```

---

## AGENTS.md — Workspace Instructions

Hermes lädt `AGENTS.md` aus dem Working Directory als Kontext. Für Autarch-Worker:

```markdown
# Autarch Worker Context
Du bist ein Autarch-Worker-Agent. Du arbeitest für Unternehmen im Autarch-Ecosystem.

## Regeln
- Immer company_id-scoped arbeiten
- PII nicht in Logs ausgeben
- Bei Unsicherheit: clarify_callback nutzen

## Verfügbare MCP-Tools
- mcp-autarch: get_open_tasks, update_task_status, save_report
```

---

## CLI Quick Reference

```bash
hermes              # Interaktive CLI starten
hermes model        # LLM Provider/Modell konfigurieren
hermes tools        # Tools konfigurieren
hermes config set   # Config-Werte setzen
hermes gateway      # Messaging Gateway
hermes setup        # Full Setup Wizard
hermes doctor       # Diagnose
hermes update       # Update
hermes claw migrate # Migration von OpenClaw
```

---

## Profiles — Multi-Agent Isolation

Hermes unterstützt **Profiles** — vollständig isolierte Instanzen mit eigenem `HERMES_HOME`:

```bash
hermes -p nous     # NOUS CEO-Profil
hermes -p athena   # Athena COO-Profil
hermes -p coder    # Engineering-Worker-Profil
```

Jedes Profil hat eigene: Config, API Keys, Memory, Sessions, Skills, Models.

---

## File Structure (Hermes Codebase)

```
hermes-agent/
├── run_agent.py          # AIAgent class — core conversation loop  ← ENTRY POINT
├── model_tools.py        # Tool orchestration, _discover_tools()
├── toolsets.py           # Toolset definitions, _HERMES_CORE_TOOLS
├── cli.py                # HermesCLI — interactive CLI
├── hermes_state.py       # SessionDB — SQLite FTS5 session store
├── mcp_serve.py          # MCP Server (Hermes als MCP-Server exposbar!)
├── batch_runner.py       # Parallel batch processing
├── agent/
│   ├── prompt_builder.py      # System prompt assembly
│   ├── context_compressor.py  # Auto context compression
│   ├── prompt_caching.py      # Anthropic prompt caching
│   └── skill_commands.py      # Skill slash commands
├── tools/                # Tool implementations (eine Datei pro Tool)
│   ├── registry.py       # Central tool registry
│   ├── terminal_tool.py  # Terminal orchestration
│   ├── web_tools.py      # Web search/extract
│   ├── delegate_tool.py  # Subagent delegation
│   └── mcp_tool.py       # MCP client
├── gateway/              # Messaging platform gateway
├── cron/                 # Cron scheduler
├── honcho_integration/   # Honcho memory integration
└── skills/               # Bundled skills
```

---

## Sicherheits-Checklist (DSGVO)

- ⚠️ `skip_memory=True` für stateless API-Endpoints (keine PII in SQLite)
- ⚠️ `terminal`-Toolset deaktivieren wenn kein Shell-Zugriff nötig
- ⚠️ `enabled_toolsets` whitelist nutzen statt alles zu erlauben
- ⚠️ API Keys nur über `.env` — nie im Code
- ⚠️ `max_iterations` begrenzen um Kosten-Runaway zu verhindern
- ⚠️ `ephemeral_system_prompt` für PII-sensitive Instructions (nicht in Trajectory)

---

## Nächste Schritte für Autarch

| Priorität | Action | Status |
|-----------|--------|--------|
| ✅ DONE | Hermes Python Library in Worker installiert (pip from git) | Abgeschlossen |
| ✅ DONE | Stateless Refactoring (6 Phasen, alle Fortress Gates bestanden) | Abgeschlossen |
| ✅ DONE | Externalized Brain Schema + Memory Lifecycle | Abgeschlossen |
| ✅ DONE | Honcho Integration (REST Client + Self-Host Docs) | Abgeschlossen |
| ✅ DONE | Enterprise UI Feature Flag (HERMES_ONLY_MODE) | Abgeschlossen |
| 🔴 HIGH | Cloud Run Worker deployen (Docker Image + Service) | Offen |
| 🔴 HIGH | Honcho Self-Hosted Instance aufsetzen (Docker Compose) | Offen |
| 🔴 HIGH | End-to-End Test (Task → Worker → Memory → Honcho) | Offen |
| 🟡 MED | Custom Autarch MCP-Server implementieren | Offen |
| 🟡 MED | Heartbeat-Cron aktivieren (5-Min-Intervall) | Offen |
| 🟢 LOW | Trajectory-Saving für Finetuning aktivieren | Offen |
