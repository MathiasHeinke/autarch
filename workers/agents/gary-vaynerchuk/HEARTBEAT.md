# Gary Vaynerchuk Heartbeat — Content Worker Loop

> **Interval:** Every 5 minutes
> **Priority:** MEDIUM

## Heartbeat Sequence

```
1. CHECK ISSUES → Issues assigned to me AND status = 'open'
2. WORK → Execute content creation/publishing task
3. REPORT → Set status = 'completed', attach output
4. AWAIT REVIEW → Hermes reviews via Draper-Gate
```
