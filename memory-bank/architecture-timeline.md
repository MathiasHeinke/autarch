# 🕰 Architecture Timeline & Epochs — Deep Research v4

> Generiert: 2026-04-01 15:25
> Git-Scan: 1846 Commits, 7 Wochen, 2026-02-16 → 2026-03-31

## Kontributoren
| Autor | Commits | Anteil |
|-------|---------|--------|
| Dotta | 902 | 48.9% |
| dotta | 385 | 20.9% |
| Forgotten | 242 | 13.1% |
| Devin Foley | 60 | 3.3% |
| Matt Van Horn | 27 | 1.5% |
| zvictor | 24 | 1.3% |
| Sai Shankar | 24 | 1.3% |
| Aaron | 17 | 0.9% |
| gsxdsm | 17 | 0.9% |
| scotttong | 14 | 0.8% |

## Commit-Typ Verteilung
| Typ | Anzahl | Anteil |
|-----|--------|--------|
| fix | 492 | 26.7% |
| other | 405 | 21.9% |
| feature | 389 | 21.1% |
| merge | 259 | 14.0% |
| docs | 126 | 6.8% |
| refactor | 60 | 3.3% |
| chore | 53 | 2.9% |
| test | 31 | 1.7% |
| update | 22 | 1.2% |
| cleanup | 9 | 0.5% |

## Architektur-Bereiche (Touch-Frequenz)
| Bereich | Commits die diesen Bereich berühren | Anteil |
|---------|-------------------------------------|--------|
| ui-components | 457 | 24.8% |
| ui-pages | 448 | 24.3% |
| server-core | 370 | 20.0% |
| services | 262 | 14.2% |
| ui-core | 248 | 13.4% |
| routes | 218 | 11.8% |
| adapter-packages | 187 | 10.1% |
| root-config | 186 | 10.1% |
| cli | 160 | 8.7% |
| shared-types | 147 | 8.0% |
| doc-specs | 140 | 7.6% |
| ui-lib | 128 | 6.9% |
| scripts | 113 | 6.1% |
| db-package | 96 | 5.2% |
| docs | 71 | 3.8% |
| adapter-utils | 67 | 3.6% |
| skills | 54 | 2.9% |
| db-schema | 48 | 2.6% |
| doc-plans | 47 | 2.5% |
| ci-cd | 42 | 2.3% |
| adapters | 35 | 1.9% |
| ui-hooks | 26 | 1.4% |
| middleware | 22 | 1.2% |
| plugins | 15 | 0.8% |
| docker | 10 | 0.5% |
| releases | 10 | 0.5% |
| tests | 8 | 0.4% |
| hermes-worker | 6 | 0.3% |
| agents-config | 5 | 0.3% |
| evals | 3 | 0.2% |
| hermes-adapter | 1 | 0.1% |

## Identifizierte Epochs

### Epoch 1: Foundation (2026-02-16)
- **15 Commits** am ersten Tag
- Monorepo-Scaffolding: server, ui, packages/db, packages/shared
- Kern-Architektur wird in einem Tag aufgebaut
- Commits:
  - `481b3a46` Add project scaffolding and infrastructure config
  - `7d1427aa` Add product documentation
  - `b62fa4ad` Add shared types package
  - `948e8e8c` Add database package with Drizzle schema
  - `c9d7cbfe` Add API server with routes, services, and middleware
  - `c3d82ed8` Add React UI with Vite
  - `f19c99f0` Add task management data model spec
  - `09471314` Add module system design plan
  - `e4752d00` Add product spec and MCP task interface docs
  - `4bc8e8ba` Add embedded PGlite support as zero-config database option
  - `d2f76585` Update product spec with adapter model and expanded governance
  - `54f35262` Add database setup guide and clean up spec formatting
  - `5c795c51` Refine spec: cross-team rules, cost model, and V1 scope
  - `5e9b6154` Refine spec: remove goal field, add budgets, simplify agent auth
  - `9722bd71` Add ClipHub company template registry spec

---

## Woche-für-Woche Chronologie

### 2026-W08 (2026-02-16 → 2026-02-21)
**150 commits** | +113,859 / -10,684 Zeilen

