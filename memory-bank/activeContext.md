# Active Context — Autarch

> Letzte Aktualisierung: 2026-04-16

## Woran wird aktuell gearbeitet?

### ✅ Erledigt
- **Vanilla Core Bootstrap:** Tauri 2 + React 19 + Vite + PTY Terminal + Monaco Editor
- **Hermes Agent Integration:** Chat Interface + Session Persistence + ACP/stdio Bridging
- **Workflow Engine v1:** React Flow Canvas, Smart Gate System, Topological Execution, EventBus
- **Multi-Lens Audit + Ramsay Hotfix:** 16 Findings → 14 Fixed, 2 Retracted
- **Reactive Execution Feedback:** `useWorkflowExecution` Hook, Node Status Rings, Run/Resume Controls
- **OS Keychain:** API Keys über `keyring-rs` statt localStorage
- **Inline Edit Overlay:** Cursor-like Mark & Prompt mit Diff Preview
- **Paperclip Purge:** Alle Legacy-Dependencies entfernt
- **Deep Research / Ground of Truth:** Exhaustive Codebase-Analyse (50+ Files, 7 Stores, 6 Services, 17 Views, 15 Skills, 16 Personas, Security Assessment)

### 🔄 In Progress
- **Marketing Pipeline Design:** Entscheidung wie native Autarch Workflows + Supabase-based ARES Pipeline koexistieren

### 📋 Nächste Schritte
1. **Security Hardening:** Shell capabilities scopen (S-1), OTA Integrity Check implementieren (S-5)
2. **DRY Persona Map:** Persona-Definitionen zentralisieren (hermesBridge + config.yaml → Single Source)
3. Marketing Module als Vanilla Core Feature designen (Hermes-driven, nicht ARES-imported)
4. Hermes Kit OTA Update System SHA-256 Verification
5. Live Dashboard (Supabase Realtime für Content Pipeline Monitoring)

## Security Findings (aus Deep Research)
| # | Finding | Severity |
|---|---------|----------|
| S-1 | Shell capabilities zu permissiv | 🔴 HIGH |
| S-2 | Persona prompts doppelt definiert | 🟡 MEDIUM |
| S-3 | curl \| bash Installer ohne Checksum | 🟡 MEDIUM |
| S-5 | OTA Kit Update ohne SHA-256 | 🟡 MEDIUM |

## Kontext aus letzten Sessions
- **2026-04-16 Deep Research:** Exhaustive Ground of Truth erstellt. 50+ Source-Dateien, vollständige Architektur-Dokumentation, 7 Security Findings, 8 Invarianten.
- **2026-04-13 Session 1:** Antigravity Kit Init, Vanilla Core Bootstrap
- **2026-04-13 Session 2:** Workflow Engine Build (6 Phases) + 4-Lens Audit + Ramsay Hotfix + Reactive Feedback. Shipped: `49bda0b3`
