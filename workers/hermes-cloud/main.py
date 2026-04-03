"""
Hermes Cloud Worker — FastAPI Application (Stateless Inference Engine v0.6.0)

100% stateless worker. No local persistence. No subprocess CLI.
Uses hermes-agent Python library directly via `from run_agent import AIAgent`.
Authentication via X-Hermes-Secret shared secret.

Endpoints:
  GET  /v1/health   — Liveness check (no auth)
  POST /v1/execute   — Execute Hermes agent, stream as NDJSON (auth required)
"""
import json
import os
import asyncio
import time
import logging
import uuid
from typing import AsyncGenerator

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.responses import StreamingResponse, JSONResponse

from config import (
    NOUSRESEARCH_API_KEY,
    DEFAULT_MODEL,
    MAX_ITERATIONS_HARD_CAP,
    COST_PER_RUN_HARD_CAP,
    HERMES_CLOUD_SECRET,
    ALLOWED_TOOLSETS,
    BLOCKED_TOOLSETS,
    MCP_CONFIG_PATH,
)
from models import ExecuteRequest, ExecuteEvent, HealthResponse

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("hermes-cloud-worker")

app = FastAPI(title="Hermes Cloud Worker", version="0.6.0", docs_url=None, redoc_url=None)

# Lazy-loaded flag — checked once at startup
_hermes_available: bool | None = None


def _check_hermes_library() -> bool:
    """Check if hermes-agent library is importable."""
    global _hermes_available
    if _hermes_available is not None:
        return _hermes_available
    try:
        from run_agent import AIAgent  # noqa: F401
        _hermes_available = True
    except ImportError:
        _hermes_available = False
    return _hermes_available


# ---------------------------------------------------------------------------
# Gateway Authentication
# ---------------------------------------------------------------------------
async def verify_gateway_secret(x_hermes_secret: str = Header(..., alias="x-hermes-secret")):
    """Verify the shared secret between Paperclip adapter and this worker.
    
    Returns 503 if the secret is not configured (deploy misconfiguration).
    Returns 401 if the provided secret does not match.
    """
    if not HERMES_CLOUD_SECRET:
        raise HTTPException(
            status_code=503,
            detail="Gateway secret not configured — set HERMES_CLOUD_SECRET env var",
        )
    if x_hermes_secret != HERMES_CLOUD_SECRET:
        raise HTTPException(status_code=401, detail="Invalid gateway secret")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def ndjson_line(event: ExecuteEvent) -> str:
    return json.dumps(event.model_dump(exclude_none=True), ensure_ascii=False) + "\n"

def system_event(content: str) -> str:
    return ndjson_line(ExecuteEvent(type="system", content=content))

def error_event(content: str) -> str:
    return ndjson_line(ExecuteEvent(type="error", content=content, isError=True))


# ---------------------------------------------------------------------------
# Health (NO AUTH — Cloud Run healthcheck needs unauthenticated access)
# ---------------------------------------------------------------------------
@app.get("/v1/health")
async def health() -> JSONResponse:
    lib_ok = _check_hermes_library()
    hermes_version = ""

    if lib_ok:
        try:
            import importlib.metadata
            hermes_version = importlib.metadata.version("hermes-agent")
        except Exception:
            hermes_version = "installed"

    resp = HealthResponse(
        status="healthy" if lib_ok and NOUSRESEARCH_API_KEY else "degraded",
        model=DEFAULT_MODEL,
        version=hermes_version or "unknown",
        apiConnected=bool(NOUSRESEARCH_API_KEY),
    )
    status_code = 200 if resp.status == "healthy" else 503
    return JSONResponse(content=resp.model_dump(), status_code=status_code)


