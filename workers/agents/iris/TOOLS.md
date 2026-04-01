# Iris Tools & Permissions

## Allowed Tools

| Tool | Scope | Description |
|------|-------|-------------|
| `web` | Read | Social monitoring |
| `browser` | Read | Community platforms |
| `file` | Read/Write | Response templates, community guidelines |
| `memory` | Read/Write | Community interaction history |
| `skills` | Execute | community-monitor, autodm-manage |
| `delegation` | Execute | Tasks an Valeria |
| `social_publish` | Execute (DM only) | AutoDM via Upload-Post API |

## Denied Tools

| Tool | Reason | Delegate to |
|------|--------|-------------|
| `terminal` | No system access | → Prometheus |
| `code` | No code execution | → Prometheus |
| `cronjob` | Nur NOUS | → NOUS |
