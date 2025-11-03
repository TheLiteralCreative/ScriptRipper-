"""Profile model."""

import uuid
from typing import Optional, Dict, Any
from sqlalchemy import String, Integer, Text, Enum as SQLEnum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
import enum

from app.models.base import Base, TimestampMixin


class ProfileStatus(str, enum.Enum):
    """Profile status enumeration."""

    DRAFT = "draft"
    PUBLISHED = "published"
    DEPRECATED = "deprecated"


class LLMProvider(str, enum.Enum):
    """LLM provider enumeration."""

    GEMINI = "gemini"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"


class Profile(Base, TimestampMixin):
    """Analysis profile model."""

    __tablename__ = "profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    key: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # JSON fields for flexible configuration
    schema: Mapped[Dict[str, Any]] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
    )
    prompts: Mapped[Dict[str, Any]] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
    )

    status: Mapped[ProfileStatus] = mapped_column(
        SQLEnum(ProfileStatus, name="profile_status", create_type=True),
        nullable=False,
        default=ProfileStatus.DRAFT,
    )
    provider: Mapped[LLMProvider] = mapped_column(
        SQLEnum(LLMProvider, name="llm_provider", create_type=True),
        nullable=False,
        default=LLMProvider.GEMINI,
    )
    model: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Relationships
    jobs = relationship("Job", back_populates="profile")

    def __repr__(self) -> str:
        return f"<Profile(id={self.id}, key={self.key}, version={self.version}, status={self.status})>"
