# 🗄️ Data Model Map — Deep Research v4

> Generiert: 2026-04-01
> Total: 59 Schema-Dateien, 47 Migrations

## Schema Evolution History

**47 Drizzle Migrations** (0000 → 0046)

| # | Datei | Größe | Creates | Alters | Indexes | Policies |
|---|-------|-------|---------|--------|---------|----------|
| 0000 | `0000_mature_masked_marvel.sql` | 13719B | activity_log, agent_api_keys, agents +8 | 10 | 17 | — |
| 0001 | `0001_fast_northstar.sql` | 6082B | agent_runtime_state, agent_wakeup_requests, heartbeat_run_events | 5 | 8 | — |
| 0002 | `0002_big_zaladane.sql` | 231B | — | 1 | — | — |
| 0003 | `0003_shallow_quentin_quire.sql` | 576B | — | 2 | 2 | — |
| 0004 | `0004_issue_identifiers.sql` | 1289B | — | 2 | 1 | — |
| 0005 | `0005_chief_luke_cage.sql` | 1677B | approval_comments | 3 | 3 | — |
| 0006 | `0006_overjoyed_mister_sinister.sql` | 3048B | agent_config_revisions, issue_approvals | 2 | 5 | — |
| 0007 | `0007_new_quentin_quire.sql` | 1634B | agent_task_sessions | 1 | 3 | — |
| 0008 | `0008_amused_zzzax.sql` | 69B | — | 1 | — | — |
| 0009 | `0009_fast_jackal.sql` | 2638B | company_secret_versions, company_secrets | 2 | 6 | — |
| 0010 | `0010_stale_justin_hammer.sql` | 2888B | assets, issue_attachments | 2 | 6 | — |
| 0011 | `0011_windy_corsair.sql` | 1485B | project_goals | 1 | 3 | — |
| 0012 | `0012_perpetual_ser_duncan.sql` | 276B | — | 1 | — | — |
| 0013 | `0013_dashing_wasp.sql` | 472B | — | 1 | — | — |
| 0014 | `0014_many_mikhail_rasputin.sql` | 7392B | account, session, user +6 | 7 | 12 | — |
| 0015 | `0015_project_color_archived.sql` | 122B | — | 1 | — | — |
| 0016 | `0016_agent_icon.sql` | 45B | — | 1 | — | — |
| 0017 | `0017_tiresome_gabe_jones.sql` | 1998B | — | — | 2 | — |
| 0018 | `0018_flat_sleepwalker.sql` | 1909B | issue_labels, labels | 2 | 5 | — |
| 0019 | `0019_public_victor_mancha.sql` | 1161B | project_workspaces | 1 | 2 | — |
| 0020 | `0020_white_anita_blake.sql` | 66B | — | 1 | — | — |
| 0021 | `0021_chief_vindicator.sql` | 67B | — | 1 | — | — |
| 0022 | `0022_company_brand_color.sql` | 55B | — | 1 | — | — |
| 0023 | `0023_fair_lethal_legion.sql` | 296B | — | 1 | — | — |
| 0024 | `0024_far_beast.sql` | 309B | — | — | 2 | — |
| 0025 | `0025_nasty_salo.sql` | 1238B | issue_read_states | 1 | 3 | — |
| 0026 | `0026_lying_pete_wisdom.sql` | 3013B | workspace_runtime_services | 1 | 4 | — |
| 0027 | `0027_tranquil_tenebrous.sql` | 163B | — | 2 | — | — |
| 0028 | `0028_harsh_goliath.sql` | 4249B | document_revisions, documents, issue_documents | 3 | 7 | — |
| 0029 | `0029_plugin_tables.sql` | 10447B | plugins, plugin_config, plugin_state +6 | 8 | 22 | — |
| 0030 | `0030_rich_magneto.sql` | 924B | company_logos | 1 | 2 | — |
| 0031 | `0031_zippy_magma.sql` | 4305B | finance_events | 2 | 9 | — |
| 0032 | `0032_pretty_doctor_octopus.sql` | 4367B | budget_incidents, budget_policies | 4 | 6 | — |
| 0033 | `0033_shiny_black_tarantula.sql` | 153B | — | 1 | — | — |
| 0034 | `0034_fat_dormammu.sql` | 279B | — | — | 1 | — |
| 0035 | `0035_marvelous_satana.sql` | 8705B | execution_workspaces, issue_work_products | 5 | 15 | — |
| 0036 | `0036_cheerful_nitro.sql` | 460B | instance_settings | — | 1 | — |
| 0037 | `0037_friendly_eddie_brock.sql` | 1837B | workspace_operations | 1 | 2 | — |
| 0038 | `0038_careless_iron_monger.sql` | 617B | — | 1 | — | — |
| 0039 | `0039_fat_magneto.sql` | 9967B | — | 4 | — | — |
| 0040 | `0040_eager_shotgun.sql` | 509B | — | — | — | — |
| 0041 | `0041_curly_maria_hill.sql` | 103B | — | 1 | — | — |
| 0042 | `0042_spotty_the_renegades.sql` | 1298B | — | 1 | — | — |
| 0043 | `0043_reflective_captain_universe.sql` | 505B | — | — | — | — |
| 0044 | `0044_illegal_toad.sql` | 3485B | — | 3 | — | — |
| 0045 | `0045_workable_shockwave.sql` | 1456B | issue_inbox_archives | 1 | 4 | — |
| 0046 | `0046_lame_junta.sql` | 1289B | agent_memory | 1 | 3 | — |

