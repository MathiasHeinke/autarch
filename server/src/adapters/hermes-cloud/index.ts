import type { ServerAdapterModule } from "../types.js";
import { execute } from "./execute.js";
import { testEnvironment } from "./test.js";

export const hermesCloudAdapter: ServerAdapterModule = {
  type: "hermes_cloud",
  execute,
  testEnvironment,
  models: [
    { id: "hermes-4-405b", label: "Hermes 4 405B" },
    { id: "hermes-4-70b", label: "Hermes 4 70B" },
    { id: "hermes-3-8b", label: "Hermes 3 8B" },
  ],
  supportsLocalAgentJwt: false,
  agentConfigurationDoc: `# hermes_cloud agent configuration

Adapter: hermes_cloud

Cloud-based Hermes agent execution via Cloud Run worker.
No local installation required — agents run on managed infrastructure.

Core fields:
- workerUrl (string, optional): Cloud Run worker endpoint URL (falls back to HERMES_CLOUD_WORKER_URL env)
- model (string, optional): Hermes model id (hermes-4-405b | hermes-4-70b | hermes-3-8b)
- maxIterations (number, optional): max agent iterations per run (default: 20, hard cap: 50)
- costCapPerRun (number, optional): maximum cost in USD per run (default: 5.00)
- learnerBudget (number, optional): separate budget for post-run auto-learning extraction (default: 0.50)
- enabledToolsets (string[], optional): allowed tool categories:
  - web: web search and browsing
  - file: file read/write operations
  - memory: cross-session memory persistence
  - delegate_task: task delegation to sub-agents
  - todo: task list management
  - skills: autonomous skill acquisition (agentskills.io format)
  - vision: image analysis and understanding
  - session_search: search across past sessions
  - mcp: MCP server tools (Apify, etc.)
- profileName (string, optional): Hermes profile name for tenant isolation (auto-generated from company)
- systemPrompt (string, optional): custom system prompt for the agent

Security:
- Terminal and process toolsets are BLOCKED and cannot be enabled
- PII is scrubbed from messages before they reach the worker
- Cost cap is enforced both in the adapter and on the worker side

MCP Integration:
- Apify: web scraping, data extraction, social monitoring via MCP server
- Cohere Transcribe: self-hosted ASR (525min/min throughput, Apache 2.0)

Operational fields:
- timeoutMs (number, optional): request timeout in milliseconds (default: 300000 = 5min)
`,
};
