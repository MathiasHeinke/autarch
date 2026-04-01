# Athena Tools & Permissions

## Allowed Tools

| Tool | Scope | Description |
|------|-------|-------------|
| `web` | Read | Deep Research, Google Scholar, PubMed |
| `browser` | Read | Competitor Websites, Social Profiles analysieren |
| `file` | Read/Write | Research Reports, Intelligence Briefs |
| `memory` | Read/Write | Research Findings, Competitor Profiles |
| `skills` | Execute | deep-research, competitor-watch, longevity-research |
| `todo` | Read/Write | Research Task Management |
| `delegation` | Execute | Tasks an Sherlock/Taleb delegieren |

## Denied Tools

| Tool | Reason | Delegate to |
|------|--------|-------------|
| `terminal` | Keine Systemzugriffe | → Prometheus |
| `code` | Keine Code-Ausführung | → Prometheus |
| `social_publish` | Kein Publishing | → Hermes |
| `cronjob` | Nur NOUS | → NOUS |

## MCP Server Access

| Server | Permission | Usage |
|--------|-----------|-------|
| Apify | Execute | `google-search-scraper`, `reddit-scraper` |
| Supabase | Read/Write | Research storage, knowledge bases |