## Tabellen-Register (Live Schema)

| Tabelle | Schema-Datei | Spalten | Referenzen | Migrations-Historie |
|---------|-------------|---------|------------|---------------------|
| `activity_log` | `activity_log.ts` | 11 | — | 6 ops |
| `agent_api_keys` | `agent_api_keys.ts` | 8 | — | 4 ops |
| `agent_config_revisions` | `agent_config_revisions.ts` | 11 | — | 4 ops |
| `agent_memory` | `agent_memory.ts` | 11 | — | 5 ops |
| `agent_runtime_state` | `agent_runtime_state.ts` | 10 | — | 4 ops |
| `agent_task_sessions` | `agent_task_sessions.ts` | 11 | — | 5 ops |
| `agent_wakeup_requests` | `agent_wakeup_requests.ts` | 19 | — | 5 ops |
| `agents` | `agents.ts` | 21 | — | 9 ops |
| `approval_comments` | `approval_comments.ts` | 8 | — | 5 ops |
| `approvals` | `approvals.ts` | 12 | — | 3 ops |
| `assets` | `assets.ts` | 12 | — | 5 ops |
| `user` | `auth.ts` | 34 | — | CREATED in 0014_many_mikhail_rasputin.sql |
| `board_api_keys` | `board_api_keys.ts` | 8 | — | ALTERED in 0044_illegal_toad.sql; INDEX board_api_keys_key_hash_idx in 0045_workable_shockwave.sql |
| `budget_incidents` | `budget_incidents.ts` | 17 | — | 6 ops |
| `budget_policies` | `budget_policies.ts` | 15 | — | 5 ops |
| `cli_auth_challenges` | `cli_auth_challenges.ts` | 15 | — | ALTERED in 0044_illegal_toad.sql |
| `companies` | `companies.ts` | 14 | — | 6 ops |
| `company_logos` | `company_logos.ts` | 5 | — | 4 ops |
| `company_memberships` | `company_memberships.ts` | 8 | — | 5 ops |
| `company_secret_versions` | `company_secret_versions.ts` | 9 | — | 5 ops |
| `company_secrets` | `company_secrets.ts` | 11 | — | 5 ops |
| `company_skills` | `company_skills.ts` | 16 | — | ALTERED in 0042_spotty_the_renegades.sql |
| `cost_events` | `cost_events.ts` | 18 | — | 8 ops |
| `document_revisions` | `document_revisions.ts` | 9 | — | 4 ops |
| `documents` | `documents.ts` | 13 | — | 4 ops |
| `execution_workspaces` | `execution_workspaces.ts` | 24 | — | 7 ops |
| `finance_events` | `finance_events.ts` | 27 | — | 8 ops |
| `goals` | `goals.ts` | 10 | — | 3 ops |
| `heartbeat_run_events` | `heartbeat_run_events.ts` | 11 | — | 5 ops |
| `heartbeat_runs` | `heartbeat_runs.ts` | 31 | — | 6 ops |
| `instance_settings` | `instance_settings.ts` | 6 | — | 4 ops |
| `instance_user_roles` | `instance_user_roles.ts` | 5 | — | 3 ops |
| `invites` | `invites.ts` | 12 | — | 4 ops |
| `issue_approvals` | `issue_approvals.ts` | 6 | — | 5 ops |
| `issue_attachments` | `issue_attachments.ts` | 7 | — | 5 ops |
| `issue_comments` | `issue_comments.ts` | 8 | — | 6 ops |
| `issue_documents` | `issue_documents.ts` | 7 | — | 5 ops |
| `issue_inbox_archives` | `issue_inbox_archives.ts` | 7 | — | 5 ops |
| `issue_labels` | `issue_labels.ts` | 4 | — | 5 ops |
| `issue_read_states` | `issue_read_states.ts` | 7 | — | 5 ops |
| `issue_work_products` | `issue_work_products.ts` | 20 | — | 6 ops |
| `issues` | `issues.ts` | 35 | — | 20 ops |
| `join_requests` | `join_requests.ts` | 22 | — | 5 ops |
| `labels` | `labels.ts` | 6 | — | 4 ops |
| `plugin_company_settings` | `plugin_company_settings.ts` | 8 | — | 5 ops |
| `plugin_config` | `plugin_config.ts` | 6 | — | 3 ops |
| `plugin_entities` | `plugin_entities.ts` | 11 | — | 6 ops |
| `plugin_jobs` | `plugin_jobs.ts` | 20 | — | 5 ops |
| `plugin_logs` | `plugin_logs.ts` | 6 | — | 4 ops |
| `plugin_state` | `plugin_state.ts` | 8 | — | 3 ops |
| `plugin_webhooks` | `plugin_webhooks.ts` | 12 | — | (nur Schema) |
| `plugins` | `plugins.ts` | 13 | — | 3 ops |
| `principal_permission_grants` | `principal_permission_grants.ts` | 9 | — | 4 ops |
| `project_goals` | `project_goals.ts` | 5 | — | 5 ops |
| `project_workspaces` | `project_workspaces.ts` | 19 | — | 9 ops |
| `projects` | `projects.ts` | 14 | — | 6 ops |
| `routines` | `routines.ts` | 57 | — | ALTERED in 0039_fat_magneto.sql |
| `workspace_operations` | `workspace_operations.ts` | 20 | — | 4 ops |
| `workspace_runtime_services` | `workspace_runtime_services.ts` | 27 | — | 8 ops |

