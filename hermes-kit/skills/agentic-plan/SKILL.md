---
name: agentic-plan
description: "Autonomous multi-phase plan execution with maximum detail depth, fortress gates, feasibility probes, EVAL harness, post-delivery Sherlock deep audit, Ramsay hotfix (ALL findings), and missing puzzle piece gate."
version: 2.0.0
platforms: [macos, linux, windows]
metadata:
  hermes:
    tags: [planning, architecture, autonomous, quality]
    category: autarch
    requires_toolsets: [terminal, file]
---

# Agentic Plan v2.0 — Maximum Detail Depth Execution

## When to Use
- Any non-trivial implementation (>1 file, >1 component)
- Architecture decisions requiring structured thinking
- Feature development with user approval gates
- Bug fixes affecting >3 files
- Any task where "winging it" would be irresponsible

## Core Principle
> Every plan must be detailed enough that a DIFFERENT agent could execute it BLIND — without a single clarification question.

## The 11-Phase Protocol

### Phase 1: Deep Research
- Read ALL relevant files, not just the obvious ones
- Map dependencies, imports, consumers
- Load system context (architecture docs, indexes)
- **Output:** Complete situational awareness

### Phase 2: Plan Architecture (Maximum Detail)
- For EVERY file: exact changes, line-level precision
- Dependency order: what must be built first?
- Risk assessment per component
- **Feasibility Probe:** For each uncertain step, verify it CAN be done before planning it
- **Detail Checklist (MANDATORY before showing plan):**
  - [ ] Every file change has exact before/after
  - [ ] Import/dependency order specified
  - [ ] Error handling specified for every new function
  - [ ] Types/interfaces defined, not "TBD"
  - [ ] No placeholder steps ("implement the logic")

### Phase 3: User Approval Gate
- Present plan to user with full detail
- Wait for explicit approval — NO auto-proceeding
- Incorporate feedback into plan adjustments

### Phase 4: Incremental Execution
- Execute phase by phase, not all at once
- Build check after EVERY phase (compile/lint/test)
- **Fortress Gate:** After each phase, verify:
  - [ ] Build passes
  - [ ] No regressions introduced
  - [ ] Phase output matches plan specification

### Phase 5: EVAL Harness
- After each execution phase, evaluate:
  - Does the output match the plan?
  - Are there deviations? Document them.
  - Would the next phase still work with current state?

### Phase 6: Integration & System Test
- Full build after all phases complete
- End-to-end verification of the built feature
- Cross-check with original requirements

### Phase 7: User Delivery Briefing (INFORMATIONAL — NOT SHIP)
- Present what was built (WHAT, not HOW)
- Show metrics and quality gates
- **This is NOT the end** — Phase 8-10 follow

### Phase 8: 🔍 Sherlock Deep Audit (MANDATORY — NO SKIP)
> An independent post-delivery forensic audit over ALL changed files.
> The plan's own EVAL gates are NOT sufficient.

Activate Sherlock persona. He sees ONLY the code, NOT the plan.

**Audit Lenses:**
- Architecture: State machine completeness, lifecycle management, resource leaks
- Code Quality: Type safety, error handling, anti-patterns, performance
- Security: PII in logs, hardcoded secrets, unsanitized input, auth bypass
- UX: Dead-end states, missing feedback, destructive actions without confirmation

**Output:** Structured findings table (🔴 Critical / 🟡 Warning / 🔵 Info)

### Phase 9: 🔥 Ramsay Hotfix — ALL Findings (MANDATORY)
> Fix ALL findings. Not just criticals. ALL of them.
> Warnings are the soil from which next session's criticals grow.

1. Fix in order: 🔴 Critical → 🟡 Warning → 🔵 Info
2. Build check after each fix
3. Full build after all fixes

### Phase 10: 🧩 Missing Puzzle Piece Gate (USER DECISION)
If Sherlock identified an architectural improvement beyond bug-fixing:
- Present to user with effort estimate and risk
- User decides: implement now OR postpone to next session
- Document decision either way

### Phase 11: Ship & Memory
- Final delivery briefing with ALL quality gates passed
- Memory update (decisions, learnings, architectural changes)
- Git commit + push

## Anti-Hallucination Protocol
1. Every claim must be verifiable in code
2. Every assumption must have a Feasibility Probe
3. "I assume" is FORBIDDEN — verify or ask
4. If unsure about an API: read the source, don't guess
5. If a build fails: fix it NOW, don't document it for later

## Pitfalls
- Don't shorten plans — maximum detail depth is MANDATORY
- Don't skip Feasibility Probes
- Don't skip EVAL gates
- Don't cherry-pick Sherlock findings — fix ALL of them
- Don't ship without the Puzzle Piece question

## Verification
- Plan must contain all 11 phases
- Every phase has EVAL criteria
- Fortress gates active from Phase 4+
- Sherlock audit is MANDATORY after all phases
- Ramsay hotfix covers ALL severity levels
