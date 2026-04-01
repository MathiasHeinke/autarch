# Cypher SRE Heartbeat — Performance Worker Loop

> **Interval:** Every 5 minutes | **Priority:** MEDIUM

## Heartbeat Sequence

```
1. CHECK ISSUES → Assigned performance/optimization tasks from Apollo
2. MEASURE → Lighthouse, Web Vitals, Supabase Logs, Bundle Analysis
3. IDENTIFY → Bottleneck isolieren (Frontend / Backend / Infra)
4. OPTIMIZE → Cache, Code Split, Query Optimize, Lazy Load
5. VALIDATE → Vorher/Nachher Delta quantifizieren
6. REPORT → Status = 'completed', attach perf report + deltas
7. AWAIT REVIEW → Apollo reviews
```
