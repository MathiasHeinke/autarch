# 🧬 Autarch OS — Hermes Agent Power Kit

> Turn your fresh Hermes Agent into a multi-persona, workflow-driven development powerhouse.
> Including the **Frontend Triad** — Jobs (Vision) → Jonah (Direction) → Rauno (Craft) — for showroom-ready interfaces.

## What's Inside

This kit gives your Hermes Agent:

- **16 Personalities** — Specialist personas for engineering, quality, product, marketing, and strategy
- **14 Skills** — Battle-tested workflows as slash commands
- **1 SOUL** — A lead architect identity that orchestrates everything

### At a Glance

```
hermes-kit/
├── SOUL.md                    # Agent identity (Lead Architect)
├── config.yaml                # Model + 15 personality presets
├── README.md                  # You are here
│
└── skills/                    # 13 workflow skills
    ├── agentic-plan/          # 🏗️  Full plan-build-audit-ship cycle (flagship)
    ├── hotfix/                # 🔥  Quick bugfix with quality gate
    ├── deep-work/             # 🧠  Autonomous phased execution
    ├── deep-research/         # 🔬  Structured knowledge excavation
    ├── fortress-audit/        # 🏰  Full quality harness
    ├── security-sweep/        # 🛡️  Security audit protocol
    ├── brainstorm/            # 💡  Spec before code
    ├── tdd/                   # 🧪  Red → Green → Refactor
    ├── simplify/              # ✂️  Radical simplification
    ├── recon/                 # 🗺️  Codebase reconnaissance
    ├── ship-it/               # 🚀  Deploy protocol
    ├── update-memory/         # 💾  Session-end memory persist
    ├── cinematic-ui/          # 🎬  Design systems + Framer Motion + Remotion video
    ├── draper-copy/           # 🥃  Copy review & generation
    └── jobs-keynote/          # 🎤  Product launch storytelling
```

---

## 🚀 Quick Install (2 minutes)

### Step 1: Copy SOUL.md
```bash
cp hermes-kit/SOUL.md ~/.hermes/SOUL.md
```

### Step 2: Merge config.yaml
```bash
# If you have NO existing config:
cp hermes-kit/config.yaml ~/.hermes/config.yaml

# If you already have a config, merge the `agent.personalities` section manually
```

### Step 3: Install Skills
```bash
# Option A: Copy skills to Hermes home
cp -r hermes-kit/skills/* ~/.hermes/skills/

# Option B: Use external_dirs (zero-copy, recommended)
# Add to your config.yaml:
#   skills:
#     external_dirs:
#       - /path/to/autarch/hermes-kit/skills
```

### Step 4: Verify
```bash
hermes chat
# Then in chat:
/skills          # Should list all 13 skills
/personality     # Should show all 15 personalities
```

---

## 🎭 The 15 Personalities

### 🔧 Engineering (build, optimize, architect)

| Command | Persona | Best For |
|---------|---------|----------|
| `/personality carmack` | John Carmack | Performance, systems, low-level optimization |
| `/personality karpathy` | Andrej Karpathy | Architecture, ML/AI, data pipelines |
| `/personality uncle-bob` | Uncle Bob Martin | Clean code, SOLID, testing discipline |
| `/personality hamilton` | Margaret Hamilton | Mission-critical, error handling, edge cases |

### 🔍 Quality (audit, review, test, fix)

| Command | Persona | Best For |
|---------|---------|----------|
| `/personality sherlock` | Sherlock Holmes | Code audits, bug hunting, forensic analysis |
| `/personality ramsay` | Gordon Ramsay | Quality enforcement, hotfixes, no-BS reviews |
| `/personality mr-robot` | Mr. Robot | Security audits, penetration thinking, auth |

### 🎨 Product & Design (UX, vision, simplification)

| Command | Persona | Best For |
|---------|---------|----------|
| `/personality jobs` | Steve Jobs | Product vision, design decisions, demos |
| `/personality elon` | Elon Musk | Radical simplification, first principles |
| `/personality rauno` | Rauno Freiberg | Frontend craft, TypeScript, pixel-perfection |
| `/personality jonah` | Jonah Jansen | Design systems (Stitch), cinematic UI, video |

### 📈 Marketing & Sales (copy, offers, growth)

| Command | Persona | Best For |
|---------|---------|----------|
| `/personality draper` | Don Draper | Copywriting, brand voice, UI text |
| `/personality hormozi` | Alex Hormozi | Offer design, pricing, revenue architecture |
| `/personality gary-vee` | Gary Vaynerchuk | Content strategy, social media, distribution |

### 🧠 Strategy (risk, behavior, meta-analysis)

| Command | Persona | Best For |
|---------|---------|----------|
| `/personality taleb` | Nassim Taleb | Risk analysis, antifragility, black swans |
| `/personality kahneman` | Daniel Kahneman | Behavioral economics, UX psychology, biases |

#### 🎬 The Frontend Triad (Jobs → Jonah → Rauno)

The killer combination for showroom-ready interfaces:

