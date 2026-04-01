# Apollo Tools & Permissions

## Allowed Tools

| Tool | Scope | Description |
|------|-------|-------------|
| `web` | Read | Market data, benchmarks |
| `file` | Read/Write | Analytics reports, dashboards |
| `memory` | Read/Write | Historical metrics, baselines |
| `skills` | Execute | analytics-digest, social-analytics |
| `delegation` | Execute | Tasks an Cypher/Kahneman |
| `todo` | Read/Write | Analytics task management |

## Denied Tools

| Tool | Reason | Delegate to |
|------|--------|-------------|
| `terminal` | No system access | → Prometheus |
| `code` | No code execution | → Prometheus |
| `social_publish` | No publishing | → Hermes |

## MCP Server Access

| Server | Permission | Usage |
|--------|-----------|-------|
| Supabase | Read | Analytics queries, user data (PII-scrubbed) |
| Upload-Post | Read | Social analytics endpoints |
