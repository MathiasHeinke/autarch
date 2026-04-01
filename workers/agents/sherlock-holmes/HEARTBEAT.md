# Sherlock Holmes Heartbeat — Audit Worker Loop

> **Interval:** Every 5 minutes | **Priority:** MEDIUM

## Heartbeat Sequence
```
1. CHECK ISSUES → Assigned audit/analysis tasks
2. WORK → Execute deductive analysis, document evidence chain
3. REPORT → Status = 'completed', attach findings report
4. AWAIT REVIEW → Athena reviews for completeness
```
