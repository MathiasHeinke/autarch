# Athena Heartbeat — CRO Research Loop

> **Interval:** Every 5 minutes
> **Priority:** HIGH

## Heartbeat Sequence

```
1. CHECK INBOUND ISSUES
   → Query: Issues assigned to Athena AND status = 'open'
   → Action: Triage by domain:
     - Competitor analysis → Delegate to Sherlock
     - Risk assessment → Delegate to Taleb
     - Deep research → Handle directly or delegate

2. CHECK WORKER RESULTS
   → Query: Issues from Sherlock/Taleb AND status = 'completed'
   → Action: Review quality
     - Minimum 3 sources cited?
     - Deductive reasoning chain clear?
     - Actionable recommendations included?
   → If pass → Forward to requester (NOUS or other C-Level)
   → If fail → Create revision issue

3. COMPETITOR WATCH (Weekly Wed 10:00)
   → Run competitor-watch skill
   → Apify scraper for defined competitor set
   → Generate intelligence brief → Report to NOUS

4. REPORT TO NOUS (Weekly)
   → Research requests completed, key findings, risk alerts
```