**Fokus-Bereiche:**
- `ui-components` (56) ████████████████████
- `ui-pages` (51) ████████████████████
- `ui-core` (40) ████████████████████
- `root-config` (32) ████████████████████
- `services` (29) ████████████████████

**Typen:** feature: 71 | other: 42 | fix: 16 | docs: 10 | refactor: 4 | update: 3 | cleanup: 2 | chore: 1 | test: 1

**Schlüssel-Commits:**
| Commit | Datum | Autor | Beschreibung | +/- |
|--------|-------|-------|--------------|-----|
| `49e15f05` | 2026-02-20 | Forgotten | Implement issue execution lock with deferred wake promotion | +9048/-178 |
| `d26b67eb` | 2026-02-19 | Forgotten | Add secrets infrastructure: DB tables, shared types, env binding model, and migration improvements | +7348/-14 |
| `778b39d3` | 2026-02-19 | Forgotten | Add agent config revisions, issue-approval links, and robust migration reconciliation | +6199/-11 |
| `2583bf4c` | 2026-02-17 | Forgotten | Add agent runtime DB schemas and expand shared types | +5296/-5 |
| `ef700c23` | 2026-02-20 | Forgotten | feat: add project_goals many-to-many join table | +4252/-15 |
| `481b3a46` | 2026-02-16 | Forgotten | Add project scaffolding and infrastructure config | +3973/-0 |
| `4e3da491` | 2026-02-19 | Forgotten | Add agent task sessions table, session types, and programmatic DB backup | +3720/-91 |
| `21b7bc8d` | 2026-02-19 | Forgotten | Add issue identifiers, activity run tracking, and migration inspection | +2740/-5 |
| `fad1bd27` | 2026-02-17 | Forgotten | Add shared UI primitives, contexts, and reusable components | +2534/-69 |
| `c09037ff` | 2026-02-19 | Forgotten | Implement agent hiring, approval workflows, config revisions, LLM reflection, and sidebar badges | +2390/-145 |

**Große Fixes:**
- `0f4ab728` fix: move Skip permissions to Advanced section, fix indentation (+190/-188)
- `de3efdd1` fix: move defaultCreateValues to separate file to fix HMR (+180/-80)
- `3ad42196` fix(ui): responsive tab bar, activity row wrapping, and layout tweaks (+114/-57)
- `7f382ce5` fix: add gap between labels and values in all properties panes (+121/-17)
- `6d0f58d5` fix: storage S3 stream conversion, API client FormData support, and attachment API (+112/-3)

---

### 2026-W09 (2026-02-23 → 2026-02-27)
**81 commits** | +61,825 / -4,182 Zeilen

**Fokus-Bereiche:**
- `ui-components` (50) ████████████████████
- `ui-pages` (29) ████████████████████
- `ui-core` (22) ████████████████████
- `shared-types` (12) ████████████
- `db-package` (10) ██████████

**Typen:** feature: 47 | fix: 26 | other: 3 | docs: 3 | refactor: 2

**Schlüssel-Commits:**
| Commit | Datum | Autor | Beschreibung | +/- |
|--------|-------|-------|--------------|-----|
| `29af5251` | 2026-02-25 | Forgotten | feat: add project workspaces (DB, API, service, and UI) | +6273/-15 |
| `60d61222` | 2026-02-23 | Forgotten | feat: add auth/access foundation - deps, DB schema, shared types, and config | +6143/-30 |
| `e2c5b669` | 2026-02-26 | Forgotten | feat: join request claim secrets, onboarding API, and company branding | +6144/-28 |
| `6f7172c0` | 2026-02-25 | Forgotten | feat: add issue labels (DB schema, API, and service) | +5903/-43 |
| `e4e56091` | 2026-02-26 | Forgotten | feat: per-issue assignee adapter overrides (model, effort, workspace) | +5899/-6 |
| `20a4ca08` | 2026-02-25 | Forgotten | feat: workspace improvements - nullable cwd, repo-only workspaces, and resolution refactor | +5821/-66 |
| `d2d927bd` | 2026-02-23 | Forgotten | feat(db): enforce globally unique issue prefixes and identifiers | +5342/-24 |
| `2ec45c49` | 2026-02-23 | Forgotten | feat(ui): add auth pages, company rail, inbox redesign, and page improvements | +2788/-1061 |
| `ad19bc92` | 2026-02-26 | Forgotten | feat(ui): onboarding wizard, comment thread, markdown editor, and UX polish | +1011/-841 |
| `e1f2be7e` | 2026-02-23 | Forgotten | feat(server): integrate Better Auth, access control, and deployment mode startup | +1530/-49 |