## ER-Diagramm (Mermaid)

```mermaid
erDiagram
```

## Company-Scoped Tabellen

**Company-Scoped (6):** `company_logos`, `company_memberships`, `company_secret_versions`, `company_secrets`, `company_skills`, `plugin_company_settings`

**Nicht Company-Scoped (53):** `activity_log`, `agent_api_keys`, `agent_config_revisions`, `agent_memory`, `agent_runtime_state`, `agent_task_sessions`, `agent_wakeup_requests`, `agents`, `approval_comments`, `approvals`, `assets`, `user`, `board_api_keys`, `budget_incidents`, `budget_policies`, `cli_auth_challenges`, `companies`, `cost_events`, `document_revisions`, `documents`, `execution_workspaces`, `finance_events`, `goals`, `heartbeat_run_events`, `heartbeat_runs`, `instance_settings`, `instance_user_roles`, `invites`, `issue_approvals`, `issue_attachments`, `issue_comments`, `issue_documents`, `issue_inbox_archives`, `issue_labels`, `issue_read_states`, `issue_work_products`, `issues`, `join_requests`, `labels`, `plugin_config`, `plugin_entities`, `plugin_jobs`, `plugin_logs`, `plugin_state`, `plugin_webhooks`, `plugins`, `principal_permission_grants`, `project_goals`, `project_workspaces`, `projects`, `routines`, `workspace_operations`, `workspace_runtime_services`

## Tabellen-Evolutions-Detail

### `IF`
- DROPPED in 0029_plugin_tables.sql
- DROPPED in 0029_plugin_tables.sql
- DROPPED in 0029_plugin_tables.sql
- DROPPED in 0029_plugin_tables.sql
- DROPPED in 0029_plugin_tables.sql
- DROPPED in 0029_plugin_tables.sql
- DROPPED in 0029_plugin_tables.sql
- DROPPED in 0029_plugin_tables.sql
- DROPPED in 0029_plugin_tables.sql

### `account`
- CREATED in 0014_many_mikhail_rasputin.sql
- ALTERED in 0014_many_mikhail_rasputin.sql

### `activity_log`
- CREATED in 0000_mature_masked_marvel.sql
- ALTERED in 0000_mature_masked_marvel.sql
- INDEX activity_log_company_created_idx in 0000_mature_masked_marvel.sql
- ALTERED in 0003_shallow_quentin_quire.sql
- INDEX activity_log_run_id_idx in 0003_shallow_quentin_quire.sql
- INDEX activity_log_entity_type_id_idx in 0003_shallow_quentin_quire.sql

### `agent_api_keys`
- CREATED in 0000_mature_masked_marvel.sql
- ALTERED in 0000_mature_masked_marvel.sql
- INDEX agent_api_keys_key_hash_idx in 0000_mature_masked_marvel.sql
- INDEX agent_api_keys_company_agent_idx in 0000_mature_masked_marvel.sql

