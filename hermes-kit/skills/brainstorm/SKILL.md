---
name: brainstorm
description: "Structured brainstorming protocol — spec before code. Forces divergent thinking before converging on a solution."
version: 1.0.0
platforms: [macos, linux, windows]
metadata:
  hermes:
    tags: [ideation, planning, specification]
    category: autarch
    requires_toolsets: [file]
---

# 💡 Brainstorm — Spec Before Code

## When to Use
- Before any feature implementation
- When the approach isn't clear
- When multiple solutions exist and you need to pick one
- When someone says "just build it" without a spec

## Procedure

### 1. Problem Statement
Write ONE sentence: What problem are we solving?
If you need more than one sentence, you don't understand the problem yet.

### 2. Constraints
- What MUST be true? (hard requirements)
- What SHOULD be true? (preferences)
- What must NOT happen? (anti-requirements)
- Time/resource constraints?

### 3. Divergent Phase (3+ Options)
Generate at least 3 different approaches:

| Approach | Pros | Cons | Effort | Risk |
|----------|------|------|--------|------|
| A: [name] | ... | ... | ... | ... |
| B: [name] | ... | ... | ... | ... |
| C: [name] | ... | ... | ... | ... |

### 4. Convergent Phase
- Eliminate approaches that violate constraints
- Score remaining by: effort, risk, maintainability
- Pick ONE winner with clear reasoning

### 5. Mini-Spec Output
```markdown
## Decision: [Chosen Approach]
### Why: [1-2 sentences]
### Not Chosen: [Brief why alternatives were rejected]
### Next: [First concrete step]
```

## Pitfalls
- Don't brainstorm for 5 minutes then code for 5 hours
- Don't skip the divergent phase — 1 option is not brainstorming
- Don't pick the first idea that "seems fine"
- The goal is CLARITY, not documentation
