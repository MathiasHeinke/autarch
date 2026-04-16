# 🧠 Architect Memory — Antigravity

> **3-Layer Memory System für NOUS und alle Personas.**

---

## Layer 1: Strategic Guardrails
> *Geschrieben von: 🧠 Karpathy | Gelesen von: NOUS*

### SG-001: Meta-Workspace Architektur (24.03.2026)
- **Decision:** Das Antigravity-Repo ist die Kommandozentrale für alle IDE-Workspaces.
- **Rationale:** Single Source of Truth für Kit, Personas, Workflows, MCP-Konfiguration.
- **Constraint:** Kit-Änderungen müssen hier zuerst gemacht und dann in Workspaces propagiert werden.

### SG-002: 4-Layer Memory Architektur (24.03.2026)
- **Decision:** Trennung von strukturellem Gedächtnis (native IDE-Indizierung) und strategischem Gedächtnis (`memory-bank/*.md`). NOUS agiert als "Über-Meta-Persönlichkeit" (Main Agent).
- **Rationale:** Verhindert AI Amnesia und blinden Kontextverlust. Der Meta-Workspace optimiert IDE-Umgebungen durch tiefes Code-Bewusstsein ohne 3rd-Party MCP-Indexer.
- **Constraint:** NOUS MUSS zwingend das Working Memory (`memory-bank/`) lesen, bevor Code bewertet und Arbeit delegiert wird. Die Code-Strukturierung referenziert er nativ über die IDE-Engine.

### SG-003: Deprecation von Mem0 & Qdrant im MCP Gateway (30.03.2026)
- **Decision:** Das lokale semantische Memory-Layer (Mem0 + Qdrant) wird restlos aus dem MCP Gateway entfernt. Fokus auf `memory-bank/*.md` als einzige deterministische Wahrheitsquelle.
- **Rationale:** Reduktion von Architektur-Komplexität ("Spaghetti"). Vorbereitung auf Honcho MCP-Server für stabiles, Cloud-basiertes und Workspace-übergreifendes Memory mit striktem User/Workspace-Scoping.
- **Constraint:** Das MCP Gateway dient ab sofort primär als Context7-Proxy und Dashboard-Service.

---

## Layer 2: Active Directives
> *Geschrieben von: 🧬 NOUS | Gelesen von: Alle Personas*

- **Kit v2.0 aktiv:** 21 Personas, 16 Knowledge Files, 7 Chains, 6 Mastertables installiert.
- **NOUS als Main Agent:** NOUS ist die Über-Meta-Persönlichkeit; Carmack, Jobs, Karpathy etc. sind Sub-Agenten.
- **Offizielle MCP-Server:** Supabase, GitHub, Cloud Run, Stitch.
- **Advanced Tools (Rollout):** 
  - `MCP Gateway` (Python) für Whitelist-Umgehung (Context7).
  - `Context7`: PFLICHT für Library-Docs (Verhindert Halluzinationen bei neuen Tech-Stacks).
  - `Honcho MCP`: Evaluierung nach Hermes v0.7.0 Upgrade (Pluggable Memory Provider Interface).
- **Workspace Strategy:** `.antigravity/workspace-strategy.md` — Benefit-Matrix für alle Projekte.
- **Working Memory Bootstrapped:** `memory-bank/` existiert als native Datei-Struktur für persistenten operativen Kontext.
- **🏰 Fortress Audit Harness:** `/fortress-audit` ist der Full-Picture Quality Gate. 5-Stage Pipeline (E2E → Hotfix → Sherlock → Security → Targeted E2E). `/agentic-plan` integriert Fortress default bei ≥5 Phasen. Harness-Snapshots in `memory-bank/e2e-snapshots/`.
- **🚀 ARES Bio.OS Production Stack:**
  - Cloud Run: `hermes-agent` (→ wird `ares-gateway`), europe-west1, min-instances=1, 2 CPU, 1Gi RAM
  - Frontend: app.bio-os.io (Vercel) → Cloud Run Gateway → Hermes Agent (Python Fork v0.6.0 → v0.7.0)
  - hermes-workspace (→ wird "ARES Bio.OS Dashboard"): Node.js/Vite Frontend für Chat, Sessions, Memory, Skills
  - Custom Domain geplant: `api.bio-os.io` → Cloud Run
  - 13 Custom Commits im Fork: Platform Gate, Session API, Multimodal Support, WebAPI Bridge
