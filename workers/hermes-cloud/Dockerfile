FROM python:3.12-slim

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Pre-create Hermes config directory
RUN mkdir -p /root/.hermes

# Copy Hermes configuration
COPY config/hermes.json /root/.hermes/config.json

# Install Hermes Agent as Python library (not CLI installer)
# This gives us direct `from run_agent import AIAgent` access
RUN pip install --no-cache-dir \
    "hermes-agent[honcho] @ git+https://github.com/NousResearch/hermes-agent.git"

# Install FastAPI wrapper dependencies
RUN pip install --no-cache-dir fastapi uvicorn

# Copy our FastAPI wrapper application
COPY main.py config.py models.py /app/

WORKDIR /app

# Entrypoint: inject API key → start our FastAPI wrapper
RUN printf '#!/bin/bash\nset -e\n\nexec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}\n' > /entrypoint.sh && chmod +x /entrypoint.sh

ENV PORT=8080
EXPOSE 8080

CMD ["/bin/bash", "/entrypoint.sh"]
