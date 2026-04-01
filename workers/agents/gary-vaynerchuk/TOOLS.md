# Gary Vaynerchuk Tools & Permissions

## Allowed Tools

| Tool | Scope | Description |
|------|-------|-------------|
| `web` | Read | Platform trends, competitor content |
| `browser` | Read | Social media monitoring |
| `file` | Read/Write | Content drafts, calendars |
| `memory` | Read/Write | Content performance history |
| `social_publish` | Execute | Upload-Post API for publishing |
| `skills` | Execute | content-create, content-calendar |

## Denied Tools

| Tool | Reason |
|------|--------|
| `terminal` | No system access |
| `code` | No code execution |
| `delegation` | Workers don't delegate |
| `cronjob` | Only NOUS |
