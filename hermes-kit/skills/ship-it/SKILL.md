---
name: ship-it
description: "Deploy protocol — build, verify, commit, push, deploy. The final gate before production."
version: 1.0.0
platforms: [macos, linux, windows]
metadata:
  hermes:
    tags: [deployment, git, production]
    category: autarch
    requires_toolsets: [terminal, file]
---

# 🚀 Ship It — Deploy Protocol

## When to Use
- All quality gates passed
- User approved the changes
- Ready to commit and deploy

## Procedure

### 1. Pre-Flight Check
- [ ] Build passes clean (`npm run build` / `cargo build --release`)
- [ ] No TypeScript errors (`tsc --noEmit`)
- [ ] No lint warnings
- [ ] Tests pass
- [ ] No `console.log` statements left
- [ ] No hardcoded secrets
- [ ] No `: any` type escapes

### 2. Git Stage & Commit
```bash
git add -A
git status                    # Review what's being committed
git diff --cached --stat      # Verify scope
git commit -m "feat: [descriptive message]"
```

Commit message format:
- `feat:` — new feature
- `fix:` — bug fix
- `refactor:` — code improvement
- `docs:` — documentation
- `chore:` — maintenance

### 3. Push
```bash
git push origin [branch]
```

### 4. Deploy (if applicable)
Depending on your stack:
```bash
# Vercel
vercel --prod

# Docker
docker build -t app . && docker push

# Cloud Run
gcloud run deploy

# Supabase Edge Functions
supabase functions deploy [name]
```

### 5. Post-Deploy Verification
- Hit the deployed endpoint
- Verify the feature works in production
- Check error monitoring (Sentry, logs)

### 6. Memory Update
- Update session notes with what was shipped
- Document any deployment-specific learnings

## Pitfalls
- Don't push without reviewing `git diff`
- Don't deploy on Friday evenings
- Don't skip post-deploy verification
- Don't forget to update memory
