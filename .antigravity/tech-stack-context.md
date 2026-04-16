# Tech Stack Context — Antigravity

> **Meta-Workspace: Keine klassische App — sondern die IDE-Kommandozentrale.**

---

## IDE & Agent Tools

| Aspekt | Technologie |
|---|---|
| IDE | Gemini Code Assist (Jules / Antigravity Agent) |
| Agent Framework | NOUS Persona System 3.0 (21 Personas) |
| Routing | Agentic Router v3.0 mit 7 Chains + 8 Mastertables |
| Memory (Operativ) | `memory-bank/` (8 Dateien, Layer 0.5 Boot) |
| Memory (Strategisch) | `architect-memory.md` (Decision Records) |
| Memory (Semantisch) | Honcho MCP (Cloud) |
| Config | `.antigravity/` Kit + `.agents/rules/` |

---

## MCP-Server (Model Context Protocol)

| Server | Port/Interface | Capabilities |
|---|---|---|
| **Antigravity Gateway** | Port 9090 (REST) | Context7 Library-Docs, PII Scrubber (DIRECTIVE-002) |
| **Supabase** | `supabase-mcp-server` | DB Queries, Migrations, Edge Functions, Types, Advisors, Branches |
| **GitHub** | `github-mcp-server` | Repos, PRs, Issues, Code Search, Branches, Releases, File Ops |
| **Cloud Run** | `cloudrun` | Container Deploy, Service Mgmt, Logs, Project Creation |
| **Stitch** | `StitchMCP` | UI Design Generation, Screen Creation, Variants, Editing |
| **GitNexus** | `gitnexus mcp` (stdio) | Code Intelligence: Query, Impact, Context, Rename, Detect Changes |

### Code Intelligence via GitNexus

Alle managed Workspaces im ARES Kosmos (ares-app, ares-bio-os-dashboard, ares-website) sind via GitNexus indexiert.
Das bedeutet du kannst (als NOUS oder als Persona) diese Befehle nutzen:
- `gitnexus_query`: Finde Konzepte in der Codebase.
- `gitnexus_impact`: Führe Impact Analysen durch vor (!) dem Code schreiben.
- `gitnexus_detect_changes`: Verifiziere Scope vor einem Push.

### Gateway Stack (In-Process Python, kein Docker)

| Component | Provider | Model/Config |
|-----------|----------|--------------|
| LLM | Google Gemini | `gemini-2.5-flash` |
| Embedder | Google Gemini | `gemini-embedding-2-preview` (768 dims) |
| Memory | Honcho (Cloud) / File-based (Memory Bank) | `memory-bank/*.md` |
| PII Scrubber | Regex | Email, Phone, CC, IBAN, SSN |
| Context7 | npx | Library-Docs (3000 tokens) |
| Autostart | macOS LaunchAgent | `com.antigravity.mcp-gateway` (RunAtLoad + KeepAlive) |

---

## Verwaltete Workspaces

| Workspace | Tech Stack | Gateway | Relevante Personas |
|---|---|---|---|
| **ARES Bio.OS** | Next.js, Supabase, Capacitor, Vertex AI | Planned | Alle 21 |
| **The Swarm** | Next.js, Supabase, AI Chat | ✅ Propagiert | Carmack, Rauno, Sherlock, Mr. Robot |
| **NOUS Bridge** | Node.js, Discord.js, MCP | Planned | Nexus, Carmack, Mr. Robot |
| **ARES Website** | Next.js, Vercel | Planned | Rauno, Draper, Jobs |

---

## Kit-System

| Aspekt | Details |
|---|---|
| Personas | 21 (in `.antigravity/personas/`) |
| Knowledge Files | 16 (in `.antigravity/knowledge/`) |
| Workflows | 27+ (in `.antigravity/workflows/`) + `/start-gateway` |
| Mastertables | 8 (architecture, frontend, engine, security, review, strategy, ai, content) |
| Chains | 7 (Feature UI, Feature Backend, Hardening, Ship-Ready, Radical Simplification, Deep Work, Disciplined Build) |
| Memory Bank | 8 Template-Dateien (in `memory-bank/`) |
| MCP Gateway | Template in `scripts/mcp-gateway-template/` |

---

## Boot-Sequenz (Layer-Prinzip)

```
Layer 0    → Identität (NOUS = system-prompt + nous.md)
Layer 0.5  → Working Memory (activeContext.md + progress.md)
Layer 0.75 → Infrastructure (Gateway Health-Check → /start-gateway)
Layer 1    → Regelwerk (copy-rules + tech-stack + agentic-router)
Layer 2    → On-Demand (Personas, Knowledge, architect-memory)
```

---

## Datenfluss

```
User Intent → NOUS (Layer 0) → Memory Bank (Layer 0.5)
                                    ↓
                          Gateway Check (Layer 0.75)
                                    ↓
                          Agentic Router → Persona/Chain/Mastertable
                                    ↓
                          MCP-Server (Gateway/Supabase/GitHub/CloudRun/Stitch)
                                    ↓
                          Workspace-spezifische Arbeit
                                    ↓
                          Quality Gate → /update-memory → Output
```