**Große Fixes:**
- `d2f9ade3` fix(ui): mobile viewport, scrollable popovers, and actor labels (+107/-109)
- `5af5e4f3` fix(ui): remove borders from label color picker and name input (+151/-8)
- `0db2795d` fix: convert navigate() calls to Link components for cmd-click support (+41/-46)
- `20176d9d` fix(ui): resume lost runs, activity feed fixes, and selector focus (+74/-1)
- `f3d153c7` fix(ui): move live badge to left of assignee in issues list (+53/-18)

---

### 2026-W10 (2026-03-02 → 2026-03-08)
**473 commits** | +80,793 / -32,142 Zeilen

**Fokus-Bereiche:**
- `server-core` (118) ████████████████████
- `ui-components` (108) ████████████████████
- `ui-pages` (93) ████████████████████
- `adapter-packages` (84) ████████████████████
- `routes` (74) ████████████████████

**Typen:** fix: 132 | feature: 105 | other: 100 | merge: 58 | docs: 33 | chore: 20 | refactor: 11 | test: 7 | update: 6 | cleanup: 1

**Schlüssel-Commits:**
| Commit | Datum | Autor | Beschreibung | +/- |
|--------|-------|-------|--------------|-----|
| `af97259a` | 2026-03-08 | Aditya Sasidhar | feat(adapters): add Gemini CLI local adapter support | +2183/-11894 |
| `b19d0b6f` | 2026-03-06 | JonCSykes | Add support for company logos, including schema adjustments, validation, assets handling, and UI display enhancements. | +6211/-26 |
| `38b9a55e` | 2026-03-06 | Dotta | Add touched/unread inbox issue semantics | +6059/-46 |
| `048e2b1b` | 2026-03-07 | Dotta | Remove legacy OpenClaw adapter and keep gateway-only flow | +454/-5057 |
| `a498c268` | 2026-03-07 | Dotta | feat: add openclaw_gateway adapter | +4290/-19 |
| `6a101e0d` | 2026-03-05 | Konan69 | Add OpenCode provider integration and strict model selection | +2225/-104 |
| `8ee063c4` | 2026-03-02 | Dotta | feat(ui): reconcile backup UI changes with current routing and interaction features | +1593/-668 |
| `8a851731` | 2026-03-05 | Dotta | feat: add cursor local adapter across server ui and cli | +1871/-20 |
| `f6a09bcb` | 2026-03-04 | Dotta | feat: add opencode local adapter support | +1708/-28 |
| `defccdd4` | 2026-03-03 | Dotta | feat: integrate Changesets for multi-package npm publishing | +1197/-256 |

**Große Fixes:**
- `09d2ef1a` fix: restore docs deleted in v0.2.3 release, add Paperclip branding (+4159/-2)
- `83488b4e` fix(openclaw-gateway): enforce join token validation and add smoke preflight gates (+458/-32)
- `43ac7d06` fix(costs): guard routes, fix DST ranges, sync provider state, wire live updates (+202/-141)
- `bc991a96` fix(costs): guard routes, fix DST ranges, sync provider state, wire live updates (+202/-141)
- `a05aa99c` fix(openclaw): support /hooks/wake compatibility payload (+291/-10)

---

### 2026-W11 (2026-03-09 → 2026-03-15)
**418 commits** | +214,531 / -17,277 Zeilen

**Fokus-Bereiche:**
- `ui-components` (95) ████████████████████
- `server-core` (69) ████████████████████
- `ui-pages` (66) ████████████████████
- `ui-core` (58) ████████████████████
- `services` (57) ████████████████████

**Typen:** fix: 103 | merge: 90 | other: 82 | feature: 67 | docs: 31 | chore: 16 | refactor: 16 | update: 9 | cleanup: 4

