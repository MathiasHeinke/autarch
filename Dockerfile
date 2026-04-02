# ─── Paperclip Server — Cloud Run Dockerfile (pre-built) ───
# Uses pre-built dist/ artifacts from the monorepo
FROM node:22-slim
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

# Copy full monorepo (dist/ already built locally)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY patches/ patches/
COPY packages/ packages/
COPY server/ server/
COPY cli/package.json cli/
COPY ui/package.json ui/

# Install all dependencies (tsx needed as runtime TS loader)
RUN pnpm install --no-frozen-lockfile --ignore-scripts

# Create Paperclip home directory structure
RUN mkdir -p /app/.paperclip/instances/default/data/storage \
    /app/.paperclip/instances/default/data/backups \
    /app/.paperclip/instances/default/logs \
    /app/.paperclip/instances/default/secrets

# Cloud Run environment
ENV PORT=8080
ENV NODE_ENV=production
ENV PAPERCLIP_HOME=/app/.paperclip
ENV PAPERCLIP_INSTANCE_ID=default
ENV PAPERCLIP_MIGRATION_AUTO_APPLY=true

# Write cloud config.json
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
    "serveUi": false\n\
  },\n\
  "auth": { "baseUrlMode": "auto", "disableSignUp": false },\n\
  "storage": {\n\
    "provider": "local_disk",\n\
    "localDisk": { "baseDir": "/app/.paperclip/instances/default/data/storage" }\n\
  },\n\
  "secrets": { "provider": "env", "strictMode": false }\n\
}' > /app/.paperclip/instances/default/config.json

EXPOSE 8080

WORKDIR /app/server
CMD ["./node_modules/.bin/tsx", "src/index.ts"]
