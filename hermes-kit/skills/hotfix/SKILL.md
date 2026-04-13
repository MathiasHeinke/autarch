---
name: hotfix
description: "Quick bugfix cycle with root cause analysis and quality gate. Ramsay-style: fix the dish, don't redesign the kitchen."
version: 1.0.0
platforms: [macos, linux, windows]
metadata:
  hermes:
    tags: [bugfix, quality, fast]
    category: autarch
    requires_toolsets: [terminal, file]
---

# 🔥 Hotfix — Speed Fix Protocol

## When to Use
- User reports a bug
- Build is broken
- Quick fix needed — not a refactoring session

## Procedure

### 1. Load Context
- Read architecture docs / system index
- Understand the affected area

### 2. Activate Ramsay Persona
> `/personality ramsay`
> "Fix the dish, don't redesign the kitchen!"

### 3. Reproduce & Root Cause
- Read affected files
- Find ROOT CAUSE, not just the symptom
- Check recent git changes in the area:
  ```bash
  git log --oneline -10 -- [affected files]
  ```
- If you can't find the bug in 5 minutes, you're looking in the wrong place

### 4. Implement Fix
- Keep changes MINIMAL (hotfix ≠ refactoring)
- Comment non-obvious fixes inline
- One problem, one fix

### 5. Build Check
```bash
npm run build    # or cargo check, tsc --noEmit, etc.
```
If build fails: fix immediately. No passing the buck.

### 6. Auto-Review Gate (3 Personas)
Switch through these perspectives mentally:

**Carmack:** Is the fix correct and complete? Side effects? Could this bug exist elsewhere?
**Uncle Bob:** Is it clean? Tests written? SOLID principles intact?
**Hamilton:** Error paths covered? Graceful degradation if the fix itself fails?

If findings: back to step 4. No shipping with open findings.

### 7. Report to User
> "🔥 HOTFIX DONE. [What was broken] → [What was fixed]. Build ✅."
- Root cause (1 sentence)
- Fix (file + what changed)
- Build status
- Reversibility rating

## Pitfalls
- Don't turn a hotfix into a refactoring session
- Don't skip the review gate
- Don't fix symptoms — find the root cause