### `agent_config_revisions`
- CREATED in 0006_overjoyed_mister_sinister.sql
- ALTERED in 0006_overjoyed_mister_sinister.sql
- INDEX agent_config_revisions_company_agent_created_idx in 0006_overjoyed_mister_sinister.sql
- INDEX agent_config_revisions_agent_created_idx in 0006_overjoyed_mister_sinister.sql

### `agent_memory`
- CREATED in 0046_lame_junta.sql
- ALTERED in 0046_lame_junta.sql
- INDEX agent_memory_company_agent_category_idx in 0046_lame_junta.sql
- INDEX agent_memory_company_agent_key_idx in 0046_lame_junta.sql
- INDEX agent_memory_importance_idx in 0046_lame_junta.sql

### `agent_runtime_state`
- CREATED in 0001_fast_northstar.sql
- ALTERED in 0001_fast_northstar.sql
- INDEX agent_runtime_state_company_agent_idx in 0001_fast_northstar.sql
- INDEX agent_runtime_state_company_updated_idx in 0001_fast_northstar.sql

### `agent_task_sessions`
- CREATED in 0007_new_quentin_quire.sql
- ALTERED in 0007_new_quentin_quire.sql
- INDEX agent_task_sessions_company_agent_adapter_task_uniq in 0007_new_quentin_quire.sql
- INDEX agent_task_sessions_company_agent_updated_idx in 0007_new_quentin_quire.sql
- INDEX agent_task_sessions_company_task_updated_idx in 0007_new_quentin_quire.sql

### `agent_wakeup_requests`
- CREATED in 0001_fast_northstar.sql
- ALTERED in 0001_fast_northstar.sql
- INDEX agent_wakeup_requests_company_agent_status_idx in 0001_fast_northstar.sql
- INDEX agent_wakeup_requests_company_requested_idx in 0001_fast_northstar.sql
- INDEX agent_wakeup_requests_agent_requested_idx in 0001_fast_northstar.sql

### `agents`
- CREATED in 0000_mature_masked_marvel.sql
- ALTERED in 0000_mature_masked_marvel.sql
- INDEX agents_company_status_idx in 0000_mature_masked_marvel.sql
- INDEX agents_company_reports_to_idx in 0000_mature_masked_marvel.sql
- ALTERED in 0001_fast_northstar.sql
- ALTERED in 0003_shallow_quentin_quire.sql
- ALTERED in 0005_chief_luke_cage.sql
- ALTERED in 0016_agent_icon.sql
- ALTERED in 0032_pretty_doctor_octopus.sql

### `approval_comments`
- CREATED in 0005_chief_luke_cage.sql
- ALTERED in 0005_chief_luke_cage.sql
- INDEX approval_comments_company_idx in 0005_chief_luke_cage.sql
- INDEX approval_comments_approval_idx in 0005_chief_luke_cage.sql
- INDEX approval_comments_approval_created_idx in 0005_chief_luke_cage.sql

### `approvals`
- CREATED in 0000_mature_masked_marvel.sql
- ALTERED in 0000_mature_masked_marvel.sql
- INDEX approvals_company_status_type_idx in 0000_mature_masked_marvel.sql

### `assets`
- CREATED in 0010_stale_justin_hammer.sql
- ALTERED in 0010_stale_justin_hammer.sql
- INDEX assets_company_created_idx in 0010_stale_justin_hammer.sql
- INDEX assets_company_provider_idx in 0010_stale_justin_hammer.sql
- INDEX assets_company_object_key_uq in 0010_stale_justin_hammer.sql

### `board_api_keys`
- ALTERED in 0044_illegal_toad.sql
- INDEX board_api_keys_key_hash_idx in 0045_workable_shockwave.sql

### `budget_incidents`
- CREATED in 0032_pretty_doctor_octopus.sql
- ALTERED in 0032_pretty_doctor_octopus.sql
- INDEX budget_incidents_company_status_idx in 0032_pretty_doctor_octopus.sql
- INDEX budget_incidents_company_scope_idx in 0032_pretty_doctor_octopus.sql
- INDEX budget_incidents_policy_window_threshold_idx in 0032_pretty_doctor_octopus.sql
- INDEX budget_incidents_policy_window_threshold_idx in 0034_fat_dormammu.sql

### `budget_policies`
- CREATED in 0032_pretty_doctor_octopus.sql
- ALTERED in 0032_pretty_doctor_octopus.sql
- INDEX budget_policies_company_scope_active_idx in 0032_pretty_doctor_octopus.sql
- INDEX budget_policies_company_window_idx in 0032_pretty_doctor_octopus.sql
- INDEX budget_policies_company_scope_metric_unique_idx in 0032_pretty_doctor_octopus.sql

### `cli_auth_challenges`
- ALTERED in 0044_illegal_toad.sql