**Schlüssel-Commits:**
| Commit | Datum | Autor | Beschreibung | +/- |
|--------|-------|-------|--------------|-----|
| `80cdbdbd` | 2026-03-13 | Dotta | Add plugin framework and settings UI | +31760/-35 |
| `83efe2a2` | 2026-03-14 | Dotta | feat(costs): add billing, quota, and budget control plane | +22723/-731 |
| `76e6cc08` | 2026-03-14 | Dotta | feat(costs): add billing, quota, and budget control plane | +22369/-732 |
| `a53e7eb7` | 2026-03-10 | Dotta | Add worktree-aware workspace runtime support | +9510/-68 |
| `920bc4c7` | 2026-03-13 | Dotta | Implement execution workspaces and work products | +9157/-140 |
| `45998aa9` | 2026-03-13 | Dotta | feat(issues): add issue documents and inline editing | +9157/-97 |
| `3120c723` | 2026-03-10 | Dotta | Add worktree-aware workspace runtime support | +8750/-61 |
| `0bf53bc5` | 2026-03-14 | Dotta | Add company skills library and agent skills UI | +8049/-130 |
| `99f6fafa` | 2026-03-10 | Dotta | Add project-first execution workspace policies | +7046/-114 |
| `b83a87f4` | 2026-03-10 | Dotta | Add project-first execution workspace policies | +7046/-114 |

**Große Fixes:**
- `6956dad5` fix(adapters/gemini-local): address PR review feedback (+11878/-5)
- `7c4b02f0` Fix plugin dev watcher and migration snapshot (+8122/-46)
- `8360b2e3` fix: complete authenticated onboarding startup (+639/-529)
- `7675fd08` Fix runtime skill injection across adapters (+506/-222)
- `56aeddfa` Fix dev migration prompt and embedded db:migrate (+701/-16)

---

### 2026-W12 (2026-03-16 → 2026-03-22) 🔄 **EPOCH SHIFT**
**413 commits** | +168,537 / -16,222 Zeilen

**Fokus-Bereiche:**
- `ui-pages` (150) ████████████████████
- `ui-components` (99) ████████████████████
- `server-core` (79) ████████████████████
- `services` (77) ████████████████████
- `routes` (56) ████████████████████

**Typen:** fix: 138 | other: 97 | feature: 66 | merge: 61 | refactor: 19 | docs: 10 | chore: 9 | test: 9 | update: 2 | cleanup: 2

**Schlüssel-Commits:**
| Commit | Datum | Autor | Beschreibung | +/- |
|--------|-------|-------|--------------|-----|
| `8f5196f7` | 2026-03-19 | dotta | Add routines automation workflows | +25977/-5 |
| `4da13984` | 2026-03-17 | Dotta | Add workspace operation tracking and fix project properties JSX | +11537/-30 |
| `e39ae5a4` | 2026-03-17 | Dotta | Add instance experimental setting for isolated workspaces | +10839/-252 |
| `39878fcd` | 2026-03-20 | dotta | Add username log censor setting | +10841/-146 |
| `e980c2ef` | 2026-03-17 | Dotta | Add agent instructions bundle editing | +1479/-135 |
| `51ca7131` | 2026-03-18 | dotta | Add CEO-safe company portability flows | +1166/-96 |
| `cfc53bf9` | 2026-03-18 | dotta | Add unmanaged skill provenance to agent skills | +497/-501 |
| `8d0581ff` | 2026-03-16 | Dotta | refactor: extract shared PackageFileTree component for import/export | +346/-588 |
| `19f4a78f` | 2026-03-18 | dotta | feat: add release smoke workflow | +795/-8 |
| `8fc399f5` | 2026-03-20 | dotta | Add guarded dev restart handling | +758/-43 |

**Große Fixes:**
- `5fee484e` Fix routine coalescing for idle execution issues (+11787/-13)
- `18302160` Fix PR verify failures after merge (+10550/-419)
- `8fbbc4ad` Fix budget incident resolution edge cases (+9259/-7)
- `8232456c` Fix markdown mention chips (+522/-259)
- `99eb3176` fix: harden routine dispatch and permissions (+415/-137)

---

### 2026-W13 (2026-03-23 → 2026-03-29)
**271 commits** | +73,597 / -12,775 Zeilen

