"""User model."""

import uuid
from typing import Optional
from sqlalchemy import String, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
import enum

from app.models.base import Base, TimestampMixin


class UserRole(str, enum.Enum):
    """User role enumeration."""

    USER = "user"
    ADMIN = "admin"


class User(Base, TimestampMixin):
    """User model for authentication and authorization."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )
    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    hashed_password: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,  # Nullable for OAuth users
    )
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole, name="user_role", create_type=False, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=UserRole.USER,
    )
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    oauth_provider: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
    )
    oauth_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    # Relationships
    jobs = relationship("Job", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"
