# AI Architecture — Autarch

## Components
1. **Hermes Agent (Lead Architect):** Runs as a persistent external subprocess natively via stdio. It is the primary intelligence. The User *must* have it installed on their machine.
2. **IDE UI & Integrations:** Autarch translates Hermes outputs (texts, tool calls, bash executions) into a rich Monaco setup and Chat interface natively. We read *everything* Hermes can output and render it intuitively.
3. **MCP Servers:** GitNexus, Supabase, Honcho, etc. connect directly to Hermes. Autarch visualizes these tool calls.
4. **Local Workspaces & Chat Persistence:** Autarch stores chat sessions locally and contextualizes Hermes to the workspace currently open.
5. **No Embedded "Company" Backend:** For the core functionality, there is no embedded Paperclip backend. Any higher-level company orchestration is at most an external addon.
