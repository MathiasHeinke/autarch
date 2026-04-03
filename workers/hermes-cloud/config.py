"""
Hermes Cloud Worker — Configuration
Environment variable mapping for Cloud Run deployment.

v0.7.0: Migrated from NousResearch to Gemini (via OpenAI-compatible endpoint).
"""
import os

# =============================================================================
# Gemini API — Primary inference backend (via OpenAI-compatible endpoint)
# =============================================================================
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY", "")
GEMINI_BASE_URL = os.environ.get(
    "GEMINI_BASE_URL",
    "https://generativelanguage.googleapis.com/v1beta/openai/"
)

# Tiered models — Pro for complex tasks, Flash for simple/fast ones
DEFAULT_MODEL = os.environ.get("DEFAULT_MODEL", "gemini-3.1-pro-preview")
FLASH_MODEL = os.environ.get("FLASH_MODEL", "gemini-3-flash-preview")

# =============================================================================
# Legacy NousResearch fallback (kept for rollback, not active)
# =============================================================================
NOUSRESEARCH_API_KEY = os.environ.get("NOUSRESEARCH_API_KEY", "")
NOUSRESEARCH_BASE_URL = "https://inference-api.nousresearch.com/v1"

# =============================================================================
# Gateway security — shared secret between Paperclip adapter and worker
# =============================================================================
HERMES_CLOUD_SECRET = os.environ.get("HERMES_CLOUD_SECRET", "").strip()

# =============================================================================
# Safety limits
# =============================================================================
MAX_ITERATIONS_HARD_CAP = int(os.environ.get("MAX_ITERATIONS_HARD_CAP", "50"))
COST_PER_RUN_HARD_CAP = float(os.environ.get("COST_PER_RUN_HARD_CAP", "5.0"))

# Self-learning: separate learner budget (post-run auto-extraction)
LEARNER_BUDGET_PER_RUN = float(os.environ.get("LEARNER_BUDGET_PER_RUN", "0.50"))

# =============================================================================
# Toolset whitelist — NEVER allow terminal or process
# =============================================================================
ALLOWED_TOOLSETS = frozenset({
    "web", "file", "memory", "delegate_task", "hire_employee",
    "todo", "skills", "vision", "session_search", "mcp",
})
BLOCKED_TOOLSETS = frozenset({"terminal", "process", "shell", "exec", "subprocess"})

# =============================================================================
# MCP integration
# =============================================================================
APIFY_API_KEY = os.environ.get("APIFY_API_KEY", "")
MCP_CONFIG_PATH = os.environ.get("MCP_CONFIG_PATH", "/root/.hermes/mcp.json")

# =============================================================================
# Transcription (Cohere Transcribe — Apache 2.0, 525min/min throughput)
# =============================================================================
TRANSCRIPTION_MODEL = os.environ.get("TRANSCRIPTION_MODEL", "CohereLabs/cohere-transcribe-03-2026")

# =============================================================================
# Server
# =============================================================================
PORT = int(os.environ.get("PORT", "8080"))
