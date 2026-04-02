# ─── Paperclip Server — Cloud Run Dockerfile ───
FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

# Copy workspace root files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy all package.json files for workspace resolution
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
COPY packages/plugin-sdk/package.json packages/plugin-sdk/
COPY packages/adapters/adapter-utils/package.json packages/adapters/adapter-utils/
COPY packages/adapters/claude-local/package.json packages/adapters/claude-local/
COPY packages/adapters/codex-local/package.json packages/adapters/codex-local/
COPY packages/adapters/cursor-local/package.json packages/adapters/cursor-local/
COPY packages/adapters/gemini-local/package.json packages/adapters/gemini-local/
COPY packages/adapters/openclaw-gateway/package.json packages/adapters/openclaw-gateway/
COPY packages/adapters/opencode-local/package.json packages/adapters/opencode-local/
COPY packages/adapters/pi-local/package.json packages/adapters/pi-local/
COPY server/package.json server/
COPY ui/package.json ui/
COPY cli/package.json cli/

# Copy plugin package.json files if they exist
COPY packages/plugins/ packages/plugins/ 

# Install dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts 2>/dev/null || pnpm install --no-frozen-lockfile --ignore-scripts

# Copy all source
COPY packages/ packages/
COPY server/ server/
COPY scripts/ scripts/

# Build workspace packages + server
RUN pnpm --filter @paperclipai/shared build 2>/dev/null || true
RUN pnpm --filter @paperclipai/db build 2>/dev/null || true
RUN pnpm --filter @paperclipai/plugin-sdk build 2>/dev/null || true
RUN pnpm --filter @paperclipai/adapter-utils build 2>/dev/null || true
RUN pnpm --filter @paperclipai/server build

# ─── Production stage ───
FROM node:22-slim AS prod
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

COPY --from=base /app/ /app/

# Create Paperclip home directory structure
RUN mkdir -p /app/.paperclip/instances/default/data/storage \
    /app/.paperclip/instances/default/data/backups \
    /app/.paperclip/instances/default/logs \
    /app/.paperclip/instances/default/secrets

# Cloud Run config — overridden by env vars at runtime
ENV PORT=8080
ENV NODE_ENV=production
ENV PAPERCLIP_HOME=/app/.paperclip
ENV PAPERCLIP_INSTANCE_ID=default
ENV PAPERCLIP_MIGRATION_AUTO_APPLY=true
ENV SERVE_UI=true

# Write cloud config.json at build time (secrets via env vars at runtime)
RUN printf '{\n\
  "$meta": { "version": 1, "source": "cloud-run" },\n\
  "database": { "mode": "postgres", "backup": { "enabled": false } },\n\
  "logging": { "mode": "stdout" },\n\
  "server": {\n\
    "deploymentMode": "local_trusted",\n\
    "exposure": "public",\n\
    "host": "0.0.0.0",\n\
    "port": 8080,\n\
    "allowedHostnames": [],\n\
    "serveUi": true\n\
  },\n\
  "auth": { "baseUrlMode": "auto", "disableSignUp": false },\n\
  "storage": {\n\
    "provider": "local_disk",\n\
    "localDisk": { "baseDir": "/app/.paperclip/instances/default/data/storage" }\n\
  },\n\
  "secrets": { "provider": "env", "strictMode": false }\n\
}' > /app/.paperclip/instances/default/config.json

EXPOSE 8080

CMD ["node", "server/dist/index.js"]
