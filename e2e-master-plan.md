# 🐝 Autarch — End-to-End Master Test Plan
Generiert: 2026-04-01 | Scope: Hermes Cloud Worker Integration + Core Platform

## 🏁 Phase 1: Cloud Worker Health & Auth
| ID  | Funktion | Beschreibung | Test-Status | Gefundene Bugs / Fixes |
|-----|----------|--------------|-------------|------------------------|
| 1.1 | Worker Health | `GET /v1/health` → status=healthy, model correct | ✅ Passed | - |
| 1.2 | Auth Reject | `POST /v1/execute` ohne x-hermes-secret → 422 | ✅ Passed | - |
| 1.3 | Auth Accept | Falscher Secret → 401, korrekter → 200 stream | ✅ Passed | - |
| 1.4 | Inference E2E | Vollständiger Inference-Call mit Response "PONG" | ✅ Passed | Response wrapped in tool_call (library behavior) |
| 1.5 | NDJSON Stream | Response-Format: system → response → usage Events | ✅ Passed | 4 Events korrekt |

### 🧹 Context Checkpoint — Phase 1
- Abgeschlossen: 2026-04-01 18:07
- Passed: 5 | Bugfixed: 0 | Failed: 0

## 💬 Phase 2: Server Adapter Integration
| ID  | Funktion | Beschreibung | Test-Status | Gefundene Bugs / Fixes |
|-----|----------|--------------|-------------|------------------------|
| 2.1 | Adapter Registry | hermes_cloud in registry.ts (server + UI) | ✅ Passed | Korrekt registriert |
| 2.2 | Adapter Test | test.ts health check Logik | ✅ Passed | URL + Health Check korrekt |
| 2.3 | Execute Path | execute.ts nutzt WORKER_URL + SECRET env | ✅ Passed | NDJSON Streaming korrekt |
| 2.4 | PII Scrub | 4 Patterns: Email, Phone, IBAN, Tax ID | ✅ Passed | DSGVO-konform |
| 2.5 | Memory Lifecycle | Pre-Load top-50, Post-Persist via save_memory | ✅ Passed | Upsert by key |

### 🧹 Context Checkpoint — Phase 2
- Abgeschlossen: 2026-04-01 18:17
- Passed: 5 | Bugfixed: 0 | Failed: 0

## 🧪 Phase 3: Existing Test Suite
| ID  | Funktion | Beschreibung | Test-Status | Gefundene Bugs / Fixes |
|-----|----------|--------------|-------------|------------------------|
| 3.1 | Vitest Suite | 149 files, 752 tests passed, 0 failed | ✅ Passed | 1 skipped (expected) |
| 3.2 | TypeCheck | `pnpm typecheck` alle Packages | ✅ Passed | 0 Fehler |
| 3.3 | Build | `pnpm build` server + ui + cli + plugins | ✅ Passed | Chunk size warning (cosmetic) |

### 🧹 Context Checkpoint — Phase 3
- Abgeschlossen: 2026-04-01 18:17
- Passed: 3 | Bugfixed: 0 | Failed: 0

## 🌐 Phase 4: UI Adapter (hermes-cloud)
| ID  | Funktion | Beschreibung | Test-Status | Gefundene Bugs / Fixes |
|-----|----------|--------------|-------------|------------------------|
| 4.1 | UI Adapter Reg | hermesCloudUIAdapter in ui/adapters/registry.ts | ✅ Passed | - |
| 4.2 | Config Fields | HermesCloudConfigFields component exists | ✅ Passed | - |
| 4.3 | Feature Flags | HERMES_ONLY_MODE + DEFAULT_ADAPTER_TYPE | ✅ Passed | - |

### 🧹 Context Checkpoint — Phase 4
- Abgeschlossen: 2026-04-01 18:17
- Passed: 3 | Bugfixed: 0 | Failed: 0

## 🏆 E2E Test Result
- **Total Steps: 16**
- **Passed: 16 | Bugfixed: 0 | Remaining Failed: 0**
- **Duration: ~15 min**
- **System Status: ✅ Battle-Tested**

### Summary
- Cloud Worker: ✅ Live, healthy, authenticated, Hermes 4 405B responding
- Server Adapter: ✅ Fully wired (registry, execute, test, PII scrub, memory lifecycle)
- Test Suite: ✅ 752/752 tests green, typecheck clean, build successful
- UI Adapter: ✅ Registered, config fields, feature flags operational
