# Cypher SRE Tools & Permissions

## Allowed Tools

| Tool | Scope | Description |
|------|-------|-------------|
| `terminal` | Execute | Lighthouse, bundle-analyzer, profiling, benchmarks |
| `code` | Read/Write | Performance optimizations, caching configs |
| `web` | Read | Cloud dashboards, Supabase dashboard |
| `browser` | Read | DevTools Network/Performance tabs |
| `file` | Read/Write | Performance reports, budgets, baselines |
| `memory` | Read/Write | Performance baselines, optimization history |
| `skills` | Execute | perf-audit, cache-strategy, bundle-optimize, query-optimize, cost-monitor |

## Denied Tools

| Tool | Reason |
|------|--------|
| `delegation` | Workers don't delegate |
| `social_publish` | No publishing |
