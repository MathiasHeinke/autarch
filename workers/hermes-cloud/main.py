"""
Hermes Cloud Worker — FastAPI Application (Hybrid: Hermes CLI + FastAPI)

Uses the Hermes CLI tool (installed via installer script) for agent execution,
wrapped in a FastAPI server for guaranteed port binding on Cloud Run.

Endpoints:
  GET  /v1/health   — Liveness + Hermes CLI check
  POST /v1/execute   — Execute Hermes agent via CLI, stream as NDJSON
"""
import json
import os
import subprocess
import time
import logging
from typing import Generator

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse

from config import (
    NOUSRESEARCH_API_KEY,
    DEFAULT_MODEL,
    MAX_ITERATIONS_HARD_CAP,
    COST_PER_RUN_HARD_CAP,
)
from models import ExecuteRequest, ExecuteEvent, HealthResponse

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("hermes-cloud-worker")

app = FastAPI(title="Hermes Cloud Worker", version="0.2.0", docs_url=None, redoc_url=None)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def ndjson_line(event: ExecuteEvent) -> str:
    return json.dumps(event.model_dump(exclude_none=True), ensure_ascii=False) + "\n"

def system_event(content: str) -> str:
    return ndjson_line(ExecuteEvent(type="system", content=content))

def error_event(content: str) -> str:
    return ndjson_line(ExecuteEvent(type="error", content=content, isError=True))

def find_hermes_binary() -> str:
    """Find the hermes binary in known locations."""
    candidates = [
        os.path.expanduser("~/.local/bin/hermes"),
        os.path.expanduser("~/.hermes/bin/hermes"),
        "/usr/local/bin/hermes",
    ]
    for c in candidates:
        if os.path.isfile(c) and os.access(c, os.X_OK):
            return c
    # Fallback: try PATH
    result = subprocess.run(["which", "hermes"], capture_output=True, text=True)
    if result.returncode == 0:
        return result.stdout.strip()
    return ""


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
@app.get("/v1/health")
async def health() -> JSONResponse:
    hermes_bin = find_hermes_binary()
    hermes_version = ""
    
    if hermes_bin:
        try:
            result = subprocess.run(
                [hermes_bin, "version"],
                capture_output=True, text=True, timeout=5
            )
            hermes_version = result.stdout.strip() or result.stderr.strip()
        except Exception:
            pass
    
    resp = HealthResponse(
        status="healthy" if hermes_bin and NOUSRESEARCH_API_KEY else "degraded",
        model=DEFAULT_MODEL,
        version=hermes_version or "unknown",
        apiConnected=bool(NOUSRESEARCH_API_KEY),
    )
    status_code = 200 if resp.status == "healthy" else 503
    return JSONResponse(content=resp.model_dump(), status_code=status_code)


# ---------------------------------------------------------------------------
# Execute
# ---------------------------------------------------------------------------
@app.post("/v1/execute")
async def execute(req: ExecuteRequest) -> StreamingResponse:
    if not NOUSRESEARCH_API_KEY:
        raise HTTPException(status_code=503, detail="NOUSRESEARCH_API_KEY not configured")
    
    hermes_bin = find_hermes_binary()
    if not hermes_bin:
        raise HTTPException(status_code=503, detail="Hermes binary not found")
    
    max_iters = min(req.maxIterations, MAX_ITERATIONS_HARD_CAP)
    cost_cap = min(req.costCapPerRun, COST_PER_RUN_HARD_CAP)
    
    logger.info(
        "Execute: agent=%s run=%s model=%s iters=%d cap=$%.2f",
        req.agentId, req.runId, req.model, max_iters, cost_cap,
    )

    # Extract user message from context
    messages = req.context.get("messages", [])
    user_message = ""
    if messages:
        last_msg = messages[-1] if isinstance(messages, list) else messages
        user_message = last_msg.get("content", "") if isinstance(last_msg, dict) else str(last_msg)
    if not user_message:
        user_message = "Continue with the current task."

    def generate() -> Generator[str, None, None]:
        start = time.time()
        
        yield system_event(f"Hermes Cloud Worker v0.2.0 — model={req.model}, max_iterations={max_iters}")

        try:
            # Build Hermes CLI command
            cmd = [hermes_bin, "--yolo"]
            
            # Use profile if specified
            if req.profileName and req.profileName != "default":
                cmd.extend(["--profile", req.profileName])

            # Add the user message via stdin
            logger.info("Running: %s", " ".join(cmd))
            
            proc = subprocess.Popen(
                cmd,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                env={
                    **os.environ,
                    "NOUSRESEARCH_API_KEY": NOUSRESEARCH_API_KEY,
                },
                timeout=int(cost_cap * 120),  # rough timeout based on cost cap
            )
            
            # Send the prompt
            stdout, stderr = proc.communicate(input=user_message, timeout=300)
            
            if stdout:
                yield ndjson_line(ExecuteEvent(
                    type="response",
                    content=stdout.strip(),
                ))
            
            if stderr and proc.returncode != 0:
                yield error_event(f"Hermes stderr: {stderr.strip()[:500]}")
            
        except subprocess.TimeoutExpired:
            yield error_event(f"Hermes execution timed out after 300s")
            try:
                proc.kill()
            except Exception:
                pass
        except Exception as e:
            logger.error("Execution error: %s", str(e))
            yield error_event(f"Execution failed: {str(e)}")
        
        finally:
            duration_ms = int((time.time() - start) * 1000)
            yield ndjson_line(ExecuteEvent(
                type="usage",
                inputTokens=0,
                outputTokens=0,
                totalCostUsd=0,
                iterations=1,
                content=f"Duration: {duration_ms}ms",
            ))
            logger.info("Execute done: agent=%s duration=%dms", req.agentId, duration_ms)

    return StreamingResponse(
        generate(),
        media_type="application/x-ndjson",
        headers={
            "X-Hermes-Run-Id": req.runId,
            "X-Hermes-Agent-Id": req.agentId,
        },
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", "8080"))
    uvicorn.run(app, host="0.0.0.0", port=port)
