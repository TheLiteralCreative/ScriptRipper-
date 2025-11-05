"""Usage tracking models."""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import UUID, String, Integer, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Usage(Base):
    """Track user rips for rate limiting."""

    __tablename__ = "usage"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    transcript_type: Mapped[str] = mapped_column(String(50), nullable=False)  # 'meetings' or 'presentations'
    prompt_count: Mapped[int] = mapped_column(Integer, nullable=False)
    had_custom_prompt: Mapped[bool] = mapped_column(default=False)
    total_input_tokens: Mapped[int] = mapped_column(Integer, default=0)
    total_output_tokens: Mapped[int] = mapped_column(Integer, default=0)
    total_cost: Mapped[float] = mapped_column(default=0.0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )

    def __repr__(self) -> str:
        return f"<Usage(user_id={self.user_id}, prompts={self.prompt_count}, created_at={self.created_at})>"
