FROM python:3.12-slim

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl xz-utils ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Pre-create Hermes config directory
RUN mkdir -p /root/.hermes

# Copy Hermes configuration
COPY config/hermes.json /root/.hermes/config.json

# Create .env placeholder
RUN printf 'NOUSRESEARCH_API_KEY=placeholder\n' > /root/.hermes/.env && \
    chmod 600 /root/.hermes/.env

# Install Hermes Agent CLI (non-interactive because config already exists)
RUN curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash || true

# Ensure all binaries are in PATH
ENV PATH="/root/.local/bin:/root/.hermes/bin:${PATH}"

# Install FastAPI wrapper dependencies using pip (system Python)
RUN pip install --no-cache-dir fastapi uvicorn pydantic httpx

# Copy our FastAPI wrapper application
COPY main.py config.py models.py /app/

WORKDIR /app

# Entrypoint: inject API key → start our FastAPI wrapper (not hermes gateway)
RUN printf '#!/bin/bash\nset -e\n\n# Write real API key from Cloud Run env\ncat > /root/.hermes/.env << EOF\nNOUSRESEARCH_API_KEY=${NOUSRESEARCH_API_KEY}\nEOF\nchmod 600 /root/.hermes/.env\n\n# Start our FastAPI wrapper on PORT (Cloud Run sets this)\nexec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}\n' > /entrypoint.sh && chmod +x /entrypoint.sh

ENV PORT=8080
EXPOSE 8080

CMD ["/bin/bash", "/entrypoint.sh"]
