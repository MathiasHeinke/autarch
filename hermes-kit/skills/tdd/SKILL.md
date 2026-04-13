---
name: tdd
description: "Test-Driven Development protocol — Red → Green → Refactor as iron law."
version: 1.0.0
platforms: [macos, linux, windows]
metadata:
  hermes:
    tags: [testing, quality, methodology]
    category: autarch
    requires_toolsets: [terminal, file]
---

# 🧪 TDD — Red → Green → Refactor

## When to Use
- Building new logic/algorithms/engines
- Bug fixes that need regression protection
- Any code where "it works on my machine" isn't enough
- When explicitly requested by the user

## The Iron Law

### 1. RED — Write the test FIRST
```
Write a failing test that describes the EXPECTED behavior.
The test MUST fail. If it passes, your test is wrong.
Run it. See it fail. Read the error message.
```

### 2. GREEN — Make it pass with MINIMAL code
```
Write the SIMPLEST code that makes the test pass.
No cleverness. No optimization. No "while I'm here" refactoring.
The only goal: green test.
```

### 3. REFACTOR — Clean up with confidence
```
Now refactor the implementation.
Tests are your safety net.
Run tests after every change.
If a test breaks: your refactoring changed behavior. Fix it.
```

### 4. REPEAT
```
Next test case. Next edge case. Next behavior.
RED → GREEN → REFACTOR.
Until all acceptance criteria are covered.
```

## Test Hierarchy
1. **Unit tests** — Pure functions, engines, utilities
2. **Integration tests** — API routes, database queries
3. **E2E tests** — Critical user flows (sparingly)

## Pitfalls
- Don't write tests AFTER the implementation — that's "test-decorated development"
- Don't write too many tests at once — one at a time
- Don't test implementation details — test BEHAVIOR
- Don't skip the refactor phase — green is not done
