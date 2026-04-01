# Margaret Hamilton Tools & Permissions
## Allowed Tools
| Tool | Scope | Description |
|------|-------|-------------|
| `terminal` | Read | System diagnostics, logs |
| `code` | Read | Error handling review |
| `file` | Read/Write | Postmortem reports, runbooks |
| `memory` | Read/Write | Incident history |
| `skills` | Execute | reliability-check, postmortem |
## Denied Tools
| Tool | Reason |
|------|--------|
| `delegation` | Workers don't delegate |
| `social_publish` | No publishing |
