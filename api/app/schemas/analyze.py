"""Analysis endpoint schemas."""

from typing import Dict, Any
from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    """Request to analyze a transcript."""

    transcript: str = Field(
        ...,
        description="The transcript text to analyze",
        min_length=10,
    )
    profile_key: str = Field(
        ...,
        description="The profile key to use for analysis (e.g., 'meetings', 'presentations')",
        examples=["meetings", "presentations"],
    )

    model_config = {"json_schema_extra": {"example": {
        "transcript": "John: Hi everyone, thanks for joining today's meeting...",
        "profile_key": "meetings"
    }}}


class AnalysisMetadata(BaseModel):
    """Metadata about the analysis."""

    profile_key: str = Field(..., description="Profile key used")
    profile_version: int = Field(..., description="Profile version used")
    provider: str = Field(..., description="LLM provider used")
    model: str = Field(..., description="LLM model used")
    input_tokens: int = Field(..., description="Total input tokens")
    output_tokens: int = Field(..., description="Total output tokens")
    total_tokens: int = Field(..., description="Total tokens (input + output)")
    total_cost: float = Field(..., description="Total cost in USD")


class AnalyzeResponse(BaseModel):
    """Response from transcript analysis."""

    results: Dict[str, Any] = Field(
        ...,
        description="Analysis results keyed by task name",
    )
    metadata: AnalysisMetadata = Field(
        ...,
        description="Metadata about the analysis",
    )

    model_config = {"json_schema_extra": {"example": {
        "results": {
            "summary": "The meeting discussed project updates and next steps...",
            "key_decisions": ["Approved new feature timeline", "Assigned tasks to team members"],
            "action_items": ["Alice: Complete API design by Friday", "Bob: Review security requirements"],
            "topics": ["Project timeline", "Resource allocation", "Security considerations"],
            "quotables": ["John: 'This is our highest priority for Q1'"]
        },
        "metadata": {
            "profile_key": "meetings",
            "profile_version": 1,
            "provider": "gemini",
            "model": "gemini-1.5-pro-latest",
            "input_tokens": 1234,
            "output_tokens": 567,
            "total_tokens": 1801,
            "total_cost": 0.0123
        }
    }}}
