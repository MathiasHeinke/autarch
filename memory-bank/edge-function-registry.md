# 📦 Module Registry — Deep Research v4

> Generiert: 2026-04-01
> Total: 65 Services, 24 Routes, 7 Adapter-Packages, 40 Pages, 81 Components

## Server Services (Kern-Logik)

| Service | Zeilen | Größe | Exportierte Funktionen | DB-Tabellen |
|---------|--------|-------|------------------------|-------------|
| `company-portability.ts` | 4248 | 160.8KB | parseGitHubSourceUrl, companyPortabilityService | baseDir, targetCompany, entry, new +15 |
| `heartbeat.ts` | 4038 | 140.6KB | applyPersistedExecutionWorkspaceConfig, stripWorkspaceRuntimeFromExecutionRunConfig, buildRealizedExecutionWorkspaceFromPersisted, prioritizeProjectWorkspaceCandidatesForRun, buildExplicitResumeSessionOverride +5 | issues, agents, existingExecutionWorkspace, agentTaskSessions +7 |
| `company-skills.ts` | 2356 | 80.1KB | normalizeGitHubSkillDirectory, parseSkillImportSourceInput, readLocalSkillImportFromDirectory, discoverProjectWorkspaceSkillDirectories, findMissingLocalSkillIds +1 | companySkills, ambiguous, companyId, repoSkillDir +13 |
| `workspace-runtime.ts` | 2076 | 66.9KB | resetRuntimeServicesForTests, sanitizeRuntimeServiceBaseEnv, realizeExecutionWorkspace, cleanupExecutionWorkspaceArtifacts, normalizeAdapterManagedRuntimeServices +5 | runtimeServicesById, stableStringify, workspaceRuntimeServices, worktreeParentDir +3 |
| `plugin-loader.ts` | 1955 | 68.4KB | NPM_PLUGIN_PACKAGE_PREFIX, DEFAULT_LOCAL_PLUGIN_DIR, isPluginPackageName, getPluginUiContributionMetadata, pluginLoader | localPluginDir, os, nodeModulesDir, scanDir +7 |
| `issues.ts` | 1923 | 67.3KB | normalizeAgentMentionToken, deriveIssueUserContext, issueService | issues, agents, issueDocuments, labels +12 |
| `plugin-worker-manager.ts` | 1343 | 39.7KB | appendStderrExcerpt, formatWorkerFailureMessage, createPluginWorkerHandle, createPluginWorkerManager | workers |
| `routines.ts` | 1269 | 46.6KB | routineService | issues, expectedHmac, agents, expected +10 |
| `plugin-host-services.ts` | 1132 | 40.7KB | flushPluginLogBuffer, buildHostServices | chunk, agentTaskSessionsTable, activeSubscriptions, params |
| `budgets.ts` | 959 | 30.9KB | budgetService | approvals, agents, costEvents, projects +3 |
| `projects.ts` | 880 | 30.7KB | resolveProjectNameForUniqueShortname, projectService | runtimeServicesByWorkspaceId, projectGoals, projects, projectWorkspaces +1 |
| `plugin-lifecycle.ts` | 822 | 28.3KB | pluginLifecycleManager | — |
| `plugin-job-scheduler.ts` | 753 | 21.3KB | createPluginJobScheduler | pluginJobRuns, pluginJobs |
| `agent-instructions.ts` | 736 | 25.6KB | syncInstructionsBundleConfigFromFilePath, agentInstructionsService | resolveManagedInstructionsRoot, currentPath, relativeDir |
| `agents.ts` | 694 | 22.9KB | hasAgentShortnameCollision, deduplicateAgentName, agentService | agents, token, costEvents, agentApiKeys +2 |
| `plugin-registry.ts` | 683 | 20.4KB | pluginRegistryService | pluginConfig, pluginJobRuns, pluginJobs, pluginWebhookDeliveries +2 |
| `execution-workspaces.ts` | 644 | 24.1KB | readExecutionWorkspaceConfig, mergeExecutionWorkspaceConfig, executionWorkspaceService | issues, projects, projectWorkspaces, workspaceRuntimeServices +1 |
| `plugin-job-store.ts` | 466 | 13.8KB | pluginJobStore | pluginJobRuns, pluginJobs, plugins |
| `plugin-capability-validator.ts` | 450 | 14.1KB | pluginCapabilityValidator | — |
| `plugin-tool-registry.ts` | 450 | 14.7KB | TOOL_NAMESPACE_SEPARATOR, createPluginToolRegistry | byNamespace |
| `plugin-tool-dispatcher.ts` | 449 | 14.8KB | createPluginToolDispatcher | — |
| `documents.ts` | 434 | 16.1KB | extractLegacyPlanBody, documentService | issueDocuments, issues, documentRevisions, documents |
| `plugin-event-bus.ts` | 413 | 15.0KB | createPluginEventBus | — |
| `access.ts` | 381 | 11.1KB | accessService | instanceUserRoles, principalPermissionGrants, companyMemberships |
| `cron.ts` | 374 | 10.8KB | parseCron, validateCron, nextCronTick, nextCronTickFromExpression | — |
| `secrets.ts` | 370 | 12.5KB | secretService | companySecretVersions, companySecrets |
| `costs.ts` | 365 | 16.2KB | costService | activityLog, issues, agents, runProjectLinks +4 |
| `board-auth.ts` | 355 | 11.5KB | BOARD_API_KEY_TTL_MS, CLI_AUTH_CHALLENGE_TTL_MS, hashBearerToken, tokenHashesMatch, createBoardApiToken +4 | cliAuthChallenges, companyIds, boardApiKeys, token +6 |
| `plugin-secrets-handler.ts` | 355 | 12.2KB | extractSecretRefsFromConfig, createPluginSecretsHandler | pluginConfig, companySecretVersions, companySecrets |
| `plugin-dev-watcher.ts` | 340 | 10.3KB | resolvePluginWatchTargets, createPluginDevWatcher | dirPath, absPath |
| `companies.ts` | 313 | 10.9KB | companyService | issues, agents, costEvents, companyLogos +2 |
| `local-service-supervisor.ts` | 303 | 9.5KB | createLocalServiceKey, writeLocalServiceRegistryRecord, removeLocalServiceRegistryRecord, readLocalServiceRegistryRecord, listLocalServiceRegistryRecords +5 | stableStringify |
| `approvals.ts` | 273 | 9.4KB | approvalService | approvals, approvalComments, canResolveStatuses |
| `workspace-operations.ts` | 262 | 9.5KB | workspaceOperationService | workspaceOperations |
| `plugin-job-coordinator.ts` | 261 | 8.1KB | createPluginJobCoordinator | — |
| `plugin-state-store.ts` | 238 | 7.6KB | pluginStateStore | pluginState, plugins |
| `plugin-runtime-sandbox.ts` | 222 | 7.4KB | PluginSandboxError, createCapabilityScopedInvoker, loadPluginModuleInSandbox | — |
| `execution-workspace-policy.ts` | 210 | 8.7KB | parseProjectExecutionWorkspacePolicy, gateProjectExecutionWorkspacePolicy, parseIssueExecutionWorkspaceSettings, defaultIssueExecutionWorkspaceSettingsForProject, issueExecutionWorkspaceModeForPersistedWorkspace +2 | — |
| `issue-approvals.ts` | 175 | 5.6KB | issueApprovalService | issues, new, issueApprovals, approvals |
| `company-export-readme.ts` | 173 | 5.3KB | generateOrgChartMermaid, generateReadme | — |
| `activity.ts` | 164 | 4.9KB | activityService | activityLog, heartbeatRuns, issues |
| `plugin-manifest-validator.ts` | 164 | 4.8KB | pluginManifestValidator | — |
| `run-log-store.ts` | 157 | 4.9KB | getRunLogStore | chunk, companyId, relDir |
| `workspace-operation-log-store.ts` | 157 | 5.2KB | getWorkspaceOperationLogStore | chunk, relDir |
| `instance-settings.ts` | 138 | 4.1KB | instanceSettingsService | instanceSettings, companies |
| `finance.ts` | 135 | 5.3KB | financeService | table, financeEvents |
| `work-products.ts` | 124 | 4.0KB | workProductService | issueWorkProducts |
| `hire-hook.ts` | 114 | 3.3KB | notifyHireApproved | agents |
| `dashboard.ts` | 110 | 3.6KB | dashboardService | issues, approvals, agents, costEvents +1 |
| `activity-log.ts` | 95 | 3.1KB | setPluginEventBus, logActivity | — |
| `plugin-log-retention.ts` | 87 | 2.4KB | prunePluginLogs, startPluginLogRetention | — |
| `plugin-stream-bus.ts` | 82 | 2.2KB | createPluginStreamBus | — |
| `goals.ts` | 81 | 2.1KB | getDefaultCompanyGoal, goalService | goals |
| `quota-windows.ts` | 65 | 1.9KB | fetchAllQuotaWindows | — |
| `plugin-host-service-cleanup.ts` | 60 | 1.5KB | createPluginHostServiceCleanup | — |
| `project-workspace-runtime-config.ts` | 60 | 2.1KB | readProjectWorkspaceRuntimeConfig, mergeProjectWorkspaceRuntimeConfig | — |
| `issue-goal-fallback.ts` | 57 | 1.5KB | resolveIssueGoalId, resolveNextIssueGoalId | — |
| `sidebar-badges.ts` | 56 | 1.8KB | sidebarBadgeService | approvals, agents, heartbeatRuns |
| `live-events.ts` | 55 | 1.4KB | publishLiveEvent, publishGlobalLiveEvent, subscribeCompanyLiveEvents, subscribeGlobalLiveEvents | — |
| `plugin-config-validator.ts` | 55 | 1.9KB | validateInstanceConfig | — |
| `issue-assignment-wakeup.ts` | 49 | 1.6KB | queueIssueAssignmentWakeup | — |
| `heartbeat-run-summary.ts` | 36 | 1.1KB | summarizeHeartbeatRunResultJson | — |
| `agent-permissions.ts` | 28 | 0.7KB | defaultPermissionsForRole, normalizeAgentPermissions | — |
| `default-agent-instructions.ts` | 28 | 1.0KB | loadDefaultAgentInstructionsBundle, resolveDefaultAgentInstructionsBundleRole | — |
| `assets.ts` | 23 | 0.5KB | assetService | assets |