### `companies`
- CREATED in 0000_mature_masked_marvel.sql
- ALTERED in 0004_issue_identifiers.sql
- ALTERED in 0005_chief_luke_cage.sql
- INDEX companies_issue_prefix_idx in 0017_tiresome_gabe_jones.sql
- ALTERED in 0022_company_brand_color.sql
- ALTERED in 0033_shiny_black_tarantula.sql

### `company_logos`
- CREATED in 0030_rich_magneto.sql
- ALTERED in 0030_rich_magneto.sql
- INDEX company_logos_company_uq in 0030_rich_magneto.sql
- INDEX company_logos_asset_uq in 0030_rich_magneto.sql

### `company_memberships`
- CREATED in 0014_many_mikhail_rasputin.sql
- ALTERED in 0014_many_mikhail_rasputin.sql
- INDEX company_memberships_company_principal_unique_idx in 0014_many_mikhail_rasputin.sql
- INDEX company_memberships_principal_status_idx in 0014_many_mikhail_rasputin.sql
- INDEX company_memberships_company_status_idx in 0014_many_mikhail_rasputin.sql

### `company_secret_versions`
- CREATED in 0009_fast_jackal.sql
- ALTERED in 0009_fast_jackal.sql
- INDEX company_secret_versions_secret_idx in 0009_fast_jackal.sql
- INDEX company_secret_versions_value_sha256_idx in 0009_fast_jackal.sql
- INDEX company_secret_versions_secret_version_uq in 0009_fast_jackal.sql

### `company_secrets`
- CREATED in 0009_fast_jackal.sql
- ALTERED in 0009_fast_jackal.sql
- INDEX company_secrets_company_idx in 0009_fast_jackal.sql
- INDEX company_secrets_company_provider_idx in 0009_fast_jackal.sql
- INDEX company_secrets_company_name_uq in 0009_fast_jackal.sql

### `company_skills`
- ALTERED in 0042_spotty_the_renegades.sql

### `cost_events`
- CREATED in 0000_mature_masked_marvel.sql
- ALTERED in 0000_mature_masked_marvel.sql
- INDEX cost_events_company_occurred_idx in 0000_mature_masked_marvel.sql
- INDEX cost_events_company_agent_occurred_idx in 0000_mature_masked_marvel.sql
- ALTERED in 0031_zippy_magma.sql
- INDEX cost_events_company_provider_occurred_idx in 0031_zippy_magma.sql
- INDEX cost_events_company_biller_occurred_idx in 0031_zippy_magma.sql
- INDEX cost_events_company_heartbeat_run_idx in 0031_zippy_magma.sql

### `document_revisions`
- CREATED in 0028_harsh_goliath.sql
- ALTERED in 0028_harsh_goliath.sql
- INDEX document_revisions_document_revision_uq in 0028_harsh_goliath.sql
- INDEX document_revisions_company_document_created_idx in 0028_harsh_goliath.sql

### `documents`
- CREATED in 0028_harsh_goliath.sql
- ALTERED in 0028_harsh_goliath.sql
- INDEX documents_company_updated_idx in 0028_harsh_goliath.sql
- INDEX documents_company_created_idx in 0028_harsh_goliath.sql

### `execution_workspaces`
- CREATED in 0035_marvelous_satana.sql
- ALTERED in 0035_marvelous_satana.sql
- INDEX execution_workspaces_company_project_status_idx in 0035_marvelous_satana.sql
- INDEX execution_workspaces_company_project_workspace_status_idx in 0035_marvelous_satana.sql
- INDEX execution_workspaces_company_source_issue_idx in 0035_marvelous_satana.sql
- INDEX execution_workspaces_company_last_used_idx in 0035_marvelous_satana.sql
- INDEX execution_workspaces_company_branch_idx in 0035_marvelous_satana.sql

### `finance_events`
- CREATED in 0031_zippy_magma.sql
- ALTERED in 0031_zippy_magma.sql
- INDEX finance_events_company_occurred_idx in 0031_zippy_magma.sql
- INDEX finance_events_company_biller_occurred_idx in 0031_zippy_magma.sql
- INDEX finance_events_company_kind_occurred_idx in 0031_zippy_magma.sql
- INDEX finance_events_company_direction_occurred_idx in 0031_zippy_magma.sql
- INDEX finance_events_company_heartbeat_run_idx in 0031_zippy_magma.sql
- INDEX finance_events_company_cost_event_idx in 0031_zippy_magma.sql

### `goals`
- CREATED in 0000_mature_masked_marvel.sql
- ALTERED in 0000_mature_masked_marvel.sql
- INDEX goals_company_idx in 0000_mature_masked_marvel.sql

