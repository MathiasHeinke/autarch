---
name: deep-research
description: "Exhaustive knowledge excavation — web research, documentation analysis, and synthesis into actionable ground truth."
version: 1.0.0
platforms: [macos, linux, windows]
metadata:
  hermes:
    tags: [research, analysis, learning]
    category: autarch
    requires_toolsets: [terminal, file, browser]
---

# 🔬 Deep Research — Knowledge Excavation Protocol

## When to Use
- Evaluating a new technology or library
- Understanding a complex domain before implementation
- Comparing approaches with evidence, not assumptions
- Building a knowledge base for a new project area

## Procedure

### 1. Define Research Questions
Before searching:
- What EXACTLY do you need to know?
- What would change your approach based on the answer?
- What are your current assumptions to validate/invalidate?

### 2. Source Hierarchy
Research in this order (most reliable first):
1. **Official Docs** — The source of truth
2. **Source Code** — When docs are incomplete
3. **GitHub Issues/Discussions** — Real-world problems
4. **Recent Blog Posts** — Implementation experiences (check dates!)
5. **StackOverflow** — Specific solutions (verify currency)

### 3. Evidence Collection
For each finding:
- Source URL + date
- Relevance to your question
- Confidence level (verified/likely/uncertain)
- Contradictions with other sources

### 4. Synthesis
Create a research document:
```markdown
# Research: [Topic]
## Context: Why we're investigating
## Key Findings
## Recommendation
## Sources
## Open Questions
```

### 5. Actionable Output
Every research session must end with:
- A clear recommendation (do X, not Y, because Z)
- OR a list of remaining unknowns that need user input

## Pitfalls
- Don't research forever — set a time box
- Don't trust blog posts from 2+ years ago without verification
- Don't conflate "popular" with "correct"
- Don't skip contradictory evidence
