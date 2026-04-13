---
name: deep-work
description: "Autonomous multi-phase execution with fortress gates. For when you know WHAT to build and need disciplined execution."
version: 1.0.0
platforms: [macos, linux, windows]
metadata:
  hermes:
    tags: [execution, autonomous, building]
    category: autarch
    requires_toolsets: [terminal, file]
---

# 🧠 Deep Work — Autonomous Execution Protocol

## When to Use
- Plan is approved and execution begins
- Multi-file changes that need disciplined phasing
- When you want fortress-gate quality without full agentic-plan overhead

## Procedure

### 1. Load Context
- Read the approved plan or task description
- Identify build phases and dependency order
- Map all affected files

### 2. Phase Execution Loop
For EACH phase:

1. **Announce:** "Starting Phase N: [description]"
2. **Execute:** Make the changes
3. **Build Check:** `npm run build` / `tsc --noEmit` / `cargo check`
4. **Fortress Gate:**
   - [ ] Build passes clean
   - [ ] No lint errors introduced
   - [ ] Changes match plan specification
   - [ ] No unintended side effects
5. **Verdict:** PASS → next phase. FAIL → fix before proceeding.

### 3. Integration Test
After all phases:
- Full build
- Smoke test critical paths
- Verify end-to-end functionality

### 4. Delivery
- Summary of what was built
- Any deviations from plan (documented + justified)
- Build status

## Fortress Gate Rules
- NEVER skip a gate — even if "it's just a small change"
- NEVER proceed to next phase with a failing build
- If a gate reveals a plan error: STOP and inform user
- Deviations are OK if documented and justified

## Pitfalls
- Don't combine phases to "save time"
- Don't skip build checks on "config-only" changes
- Don't assume the plan is perfect — verify at each gate