**Total Services Lines:** 36,323

## Server Routes (API Surface)

| Route | Zeilen | HTTP-Methoden | Exportierte Handler |
|-------|--------|---------------|---------------------|
| `access.ts` | 2941 | get, patch, post, put | companyInviteExpiresAt, buildJoinDefaultsPayloadForAccept, mergeJoinDefaultsPayloadForReplay, canReplayOpenClawGatewayInviteAccept, normalizeAgentDefaultsForJoin |
| `agents.ts` | 2340 | delete, get, patch, post, put | agentRoutes |
| `plugins.ts` | 2220 | delete, get, post | pluginRoutes |
| `issues.ts` | 1777 | delete, get, patch, post, put | issueRoutes |
| `org-chart-svg.ts` | 778 | — | ORG_CHART_STYLES, renderOrgChartSvg, renderOrgChartPng |
| `plugin-ui-static.ts` | 497 | get | resolvePluginUiDir, pluginUiStaticRoutes |
| `projects.ts` | 436 | delete, get, patch, post | projectRoutes |
| `execution-workspaces.ts` | 413 | get, patch, post | executionWorkspaceRoutes |
| `approvals.ts` | 346 | get, post | approvalRoutes |
| `companies.ts` | 343 | delete, get, patch, post | companyRoutes |
| `assets.ts` | 341 | get, post | assetRoutes |
| `costs.ts` | 335 | get, patch, post | costRoutes |
| `routines.ts` | 300 | delete, get, patch, post | routineRoutes |
| `company-skills.ts` | 284 | delete, get, patch, post | companySkillRoutes |
| `secrets.ts` | 166 | delete, get, patch, post | secretRoutes |
| `goals.ts` | 107 | delete, get, patch, post | goalRoutes |
| `health.ts` | 105 | get | healthRoutes |
| `instance-settings.ts` | 95 | get, patch | instanceSettingsRoutes |
| `activity.ts` | 89 | get, post | activityRoutes |
| `llms.ts` | 86 | get | llmRoutes |
| `authz.ts` | 53 | — | assertBoard, assertInstanceAdmin, assertCompanyAccess, getActorInfo |
| `sidebar-badges.ts` | 52 | get | sidebarBadgeRoutes |
| `dashboard.ts` | 19 | get | dashboardRoutes |
| `issues-checkout-wakeup.ts` | 15 | — | shouldWakeAssigneeOnCheckout |