```
Jobs  → "What should the user FEEL?"   (Vision, Emotion, One More Thing)
Jonah → "How does it LOOK and MOVE?"    (Design System, Motion, Video)
Rauno → "How is it BUILT and OPTIMIZED?" (React, TypeScript, Performance)
```

> **Reset to default:** `/personality` (returns to Lead Architect SOUL)

---

## ⚡ The Skills — What They Do

### Core Development Workflow

| Skill | Command | Description |
|-------|---------|-------------|
| **Agentic Plan** | `/agentic-plan` | The beast. 11-phase plan-build-audit-ship cycle with mandatory feasibility probes, fortress gates, Sherlock deep audit, Ramsay hotfix, and puzzle piece gate. Use for any non-trivial work. |
| **Deep Work** | `/deep-work` | Autonomous phased execution. When you KNOW what to build and need disciplined gates. |
| **Hotfix** | `/hotfix` | Quick bug fix. Root cause → minimal fix → quality gate → ship. 15 minutes max. |
| **TDD** | `/tdd` | Red → Green → Refactor. For engines, algorithms, and anything that needs regression protection. |

### Quality & Security

| Skill | Command | Description |
|-------|---------|-------------|
| **Fortress Audit** | `/fortress-audit` | Full harness: Sherlock audit + Mr. Robot security sweep + Ramsay hotfix + regression check. |
| **Security Sweep** | `/security-sweep` | Focused security audit: secrets, PII, auth, input validation. |

### Research & Understanding

| Skill | Command | Description |
|-------|---------|-------------|
| **Deep Research** | `/deep-research` | Structured web/docs research with evidence hierarchy and synthesis. |
| **Recon** | `/recon` | Codebase reconnaissance. First time in a project? Run this. |
| **Brainstorm** | `/brainstorm` | Spec before code. 3+ options → evaluate → pick one → mini-spec. |
| **Simplify** | `/simplify` | Elon-style elimination. Delete > optimize > simplify > automate. |
| **Cinematic UI** | `/cinematic-ui` | Design system (Stitch MCP) + Framer Motion + Remotion video in one workflow. |

### Marketing & Product

| Skill | Command | Description |
|-------|---------|-------------|
| **Draper Copy** | `/draper-copy` | Copy review: 3 variants (safe/bold/wild), headline test, compliance check. |
| **Jobs Keynote** | `/jobs-keynote` | Product launch narrative: problem → solution → demo → one more thing. |

### Session Management

| Skill | Command | Description |
|-------|---------|-------------|
| **Ship It** | `/ship-it` | Deploy protocol: pre-flight → git → push → deploy → verify. |
| **Update Memory** | `/update-memory` | Session-end: persist decisions and state for future sessions. |

---

## 🧠 How It Fits Together

### The Typical Workflow

```
1. Start Hermes in your project directory
   → SOUL.md loads (Lead Architect identity)
   → AGENTS.md loads (project context)
   → Skills become available

2. User: "Build feature X"
   → Agent runs /brainstorm → picks approach
   → Agent runs /agentic-plan → creates detailed plan
   → User approves plan

3. Agent executes with /deep-work
   → Phase-by-phase with fortress gates
   → Uses the Frontend Triad for UI work:
     /personality jobs → vision + emotional brief
     /personality jonah → design system + motion specs
     /personality rauno → production React code

4. Agent runs Phase 8-10 from /agentic-plan
   → /personality sherlock → deep audit
   → /personality ramsay → fix ALL findings
   → Puzzle piece gate → user decides

5. /ship-it → deploy
6. /update-memory → persist session state
```

### Delegation Patterns

When the agent recognizes specialist work, it delegates:

| Task | Delegation |
|------|-----------|
| Code review | → Sherlock (audit) + Uncle Bob (SOLID) + Hamilton (error paths) |
| Security check | → Mr. Robot (attack surface) + Sherlock (verification) |
| Feature launch | → Jobs (narrative) + Draper (copy) + Hormozi (offer design) |
| UI/UX overhaul | → Jobs (vision) + Jonah (design system + motion) + Rauno (code) |
| Product video | → Jobs (story) + Jonah (Remotion direction) + Draper (copy) |
| Performance fix | → Carmack (optimization) + Sherlock (verification) |
| Refactoring | → Elon (simplify) + Ramsay (quality) + Sherlock (regression) |

---

## 📋 Customization

### Adding Your Own Personalities

Add to `config.yaml`:
```yaml
agent:
  personalities:
    my-persona:
      >
      You are [name] — [role].
      [2-3 sentences defining voice, priorities, and constraints.]
```

### Adding Your Own Skills

Create `~/.hermes/skills/[name]/SKILL.md`:
```yaml
---
name: my-skill
description: "What this skill does"
version: 1.0.0
---

# Skill Name

## When to Use
## Procedure
## Pitfalls
```

### Project-Specific Context

Create `AGENTS.md` in your project root:
```markdown
# Project Name

## Tech Stack
## Conventions
## Architecture
## Known Gotchas
```

Hermes auto-discovers this file — no config needed.

---

## License

MIT — Use it, fork it, make it yours.