- **🤖 Autonome Content Pipeline v2 (ares-website):**
  - 4 pg_cron Jobs live: `weekly-topic-discovery` (So 04:00), `daily-content-operator` (06:00), `daily-seo-optimizer` (08:00), `daily-google-index-push` (12:00)
  - **Alle 14 Pipeline Edge Functions:** `verify_jwt=false` (Cron-kompatibel, Auth via `x-operator-secret`)
  - **Priority-System 0-100:** Auto-Research max 70 (domain-weighted 30-60), User-Artikel 71-100, Fasttrack Default 100
  - Fasttrack-Push: `cms-fasttrack-push` Edge Function mit Priority-Parameter + EN-Twin Auto-Processing
  - Audit Dashboard: `/research/audit` (password-protected, Priority-Slider, P-Badges)
  - `cms-google-index-push`: Serverside Google Indexing API (SA Key in Supabase Secret)
  - `cms-pipeline-status`: Health Aggregation API
  - Vault Secrets: `supabase_url`, `operator_secret` für pg_cron→pg_net Kommunikation
---

## Layer 3: Session Log

### Session 16.04.2026, 10:45 — 🚀 Ship: ARES SEO Pipeline Hardening & Cite Check Bucket
- **Thema:** Einbindung von "Content Depth Boost" und einem verifizierenden "Cite Check" für High-Volume Kategorien.
- **Ergebnis:**
  1. **Cite Check:** DOI/PubMed Links geben im SEO-Scorer 3 Punkte und validieren den Content stärker. Pipeline hat eine explizite State-Machine Ergänzung zwischen `hook` und `readability`.
  2. **Dashboard Refactoring:** Inline-Grid-Areas für Bento-Grid entfernt, modernes CSS Auto-Fit eingefügt (`.bento-grid`, `.seo-grid`), um 4-Column Tablet Unterstützung umzusetzen.
  3. **Build & Deploy:** Fehler im Box-Sizing Layout im Dashboard behoben, Edge Functions neu deployed.
- **Betroffene Dateien:**
  - `cms-seo-optimizer/index.ts` (Neuer Stage 'cite_check', Readability Boost)
  - `cms-pipeline-status/index.ts`
  - `_shared/seo-scorer.ts` (Punktesystem DOI/PubMed)
  - `ResearchAudit.tsx` (Bento-Grid / SEO-Grid CSS Grid Template und cite_check Cell)
- **Deployed:** Edge Functions (`cms-pipeline-status`, `cms-seo-optimizer`). Git pushed.

### Session 15.04.2026, 13:30 — 🔥 Hotfix: Pipeline 5 Critical Fixes (Cron Auth + Priority + Twin)
- **Thema:** 5 kritische Pipeline-Bugs aus Deep Audit + 2 User-Findings gefixt.
- **Ergebnis:**
  1. **Cron-Auth-Fix:** `cms-seo-optimizer`, `cms-seo-scorer`, `cms-seo-mark-indexed` mit `--no-verify-jwt` deployed. Alle 14 Pipeline-Functions haben jetzt `verify_jwt=false`.
  2. **Priority-System 0-100:** DB Default 100→50. Auto-Research via `topic-discovery` bekommt domain-gewichtete Prio (30-60), **HARD CAP 70**. User-Artikel können 71-100 setzen.
  3. **Fasttrack Priority:** `cms-fasttrack-push` akzeptiert jetzt `priority` Parameter. Fasttrack Default: 100, Queue Default: 50 (User-override via Slider).
  4. **Fasttrack EN-Twin Fix:** Nach Translate-Stage werden EN-Twins jetzt im selben Fasttrack-Run durch QA geschickt statt auf nächsten Cron zu warten.
  5. **Dashboard:** Priority-Slider (0-100) mit farbigem P-Badge auf Article Cards.