## Adapter Packages

| Adapter | Total Lines | Paket-Pfad |
|---------|-------------|------------|
| `codex-local` | 2593 | `packages/adapters/codex-local/` |
| `claude-local` | 2276 | `packages/adapters/claude-local/` |
| `pi-local` | 2164 | `packages/adapters/pi-local/` |
| `cursor-local` | 2030 | `packages/adapters/cursor-local/` |
| `openclaw-gateway` | 1954 | `packages/adapters/openclaw-gateway/` |
| `opencode-local` | 1902 | `packages/adapters/opencode-local/` |
| `gemini-local` | 1766 | `packages/adapters/gemini-local/` |

## Hermes Cloud Adapter (Server-Side Bridge)

| Datei | Zeilen | Größe | Exporte | Zweck |
|-------|--------|-------|---------|-------|
| `execute.ts` | 155 | 5.5KB | execute | HTTP Bridge zum Worker |
| `honcho-client.ts` | 197 | 5.6KB | ingestRunConversation, queryAgentInsights, getContext | Cross-Session Reasoning Client |
| `index.ts` | 40 | 1.6KB | hermesCloudAdapter | Adapter Registration |
| `memory-lifecycle.ts` | 142 | 3.9KB | loadAgentMemories, persistNewMemories | Memory Load/Persist |
| `pii-scrub.ts` | 56 | 1.6KB | scrubPii, scrubContextMessages | PII-Scrubbing vor Dispatch |
| `test.ts` | 74 | 2.1KB | testEnvironment | Integration Test |

