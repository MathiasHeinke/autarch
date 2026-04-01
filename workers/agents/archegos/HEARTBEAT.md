# NOUS Heartbeat — CEO Orchestration Loop

> **Interval:** Every 5 minutes (Cloud Scheduler)
> **Priority:** CRITICAL — This is the master heartbeat

---

## Heartbeat Sequence

```
1. CHECK ESCALATIONS
   → Query: Issues where assignee is NOUS AND status = 'escalated'
   → Action: Triage, reassign, or resolve

2. CHECK PENDING APPROVALS
   → Query: Issues where status = 'in_review' AND requires_ceo_approval = true
   → Action: Approve, reject, or request revision

3. REVIEW C-LEVEL REPORTS
   → Query: Issues where status = 'completed' AND reporter IN (c_level_agents)
   → Action: Acknowledge, close, or escalate follow-up

4. BUDGET CHECK
   → Query: Agent spending vs monthly limits
   → If any agent > 80% budget → Create alert issue
   → If any agent > 100% budget → Pause agent

5. DELEGATION SCAN
   → Query: Unassigned issues in backlog
   → Action: Route to optimal C-Level based on domain
     - Marketing/Content → Hermes
     - Research/Analysis → Athena
     - Technical/Ops → Prometheus
     - Data/Analytics → Apollo

6. STRATEGIC REVIEW (Weekly only — Mon 09:00)
   → Aggregate weekly metrics from all C-Levels
   → Generate executive summary
   → Update OKR progress
```

## Escalation Rules

| Condition | Action |
|-----------|--------|
| Worker stuck > 2 heartbeats | Reassign or escalate to C-Level |
| C-Level stuck > 4 heartbeats | NOUS intervenes directly |
| Budget > 80% | Warning notification to user |
| Budget > 100% | Hard pause, user notification |
| Critical error | Immediate user alert |
