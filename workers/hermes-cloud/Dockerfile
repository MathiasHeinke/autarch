FROM python:3.12-slim

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl xz-utils ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Pre-create Hermes config directory (prevents interactive setup wizard)
RUN mkdir -p /root/.hermes

# Copy configuration BEFORE install (wizard detects existing config → skips)
COPY config/hermes.json /root/.hermes/config.json

# Create .env with placeholder (real key comes from Cloud Run env vars at runtime)
RUN echo "NOUSRESEARCH_API_KEY=placeholder" > /root/.hermes/.env && \
    chmod 600 /root/.hermes/.env

# Install Hermes Agent CLI (non-interactive because config already exists)
RUN curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash || true

# Ensure hermes binary is in PATH
ENV PATH="/root/.local/bin:/root/.hermes/bin:${PATH}"

# Create entrypoint that injects the real API key at runtime
RUN echo '#!/bin/bash\n\
echo "NOUSRESEARCH_API_KEY=$NOUSRESEARCH_API_KEY" > /root/.hermes/.env\n\
chmod 600 /root/.hermes/.env\n\
exec hermes gateway start --port ${PORT:-8080}\n' > /entrypoint.sh && chmod +x /entrypoint.sh

# Cloud Run expects PORT env var
ENV PORT=8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD curl -f http://localhost:8080/v1/health || exit 1

CMD ["/entrypoint.sh"]
