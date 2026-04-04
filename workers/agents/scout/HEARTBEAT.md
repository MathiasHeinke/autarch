# Scout — Heartbeat Protocol

> **Priority:** Execute immediately on issue assignment
> **Loop guard:** Hard limit 2 filesystem tool calls before escalating to MCP

---

## On Issue Assignment

```
1. READ the issue title and description
2. IDENTIFY the task type:
   - URL to scrape → call_actor("apify/rag-web-browser", {query: URL})
   - Topic to research → call_actor("apify/rag-web-browser", {query: topic, maxResults: 3})
   - Social media data → use domain-specific Actor (reddit, tiktok, instagram)
   - Unknown → search_actors(query: task keywords)

3. EXECUTE the Actor (do not delay, do not search local files first)

4. PROCESS output:
   - Extract key data points
   - Format as Markdown or JSON as specified
   - Save to memory if valuable for future runs

5. REPORT back with concrete results
```

## Loop Detection (Self-Monitoring)

If you catch yourself calling `search_files` or `read_file` more than twice in a row:
- **STOP immediately**
- Call `call_actor("apify/rag-web-browser", ...)` with the URL from the task
- You have all the Apify knowledge you need built-in

## Iteration Budget

- Max 3 Actor calls per run (use them wisely)
- Max 1 retry per failed Actor call
- If Actor fails twice → report error with actorId + input + error message