**Fokus-Bereiche:**
- `server-core` (70) ████████████████████
- `ui-pages` (55) ████████████████████
- `ui-components` (44) ████████████████████
- `services` (37) ████████████████████
- `ui-lib` (36) ████████████████████

**Typen:** other: 75 | fix: 66 | merge: 36 | docs: 34 | feature: 30 | test: 13 | refactor: 8 | chore: 7 | update: 2

**Schlüssel-Commits:**
| Commit | Datum | Autor | Beschreibung | +/- |
|--------|-------|-------|--------------|-----|
| `37c2c4ac` | 2026-03-23 | dotta | Add browser-based board CLI auth flow | +13299/-19 |
| `995f5b0b` | 2026-03-26 | dotta | Add the inbox mine tab and archive flow | +12514/-43 |
| `1b70091d` | 2026-03-26 | Devin Foley | Implement idle timeout reaper and liveness visibility for hung runs | +12040/-8 |
| `2e76a2a5` | 2026-03-23 | dotta | Add routine support to recurring task portability | +1520/-86 |
| `6793dde5` | 2026-03-28 | dotta | Add idempotent local dev service management | +1448/-35 |
| `f1ad0761` | 2026-03-28 | dotta | Add execution workspace close readiness and UI | +1341/-105 |
| `1f1fe9c9` | 2026-03-28 | dotta | Add workspace runtime controls | +1133/-51 |
| `5d538d47` | 2026-03-26 | dotta | Add Paperclip commit metrics script | +714/-1 |
| `1583a2d6` | 2026-03-28 | HenkDz | feat(hermes): upgrade hermes-paperclip-adapter + UI adapter + skills + detectModel | +634/-33 |
| `bb1732dd` | 2026-03-28 | dotta | Add project workspace detail page | +586/-5 |

**Große Fixes:**
- `2735ef1f` fix(issues): decode @mention entities without lockfile or new deps (+7890/-7778)
- `ed62d58c` Fix headless OpenCode permission prompts (+638/-416)
- `ab82e3f0` Fix worktree runtime isolation recovery (+715/-2)
- `dcead976` Fix company zip imports (+420/-7)
- `e3f07aad` Fix execution workspace runtime control reuse (+347/-33)

---

### 2026-W14 (2026-03-30 → 2026-03-31) 🔄 **EPOCH SHIFT**
**40 commits** | +2,712 / -571 Zeilen

**Fokus-Bereiche:**
- `server-core` (6) ██████
- `hermes-worker` (6) ██████
- `ui-components` (5) █████
- `doc-specs` (4) ████
- `ui-pages` (4) ████

**Typen:** merge: 14 | fix: 11 | other: 6 | docs: 5 | feature: 3 | test: 1

**Schlüssel-Commits:**
| Commit | Datum | Autor | Beschreibung | +/- |
|--------|-------|-------|--------------|-----|
| `9f39287c` | 2026-03-31 | Mathias | feat: add hermes_cloud adapter + Cloud Run worker + Supabase persistence | +1093/-0 |
| `5e65bb2b` | 2026-03-30 | dotta | Add company name to invite summaries | +116/-13 |
| `9684e7bf` | 2026-03-30 | dotta | Add dark mode inbox selection color | +8/-4 |

**Große Fixes:**
- `db4e1465` Fix routine modal scrolling (+180/-175)
- `9b963fab` fix: hybrid FastAPI + Hermes CLI approach for guaranteed port binding (+123/-141)
- `3c666831` Fix execution workspace reuse and slugify worktrees (+176/-46)
- `26679418` fix: non-interactive Dockerfile + standalone migration SQL (+39/-38)
- `88e742a1` Fix health DB connectivity probe (+54/-3)

---

