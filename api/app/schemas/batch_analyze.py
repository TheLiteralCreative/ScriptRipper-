"""Batch analysis schemas for processing multiple prompts as one rip."""

from typing import List, Optional
from pydantic import BaseModel, Field


class PromptTask(BaseModel):
    """Single prompt task."""

    task_name: str
    prompt: str


class BatchAnalyzeRequest(BaseModel):
    """Batch analysis request schema."""

    transcript: str
    transcript_type: str  # 'meetings' or 'presentations'
    tasks: List[PromptTask] = Field(..., min_length=1, max_length=5)
    provider: str = "gemini"
    model: str = "models/gemini-2.5-flash"


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
