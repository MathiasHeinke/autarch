FROM python:3.12-slim

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl xz-utils ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Pre-create Hermes config directory (prevents interactive setup wizard)
RUN mkdir -p /root/.hermes

# Copy Hermes configuration
COPY config/hermes.json /root/.hermes/config.json

# Create .env with API server enabled on the correct port
RUN printf 'NOUSRESEARCH_API_KEY=placeholder\nAPI_SERVER_ENABLED=true\nAPI_SERVER_PORT=8080\n' > /root/.hermes/.env && \
    chmod 600 /root/.hermes/.env

# Install Hermes Agent CLI (non-interactive because config already exists)
# The "|| true" ensures build continues even if the wizard prompt fails
RUN curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash || true

# Ensure binaries are in PATH
ENV PATH="/root/.local/bin:/root/.hermes/bin:${PATH}"

# Create entrypoint that injects the real API key at runtime, then starts gateway
RUN printf '#!/bin/bash\nset -e\n\n# Inject real API key from Cloud Run env vars\ncat > /root/.hermes/.env << EOF\nNOUSRESEARCH_API_KEY=${NOUSRESEARCH_API_KEY}\nAPI_SERVER_ENABLED=true\nAPI_SERVER_PORT=${PORT:-8080}\nEOF\nchmod 600 /root/.hermes/.env\n\necho "Starting Hermes Gateway (API Server on port ${PORT:-8080})..."\nexec hermes gateway run\n' > /entrypoint.sh && chmod +x /entrypoint.sh

# Cloud Run PORT
ENV PORT=8080
EXPOSE 8080

CMD ["/bin/bash", "/entrypoint.sh"]