## Meistveränderte Dateien (Hot Spots)
| Datei | Änderungs-Frequenz |
|-------|--------------------|
| `ui/src/pages/AgentDetail.tsx` | 114x |
| `ui/src/pages/Inbox.tsx` | 81x |
| `pnpm-lock.yaml` | 75x |
| `ui/src/pages/IssueDetail.tsx` | 74x |
| `server/src/services/heartbeat.ts` | 73x |
| `ui/src/components/OnboardingWizard.tsx` | 73x |
| `packages/shared/src/index.ts` | 67x |
| `server/src/routes/agents.ts` | 65x |
| `ui/src/App.tsx` | 59x |
| `ui/src/components/NewIssueDialog.tsx` | 59x |
| `server/package.json` | 57x |
| `packages/shared/src/types/index.ts` | 54x |
| `server/src/services/company-portability.ts` | 54x |
| `server/src/routes/issues.ts` | 51x |
| `ui/src/components/AgentConfigForm.tsx` | 51x |
| `server/src/services/issues.ts` | 50x |
| `doc/DEVELOPING.md` | 49x |
| `server/src/index.ts` | 48x |
| `packages/db/src/migrations/meta/_journal.json` | 46x |
| `packages/adapters/codex-local/src/server/execute.ts` | 46x |
| `server/src/routes/access.ts` | 43x |
| `packages/shared/src/validators/index.ts` | 42x |
| `ui/src/components/Layout.tsx` | 41x |
| `ui/src/components/IssuesList.tsx` | 41x |
| `ui/src/index.css` | 40x |
| `ui/src/components/IssueProperties.tsx` | 40x |
| `ui/src/lib/queryKeys.ts` | 40x |
| `ui/src/context/LiveUpdatesProvider.tsx` | 38x |
| `ui/src/pages/ProjectDetail.tsx` | 36x |
| `cli/src/commands/worktree.ts` | 36x |

## Architektur-Entscheidungen (aus Commit-Messages abgeleitet)

### `adapter` (106 commits)
- 2026-02-16 `d2f76585` Update product spec with adapter model and expanded governance
- 2026-02-17 `b13c5f4b` Inject PAPERCLIP_* env vars into all adapter process runs
- 2026-02-18 `11c8c1af` Expand heartbeat service with process adapter improvements
- 2026-02-18 `47ccd946` Extract adapter registry across CLI, server, and UI
- 2026-02-18 `631c859b` Move adapter implementations into shared workspace packages
- ... und 101 weitere

### `auth` (60 commits)
- 2026-02-16 `5e9b6154` Refine spec: remove goal field, add budgets, simplify agent auth
- 2026-02-18 `7ca5cfd5` Refine agent authentication plan
- 2026-02-18 `fe6a8687` Implement local agent JWT authentication for adapters
- 2026-02-23 `60d61222` feat: add auth/access foundation - deps, DB schema, shared types, and config
- 2026-02-23 `e1f2be7e` feat(server): integrate Better Auth, access control, and deployment mode startup
- ... und 55 weitere

### `plugin` (38 commits)
- 2026-03-07 `df0f101f` plugin spec draft ideas v0
- 2026-03-07 `f81d2ebc` Enhance plugin architecture by introducing agent tool contributions and plugin-to-plugin communication. Update workspace plugin definitions for direct OS access and refine UI extension surfaces. Document new capabilities for plugin settings UI and lifecycle management.
- 2026-03-07 `72cc748a` Merge pull request #273 from gsxdsm/feature/plugins
- 2026-03-13 `80cdbdbd` Add plugin framework and settings UI
- 2026-03-13 `12ccfc2c` Simplify plugin runtime and cleanup lifecycle
- ... und 33 weitere

### `heartbeat` (36 commits)
- 2026-02-17 `8c830eae` Expand data model with companies, approvals, costs, and heartbeats
- 2026-02-17 `6dbbf1bb` Add CLI heartbeat-run command for manual agent invocation
- 2026-02-17 `af44f45c` Improve heartbeat-run CLI and agent detail UI
- 2026-02-18 `7e4a2064` Improve CLI: config store, heartbeat-run, and onboarding
- 2026-02-18 `11c8c1af` Expand heartbeat service with process adapter improvements
- ... und 31 weitere

### `docker` (35 commits)
- 2026-02-26 `1e11806f` feat: Docker quickstart with Compose, docs, and improved Dockerfile
- 2026-03-04 `bbf7490f` Fix onboard smoke Docker flow for clean npx runs
- 2026-03-04 `b66c6d01` Adjust docker onboard smoke defaults and console guidance
- 2026-03-05 `34d9122b` Add one-command OpenClaw Docker UI smoke script
- 2026-03-05 `9dbd72cf` Improve OpenClaw Docker UI smoke pairing ergonomics
- ... und 30 weitere

