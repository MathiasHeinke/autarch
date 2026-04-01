# Rauno Freiberg Tools & Permissions

## Allowed Tools

| Tool | Scope | Description |
|------|-------|-------------|
| `terminal` | Execute | npm, vite, tsc, builds, dev server |
| `code` | Read/Write | React components, TypeScript, CSS |
| `file` | Read/Write | Design specs, component documentation |
| `memory` | Read/Write | Component patterns, design tokens history |
| `browser` | Read | Visual preview, responsive testing |
| `skills` | Execute | frontend-build, design-system-exec, framer-motion-ui, responsive-audit |

## Denied Tools

| Tool | Reason |
|------|--------|
| `delegation` | Workers don't delegate |
| `social_publish` | No publishing |
