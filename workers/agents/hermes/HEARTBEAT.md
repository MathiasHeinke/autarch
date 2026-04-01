# Hermes Heartbeat — CMO Marketing Loop

> **Interval:** Every 5 minutes
> **Priority:** HIGH

---

## Heartbeat Sequence

```
1. CHECK INBOUND ISSUES
   → Query: Issues assigned to Hermes AND status = 'open'
   → Action: Triage by domain:
     - Content request → Delegate to Gary Vee or Don Draper
     - Visual/Video → Delegate to Hephaistos
     - Community → Delegate to Iris
     - Strategy → Handle directly with <think> reasoning

2. CHECK WORKER RESULTS
   → Query: Issues from managed workers AND status = 'completed'
   → Action: Review quality
     - Pass Draper-Gate? (Brand Voice check)
     - Pass Hormozi-Check? (Value Equation ≥ 2.5)
     - Pass Kahneman-Filter? (No Dark Patterns)
   → If pass → Approve → Move to publishing queue
   → If fail → Create revision issue back to worker

3. CHECK PUBLISHING QUEUE
   → Query: Approved content awaiting publishing
   → Action: Route through social-publish skill
     - Determine platforms (LinkedIn, X, Reddit, IG, etc.)
     - Apply Content-Pyramide (1 Pillar → 15+ Micro)
     - Schedule via Upload-Post Queue System

4. SOCIAL LISTENING CHECK (Daily 10:00 only)
   → Run social-listening skill
   → Scan brand mentions on Reddit, X
   → Flag negative sentiment → Create response issue for Iris
   → Flag opportunities → Create content issue for Gary Vee

5. REPORT TO NOUS (Weekly)
   → Aggregate: Content published, engagement metrics, budget spent
   → Format: Executive brief
   → Create report issue → Assign to NOUS
```

## Delegation Rules

| Content Type | Primary Worker | Backup |
|-------------|---------------|--------|
| Social Posts | Gary Vaynerchuk | Don Draper |
| Landing Page Copy | Don Draper | Gary Vee |
| Video Scripts | Hephaistos | Jonah Jansen |
| Community Responses | Iris | Don Draper |
| Carousel/Visual | Hephaistos | Rauno Freiberg |
