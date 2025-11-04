"""Job model."""

import uuid
from typing import Optional, Dict, Any
from decimal import Decimal
from datetime import datetime
from sqlalchemy import String, Text, Numeric, Enum as SQLEnum, JSON, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
import enum

from app.models.base import Base, TimestampMixin


class JobStatus(str, enum.Enum):
    """Job status enumeration."""

    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class Job(Base, TimestampMixin):
    """Analysis job model."""

    __tablename__ = "jobs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # Foreign keys
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("profiles.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    # Job details
    status: Mapped[JobStatus] = mapped_column(
        SQLEnum(JobStatus, name="job_status", create_type=False, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=JobStatus.QUEUED,
        index=True,
    )
    input_uri: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Metrics
    metrics: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
        default=dict,
    )
    cost: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 4),
        nullable=True,
    )

    # Provider info
    provider: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    model: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Error handling
    error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Completion tracking
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Idempotency
    idempotency_key: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        unique=True,
        index=True,
    )

    # Relationships
    user = relationship("User", back_populates="jobs")
    profile = relationship("Profile", back_populates="jobs")
    artifacts = relationship(
        "Artifact",
        back_populates="job",
        cascade="all, delete-orphan",
    )
    custom_prompts = relationship(
        "CustomPrompt",
        back_populates="job",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Job(id={self.id}, status={self.status}, user_id={self.user_id})>"
