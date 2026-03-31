FROM python:3.12-slim

# System dependencies (git for hermes install, curl for health checks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl xz-utils ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Hermes Agent CLI
RUN curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash

# Copy Hermes configuration for cloud worker
COPY config/ /root/.hermes/

# Cloud Run expects PORT env var
ENV PORT=8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD curl -f http://localhost:8080/v1/health || exit 1

# Start Hermes in gateway mode — exposes HTTP API on port 8080
CMD ["hermes", "gateway", "start", "--port", "8080"]
