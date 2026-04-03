import type { ServerAdapterModule } from "../types.js";
import { execute } from "./execute.js";
import { testEnvironment } from "./test.js";

export const hermesCloudAdapter: ServerAdapterModule = {
  type: "hermes_cloud",
  execute,
  testEnvironment,
  models: [
    { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro (via Hermes)" },
    { id: "gemini-3-flash-preview", label: "Gemini 3 Flash (via Hermes)" },
  ],
  supportsLocalAgentJwt: false,
  agentConfigurationDoc: `# hermes_cloud agent configuration

Adapter: hermes_cloud (v0.7.0 — Gemini backend)

Cloud-based Hermes agent execution via Cloud Run worker.
No local installation required — agents run on managed infrastructure.
Inference: Gemini 3.1 Pro (complex tasks) + Gemini 3 Flash (simple tasks) via hermes-agent library.

Core fields:
- workerUrl (string, optional): Cloud Run worker endpoint URL (falls back to HERMES_CLOUD_WORKER_URL env)
- model (string, optional): Model id — set explicitly to override auto-routing:
  - gemini-3.1-pro-preview: Complex reasoning, code, multi-step tasks
  - gemini-3-flash-preview: Fast responses, simple Q&A, status updates
  If omitted, the adapter auto-routes based on task complexity.
- maxIterations (number, optional): max agent iterations per run (default: 20, hard cap: 50)
- costCapPerRun (number, optional): maximum cost in USD per run (default: 5.00)
- learnerBudget (number, optional): separate budget for post-run auto-learning extraction (default: 0.50)
- enabledToolsets (string[], optional): allowed tool categories:
  - web: web search and browsing
  - file: file read/write operations
  - memory: cross-session memory persistence
  - delegate_task: task delegation to sub-agents
  - hire_employee: autonomous creation of sub-agents with specific skills
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
