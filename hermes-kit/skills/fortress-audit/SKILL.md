---
name: fortress-audit
description: "Full quality harness — E2E testing, Sherlock audit, security sweep, hotfix, and regression check in one run."
version: 1.0.0
platforms: [macos, linux, windows]
metadata:
  hermes:
    tags: [quality, audit, security, testing]
    category: autarch
    requires_toolsets: [terminal, file]
---

# 🏰 Fortress Audit — Full Quality Harness

## When to Use
- Pre-release quality gate
- After large feature merges
- When something "feels off" but builds clean
- Periodic codebase health check

## Procedure

### Stage 1: 🔍 Sherlock — Deep Code Audit
Activate: `/personality sherlock`

Audit ALL files in scope with these lenses:
- **Architecture:** State machine completeness, lifecycle management, resource leaks
- **Code Quality:** Type safety, error handling, anti-patterns
- **Security:** PII exposure, auth bypass, injection vectors
- **UX:** Dead-end states, missing feedback

Output: Findings table (🔴 Critical / 🟡 Warning / 🔵 Info)

### Stage 2: 🕵️ Mr. Robot — Security Sweep
Activate: `/personality mr-robot`

Focus checks:
```bash
# Secrets in code
grep -rn "password\|secret\|api_key\|token" --include="*.ts" --include="*.tsx" --include="*.env*"

# Console.log statements (PII risk)
grep -rn "console.log" --include="*.ts" --include="*.tsx"

# Type safety
grep -rn ": any" --include="*.ts" --include="*.tsx"
```

### Stage 3: 🔥 Ramsay Hotfix
Activate: `/personality ramsay`

Fix ALL findings from Stage 1-2:
- Order: 🔴 Critical → 🟡 Warning → 🔵 Info
- Build check after each fix
- Full build after all fixes

### Stage 4: Regression Check
- Full build clean?
- Existing tests pass?
- No new warnings introduced?

### Stage 5: Verdict
```
✅ FORTRESS CLEARED — Ready for production
⚠️ CONDITIONAL — [N] items need user decision
🔴 NOT READY — [N] critical findings remain
```

## Pitfalls
- Don't skip stages to "save time"
- Don't downgrade severity levels
- Don't ship with open findings
