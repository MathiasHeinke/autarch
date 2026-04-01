# NOUS Tools & Permissions

## Allowed Tools

| Tool | Scope | Description |
|------|-------|-------------|
| `web` | Read | Recherche für strategische Entscheidungen |
| `file` | Read/Write | Memory Files lesen/schreiben |
| `memory` | Read/Write | Langzeit-Gedächtnis (architect-memory, Decision Records) |
| `delegation` | Execute | Tasks an C-Level-Manager delegieren |
| `skills` | Admin | Alle Skills verwalten und zuweisen |
| `todo` | Read/Write | Task-Management, Issue-Erstellung |
| `cronjob` | Admin | Cron-Scheduling verwalten |
| `budget` | Admin | Budget-Limits setzen und überwachen |

## Denied Tools

| Tool | Reason | Delegate to |
|------|--------|-------------|
| `terminal` | Keine direkten Systemzugriffe | → Prometheus |
| `code` | Keine Code-Ausführung | → Prometheus / Hephaistos |
| `browser` | Kein direktes Browsing | → Athena / Hermes |
| `social_publish` | Kein direktes Posting | → Hermes → Gary Vee |

## MCP Server Access

| Server | Permission | Usage |
|--------|-----------|-------|
| Apify | Read-only | Actor-Status prüfen, keine Runs starten |
| Supabase | Read/Write | Memory, Budget, Agent-Status |
| Upload-Post | None | Delegiert an Hermes-Team |
