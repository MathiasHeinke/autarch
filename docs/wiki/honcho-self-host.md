# Honcho Self-Hosting Guide (Autarch.OS)

## Overview

Honcho is the autonomous memory and reasoning engine that powers
cross-session agent intelligence in Autarch.OS. By self-hosting,
we maintain full data sovereignty and eliminate external API dependencies.

## Architecture

```
┌─────────────────────────────────────────┐
│            Autarch.OS Server            │
│                                         │
│  ┌──────────┐    ┌──────────────────┐   │
│  │ Heartbeat│───▶│ memory-lifecycle  │   │
│  │ Service  │    │ (Externalized     │   │
│  │          │    │  Brain — DB)      │   │
│  └──────────┘    └────────┬─────────┘   │
│       │                   │ post-run    │
│       ▼                   ▼             │
│  ┌──────────┐    ┌──────────────────┐   │
│  │ hermes   │    │ honcho-client    │   │
│  │ cloud    │    │ (insight gen)    │   │
│  │ worker   │    └────────┬─────────┘   │
│  └──────────┘             │             │
└───────────────────────────┼─────────────┘
                            ▼
                   ┌────────────────┐
                   │  Honcho Server │
                   │  (Docker)      │
                   │  :8100         │
                   └────────┬───────┘
                            │
                   ┌────────▼───────┐
                   │  PostgreSQL    │
                   │  (Honcho DB)   │
                   └────────────────┘
```

## Quick Start (Docker Compose)

### 1. Clone Honcho

```bash
git clone https://github.com/plastic-labs/honcho.git
cd honcho
```

### 2. Configure Environment

Create `.env` in the Honcho directory:

```env
# Honcho server
HONCHO_PORT=8100
HONCHO_HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://honcho:honcho@honcho-db:5432/honcho

# API key (generate a strong key)
HONCHO_API_KEY=hsk_your_secure_api_key_here

# LLM provider for reasoning (Honcho uses this internally)
OPENAI_API_KEY=sk-your-openai-key  # or use local LLM
```

### 3. Launch

```bash
docker compose up -d
```

Verify:
```bash
curl http://localhost:8100/health
# → {"status":"ok"}
```

### 4. Configure Autarch

Add to your Autarch `.env`:

```env
# Honcho Integration
HONCHO_API_URL=http://localhost:8100
HONCHO_API_KEY=hsk_your_secure_api_key_here
```

## Production Deployment

For production, deploy Honcho to Cloud Run or a dedicated VM:

### Cloud Run Deployment

```bash
cd honcho
gcloud run deploy honcho \
  --source . \
  --region europe-west1 \
  --port 8100 \
  --set-env-vars "DATABASE_URL=$HONCHO_DB_URL" \
  --set-env-vars "HONCHO_API_KEY=$HONCHO_API_KEY" \
  --allow-unauthenticated=false \
  --min-instances=1
```

### Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `HONCHO_API_URL` | Yes | `http://localhost:8100` | Honcho server endpoint |
| `HONCHO_API_KEY` | Yes | — | API authentication key |

## Data Model Mapping

| Autarch Concept | Honcho Concept | Scope |
|----------------|----------------|-------|
| Company | Workspace | Multi-tenant isolation |
| Agent | Peer | Identity modeling |
| Heartbeat Run | Session | Conversation thread |
| User message | User Peer Message | Input context |
| Agent response | Agent Peer Message | Output context |

## How It Works

### Post-Run Ingestion

After each hermes_cloud run:

1. **Conversation Extraction**: NDJSON response is parsed for user/assistant messages
2. **Session Creation**: Messages are sent to Honcho as a session
3. **Autonomous Reasoning**: Honcho's reasoning engine processes the conversation
4. **Insight Generation**: Synthesized insights become available for future queries

### Pre-Run Context Enrichment

Before each hermes_cloud run:

1. **Memory Load**: Standard memories from `agent_memory` table
2. **Honcho Query**: Contextual insights from Honcho's reasoning engine
3. **System Prompt Assembly**: Both sources are merged into the agent's system prompt

## Monitoring

Check Honcho health:
```bash
curl $HONCHO_API_URL/health
```

Check workspace stats:
```bash
curl -H "Authorization: Bearer $HONCHO_API_KEY" \
  $HONCHO_API_URL/v3/workspaces/autarch-company-$COMPANY_ID/stats
```

## Troubleshooting

### Honcho not reachable

The integration is fully **non-fatal**. If Honcho is down:
- Agent execution continues normally
- Standard Externalized Brain (DB) memories still work
- Honcho insights are simply not available
- No error propagation to the user

### High latency

Honcho reasoning can take a few seconds. The integration:
- Pre-loads asynchronously before agent execution
- Times out gracefully after 5 seconds
- Falls back to DB-only memories on timeout
