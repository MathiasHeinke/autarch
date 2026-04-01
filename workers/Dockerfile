FROM python:3.12-slim

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl nodejs npm ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Hermes Agent
RUN curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash

# Copy configuration
COPY config/ /root/.hermes/
COPY skills/ /root/.hermes/skills/

# Cloud Run expects PORT env var
ENV PORT=8080
EXPOSE 8080

# Start Hermes gateway for API access
CMD ["hermes", "gateway", "start", "--port", "8080"]