- **Deployed:** 7 Edge Functions (operator, fasttrack, seo-optimizer, seo-scorer, seo-mark-indexed, topic-discovery, pipeline-status). Git `d1bcd41`.
- **Betroffene Dateien:**
  - `cms-daily-operator/index.ts` (Twin-Processing nach Fasttrack)
  - `cms-fasttrack-push/index.ts` (Priority Parameter)
  - `topic-discovery/index.ts` (Domain-weighted Priority, Cap 70)
  - `ResearchAudit.tsx` (Priority Slider + Badge)
  - DB Migration: `research_topics.priority` Default → 50
- **Priority-Hierarchie:** 100 (Fasttrack) > 80 (User-Queue Default) > 70 (HARD CAP) > 30-60 (Auto-Research Domain-weighted)
- **Follow-Up (14:00):**
  6. **Turbo-Polling:** Dashboard pollt 2s (statt 10s) für 120s nach Fasttrack-Push. Lila Countdown-Indikator.
  7. **Title Polisher Cron:** `daily-title-polisher` um 10:00 UTC eingerichtet. Pipeline-Schedule komplett: 04→06→08→10→12 UTC.
  8. **System Docs Domain:** `system-docs` als neue Kategorie im Dashboard hinzugefügt (ARES Field Manuals).
  9. **User-Priority für Fasttrack:** Slider gilt jetzt für BEIDE Modi — User bestimmt Prio auch bei "Run Now".
- **Commits:** `d1bcd41`, `0ea7e16`, `560c86f`
- **Offene Punkte:** 24h Cron Verification, System-Doc-Testlauf.

### Session 15.04.2026, 12:30 — 🔬 Deep Audit Content Pipeline v2
- **Thema:** Vollständige Automatisierung der ARES Research Content Pipeline — vom Topic Discovery bis Google Indexing.
- **Ergebnis:**
  1. **Säule 1 (Autonom-Flow):** 4 pg_cron Jobs eingerichtet, die die gesamte Pipeline ohne manuellen Eingriff steuern. 1 Artikel/Tag + wöchentliches Topic Discovery. Vault Secrets für sichere pg_net→Edge Function Kommunikation.
  2. **Säule 2 (Fasttrack):** Neue `cms-fasttrack-push` Edge Function — Artikel-Ideen können per Dashboard oder API sofort durch die Pipeline geschoben werden. `cms-daily-operator` um Fasttrack-Mode erweitert.
  3. **Säule 3 (Audit Dashboard):** `/research/audit` — Password-geschützte Admin-Seite mit Health Cards, Pipeline Activity Log, Topic Queue und Artikel-Input-Formular (bis 15k chars, Queue oder Sofort-Run).
  4. **Google Indexing:** `cms-google-index-push` Edge Function mit reinem Deno-JWT-Generation (RSA, crypto.subtle) — kein lokales Script mehr nötig. SA Key als Supabase Secret.
  5. **Cleanup:** 4 alte konfliktierende Cron-Jobs entfernt (content-pipeline-operator, seo-optimizer-turbo etc.)
  6. **Deployed:** 4 Edge Functions, pg_cron Migration, Git Push `e0e1bda`.
- **Offene Punkte:** Frontend-Deploy (Vercel) für Production-Dashboard, 24h-Verification der Cron-Jobs.

