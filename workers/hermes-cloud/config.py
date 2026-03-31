"""
Hermes Cloud Worker — Configuration
Environment variable mapping for Cloud Run deployment.
"""
import os

# Required
NOUSRESEARCH_API_KEY = os.environ.get("NOUSRESEARCH_API_KEY", "")

# Model defaults
DEFAULT_MODEL = os.environ.get("DEFAULT_MODEL", "hermes-4-405b")

# Safety limits
MAX_ITERATIONS_HARD_CAP = int(os.environ.get("MAX_ITERATIONS_HARD_CAP", "50"))
COST_PER_RUN_HARD_CAP = float(os.environ.get("COST_PER_RUN_HARD_CAP", "5.0"))

# Supabase (for Phase 5 persistence)
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

# Toolset whitelist — NEVER allow terminal or process
ALLOWED_TOOLSETS = frozenset({"web", "file", "memory", "delegate_task"})
BLOCKED_TOOLSETS = frozenset({"terminal", "process", "shell", "exec", "subprocess"})

# Server
PORT = int(os.environ.get("PORT", "8080"))
