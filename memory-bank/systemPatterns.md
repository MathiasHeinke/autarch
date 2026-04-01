# System Patterns: Paperclip (Autarch)

> Letztes Update: 2026-04-01 (Post-Refactoring)

## 1. Company-Scoped Data Models
Jegliche Logik, Datenbanktabelle und Route muss zwingend `company_id`-basiert sein. Datenvermerke von verschiedenen Tenants (Agenten-Companies) MÜSSEN zu 100% isoliert sein. Cross-Company Abfragen auf Agenten-Ebene sind strengstens blockiert.

**RLS Pattern (Supabase):**
```sql
USING (company_id IN (
  SELECT company_id FROM company_memberships 
  WHERE principal_id = auth.uid()::text
))
```

## 2. Der Handoff-Vertrag (API & Schema)
Änderungen am Datenschema ziehen Modifikationen am gesamten Stack nach sich:
1. `packages/db/src/schema/*.ts` 
2. `packages/db/src/schema/index.ts` (Export)
3. `pnpm db:generate`
4. `packages/shared` Typen / Zod Validatoren
5. `server` Controller / Services
6. `ui` Views / Mutatoren

## 3. Identitäts-Management (Auth)
- `/api` Namespace für Server-Calls.
- **Operator-Modus (Board Access):** Vollzugriff, Company-Selection-Kontext.
- **Maschinen-Modus (Agent Access):** Bearer API-Keys (`agent_api_keys`), gehashed at rest. Kein Cross-Company-Zugriff.

## 4. Stateless Inference Engine (Hermes on Cloud Run)
- Worker-Container sind **100% stateless** — keine lokale DB, kein Dateisystem-Gedächtnis.
- Hermes läuft im **Python Library Mode** mit `skip_memory=True`, `skip_context_files=True`, `persist_session=False`.
- Gateway-Auth via `X-Hermes-Secret` Header (Shared Secret).
- Cloud Run Scale-to-Zero für Kosteneffizienz (min_instances: 0).
- **Details:** → `docs/wiki/cloud-run-supabase-architecture.md`

## 5. Externalized Brain (Memory Lifecycle)
Agent-Gedächtnis wird im Control Plane gespeichert, nicht im Worker:

```
PRE-LOAD (heartbeat.ts):
  DB → loadAgentMemories() → context.hermesMemorySnapshot
  Honcho → queryAgentInsights() → context.hermesHonchoInsight (5s timeout)
    ↓
EXECUTE (execute.ts → worker):
  memorySnapshot + skillsIndex + honchoInsight → system_prompt
    ↓
POST-PERSIST (heartbeat.ts):
  NDJSON parse → persistNewMemories() → DB
  Messages extract → ingestRunConversation() → Honcho (fire-and-forget)
```

**Tabelle:** `agent_memory` (company-scoped, importance-indexed)
**Felder:** `key`, `content`, `category` (memory|skill|conversation), `importance` (0-100)

## 6. Honcho Cross-Session Reasoning
- Self-hosted Honcho Server (Docker) für Daten-Souveränität.
- Workspace per Company (Multi-Tenant), Peer per Agent.
- **Non-fatal:** Agent-Execution blockiert NIE auf Honcho-Verfügbarkeit.
- **Details:** → `docs/wiki/honcho-self-host.md`

## 7. Task Lifecycle (Issue Pipeline)
```
backlog → todo → in_progress → in_review → done
                                    ↕
                                 blocked / cancelled
```
1. **Create:** User (Dashboard) → INSERT issue (status=backlog)
2. **Assign:** Orchestrator oder User → UPDATE status=todo, agent_id=...
3. **Pickup:** Paperclip Heartbeat → Agent wacht auf, status=in_progress
4. **Execute:** Hermes Worker → LLM + Tools + Skills
5. **Submit:** Worker → UPDATE status=in_review, result=JSON
6. **Review:** User → Approve (done) / Reject (todo)

## 8. Multi-Agent Orchestrierung
- **Adapter System:** Jeder Agent-Typ hat einen Adapter (hermes_cloud, claude-local, codex-local, process).
- **Heartbeat:** 5-Minuten-Intervall Cron, konfigurierbar pro Agent.
- **maxConcurrentRuns: 1** pro Agent — kein Self-Racing.
- **Roundtable:** Multi-Agent Advisory Board mit Parallel LLM Calls (bis zu 7 Agents).
- **Details:** → `docs/wiki/roundtable.md`

## 9. Enterprise Feature Flags
- `HERMES_ONLY_MODE` (via `VITE_HERMES_ONLY_MODE`) — Enterprise UI für Autarch.OS.
- Wenn aktiv: Adapter-Picker wird übersprungen, `hermes_cloud` ist Default.
- **Datei:** `ui/src/lib/featureFlags.ts`

## 10. Circuit Breaker (LLM Calls)
```
Attempt 1: hermes-4-405b (Primary)
  ↓ Fail?
Attempt 2: hermes-4-405b (Retry)
  ↓ Fail?
Attempt 3: hermes-4-70b (Fallback) → sentiment: 'degraded'
  ↓ Fail?
Graceful Error Message → UI shows "Antwort nicht verfügbar"
```

## 11. Fortress Audit Pipeline
Jede Phase MUSS alle 5 Fortress-Stages bestehen:
1. **Build:** `pnpm -r typecheck` — zero errors
2. **Sherlock:** Datei-Existenz, Funktions-Count, Integration Points
3. **Security:** Keine hardcoded Secrets, Company-Scoped Queries, PII-Scrubbing
4. **Regression:** Guard-Checks (`hermes_cloud` only), Non-fatal Error Handling
5. **E2E:** End-to-End Flow Validation

## 12. Glossar-Referenz
Begriffe wie "Agentur" (→ Company), "Aufgabe" (→ Issue), "Automatisierung" (→ Routine) etc. sind im Glossar definiert:
→ `memory-bank/paperclip-glossar.md`