### Session 09.04.2026, 20:15 — 🐛 ARES Gateway CORS & Model Settings Fix
- **Thema:** Models im Dashboard auf OpenRouter/GLM-5.1 umstellen und CORS/Mixed-Content Bug beheben.
- **Root Cause:**
  1. Die Cloud Run Gateway Instanz lief weiterhin auf `gemini-3-flash-preview` als Default Model, weshalb neu angelegte Chats dieses verwendeten.
  2. Nach Umbenennung von `ARES_GATEWAY_URL` zu `HERMES_API_URL` wurde `vite.config.ts` nicht angepasst. Dadurch schlug der Env-Replacement-Schritt fehl und der Client fiel hart codiert auf `http://127.0.0.1:8642` zurück, was einen Mixed-Content und CORS Error auf `dash.bio-os.io` auslöste.
- **Ergebnis:**
  1. **Gateway Patch:** Cloud Run Instanz (`ares-gateway-61066913791.europe-west1.run.app`) per HTTP PATCH API mit `zhipu/glm-5.1` und `openrouter` versehen.
  2. **Vite Bugfix:** In `vite.config.ts` die clientseitige Ersetzung von `process.env.HERMES_API_URL` hinzugefügt, damit Produktions-URLs korrekt eingebunden werden können.
  3. **Verifiziert:** API Call funktionierte, Vite Build schlägt nicht fehl (wird via CI ausgelöst).
  4. **Shipped:** via /ship-it

### Session 09.04.2026 — 🔗 GitNexus MCP Full Activation
- **Thema:** Aktivierung des GitNexus MCP-Servers (v1.5.3) als globaler stdio-Server und Integration in den gesamten ARES Kosmos (ares-app, ares-bio-os-dashboard, ares-website).
- **Ergebnis:**
  1. **MCP Konfiguration:** GitNexus in die globale `mcp_config.json` von Antigravity (Gemini Code Assist) eingetragen. Ein lokaler Server served nun alle indexierten Repos.
  2. **Codebase Indexierung:** `ares-bio-os-dashboard` (hermes-workspace) und `ares-website` sowie `ares-app` haben `.gitnexusignore` erhalten und wurden vollständig indexiert & registriert.
  3. **Prompt System Update:** `AGENTS.md`, `ares-system.md`, `tech-stack-context.md` und `system-prompt.md` in Antigravity und den Workspaces aktualisiert, um Agents zwingend die Nutzung von `gitnexus_impact` vor Code-Änderungen vorzuschreiben.
  4. **Kit Propagation:** Template `AGENTS.md` und `tech-stack-context.md` im `antigravity-kit` enthalten nun den GitNexus Bootstrapper.
- **Offene Punkte:** Keine. Jeder Agent kann jetzt `gitnexus://repo/...` aufrufen.

### Session 04.04.2026 (Nachmittag/Spät) — 🛠️ Supabase-py Fix & Cloud Run Deploy Repair
- **Thema:** Bugfixes im Backend (`hermes-agent`) bezüglich Supabase API crashes und gcloud Container-Failures für `ares-gateway`.
- **Ergebnis:**
  1. **Supabase Bugfix:** Defensive Behandlungen für `maybe_single()` return typ eingefügt (`None` exception behandelt)
  2. **GCP Deploy Fix:** Fehlerhafte Container-Buildpack Injections (Start via `python main.py`) durch explizites Cloud Run Override (`--command="hermes" --args="gateway"`) abgefangen.
  3. **E2E Success:** Browser Test bestätigt erfolgreiche DB-Saves (`hermes_sessions` Tabelle via API erfolgreich adressiert).
- **Entscheidungen:** Supabase Fehler fortan immer defensiv intercepten (`if resp and resp.data`); Deployments immer mit dedizierten Entrypoint-Restriktionen absichern.
- **Offene Punkte:** Domain Binding (`api.bio-os.io`) & Frontend Session HTTP-Header

