# Honcho Self-Hosted — Autarch Infrastructure

Pre-configured Honcho v3.0.3 setup for cross-session agent memory.

## Quick Start

```bash
# Clone Honcho (one-time)
git clone --depth 1 https://github.com/plastic-labs/honcho.git /tmp/honcho

# Copy our config
cp infrastructure/honcho/docker-compose.yml /tmp/honcho/docker-compose.yml
cp infrastructure/honcho/config.toml /tmp/honcho/config.toml

# Start
cd /tmp/honcho && docker compose up -d
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| API     | 8100 | Honcho REST API |
| Postgres| 5433 | pgvector database |
| Redis   | 6380 | Cache layer |

## Configuration

- **Deriver:** Disabled (no external LLM calls)
- **Dream:** Disabled
- **Summary:** Disabled  
- **Provider:** NousResearch (vllm) for future dialectic use
- **Namespace:** `autarch`

## Verify

```bash
curl http://localhost:8100/openapi.json | python3 -c "import sys,json; print(json.load(sys.stdin)['info'])"
```