## Hermes Cloud Worker (Python)

| Datei | Zeilen | Größe | Zweck |
|-------|--------|-------|-------|
| `config.py` | 25 | 0.8KB | Security Config (toolset blocklist) |
| `main.py` | 290 | 10.8KB | FastAPI Stateless Inference Engine |
| `models.py` | 78 | 2.7KB | Pydantic Request/Response Schemas |

## UI Pages

| Page | Zeilen | Größe |
|------|--------|-------|
| `AgentDetail.tsx` | 4078 | 158.7KB |
| `Inbox.tsx` | 1579 | 57.4KB |
| `IssueDetail.tsx` | 1412 | 52.4KB |
| `CompanyImport.tsx` | 1354 | 48.9KB |
| `DesignGuide.tsx` | 1330 | 54.2KB |
| `CompanySkills.tsx` | 1170 | 42.9KB |
| `Costs.tsx` | 1102 | 47.9KB |
| `RoutineDetail.tsx` | 1021 | 40.4KB |
| `CompanyExport.tsx` | 1018 | 36.1KB |
| `ProjectDetail.tsx` | 947 | 36.4KB |
| `ExecutionWorkspaceDetail.tsx` | 867 | 40.4KB |
| `PluginSettings.tsx` | 836 | 34.2KB |
| `ProjectWorkspaceDetail.tsx` | 673 | 29.8KB |
| `CompanySettings.tsx` | 668 | 24.3KB |
| `Routines.tsx` | 666 | 29.0KB |
| `PluginManager.tsx` | 509 | 21.7KB |
| `OrgChart.tsx` | 447 | 14.9KB |
| `Agents.tsx` | 415 | 15.7KB |
| `Dashboard.tsx` | 387 | 15.0KB |
| `ApprovalDetail.tsx` | 368 | 14.6KB |
| `NewAgent.tsx` | 354 | 12.8KB |
| `RunTranscriptUxLab.tsx` | 334 | 13.8KB |
| `InviteLanding.tsx` | 330 | 13.7KB |
| `Companies.tsx` | 297 | 11.2KB |
| `InstanceSettings.tsx` | 283 | 11.0KB |
| `GoalDetail.tsx` | 196 | 6.4KB |
| `CliAuth.tsx` | 184 | 6.9KB |
| `Auth.tsx` | 180 | 6.8KB |
| `PluginPage.tsx` | 156 | 5.4KB |
| `Activity.tsx` | 140 | 4.4KB |
| `InstanceExperimentalSettings.tsx` | 139 | 5.5KB |
| `Approvals.tsx` | 132 | 4.8KB |
| `Org.tsx` | 132 | 3.7KB |
| `BoardClaim.tsx` | 125 | 4.5KB |
| `Issues.tsx` | 117 | 4.1KB |
| `InstanceGeneralSettings.tsx` | 104 | 3.8KB |
| `Projects.tsx` | 87 | 2.8KB |
| `MyIssues.tsx` | 72 | 2.3KB |
| `NotFound.tsx` | 66 | 2.4KB |
| `Goals.tsx` | 63 | 1.9KB |

**Total UI Pages Lines:** 24,338

## UI Components (Top 30 by size)

