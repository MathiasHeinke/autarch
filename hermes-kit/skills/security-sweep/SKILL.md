---
name: security-sweep
description: "Comprehensive security audit — PII scrubbing, API key detection, auth verification, and compliance check."
version: 1.0.0
platforms: [macos, linux, windows]
metadata:
  hermes:
    tags: [security, audit, compliance]
    category: autarch
    requires_toolsets: [terminal, file]
---

# 🛡️ Security Sweep

## When to Use
- Pre-release security check
- After adding auth/payment/user-data features
- Periodic security hygiene
- When handling any PII or sensitive data

## Procedure

### 1. Activate Mr. Robot
`/personality mr-robot`

### 2. Secrets Scan
```bash
# API keys, tokens, passwords in code
grep -rn "password\|secret\|api[_-]key\|token\|private[_-]key" \
  --include="*.ts" --include="*.tsx" --include="*.js" \
  --include="*.py" --include="*.rs" --include="*.yaml" \
  --include="*.json" --exclude-dir=node_modules

# .env files tracked in git
git ls-files | grep -i "\.env"

# Hardcoded URLs with credentials
grep -rn "https\?://[^@]*@" --include="*.ts" --include="*.tsx"
```

### 3. PII Check
```bash
# Console.log statements (potential PII leaks)
grep -rn "console.log\|console.warn\|console.error" \
  --include="*.ts" --include="*.tsx" | head -30

# User data in error messages
grep -rn "email\|phone\|address\|name.*user" \
  --include="*.ts" --include="*.tsx"
```

### 4. Auth & Access Control
- Every API endpoint protected?
- RLS enabled on all user-data tables?
- Session/token validation on every request?
- CORS configured correctly?

### 5. Input Validation
- All user inputs sanitized?
- SQL injection vectors checked?
- XSS prevention in place?
- File upload validation?

### 6. Report
```markdown
## Security Sweep Report
| Category | Status | Findings |
|----------|--------|----------|
| Secrets  | ✅/🔴  | ...      |
| PII      | ✅/🔴  | ...      |
| Auth     | ✅/🔴  | ...      |
| Input    | ✅/🔴  | ...      |
```

## Pitfalls
- Don't skip "internal" APIs — they get exposed eventually
- Don't trust client-side validation alone
- Don't mark PII in logs as "info" — it's always critical
