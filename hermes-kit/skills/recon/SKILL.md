---
name: recon
description: "Codebase reconnaissance — build a mental map of the project's architecture, dependencies, and key patterns."
version: 1.0.0
platforms: [macos, linux, windows]
metadata:
  hermes:
    tags: [exploration, understanding, onboarding]
    category: autarch
    requires_toolsets: [terminal, file]
---

# 🗺️ Recon — Codebase Reconnaissance

## When to Use
- First time in a new codebase
- Architecture docs are outdated or missing
- Need to understand the system before making changes
- Creating or updating a system index

## Procedure

### 1. Top-Level Scan
```bash
ls -la
cat package.json    # or Cargo.toml, pyproject.toml, etc.
find . -name "*.md" -maxdepth 2 | head -20
```

### 2. Architecture Discovery
- Read README.md, ARCHITECTURE.md, AGENTS.md
- Identify: framework, language, package manager, build tool
- Map the directory structure (src/, lib/, components/, etc.)

### 3. Dependency Map
```bash
cat package.json | jq '.dependencies'     # Node
cat Cargo.toml                             # Rust
cat requirements.txt                       # Python
```

### 4. Entry Points
- Find main entry: `src/main.ts`, `src/App.tsx`, `src/main.rs`
- Trace the boot sequence
- Identify routing (pages, API routes, commands)

### 5. Pattern Recognition
Look for:
- State management pattern (Context, Redux, Zustand, signals)
- Data fetching pattern (REST, GraphQL, tRPC, direct DB)
- Error handling conventions
- Test structure and coverage
- CI/CD pipeline

### 6. Output: System Index
Create or update `ARCHITECTURE.md` or `system-index.md`:
```markdown
# System Index
## Tech Stack
## Directory Structure  
## Key Patterns
## Entry Points
## Data Flow
## Known Gotchas
```

## Pitfalls
- Don't skim — read the actual code, not just filenames
- Don't assume conventional structure — verify
- Don't skip the dependency audit
