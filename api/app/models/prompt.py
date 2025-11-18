"""Prompt model for managing analysis prompts."""

import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Prompt(Base):
    """Prompt model for storing analysis prompts."""

    __tablename__ = "prompts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    task_name: Mapped[str] = mapped_column(String(255), nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)  # Legacy field, kept for backward compatibility
    description: Mapped[str] = mapped_column(Text, nullable=False)  # User-facing description
    prompt_json: Mapped[str] = mapped_column(Text, nullable=False)  # Actual JSON prompt for processing
    category: Mapped[str] = mapped_column(String(50), nullable=False)  # 'meetings' or 'presentations'
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def to_dict(self):
        """Convert to dictionary."""
        return {
            "id": str(self.id),
            "task_name": self.task_name,
            "prompt": self.prompt,  # Legacy field
            "description": self.description,
            "prompt_json": self.prompt_json,
            "category": self.category.value if hasattr(self.category, 'value') else self.category,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
