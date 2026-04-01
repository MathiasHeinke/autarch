# AGENTS.md — Autarch (Paperclip Fork + Hermes Agent)

> Cross-Tool Universal Agent Brief. Wird von JEDEM Agent bei Session-Start gelesen.
> ⚠️ Dies ersetzt die ursprüngliche Paperclip-Fork AGENTS.md mit Autarch-spezifischem Inhalt.

## Identity
- **Projekt:** Autarch — Autonomous OS built on Paperclip fork
- **Stack:** Rust (Paperclip Core), Python (Hermes Agent), Cloud Run, Supabase
- **User:** Mathias Heinke, Founder ARES

## Architecture
- **Paperclip Core:** Forked agent orchestration platform (Rust)
- **Hermes Agent:** Python-based autonomous execution engine (Cloud Run)
- **Control Plane:** Paperclip Orchestrator manages all state
- **Hermes = Stateless Inference Engine** — NO local persistence
- **Multi-Tenancy:** Via Paperclip API-auth flow

### Key Principle
> Hermes is 100% stateless. ALL state, memory, and context is managed by the Paperclip Orchestrator.
> Local `001_hermes_persistence.sql` was REMOVED (refactored to stateless).

## Build & Test
| Action | Command |
|--------|---------|
| Hermes Dev | `python -m uvicorn main:app --reload` |
| Paperclip Build | `cargo build` |
| Deploy | Cloud Run via `/ship-it` |

## Coding Standards
- **Rust:** Paperclip follows upstream conventions
- **Python (Hermes):** Type hints PFLICHT, async handlers
- **Stateless First:** NO database in Hermes workers
- **API-Auth:** Every request authenticated via Orchestrator

## Critical Directives
1. **DIRECTIVE-003:** Ruthless Efficiency — No Feature Creep
2. **DIRECTIVE-004:** Verify Before Claim — Beweis vor Behauptung
3. **Hermes = Stateless** — API-driven, no local persistence
4. **PII-Scrubbing** vor AI-Provider-Calls
5. **Multi-Tenancy** — Orchestrator-managed, never in worker
