FROM python:3.12-slim

# System dependencies — Node.js for MCP + ffmpeg for audio transcription
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl ca-certificates \
    ffmpeg libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20 LTS (needed for MCP server via npx)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Pre-create Hermes config & skills directories
RUN mkdir -p /root/.hermes /app/skills

# Copy Hermes configuration + MCP config
COPY config/hermes.json /root/.hermes/config.json
COPY config/mcp.json /root/.hermes/mcp.json

# Install Hermes Agent as Python library (not CLI installer)
# This gives us direct `from run_agent import AIAgent` access
RUN pip install --no-cache-dir \
    "hermes-agent[honcho] @ git+https://github.com/NousResearch/hermes-agent.git"

# Install FastAPI wrapper + Cohere Transcribe dependencies
RUN pip install --no-cache-dir \
    fastapi uvicorn \
    torch torchaudio --extra-index-url https://download.pytorch.org/whl/cpu \
    transformers accelerate soundfile

# Pre-download Cohere Transcribe model to avoid cold-start latency
# Model is ~1.5GB — pre-baked into image for fast inference
RUN python3 -c "from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor; \
    AutoModelForSpeechSeq2Seq.from_pretrained('CohereLabs/cohere-transcribe-03-2026', trust_remote_code=True); \
    AutoProcessor.from_pretrained('CohereLabs/cohere-transcribe-03-2026', trust_remote_code=True)" \
    || echo "WARN: Model pre-download failed — will download on first use"

# Pre-install MCP Apify server so first call is fast
RUN npx -y @apify/actors-mcp-server --help || true

# Copy our FastAPI wrapper application
COPY main.py config.py models.py /app/

WORKDIR /app

# Entrypoint: inject API key → start our FastAPI wrapper
RUN printf '#!/bin/bash\nset -e\n\nexec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}\n' > /entrypoint.sh && chmod +x /entrypoint.sh

ENV PORT=8080
ENV MCP_CONFIG_PATH=/root/.hermes/mcp.json
ENV TRANSCRIPTION_MODEL=CohereLabs/cohere-transcribe-03-2026
EXPOSE 8080

CMD ["/bin/bash", "/entrypoint.sh"]
