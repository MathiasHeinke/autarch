---
name: update-memory
description: "Session-end memory protocol — persist decisions, learnings, and state for future sessions."
version: 1.0.0
platforms: [macos, linux, windows]
metadata:
  hermes:
    tags: [memory, session, persistence]
    category: autarch
    requires_toolsets: [file]
---

# 💾 Update Memory — Session End Protocol

## When to Use
- End of every meaningful work session
- After significant decisions or architecture changes
- Before switching to a different project
- Whenever you want continuity in the next session

## Procedure

### 1. Session Summary
Write a concise summary:
- What was accomplished (3-5 bullet points)
- Key decisions made (and WHY)
- What was NOT done (deferred/blocked)
- Current state of the work

### 2. Update Agent Memory
Use Hermes' `memory` tool:
```
memory add: "[Most important takeaway from this session]"
memory add: "[Current project state in one sentence]"
memory add: "[Next action when resuming]"
```

### 3. Update MEMORY.md (if using file-based memory)
Add to MEMORY.md:
```markdown
## [Date] — [Topic]
- Built: [what]
- Decision: [what and why]
- Next: [what to do next]
- Blocked: [if anything]
```

### 4. Architecture Changes (if any)
If you changed architecture:
- Update AGENTS.md project context
- Update system index / architecture docs
- Document the decision and rationale

### 5. Learnings (if any)
If you learned something transferable:
```
memory add: "Learning: [concise insight about the codebase/tool/pattern]"
```

## Pitfalls
- Don't skip memory updates — your future self will thank you
- Don't write novels — concise > comprehensive
- Don't store temporary state as permanent knowledge
- Don't forget to mention what's NEXT
