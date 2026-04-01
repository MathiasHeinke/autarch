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

# Toolset whitelist — NEVER allow terminal or process
ALLOWED_TOOLSETS = frozenset({"web", "file", "memory", "delegate_task"})
BLOCKED_TOOLSETS = frozenset({"terminal", "process", "shell", "exec", "subprocess"})

# Server
PORT = int(os.environ.get("PORT", "8080"))