# ---------------------------------------------------------------------------
# Execute (AUTH REQUIRED via gateway secret)
# ---------------------------------------------------------------------------
@app.post("/v1/execute")
async def execute(
    req: ExecuteRequest,
    _auth: None = Depends(verify_gateway_secret),
) -> StreamingResponse:
    if not NOUSRESEARCH_API_KEY:
        raise HTTPException(status_code=503, detail="NOUSRESEARCH_API_KEY not configured")
    
    if not _check_hermes_library():
        raise HTTPException(status_code=503, detail="hermes-agent library not installed")

    max_iters = min(req.maxIterations, MAX_ITERATIONS_HARD_CAP)
    
    logger.info(
        "Execute: agent=%s run=%s model=%s iters=%d",
        req.agentId, req.runId, req.model, max_iters,
    )

    # Extract user message from context
    messages = req.context.get("messages", [])
    user_message = ""
    conversation_history = []

    for msg in (messages if isinstance(messages, list) else [messages]):
        if isinstance(msg, dict):
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "user" and not user_message:
                # Take the last user message as the active prompt
                pass
            conversation_history.append({"role": role, "content": content})

    # The last user message is what we execute
    if conversation_history:
        for msg in reversed(conversation_history):
            if msg.get("role") == "user":
                user_message = msg.get("content", "")
                # Remove from history so AIAgent sees it as the new prompt
                conversation_history = [
                    m for m in conversation_history if m is not msg
                ]
                break
    
    if not user_message:
        user_message = "Continue with the current task."

    # Build system prompt from request + externalized brain
    system_prompt_parts: list[str] = []
    if req.systemPrompt:
        system_prompt_parts.append(req.systemPrompt)

    # Hydrate externalized memories (sorted by importance, highest first)
    if req.memorySnapshot:
        sorted_memories = sorted(req.memorySnapshot, key=lambda m: m.importance, reverse=True)
        memory_lines = [f"- **{m.key}**: {m.content}" for m in sorted_memories]
        system_prompt_parts.append(
            "## Your Memories (from previous sessions)\n" + "\n".join(memory_lines)
        )

    # Hydrate externalized skills
    if req.skillsIndex:
        sorted_skills = sorted(req.skillsIndex, key=lambda s: s.importance, reverse=True)
        skill_lines = [f"- **{s.key}**: {s.content}" for s in sorted_skills]
        system_prompt_parts.append(
            "## Your Acquired Skills\n" + "\n".join(skill_lines)
        )

    # Hydrate Honcho cross-session reasoning insight
    if req.honchoInsight:
        system_prompt_parts.append(
            "## Cross-Session Insights (from Honcho reasoning engine)\n" + req.honchoInsight
        )

    # Count externalized brain items for system prompt enrichment
    memory_count = len(req.memorySnapshot)
    skill_count = len(req.skillsIndex)
    lesson_count = sum(1 for m in req.memorySnapshot if m.category == "lesson")
    if memory_count or skill_count:
        system_prompt_parts.append(
            f"## Session Context\n"
            f"You have {memory_count} memories, {skill_count} skills, and {lesson_count} lessons from previous sessions."
        )

    system_prompt = "\n\n".join(system_prompt_parts) if system_prompt_parts else None

    # Build enabled toolsets — filter through security whitelist
    safe_toolsets = [t for t in req.enabledToolsets if t in ALLOWED_TOOLSETS and t not in BLOCKED_TOOLSETS]

    async def generate() -> AsyncGenerator[str, None]:
        start = time.time()
        
        yield system_event(f"Hermes Cloud Worker v0.6.0 — model={req.model}, max_iterations={max_iters}")

        input_tokens = 0
        output_tokens = 0
        total_cost_usd = 0.0
        iterations = 0

        try:
            from run_agent import AIAgent

            # Create AIAgent in library mode — stateless, no local memory
            # Resolve model name — prepend nousresearch/ if no provider prefix
            resolved_model = req.model or DEFAULT_MODEL
            if "/" not in resolved_model:
                resolved_model = f"nousresearch/{resolved_model}"

            # Check for MCP config
            import pathlib
            mcp_config = MCP_CONFIG_PATH if pathlib.Path(MCP_CONFIG_PATH).exists() else None

            agent = AIAgent(
                api_key=NOUSRESEARCH_API_KEY,
                base_url="https://inference-api.nousresearch.com/v1",
                model=resolved_model,
                max_iterations=max_iters,
                quiet_mode=True,
                skip_memory=True,           # No ~/.hermes/memories/ — externalized
                skip_context_files=True,     # No SOUL.md/AGENTS.md injection
                persist_session=False,       # No session file writes
                enabled_toolsets=safe_toolsets if safe_toolsets is not None else None,
                disabled_toolsets=list(BLOCKED_TOOLSETS),
                ephemeral_system_prompt=system_prompt,
                session_id=req.runId or str(uuid.uuid4()),
                mcp_config_path=mcp_config,
                skills_dir="/app/skills",
            )

            yield system_event("AIAgent initialized — starting inference")

            # Run the conversation in a thread pool to avoid blocking asyncio
            loop = asyncio.get_running_loop()
            result = await loop.run_in_executor(
                None,
                lambda: agent.run_conversation(
                    user_message=user_message,
                    conversation_history=conversation_history if conversation_history else None,
                ),
            )

            # Extract real usage from AIAgent return
            final_response = result.get("final_response", "")
            completed = result.get("completed", False)
            iterations = result.get("api_calls", 0)
            input_tokens = result.get("prompt_tokens", 0) or result.get("input_tokens", 0)
            output_tokens = result.get("completion_tokens", 0) or result.get("output_tokens", 0)
            total_cost_usd = result.get("estimated_cost_usd", 0.0) or 0.0

            # ----------------------------------------------------------
            # Emit tool_call events from the conversation messages.
            # The server-side memory-lifecycle.ts watches for these to
            # persist memories into agent_memory.  Without this, ALL
            # tool invocations (memory, web, file, delegate_task) are
            # invisible to the Paperclip control plane.
            # ----------------------------------------------------------
            agent_messages = result.get("messages", [])
            if isinstance(agent_messages, list):
                for msg in agent_messages:
                    if not isinstance(msg, dict):
                        continue
                    role = msg.get("role", "")

                    # OpenAI-style tool_calls inside an assistant message
                    if role == "assistant":
                        tool_calls = msg.get("tool_calls", [])
                        if isinstance(tool_calls, list):
                            for tc in tool_calls:
                                if not isinstance(tc, dict):
                                    continue
                                fn = tc.get("function", {})
                                fn_name = fn.get("name", "") if isinstance(fn, dict) else ""
                                fn_args_raw = fn.get("arguments", "{}") if isinstance(fn, dict) else "{}"
                                try:
                                    fn_args = json.loads(fn_args_raw) if isinstance(fn_args_raw, str) else fn_args_raw
                                except json.JSONDecodeError:
                                    fn_args = {"raw": fn_args_raw}
                                yield ndjson_line(ExecuteEvent(
                                    type="tool_call",
                                    name=fn_name,
                                    input=fn_args,
                                    toolUseId=tc.get("id", ""),
                                ))

                    # Anthropic-style content blocks with type=tool_use
                    content_blocks = msg.get("content", [])
                    if isinstance(content_blocks, list):
                        for block in content_blocks:
                            if isinstance(block, dict) and block.get("type") == "tool_use":
                                yield ndjson_line(ExecuteEvent(
                                    type="tool_call",
                                    name=block.get("name", ""),
                                    input=block.get("input", {}),
                                    toolUseId=block.get("id", ""),
                                ))

            if final_response:
                yield ndjson_line(ExecuteEvent(
                    type="response",
                    content=final_response,
                ))

            if not completed:
                error_msg = result.get("error", "")
                if error_msg:
                    yield error_event(f"Agent incomplete: {error_msg}")

        except ImportError as e:
            logger.error("Library import error: %s", str(e))
            yield error_event(f"hermes-agent library error: {str(e)}")
        except Exception as e:
            logger.error("Execution error: %s", str(e))
            yield error_event(f"Execution failed: {str(e)}")
        
        finally:
            duration_ms = int((time.time() - start) * 1000)
            yield ndjson_line(ExecuteEvent(
                type="usage",
                inputTokens=input_tokens,
                outputTokens=output_tokens,
                totalCostUsd=total_cost_usd,
                iterations=iterations,
                content=f"Duration: {duration_ms}ms",
            ))
            logger.info(
                "Execute done: agent=%s duration=%dms tokens_in=%d tokens_out=%d cost=$%.4f",
                req.agentId, duration_ms, input_tokens, output_tokens, total_cost_usd,
            )

    return StreamingResponse(
        generate(),
        media_type="application/x-ndjson",
        headers={
            "X-Hermes-Run-Id": req.runId,
            "X-Hermes-Agent-Id": req.agentId,
        },
    )