### `heartbeat_run_events`
- CREATED in 0001_fast_northstar.sql
- ALTERED in 0001_fast_northstar.sql
- INDEX heartbeat_run_events_run_seq_idx in 0001_fast_northstar.sql
- INDEX heartbeat_run_events_company_run_idx in 0001_fast_northstar.sql
- INDEX heartbeat_run_events_company_created_idx in 0001_fast_northstar.sql

### `heartbeat_runs`
- CREATED in 0000_mature_masked_marvel.sql
- ALTERED in 0000_mature_masked_marvel.sql
- INDEX heartbeat_runs_company_agent_started_idx in 0000_mature_masked_marvel.sql
- ALTERED in 0001_fast_northstar.sql
- ALTERED in 0002_big_zaladane.sql
- ALTERED in 0038_careless_iron_monger.sql

### `instance_settings`
- CREATED in 0036_cheerful_nitro.sql
- INDEX instance_settings_singleton_key_idx in 0036_cheerful_nitro.sql
- ALTERED in 0041_curly_maria_hill.sql
- ALTERED in 0044_illegal_toad.sql

### `instance_user_roles`
- CREATED in 0014_many_mikhail_rasputin.sql
- INDEX instance_user_roles_user_role_unique_idx in 0014_many_mikhail_rasputin.sql
- INDEX instance_user_roles_role_idx in 0014_many_mikhail_rasputin.sql

### `invites`
- CREATED in 0014_many_mikhail_rasputin.sql
- ALTERED in 0014_many_mikhail_rasputin.sql
- INDEX invites_token_hash_unique_idx in 0014_many_mikhail_rasputin.sql
- INDEX invites_company_invite_state_idx in 0014_many_mikhail_rasputin.sql

### `issue_approvals`
- CREATED in 0006_overjoyed_mister_sinister.sql
- ALTERED in 0006_overjoyed_mister_sinister.sql
- INDEX issue_approvals_issue_idx in 0006_overjoyed_mister_sinister.sql
- INDEX issue_approvals_approval_idx in 0006_overjoyed_mister_sinister.sql
- INDEX issue_approvals_company_idx in 0006_overjoyed_mister_sinister.sql

### `issue_attachments`
- CREATED in 0010_stale_justin_hammer.sql
- ALTERED in 0010_stale_justin_hammer.sql
- INDEX issue_attachments_company_issue_idx in 0010_stale_justin_hammer.sql
- INDEX issue_attachments_issue_comment_idx in 0010_stale_justin_hammer.sql
- INDEX issue_attachments_asset_uq in 0010_stale_justin_hammer.sql

### `issue_comments`
- CREATED in 0000_mature_masked_marvel.sql
- ALTERED in 0000_mature_masked_marvel.sql
- INDEX issue_comments_issue_idx in 0000_mature_masked_marvel.sql
- INDEX issue_comments_company_idx in 0000_mature_masked_marvel.sql
- INDEX issue_comments_company_issue_created_at_idx in 0024_far_beast.sql
- INDEX issue_comments_company_author_issue_created_at_idx in 0024_far_beast.sql

### `issue_documents`
- CREATED in 0028_harsh_goliath.sql
- ALTERED in 0028_harsh_goliath.sql
- INDEX issue_documents_company_issue_key_uq in 0028_harsh_goliath.sql
- INDEX issue_documents_document_uq in 0028_harsh_goliath.sql
- INDEX issue_documents_company_issue_updated_idx in 0028_harsh_goliath.sql

### `issue_inbox_archives`
- CREATED in 0045_workable_shockwave.sql
- ALTERED in 0045_workable_shockwave.sql
- INDEX issue_inbox_archives_company_issue_idx in 0045_workable_shockwave.sql
- INDEX issue_inbox_archives_company_user_idx in 0045_workable_shockwave.sql
- INDEX issue_inbox_archives_company_issue_user_idx in 0045_workable_shockwave.sql

### `issue_labels`
- CREATED in 0018_flat_sleepwalker.sql
- ALTERED in 0018_flat_sleepwalker.sql
- INDEX issue_labels_issue_idx in 0018_flat_sleepwalker.sql
- INDEX issue_labels_label_idx in 0018_flat_sleepwalker.sql
- INDEX issue_labels_company_idx in 0018_flat_sleepwalker.sql

### `issue_read_states`
- CREATED in 0025_nasty_salo.sql
- ALTERED in 0025_nasty_salo.sql
- INDEX issue_read_states_company_issue_idx in 0025_nasty_salo.sql
- INDEX issue_read_states_company_user_idx in 0025_nasty_salo.sql
- INDEX issue_read_states_company_issue_user_idx in 0025_nasty_salo.sql

