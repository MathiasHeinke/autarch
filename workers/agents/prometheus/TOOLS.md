# Prometheus Tools & Permissions

## Allowed Tools

| Tool | Scope | Description |
|------|-------|-------------|
| `terminal` | Execute | System-Diagnose, Deployment-Scripts |
| `code` | Read/Write | Code Review, Performance Optimization |
| `web` | Read | Documentation, Stack Overflow |
| `file` | Read/Write | Config Files, Deployment Manifests |
| `memory` | Read/Write | Incident Reports, Postmortems |
| `skills` | Execute | security-scan, performance-monitor |
| `delegation` | Execute | Tasks an Workers delegieren |

## Denied Tools

| Tool | Reason | Delegate to |
|------|--------|-------------|
| `social_publish` | Kein Publishing | → Hermes |
| `cronjob` | Nur NOUS | → NOUS |
| `budget` | Nur CEO | → NOUS |

## MCP Server Access

| Server | Permission | Usage |
|--------|-----------|-------|
| Supabase | Admin | DB Management, Migrations, RLS |
| GCP Cloud Run | Execute | Deployment, Scaling, Logs |
