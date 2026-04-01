# 🏗️ Infrastructure Map — Deep Research v4

> Generiert: 2026-04-01

## Environment Variables

### .env.example Inhalt
```
DATABASE_URL=***
PORT=***
SERVE_UI=***
```

### Hermes-Spezifische Vars
| Variable | Layer | Zweck |
|----------|-------|-------|
| `HERMES_CLOUD_SECRET` | Server+Worker | Gateway Auth |
| `NOUSRESEARCH_API_KEY` | Worker | LLM API Key |
| `VITE_HERMES_ONLY_MODE` | UI | Enterprise Feature Flag |
| `HONCHO_API_URL` | Server | Reasoning Engine URL |
| `HONCHO_API_KEY` | Server | Honcho Auth |

## Dependencies (Major)

### Server Dependencies (Top)
| Package | Version |
|---------|---------|
| `better-auth` | `1.4.18` |
| `drizzle-orm` | `^0.38.4` |
| `embedded-postgres` | `^18.1.0-beta.16` |
| `express` | `^5.1.0` |
| `multer` | `^2.0.2` |
| `zod` | `^3.24.2` |
| `@types/express` | `^5.0.0` |
| `@types/express-serve-static-core` | `^5.0.0` |
| `@types/multer` | `^2.0.0` |

### UI Dependencies (Top)
| Package | Version |
|---------|---------|
| `@radix-ui/react-slot` | `^1.2.4` |
| `@tanstack/react-query` | `^5.90.21` |
| `lucide-react` | `^0.574.0` |
| `radix-ui` | `^1.4.3` |
| `react` | `^19.0.0` |
| `react-dom` | `^19.0.0` |
| `react-markdown` | `^10.1.0` |
| `react-router-dom` | `^7.1.5` |
| `@tailwindcss/vite` | `^4.0.7` |
| `@types/react` | `^19.0.8` |
| `@types/react-dom` | `^19.0.3` |
| `@vitejs/plugin-react` | `^4.3.4` |
| `vite` | `^6.1.0` |
| `vitest` | `^3.0.5` |

## Docker & Deployment

### Dockerfile
- **Base Image:** `node:lts-trixie-slim`
- **Exposed Port:** `3100`

### docker-compose.yml Services
- `db`
- `environment`
- `healthcheck`
- `ports`
- `volumes`
- `server`
- `ports`
- `environment`
- `volumes`
- `depends_on`
- `db`
- `volumes`
- `pgdata`

## External Services

| Service | Typ | Env Key | Zweck |
|---------|-----|---------|-------|
| PGlite | Database (dev) | (embedded) | Zero-config dev DB |
| PostgreSQL | Database (prod) | `DATABASE_URL` | Production persistence |
| OpenRouter | LLM Gateway | `OPENROUTER_API_KEY` | Hermes 4 405B inference |
| Honcho | Reasoning | `HONCHO_API_URL` | Cross-session dialectic |
| Google Cloud Run | Container | GCP Project | Hermes Worker hosting |
| Apify | Scraping | `APIFY_API_KEY` | Web scraping MCP |
| Better Auth | Auth Framework | (built-in) | Board user authentication |

## Monorepo Workspace Packages

```yaml
packages:
  - packages/*
  - packages/adapters/*
  - packages/plugins/*
  - packages/plugins/examples/*
  - server
  - ui
  - cli
```

## CI/CD (GitHub Actions)
- `docker.yml`
- `e2e.yml`
- `pr.yml`
- `refresh-lockfile.yml`
- `release-smoke.yml`
- `release.yml`