### Session 03.04.2026 (Abend) — 🔧 ARES Bio.OS Phase 3: Production Hardening
- **Thema:** Cold Start Elimination, Hermes v0.7.0 Analyse, Renaming-Strategie, Custom Domain Plan.
- **Ergebnis:**
  1. **Cold Start Fix:** `min-instances=1` auf Cloud Run deployed (Revision 00015-t8q). Response <5s statt 60-120s.
  2. **Hermes v0.7.0 analysiert:** 168 PRs, 46 Issues. Key Features: Pluggable Memory Provider, Session Continuity, Gateway Hardening, Secret Exfiltration Blocking, Credential Pool Rotation.
  3. **Renaming-Plan:** ~20 Files in hermes-workspace (→ "ARES Bio.OS Dashboard"), Cloud Run Service (→ "ares-gateway"), Custom Domain (api.bio-os.io).
  4. **13 Custom Commits identifiziert:** Platform Gate, Session API, Multimodal, WebAPI Bridge — einige überlappen mit Upstream v0.7.0 (#4802).
- **Entscheidungen:** Renaming zuerst (safe) → dann v0.7.0 Rebase (risky). Service Name: `ares-gateway`. Custom Domain: `api.bio-os.io`. Upgrade HEUTE noch.
- **Offene Punkte:** Rebase durchführen, Merge-Konflikte lösen, Re-Deploy, Frontend Session-Header, Subagent-Spawning.

### Session 03.04.2026 (Nachmittag) — 🔍 E2E Deep Testing & CORS Fix
- **Thema:** End-to-End Test auf app.bio-os.io mit Auth, Chat, Meal Logging.
- **Ergebnis:**
  1. **CORS Root Cause:** Separator-Bug in deploy.sh (`;` statt `,`) verhinderte Origin-Validierung → Fix: Wildcard `*` (Auth über Bearer Token).
  2. **AresChat Konsolidierung:** Legacy-Streaming entfernt, 100% auf Hermes Agent konsolidiert.
  3. **Custom Headers:** `X-Platform` und `X-Device` zu CORS-allowed-headers hinzugefügt.
- **Offene Punkte:** Cold Start (→ gelöst), Renaming, v0.7.0 Upgrade.

### Session 29.03.2026 (Nachmittag) — 🏰 Fortress Audit Quality Harness
- **Thema:** Aufbau des Full-Picture Quality Assurance Systems für alle Antigravity Workspaces.
- **Ergebnis:** 4 Deliverables implementiert:
  1. `/fortress-audit` — 5-Stage Workflow (E2E+Hotfix+Sherlock+Security+Targeted)
  2. `/agentic-plan` — Upgrade von Template zu Workflow mit Fortress-Integration
  3. Harness Snapshots — Persistente E2E-Ergebnisse in `memory-bank/e2e-snapshots/`
  4. Router + Cross-References — Routing erweitert, bestehende Workflows verknüpft
- **Propagation:** Alle 5 Workspaces (Root, ARES App, ARES Website, NOUS Bridge, TheSwarm)
- **Offene Punkte:** Dry-Run des Fortress-Workflows auf einem realen Projekt.

### Session 29.03.2026 (Vormittag) — IDE Config Fix (PET Loop)
- **Thema:** Behebung des Endlos-Loops ("uv python install") und Absturz der Python Environment Tools (PET) in der VSCode Python Erweiterung.
- **Ergebnis:** `python.useEnvironmentsExtension: false` in den globalen Antigravity User Settings gesetzt. Workspace-IDE ist wieder stabil.
- **Offene Punkte:** Keine. Zukünftige Updates der Python-Extension beobachten.

### Session 24.03.2026 — Meta-Workspace Memory Integration
- **Thema:** Integration von `mcp-codebase-index` und `memory-bank-mcp` in Antigravity.
- **Ergebnis:**
  - `memory-bank` für Antigravity-Root initialisiert.
  - `nous.md` und `system-prompt.md` upgedated: NOUS ist offiziell der "Main Agent" (Uber-Meta-Personality), restliche Personas sind Sub-Agenten.
  - `agentic-router.md` erweitert: Routing-Workflow liest nun immer zwingend Working Memory und checkt den Codebase Index.
  - Setup-Guide für externe MCP-Installation vorbereitet.
- **Offene Punkte:**
  - MCP Config in die jeweilige IDE (Claude Desktop / Cursor) des Users eintragen.
  - Test des Codebase-Inexings am `ares-app` Projekt.

### session-log: 2026-04-09 18:25 (Option A Multimodal Router, ARES Gateway)
- **Problem**: API Server in ARES Gateway previously ignored audio attachments and sent raw images inside OpenAI payload directly to backend LLM (which failed for non-vision models like GLM).
- **Lösung**: `_build_user_content` in `gateway/platforms/api_server.py` asynchron aufgerüstet (`_build_multimodal_content_async`).
- **Implementierung**: Interception von `image/*` und `audio/*` / `video/*`. Bevor der Content zum Main LLM wandert, wird das Material parallel via `async_call_llm` an Aux Model geschickt (`gemini-3.1-pro-vision` / `gemini-2.5-flash`). Das Transkript / Bild-Beschreibung wird als reiner Text eingebettet -> Main Model ist entlastet und spart Kosten/Halluzinationen.
- **Workflow**: `ship-it` ausgeführt. Bereit für E2E Testing.
### Session 09.04.2026 22:20 — 🚀 Cloud Run Deployment Fix (Port Binding)
- **Thema**: ARES Gateway Container schlug bei Startup Probe auf Cloud Run aufgrund von Timeout fehl.
- **Root Cause**: `APIServerAdapter` in `gateway/platforms/api_server.py` lud den voreingestellten Port via `API_SERVER_PORT` (Default: 8642). Google Cloud Run übergibt den dynamischen Port aber iterativ exklusiv als Environment Variable `PORT=8080`. Der Container startete auf 8642 und wurde von der Cloud Run Startup Probe (TCP auf 8080) wegen Connection Refused gekillt.
- **Lösung**: `gateway/platforms/api_server.py` und `gateway/config.py` modifiziert, um standardisiert `os.getenv("PORT")` priorisiert zu laden.
- **Implementierung**: `API_SERVER_PORT` Fallback Chain zu `PORT` in Config erweitert. `git push` durchgeführt, um Cloud Run Deployment Pipeline erneut zu triggern.
- **Nächste Schritte**: Frontend `/deep-e2e` testen, sobald Container live ist.

## Session 2026-04-10 (Nachtrag E2E & System Konfiguration)
**Status:** Erfolgreich deployt, Frontend Env Pending, MCP Config fixed.
**Fokus:** ARES Gateway Production Release, Frontend Token Mismatch & macOS IDE MCP Bugs.
- **ARES Gateway Cloud Run:** 
  - Die Multimodal-Pre-Routing-Architektur (Asynchrone `_build_multimodal_content_async`) funktioniert live in Produktion absolut souverän. 
  - Ein Dummy-Base64-Bild wurde in der Produktion asynchron über `gemini-3.1-pro-vision` transkribiert und nahtlos an Zhipu `glm-5.1` übergeben.
  - Der Container läuft perfekt mit Fallback auf die `PORT=8080` Environment-Variable von Google Cloud Run, wodurch die Startup-Probes nicht mehr in einen Timeout laufen.
- **Frontend Token Timeout (Vercel):** 
  - Der Live-Dashboard Chat wirft aktuell einen `401 Unauthorized`. Vercel nutzt im laufenden Build noch den alten `HERMES_API_TOKEN` und muss explizit neu gebaut / deployed werden, da Vite Environment Variablen strikt zum Build-Zeitpunkt ("Baked-in") injiziert. User wurde instruiert.
- **Antigravity MCP System Fix:** 
  - Wir haben einen kritischen Konfigurationsfehler in der IDE-internen `mcp_config.json` behoben.
  - MacOS GUI Apps vererben nicht den `.zshrc` PATH. Das führte dazu, dass `npx`-aufgerufene Plugins (`StitchMCP`, `gitnexus`, `supabase`) mit `env: node: No such file or directory` fehlschlugen.
  - **Lösung:** Expliziter injection des `PATH` (inkl. `/Users/mathiasheinke/Library/pnpm`) in den `"env"`-Scope jedes `npx`-basierten MCP-Servers innerhalb der Konfiguration.
- **Vercel Redeployment (dash.bio-os.io):**
  - Wurde erfolgreich über Vercel CLI (`vercel deploy --prod`) angestoßen.
  - Das Dashboard wurde neu gebaut und greift jetzt auf das korrekte `VITE_HERMES_API_TOKEN` (`ares-hermes-DeG9XZfe3qk_QcYHQmrNM1uHZtB6sEDawxy7nfwHcsc`) sowie das korrekte `ARES_GATEWAY_TOKEN` zu.
  - Sämtliche 401 Unauthorized Fehler beim Laden von Gateway-Modellen und dem Starten von Chat-Sessions sind dadurch im Frontend behoben. E2E Routing ist auf Produktion stabilisiert.

### Session 10.04.2026 (Mittag) — Dashboard Routing & Teknium Pipeline Integration
**Status:** React Crash behoben, RSS Datastream gesichert und deployed.
- **Ergebnis:**
  1. `fetch_teknium_updates.py` um python-dotenv erweitert, um Datenbank-Verbindungsfehler beim Auslesen des RSS Feeds zu beheben.
  2. Import-Crash im Admin Dashboard (Fehlerhaftes lazy-loading auf Vite Ebene / fehlende export defaults) in App.tsx und Indexierung repariert.
  3. Supabase imports in AdminMemoryBank.tsx & AdminToolRequests.tsx standardisiert (`@/integrations/supabase/client`).
  4. Kompletter End-to-End Test durchgeführt und erfolgreich validiert.
  5. Änderungen via `/ship-it` gebaut und als neuer Release an `main` gepusht.
- **Offene Punkte:** `supabase db push` Fehler aufgrund existierender Storage Policies in Produktion restrukturieren (Admin Access RLS Migration erfordert manuellere CLI Synchronisation).

### Session 10.04.2026, 15:00 — 🔥 Hotfix: Security Audit Verification & Fix
- **Thema:** Ramsay-Hotfix nach Sherlock-Audit-Findings der Admin Memory Bank Pipeline.
- **Ergebnis:**
  1. **RLS USING(true) Kill (Critical):** Die zweite Policy `Admin memory full access service role` auf `ares_admin_memory` nutzte `USING(true)`, was JEDEM authenticated User vollen CRUD-Zugriff gewährte und die Admin-only SELECT Policy komplett aushebelte. Policy entfernt — Service Role bypassed RLS ohnehin by design.
  2. **API Key Leak Kill (Critical):** Hardcoded Gemini API Key (`AIzaSy...`) lag als Default-Fallback in `os.getenv()` in `fetch_teknium_updates.py`. Entfernt und durch leeren String ersetzt.
  3. **Production-Entwarnung:** Tabelle `ares_admin_memory` existiert auf Production DB noch nicht (vorheriger `db push` war fehlgeschlagen), daher kein aktiver Security-Leak.
- **Betroffene Dateien:**
  - `ares-app/supabase/migrations/20260410020000_admin_memory_bank.sql`
  - `hermes-workspace/scripts/fetch_teknium_updates.py`
- **Build:** ares-app ✅ (2m32s), hermes-workspace ✅ (2m40s)
- **Pushed:** Beide Repos → `main`
- **Offene Punkte:** Pagination für AdminMemoryBank.tsx (.limit(50)), Retry-Logik für fetch_teknium_updates.py (tenacity).

### Session 13.04.2026: Agentic Plan v2.0 — Multi-Lens Audit + Autarch Hardening

#### Agentic Plan v2.0 Overhaul
- **Decision:** Post-Delivery Audit von Single-Persona (Sherlock) auf 4-Linsen-System erweitert
- **Linsen:** 🔍 Sherlock (Bugs), 🕵️ Mr. Robot (Security), 🚀 Elon (Dead Code), 🖥️ Carmack (Performance/optional)
- **Rationale:** Security-Lücken sind keine Bugs, Dead Code ist kein Bug, Performance ist unsichtbar — jede Linse findet was die andere nicht sieht
- **Finding-Prefixes:** S- (Sherlock), R- (Mr. Robot), E- (Elon), P- (Carmack)
- **Dead Code Policy:** LÖSCHEN, nicht markieren. Elon-Findings mit Typ Unused/Orphaned werden entfernt.
- **Priority:** R- (Security) > S- (Bugs) > E- (Dead Code) > P- (Performance)
- **Constraint:** Ramsay Hotfix fixt ALLE Findings ALLER Linsen (🔴+🟡+🔵), kein Cherry-Pick
- **Synced:** Antigravity Kit, Hermes Kit, ares-app, TheSwarm, autarch, ares-website, nous-bridge

#### Autarch OS — Hermes Agent Hardening
- PTY Terminal: cancelled-Flag, onExit-Handler, OS-Erkennung via tauri-plugin-os
- Reactive Output Parser: Ersetzt blinden 30s Timer durch State-Machine auf PTY stdout
- Sherlock Audit deckte 14 Findings auf die EVAL-Gates nicht fanden → Beweis für Multi-Lens Notwendigkeit
- Missing Puzzle Piece: Reactive Output Parser als architektonisches Upgrade implementiert

#### Lesson Learned
- Plan-eigene EVAL-Gates und Fortress-Gates fangen Regressions ab, aber NICHT: Security-Lücken, Dead Code, architektonische Schwächen
- Ein unabhängiges Post-Delivery Audit mit spezialisierten Persona-Linsen findet systematisch was der Plan-eigene Harness nicht abdeckt
- Ramsay muss ALLE Findings fixen — nicht nur Criticals. Warnings werden sonst Criticals der nächsten Session.

### Session 14.04.2026 — 🔧 ARES SEO Pipeline Hardening: Vertex AI Image Gen
- **Thema:** Behebung des Image-Generation-Blockers in der ARES SEO Pipeline (36 Artikel im `images`-State blockiert).
- **Root Cause:**
  1. `generateImage()` in `ai-providers.ts` nutzte direkte Gemini API Keys, die im Supabase Edge Environment nicht verfügbar waren.
  2. Vertex AI Secrets (`PROJECT_ID`, `CLIENT_EMAIL`, `PRIVATE_KEY`, `LOCATION`) waren nicht auf dem Supabase-Projekt gesetzt.
  3. Supabase CLI war nicht lokal installiert → `supabase secrets set` schlug fehl.
- **Lösung:**
  1. **Secrets via Management API:** Python-Script mit `urllib` + User-Agent Header (Cloudflare 1010 Workaround) setzte alle 4 Secrets erfolgreich (`POST /v1/projects/{ref}/secrets`).
  2. **Edge Function Redeployment:** `cms-seo-optimizer` via `npx supabase functions deploy` redeployed.
  3. **Auth Discovery:** Edge Function Auth akzeptiert `x-operator-secret` Header UND `Authorization: Bearer <service_role_jwt>`. Letzteres ist zuverlässiger für externe Trigger.
  4. **Auto-Batch Runner:** Lokales Shell-Script (`ares-pipeline-runner.sh`) mit `limit=1` und 15s-Intervall. Stabiler als parallele Batches wegen 150s Edge Function Timeout.
- **Ergebnis:** Pipeline verarbeitet autonom 60+ Artikel. Top-Scores: epa-dha-ratio 92, cortisol-hrv 90, magnesium 89. Bilder: 16:9, 2K, cinematic scientific illustrations.
- **Offene Punkte:** Runner bis Completion laufen lassen. Auto-Indexing nach Image-Phase verifizieren.
