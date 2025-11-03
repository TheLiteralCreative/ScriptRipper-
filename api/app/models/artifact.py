"""Artifact model."""

import uuid
from typing import Optional
from sqlalchemy import String, Text, Integer, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
import enum

from app.models.base import Base, TimestampMixin


class ArtifactKind(str, enum.Enum):
    """Artifact kind enumeration."""

    MARKDOWN = "markdown"
    JSON = "json"
    PDF = "pdf"
    ZIP = "zip"


class Artifact(Base, TimestampMixin):
    """Job artifact (output file) model."""

    __tablename__ = "artifacts"

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

    # Artifact details
    kind: Mapped[ArtifactKind] = mapped_column(
        SQLEnum(ArtifactKind, name="artifact_kind", create_type=True),
        nullable=False,
    )
    uri: Mapped[str] = mapped_column(Text, nullable=False)
    checksum: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    size: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Relationships
    job = relationship("Job", back_populates="artifacts")

    def __repr__(self) -> str:
        return f"<Artifact(id={self.id}, kind={self.kind}, job_id={self.job_id})>"