### `approval` (29 commits)
- 2026-02-17 `8c830eae` Expand data model with companies, approvals, costs, and heartbeats
- 2026-02-17 `abadd469` Add server routes for companies, approvals, costs, and dashboard
- 2026-02-17 `0b9bea66` Improve issue and approvals UI: parent chain, project names, approval details
- 2026-02-17 `b95c05a2` Improve agent detail, issue creation, and approvals pages
- 2026-02-19 `e0a878f4` Scaffold agent permissions, approval comments, and hiring governance types
- ... und 24 weitere

### `migration` (28 commits)
- 2026-02-19 `21b7bc8d` Add issue identifiers, activity run tracking, and migration inspection
- 2026-02-19 `a9006341` Server: migration prompts, structured logging, heartbeat reaping, and issue-run tracking
- 2026-02-19 `778b39d3` Add agent config revisions, issue-approval links, and robust migration reconciliation
- 2026-02-19 `d26b67eb` Add secrets infrastructure: DB tables, shared types, env binding model, and migration improvements
- 2026-02-19 `80a8ec26` Add secrets documentation and inline env migration script
- ... und 23 weitere

### `budget` (12 commits)
- 2026-02-16 `5e9b6154` Refine spec: remove goal field, add budgets, simplify agent auth
- 2026-02-20 `39f8d385` UI: mobile responsive layout, streamline agent budget display, and xs avatar size
- 2026-02-20 `b49fc745` fix: show "Unlimited budget" when budget is $0
- 2026-03-11 `57113b10` Merge pull request #386 from domocarroll/fix/heartbeat-budget-enforcement
- 2026-03-14 `83efe2a2` feat(costs): add billing, quota, and budget control plane
- ... und 7 weitere

### `hermes` (8 commits)
- 2026-03-10 `97d628d7` feat: add Hermes Agent adapter (hermes_local)
- 2026-03-15 `2162289b` Merge branch 'master' into feat/hermes-agent-adapter
- 2026-03-15 `675421f3` Merge pull request #587 from teknium1/feat/hermes-agent-adapter
- 2026-03-28 `1583a2d6` feat(hermes): upgrade hermes-paperclip-adapter + UI adapter + skills + detectModel
- 2026-03-28 `582f4cea` fix: address Hermes adapter review feedback
- ... und 3 weitere

### `deploy` (7 commits)
- 2026-02-20 `ad748349` Add deployment guidelines, assets/attachments spec, and humans-and-permissions plan
- 2026-02-23 `e1f2be7e` feat(server): integrate Better Auth, access control, and deployment mode startup
- 2026-02-23 `5b983ca4` feat(cli): add deployment mode prompts, auth bootstrap-ceo command, and doctor check
- 2026-02-23 `21c506dc` docs: add deployment modes documentation and update plans
- 2026-03-05 `2c809d55` move docker into `authenticated` deployment mode
- ... und 2 weitere

### `webhook` (6 commits)
- 2026-03-05 `8e63dd44` openclaw: accept webhook json ack in sse mode
- 2026-03-06 `b155415d` Reintroduce OpenClaw webhook transport alongside SSE
- 2026-03-06 `5ab1c185` fix openclaw webhook payload for /v1/responses
- 2026-03-06 `aa7e0690` openclaw: force webhook transport to use hooks/wake
- 2026-03-06 `b5394623` Revert "openclaw: force webhook transport to use hooks/wake"
- ... und 1 weitere

### `schema` (5 commits)
- 2026-02-16 `948e8e8c` Add database package with Drizzle schema
- 2026-02-17 `2583bf4c` Add agent runtime DB schemas and expand shared types
- 2026-02-23 `60d61222` feat: add auth/access foundation - deps, DB schema, shared types, and config
- 2026-02-25 `6f7172c0` feat: add issue labels (DB schema, API, and service)
- 2026-03-06 `b19d0b6f` Add support for company logos, including schema adjustments, validation, assets handling, and UI display enhancements.

### `memory` (3 commits)
- 2026-03-11 `a503d2c1` Adjust inbox tab memory and badge counts
- 2026-03-17 `7b9718cb` docs: plan memory service surface API
- 2026-03-17 `3ffa94ab` docs: plan memory service surface API
