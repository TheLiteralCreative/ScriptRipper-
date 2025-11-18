"""Batch analysis schemas for processing multiple prompts as one rip."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class PromptTask(BaseModel):
    """Single prompt task."""

    task_name: str
    prompt: str


class TranscriptMetadata(BaseModel):
    """Metadata about the transcript."""

    participantCount: int
    participantType: str  # 'solo', 'interview', 'group', 'panel', 'other'
    customType: Optional[str] = None
    title: str
    date: str
    participants: List[str]


class BatchAnalyzeRequest(BaseModel):
    """Batch analysis request schema."""

    transcript: str
    transcript_type: str  # 'meetings' or 'presentations' (deprecated, kept for backward compat)
    tasks: List[PromptTask] = Field(..., min_length=1, max_length=5)
    provider: str = "gemini"
    model: str = "models/gemini-2.5-flash"
    metadata: Optional[TranscriptMetadata] = None


class TaskResult(BaseModel):
    """Single task result."""

    task_name: str
    result: str
    input_tokens: int
    output_tokens: int
    cost: float


class BatchAnalyzeResponse(BaseModel):
    """Batch analysis response schema."""

    results: List[TaskResult]
    total_input_tokens: int
    total_output_tokens: int
    total_cost: float
    model: str
    rip_id: str  # Usage record ID
