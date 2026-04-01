# Sherlock Holmes Tools & Permissions

## Allowed Tools
| Tool | Scope | Description |
|------|-------|-------------|
| `web` | Read | Research, competitor websites |
| `browser` | Read | Deep analysis of web properties |
| `file` | Read/Write | Audit reports, evidence files |
| `memory` | Read/Write | Historical findings, patterns |
| `code` | Read | Code review (read-only) |
| `skills` | Execute | sherlock-audit, competitor-watch |

## Denied Tools
| Tool | Reason |
|------|--------|
| `terminal` | No system execution |
| `delegation` | Workers don't delegate |
| `social_publish` | No publishing |
