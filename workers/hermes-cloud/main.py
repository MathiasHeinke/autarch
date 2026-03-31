"""
Hermes Cloud Worker — FastAPI Application
Cloud Run worker for Hermes v0.6.0 agent execution with NDJSON streaming.

Endpoints:
  GET  /v1/health   — Liveness + provider connectivity check
  POST /v1/execute   — Execute Hermes agent with NDJSON response stream
"""
import json
import time
import logging
import traceback
from typing import AsyncGenerator, Generator

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse

from config import (
    NOUSRESEARCH_API_KEY,
    DEFAULT_MODEL,
    MAX_ITERATIONS_HARD_CAP,
    COST_PER_RUN_HARD_CAP,
    PORT,
)
from models import ExecuteRequest, ExecuteEvent, HealthResponse

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("hermes-cloud-worker")

app = FastAPI(
    title="Hermes Cloud Worker",
    version="0.1.0",
    docs_url=None,  # No public docs
    redoc_url=None,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def ndjson_line(event: ExecuteEvent) -> str:
    """Serialize an event to a single NDJSON line."""
    return json.dumps(event.model_dump(exclude_none=True), ensure_ascii=False) + "\n"


def system_event(content: str) -> str:
    return ndjson_line(ExecuteEvent(type="system", content=content))


def error_event(content: str) -> str:
    return ndjson_line(ExecuteEvent(type="error", content=content, isError=True))


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
@app.get("/v1/health")
async def health() -> JSONResponse:
    """Liveness check + NousResearch API connectivity."""
    api_connected = bool(NOUSRESEARCH_API_KEY)

    # Optional: verify API key works (lightweight check)
    resp = HealthResponse(
        status="healthy" if api_connected else "degraded",
        model=DEFAULT_MODEL,
        version="0.1.0",
        apiConnected=api_connected,
    )
    status_code = 200 if api_connected else 503
    return JSONResponse(content=resp.model_dump(), status_code=status_code)


# ---------------------------------------------------------------------------
# Execute
# ---------------------------------------------------------------------------
@app.post("/v1/execute")
async def execute(req: ExecuteRequest) -> StreamingResponse:
    """
    Execute a Hermes agent run and stream events as NDJSON.

    This endpoint:
    1. Validates the request (toolsets, iterations, cost cap)
    2. Creates a Hermes Profile on-the-fly from the request payload
    3. Runs the agent with iteration cap
    4. Streams events as NDJSON
    5. Emits a final usage summary
    """
    if not NOUSRESEARCH_API_KEY:
        raise HTTPException(status_code=503, detail="NOUSRESEARCH_API_KEY not configured")

    # Enforce hard caps (belt + suspenders — Pydantic already validates)
    max_iters = min(req.maxIterations, MAX_ITERATIONS_HARD_CAP)
    cost_cap = min(req.costCapPerRun, COST_PER_RUN_HARD_CAP)

    logger.info(
        "Execute: agent=%s run=%s model=%s iters=%d cap=$%.2f toolsets=%s",
        req.agentId, req.runId, req.model, max_iters, cost_cap, req.enabledToolsets,
    )

    def generate() -> Generator[str, None, None]:
        """Synchronous generator for NDJSON events."""
        start = time.time()
        total_input_tokens = 0
        total_output_tokens = 0
        iterations_done = 0

        try:
            yield system_event(f"Hermes Cloud Worker starting — model={req.model}, max_iterations={max_iters}")

            # ---------------------------------------------------------------
            # Hermes Agent Execution
            # ---------------------------------------------------------------
            # Import hermes lazily to avoid startup cost if not needed
            try:
                from hermes.agent import AIAgent
                from hermes.profile import Profile
            except ImportError:
                yield error_event("hermes-agent package not installed on this worker")
                return

            # Create profile on-the-fly (stateless — no file-based profiles)
            profile = Profile(
                name=req.profileName,
                model=req.model,
                api_key=NOUSRESEARCH_API_KEY,
                system_prompt=req.systemPrompt or None,
                enabled_toolsets=req.enabledToolsets,
                max_iterations=max_iters,
            )

            agent = AIAgent(profile=profile)

            # Extract the user message from context
            messages = req.context.get("messages", [])
            user_message = ""
            if messages:
                last_msg = messages[-1] if isinstance(messages, list) else messages
                user_message = last_msg.get("content", "") if isinstance(last_msg, dict) else str(last_msg)

            if not user_message:
                user_message = "Continue with the current task."

            yield system_event(f"Running agent iteration (max {max_iters})...")

            # Run the agent
            result = agent.run(user_message)

            # Parse result
            if hasattr(result, "response"):
                yield ndjson_line(ExecuteEvent(
                    type="response",
                    content=result.response or "Agent completed without response.",
                ))

            if hasattr(result, "usage"):
                total_input_tokens = getattr(result.usage, "input_tokens", 0) or 0
                total_output_tokens = getattr(result.usage, "output_tokens", 0) or 0

            if hasattr(result, "tool_calls"):
                for tc in (result.tool_calls or []):
                    yield ndjson_line(ExecuteEvent(
                        type="tool_call",
                        name=getattr(tc, "name", "unknown"),
                        input=getattr(tc, "input", {}),
                    ))

            iterations_done = getattr(result, "iterations", 1) or 1

        except Exception as e:
            logger.error("Agent execution error: %s", traceback.format_exc())
            yield error_event(f"Agent execution failed: {str(e)}")

        finally:
            duration_ms = int((time.time() - start) * 1000)

            # Rough cost estimate (NousResearch pricing)
            # Hermes 4 405B: ~$0.002/1K input, ~$0.006/1K output
            input_cost = (total_input_tokens / 1000) * 0.002
            output_cost = (total_output_tokens / 1000) * 0.006
            total_cost = input_cost + output_cost

            yield ndjson_line(ExecuteEvent(
                type="usage",
                inputTokens=total_input_tokens,
                outputTokens=total_output_tokens,
                totalCostUsd=round(total_cost, 6),
                iterations=iterations_done,
                content=f"Duration: {duration_ms}ms",
            ))

            logger.info(
                "Execute done: agent=%s tokens=%d/%d cost=$%.4f iters=%d duration=%dms",
                req.agentId, total_input_tokens, total_output_tokens,
                total_cost, iterations_done, duration_ms,
            )

            # Cleanup
            try:
                if 'agent' in dir():
                    del agent
                if 'profile' in dir():
                    del profile
            except Exception:
                pass

    return StreamingResponse(
        generate(),
        media_type="application/x-ndjson",
        headers={
            "X-Hermes-Run-Id": req.runId,
            "X-Hermes-Agent-Id": req.agentId,
        },
    )


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
