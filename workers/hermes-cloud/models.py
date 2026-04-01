"""
Hermes Cloud Worker — Pydantic Models
Request/response schemas with validation for security enforcement.
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from config import ALLOWED_TOOLSETS, BLOCKED_TOOLSETS, MAX_ITERATIONS_HARD_CAP


class MemoryEntry(BaseModel):
    """Single externalized memory/skill from the Paperclip DB."""
    key: str
    content: str
    category: str = "memory"  # memory | skill | conversation
    importance: int = 50


class ExecuteRequest(BaseModel):
    """Incoming execution request from Autarch adapter."""
    agentId: str
    runId: str
    profileName: str = "default"
    model: str = "hermes-4-405b"
    systemPrompt: str = ""
    context: dict = Field(default_factory=dict)
    enabledToolsets: list[str] = Field(default_factory=lambda: ["web", "file", "memory"])
    maxIterations: int = Field(default=20, ge=1, le=MAX_ITERATIONS_HARD_CAP)
    costCapPerRun: float = Field(default=5.0, gt=0)

    # Externalized Brain — injected by adapter from Paperclip DB
    memorySnapshot: list[MemoryEntry] = Field(default_factory=list)
    skillsIndex: list[MemoryEntry] = Field(default_factory=list)

    # Honcho — cross-session reasoning insight (optional)
    honchoInsight: Optional[str] = None

    @field_validator("enabledToolsets")
    @classmethod
    def validate_toolsets(cls, v: list[str]) -> list[str]:
        """HARD ENFORCEMENT: reject any blocked toolsets."""
        for toolset in v:
            if toolset in BLOCKED_TOOLSETS:
                raise ValueError(
                    f"Toolset '{toolset}' is permanently blocked for security reasons"
                )
            if toolset not in ALLOWED_TOOLSETS:
                raise ValueError(
                    f"Toolset '{toolset}' is not in the allowed set: {sorted(ALLOWED_TOOLSETS)}"
                )
        return v

    @field_validator("maxIterations")
    @classmethod
    def cap_iterations(cls, v: int) -> int:
        return min(v, MAX_ITERATIONS_HARD_CAP)


class ExecuteEvent(BaseModel):
    """Single NDJSON event streamed back to the adapter."""
    type: str  # thinking | response | tool_call | tool_result | usage | error | system
    content: Optional[str] = None
    name: Optional[str] = None
    input: Optional[dict] = None
    toolUseId: Optional[str] = None
    isError: bool = False
    # Usage fields (type == "usage")
    inputTokens: Optional[int] = None
    outputTokens: Optional[int] = None
    totalCostUsd: Optional[float] = None
    iterations: Optional[int] = None


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = "healthy"
    model: str = ""
    version: str = "0.1.0"
    apiConnected: bool = False