### `issue_work_products`
- CREATED in 0035_marvelous_satana.sql
- ALTERED in 0035_marvelous_satana.sql
- INDEX issue_work_products_company_issue_type_idx in 0035_marvelous_satana.sql
- INDEX issue_work_products_company_execution_workspace_type_idx in 0035_marvelous_satana.sql
- INDEX issue_work_products_company_provider_external_id_idx in 0035_marvelous_satana.sql
- INDEX issue_work_products_company_updated_idx in 0035_marvelous_satana.sql

### `issues`
- CREATED in 0000_mature_masked_marvel.sql
- ALTERED in 0000_mature_masked_marvel.sql
- INDEX issues_company_status_idx in 0000_mature_masked_marvel.sql
- INDEX issues_company_assignee_status_idx in 0000_mature_masked_marvel.sql
- INDEX issues_company_parent_idx in 0000_mature_masked_marvel.sql
- INDEX issues_company_project_idx in 0000_mature_masked_marvel.sql
- ALTERED in 0004_issue_identifiers.sql
- INDEX issues_company_identifier_idx in 0004_issue_identifiers.sql
- ALTERED in 0008_amused_zzzax.sql
- ALTERED in 0012_perpetual_ser_duncan.sql
- ALTERED in 0013_dashing_wasp.sql
- ALTERED in 0014_many_mikhail_rasputin.sql
- INDEX issues_company_assignee_user_status_idx in 0014_many_mikhail_rasputin.sql
- INDEX issues_identifier_idx in 0017_tiresome_gabe_jones.sql
- ALTERED in 0021_chief_vindicator.sql
- ALTERED in 0027_tranquil_tenebrous.sql
- ALTERED in 0035_marvelous_satana.sql
- INDEX issues_company_project_workspace_idx in 0035_marvelous_satana.sql
- INDEX issues_company_execution_workspace_idx in 0035_marvelous_satana.sql
- ALTERED in 0039_fat_magneto.sql

### `join_requests`
- CREATED in 0014_many_mikhail_rasputin.sql
- ALTERED in 0014_many_mikhail_rasputin.sql
- INDEX join_requests_invite_unique_idx in 0014_many_mikhail_rasputin.sql
- INDEX join_requests_company_status_type_created_idx in 0014_many_mikhail_rasputin.sql
- ALTERED in 0023_fair_lethal_legion.sql

### `labels`
- CREATED in 0018_flat_sleepwalker.sql
- ALTERED in 0018_flat_sleepwalker.sql
- INDEX labels_company_idx in 0018_flat_sleepwalker.sql
- INDEX labels_company_name_idx in 0018_flat_sleepwalker.sql

### `plugin_company_settings`
- CREATED in 0029_plugin_tables.sql
- ALTERED in 0029_plugin_tables.sql
- INDEX plugin_company_settings_company_idx in 0029_plugin_tables.sql
- INDEX plugin_company_settings_plugin_idx in 0029_plugin_tables.sql
- INDEX plugin_company_settings_company_plugin_uq in 0029_plugin_tables.sql

### `plugin_config`
- CREATED in 0029_plugin_tables.sql
- ALTERED in 0029_plugin_tables.sql
- INDEX plugin_config_plugin_id_idx in 0029_plugin_tables.sql

### `plugin_entities`
- CREATED in 0029_plugin_tables.sql
- ALTERED in 0029_plugin_tables.sql
- INDEX plugin_entities_plugin_idx in 0029_plugin_tables.sql
- INDEX plugin_entities_type_idx in 0029_plugin_tables.sql
- INDEX plugin_entities_scope_idx in 0029_plugin_tables.sql
- INDEX plugin_entities_external_idx in 0029_plugin_tables.sql

### `plugin_job_runs`
- CREATED in 0029_plugin_tables.sql
- ALTERED in 0029_plugin_tables.sql
- INDEX plugin_job_runs_job_idx in 0029_plugin_tables.sql
- INDEX plugin_job_runs_plugin_idx in 0029_plugin_tables.sql
- INDEX plugin_job_runs_status_idx in 0029_plugin_tables.sql

### `plugin_jobs`
- CREATED in 0029_plugin_tables.sql
- ALTERED in 0029_plugin_tables.sql
- INDEX plugin_jobs_plugin_idx in 0029_plugin_tables.sql
- INDEX plugin_jobs_next_run_idx in 0029_plugin_tables.sql
- INDEX plugin_jobs_unique_idx in 0029_plugin_tables.sql

### `plugin_logs`
- CREATED in 0029_plugin_tables.sql
- ALTERED in 0029_plugin_tables.sql
- INDEX plugin_logs_plugin_time_idx in 0029_plugin_tables.sql
- INDEX plugin_logs_level_idx in 0029_plugin_tables.sql

