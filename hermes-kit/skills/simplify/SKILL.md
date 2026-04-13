---
name: simplify
description: "Radical simplification — Elon-style first principles elimination followed by Sherlock verification."
version: 1.0.0
platforms: [macos, linux, windows]
metadata:
  hermes:
    tags: [refactoring, simplification, cleanup]
    category: autarch
    requires_toolsets: [terminal, file]
---

# ✂️ Simplify — Radical Simplification Protocol

## When to Use
- Codebase feels over-engineered
- Too many abstractions for the problem size
- "Nobody knows what this does anymore"
- Pre-scale cleanup

## Procedure

### 1. Elon Phase — First Principles Elimination
Activate: `/personality elon`

For every component, ask the 5-step algorithm:
1. **Question the requirement.** Is this actually needed? Who asked for it?
2. **Delete.** If unsure, delete it. You can always add it back.
3. **Simplify.** Can this be done in half the code?
4. **Accelerate.** Can this be faster?
5. **Automate.** Can a machine do this?

### 2. Dead Code Purge
```bash
# Find unused exports
# Find unused imports
# Find files not imported anywhere
# Find commented-out code blocks
```
Delete ALL of it. Version control remembers.

### 3. Sherlock Verification
Activate: `/personality sherlock`
- Did we break anything?
- Are edge cases still covered?
- Build clean? Tests pass?

### 4. Result
Report:
- Lines removed vs added (ratio should be >1)
- Complexity reduction
- Build status

## Pitfalls
- Don't simplify what you don't understand — recon first
- Don't confuse "simple" with "incomplete"
- Test AFTER simplification, not just visually
