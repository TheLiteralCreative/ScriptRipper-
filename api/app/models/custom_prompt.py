"""Custom prompt model."""

import uuid
from typing import Optional
from sqlalchemy import Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base, TimestampMixin


class CustomPrompt(Base, TimestampMixin):
    """Custom ad-hoc prompt model."""

    __tablename__ = "custom_prompts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # Foreign key
    job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Prompt details
    prompt: Mapped[str] = mapped_column(Text, nullable=False)

    # Result reference
    result_artifact_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("artifacts.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Relationships
    job = relationship("Job", back_populates="custom_prompts")
    result_artifact = relationship("Artifact", foreign_keys=[result_artifact_id])

    def __repr__(self) -> str:
        return f"<CustomPrompt(id={self.id}, job_id={self.job_id})>"