### `plugin_state`
- CREATED in 0029_plugin_tables.sql
- ALTERED in 0029_plugin_tables.sql
- INDEX plugin_state_plugin_scope_idx in 0029_plugin_tables.sql

### `plugin_webhook_deliveries`
- CREATED in 0029_plugin_tables.sql
- ALTERED in 0029_plugin_tables.sql
- INDEX plugin_webhook_deliveries_plugin_idx in 0029_plugin_tables.sql
- INDEX plugin_webhook_deliveries_status_idx in 0029_plugin_tables.sql
- INDEX plugin_webhook_deliveries_key_idx in 0029_plugin_tables.sql

### `plugins`
- CREATED in 0029_plugin_tables.sql
- INDEX plugins_plugin_key_idx in 0029_plugin_tables.sql
- INDEX plugins_status_idx in 0029_plugin_tables.sql

### `principal_permission_grants`
- CREATED in 0014_many_mikhail_rasputin.sql
- ALTERED in 0014_many_mikhail_rasputin.sql
- INDEX principal_permission_grants_unique_idx in 0014_many_mikhail_rasputin.sql
- INDEX principal_permission_grants_company_permission_idx in 0014_many_mikhail_rasputin.sql

### `project_goals`
- CREATED in 0011_windy_corsair.sql
- ALTERED in 0011_windy_corsair.sql
- INDEX project_goals_project_idx in 0011_windy_corsair.sql
- INDEX project_goals_goal_idx in 0011_windy_corsair.sql
- INDEX project_goals_company_idx in 0011_windy_corsair.sql

### `project_workspaces`
- CREATED in 0019_public_victor_mancha.sql
- ALTERED in 0019_public_victor_mancha.sql
- INDEX project_workspaces_company_project_idx in 0019_public_victor_mancha.sql
- INDEX project_workspaces_project_primary_idx in 0019_public_victor_mancha.sql
- ALTERED in 0020_white_anita_blake.sql
- ALTERED in 0035_marvelous_satana.sql
- INDEX project_workspaces_project_source_type_idx in 0035_marvelous_satana.sql
- INDEX project_workspaces_company_shared_key_idx in 0035_marvelous_satana.sql
- INDEX project_workspaces_project_remote_ref_idx in 0035_marvelous_satana.sql

### `projects`
- CREATED in 0000_mature_masked_marvel.sql
- ALTERED in 0000_mature_masked_marvel.sql
- INDEX projects_company_idx in 0000_mature_masked_marvel.sql
- ALTERED in 0015_project_color_archived.sql
- ALTERED in 0027_tranquil_tenebrous.sql
- ALTERED in 0032_pretty_doctor_octopus.sql

### `routine_runs`
- ALTERED in 0039_fat_magneto.sql

### `routine_triggers`
- ALTERED in 0039_fat_magneto.sql

### `routines`
- ALTERED in 0039_fat_magneto.sql

### `session`
- CREATED in 0014_many_mikhail_rasputin.sql
- ALTERED in 0014_many_mikhail_rasputin.sql

### `user`
- CREATED in 0014_many_mikhail_rasputin.sql

### `verification`
- CREATED in 0014_many_mikhail_rasputin.sql

### `workspace_operations`
- CREATED in 0037_friendly_eddie_brock.sql
- ALTERED in 0037_friendly_eddie_brock.sql
- INDEX workspace_operations_company_run_started_idx in 0037_friendly_eddie_brock.sql
- INDEX workspace_operations_company_workspace_started_idx in 0037_friendly_eddie_brock.sql

### `workspace_runtime_services`
- CREATED in 0026_lying_pete_wisdom.sql
- ALTERED in 0026_lying_pete_wisdom.sql
- INDEX workspace_runtime_services_company_workspace_status_idx in 0026_lying_pete_wisdom.sql
- INDEX workspace_runtime_services_company_project_status_idx in 0026_lying_pete_wisdom.sql
- INDEX workspace_runtime_services_run_idx in 0026_lying_pete_wisdom.sql
- INDEX workspace_runtime_services_company_updated_idx in 0026_lying_pete_wisdom.sql
- ALTERED in 0035_marvelous_satana.sql
- INDEX workspace_runtime_services_company_execution_workspace_status_idx in 0035_marvelous_satana.sql

## ⚠️ Verwaiste Tabellen (in Migration, nicht im Schema)
- `account`
- `plugin_job_runs`
- `plugin_webhook_deliveries`
- `session`
- `verification`

## ⚠️ Verwaiste Schema-Dateien (im Schema, nicht in Migrations)
- `board_api_keys`
- `cli_auth_challenges`
- `company_skills`
- `plugin_webhooks`
- `routines`