# ---------------------------------------------------------------------------
# Transcription (Cohere Transcribe — self-hosted, Apache 2.0)
# ---------------------------------------------------------------------------
_transcriber = None

def _get_transcriber():
    """Lazy-load transcription pipeline to avoid import cost on health checks."""
    global _transcriber
    if _transcriber is not None:
        return _transcriber
    try:
        from config import TRANSCRIPTION_MODEL
        from transformers import pipeline
        import torch
        device = "cuda" if torch.cuda.is_available() else "cpu"
        _transcriber = pipeline(
            "automatic-speech-recognition",
            model=TRANSCRIPTION_MODEL,
            device=device,
            trust_remote_code=True,
        )
        logger.info("Transcription model loaded: %s on %s", TRANSCRIPTION_MODEL, device)
    except Exception as e:
        logger.error("Failed to load transcription model: %s", str(e))
        _transcriber = None
    return _transcriber


@app.post("/v1/transcribe")
async def transcribe(
    _auth: None = Depends(verify_gateway_secret),
):
    """Transcribe audio via Cohere Transcribe.
    
    Accepts multipart/form-data with an 'audio' file field.
    Returns JSON with transcript and metadata.
    """
    from fastapi import UploadFile, File as FastAPIFile
    # Re-import is intentional — this endpoint is rarely used
    raise HTTPException(status_code=501, detail="Transcription endpoint ready — upload handler coming in next iteration")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", "8080"))
    uvicorn.run(app, host="0.0.0.0", port=port)
