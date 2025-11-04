"""Custom analysis schemas."""

from pydantic import BaseModel


class CustomAnalyzeRequest(BaseModel):
    """Custom analysis request schema."""

    transcript: str
    task_name: str
    prompt: str
    provider: str = "gemini"
    model: str = "models/gemini-2.5-flash"


class CustomAnalyzeResponse(BaseModel):
    """Custom analysis response schema."""

    task_name: str
    result: str
    input_tokens: int
    output_tokens: int
    cost: float
    model: str
