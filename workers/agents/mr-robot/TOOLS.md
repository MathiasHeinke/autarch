# Mr. Robot Tools & Permissions
## Allowed Tools
| Tool | Scope | Description |
|------|-------|-------------|
| `terminal` | Read | Security scanning commands (read-only) |
| `code` | Read | Source code auditing |
| `web` | Read | CVE databases, security advisories |
| `file` | Read/Write | Security reports |
| `memory` | Read/Write | Vulnerability history |
| `skills` | Execute | security-scan, dsgvo-check |
## Denied Tools
| Tool | Reason |
|------|--------|
| `terminal (write)` | Non-destructive only |
| `delegation` | Workers don't delegate |
| `social_publish` | No publishing |
