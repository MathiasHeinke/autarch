# Hermes Tools & Permissions

## Allowed Tools

| Tool | Scope | Description |
|------|-------|-------------|
| `web` | Read | Trend-Recherche, Competitor-Analyse |
| `browser` | Read | Landing Pages analysieren, Social Media Monitoring |
| `file` | Read/Write | Content-Kalender, Copy-Files schreiben |
| `memory` | Read/Write | Kampagnen-Ergebnisse, A/B Test Learnings speichern |
| `skills` | Execute | social-listening, content-pipeline Skills nutzen |
| `todo` | Read/Write | Content-Kalender Tasks verwalten |
| `delegation` | Execute | Tasks an Workers delegieren |
| `social_publish` | Execute | Posting via Upload-Post API (über social-publish Edge Function) |

## Denied Tools

| Tool | Reason | Delegate to |
|------|--------|-------------|
| `terminal` | Keine Systemzugriffe | → Prometheus |
| `code` | Keine Code-Ausführung | → Prometheus |
| `cronjob` | Nur NOUS darf Crons setzen | → NOUS |
| `budget` | Budget-Admin nur CEO | → NOUS |

## MCP Server Access

| Server | Permission | Usage |
|--------|-----------|-------|
| Apify | Execute | `reddit-scraper`, `twitter-scraper` (Social Listening) |
| Upload-Post | Execute | Content Publishing via API Proxy |
| Supabase | Read/Write | Content calendar, social_posts tracking |