| Component | Zeilen | Größe |
|-----------|--------|-------|
| `AgentConfigForm.tsx` | 1634 | 61.8KB |
| `NewIssueDialog.tsx` | 1475 | 58.5KB |
| `OnboardingWizard.tsx` | 1403 | 55.8KB |
| `ProjectProperties.tsx` | 1126 | 44.7KB |
| `JsonSchemaForm.tsx` | 1048 | 27.0KB |
| `IssueDocumentsSection.tsx` | 891 | 34.1KB |
| `IssuesList.tsx` | 888 | 37.9KB |
| `MarkdownEditor.tsx` | 624 | 20.7KB |
| `IssueProperties.tsx` | 620 | 22.1KB |
| `CommentThread.tsx` | 604 | 20.7KB |
| `agent-config-primitives.tsx` | 480 | 16.3KB |
| `NewProjectDialog.tsx` | 450 | 16.5KB |
| `IssueWorkspaceCard.tsx` | 445 | 17.2KB |
| `Layout.tsx` | 441 | 15.8KB |
| `ProviderQuotaCard.tsx` | 416 | 17.2KB |
| `AsciiArtAnimation.tsx` | 348 | 10.5KB |
| `ScheduleEditor.tsx` | 344 | 11.0KB |
| `CompanyRail.tsx` | 329 | 11.0KB |
| `PackageFileTree.tsx` | 318 | 10.8KB |
| `ExecutionWorkspaceCloseDialog.tsx` | 314 | 14.3KB |
| `NewGoalDialog.tsx` | 282 | 9.9KB |
| `KanbanBoard.tsx` | 274 | 7.2KB |
| `ActivityCharts.tsx` | 263 | 9.8KB |
| `NewAgentDialog.tsx` | 255 | 7.9KB |
| `InlineEditor.tsx` | 248 | 6.9KB |
| `CommandPalette.tsx` | 239 | 7.6KB |
| `SidebarProjects.tsx` | 234 | 7.6KB |
| `BudgetPolicyCard.tsx` | 219 | 9.0KB |
| `CompanyPatternIcon.tsx` | 212 | 6.0KB |
| `InlineEntitySelector.tsx` | 206 | 7.4KB |

**Total UI Components Lines:** 21,252 (81 files)

## ⚠️ Monster Files (>1000 Zeilen)

| Datei | Zeilen | Bereich |
|-------|--------|---------|
| `server/src/services/company-portability.ts` | 4248 | services |
| `ui/src/pages/AgentDetail.tsx` | 4078 | ui-pages |
| `server/src/services/heartbeat.ts` | 4038 | services |
| `server/src/routes/access.ts` | 2941 | routes |
| `server/src/services/company-skills.ts` | 2356 | services |
| `server/src/routes/agents.ts` | 2340 | routes |
| `server/src/routes/plugins.ts` | 2220 | routes |
| `server/src/services/workspace-runtime.ts` | 2076 | services |
| `server/src/services/plugin-loader.ts` | 1955 | services |
| `server/src/services/issues.ts` | 1923 | services |
| `server/src/routes/issues.ts` | 1777 | routes |
| `ui/src/components/AgentConfigForm.tsx` | 1634 | ui-components |
| `ui/src/pages/Inbox.tsx` | 1579 | ui-pages |
| `ui/src/components/NewIssueDialog.tsx` | 1475 | ui-components |
| `ui/src/pages/IssueDetail.tsx` | 1412 | ui-pages |
| `ui/src/components/OnboardingWizard.tsx` | 1403 | ui-components |
| `ui/src/pages/CompanyImport.tsx` | 1354 | ui-pages |
| `server/src/services/plugin-worker-manager.ts` | 1343 | services |
| `ui/src/pages/DesignGuide.tsx` | 1330 | ui-pages |
| `server/src/services/routines.ts` | 1269 | services |
| `ui/src/pages/CompanySkills.tsx` | 1170 | ui-pages |
| `server/src/services/plugin-host-services.ts` | 1132 | services |
| `ui/src/components/ProjectProperties.tsx` | 1126 | ui-components |
| `ui/src/pages/Costs.tsx` | 1102 | ui-pages |
| `ui/src/components/JsonSchemaForm.tsx` | 1048 | ui-components |
| `ui/src/pages/RoutineDetail.tsx` | 1021 | ui-pages |
| `ui/src/pages/CompanyExport.tsx` | 1018 | ui-pages |
