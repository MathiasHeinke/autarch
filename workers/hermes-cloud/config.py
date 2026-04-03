"""
Hermes Cloud Worker — Configuration
Environment variable mapping for Cloud Run deployment.
"""
import os

# Required
NOUSRESEARCH_API_KEY = os.environ.get("NOUSRESEARCH_API_KEY", "")

# Gateway security — shared secret between Paperclip adapter and worker
HERMES_CLOUD_SECRET = os.environ.get("HERMES_CLOUD_SECRET", "")

# Model defaults
DEFAULT_MODEL = os.environ.get("DEFAULT_MODEL", "nousresearch/hermes-4-405b")

# Safety limits
MAX_ITERATIONS_HARD_CAP = int(os.environ.get("MAX_ITERATIONS_HARD_CAP", "50"))
COST_PER_RUN_HARD_CAP = float(os.environ.get("COST_PER_RUN_HARD_CAP", "5.0"))

# Self-learning: separate learner budget (post-run auto-extraction)
LEARNER_BUDGET_PER_RUN = float(os.environ.get("LEARNER_BUDGET_PER_RUN", "0.50"))

# Toolset whitelist — NEVER allow terminal or process
ALLOWED_TOOLSETS = frozenset({
    "web", "file", "memory", "delegate_task",
    "todo", "skills", "vision", "session_search", "mcp",
})
BLOCKED_TOOLSETS = frozenset({"terminal", "process", "shell", "exec", "subprocess"})

# MCP integration
APIFY_API_KEY = os.environ.get("APIFY_API_KEY", "")
MCP_CONFIG_PATH = os.environ.get("MCP_CONFIG_PATH", "/root/.hermes/mcp.json")

# Transcription (Cohere Transcribe — Apache 2.0, 525min/min throughput)
TRANSCRIPTION_MODEL = os.environ.get("TRANSCRIPTION_MODEL", "CohereLabs/cohere-transcribe-03-2026")

# Server
PORT = int(os.environ.get("PORT", "8080"))
