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


class SubscriptionTier(str, enum.Enum):
    """User subscription tier enumeration."""

    FREE = "free"
    PRO = "pro"
    PREMIUM = "premium"


class SubscriptionSource(str, enum.Enum):
    """Source of subscription tier grant."""

    NONE = "none"  # Free tier, no subscription
    STRIPE = "stripe"  # Paid via Stripe
    ADMIN = "admin"  # Granted by admin
    PROMOTIONAL = "promotional"  # Promotional/trial access


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
    display_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
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
    subscription_tier: Mapped[SubscriptionTier] = mapped_column(
        SQLEnum(SubscriptionTier, name="subscription_tier", create_type=False, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=SubscriptionTier.FREE,
    )
    subscription_source: Mapped[SubscriptionSource] = mapped_column(
        SQLEnum(SubscriptionSource, name="subscription_source", create_type=False, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=SubscriptionSource.NONE,
    )
    stripe_customer_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        index=True,
    )
    stripe_subscription_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )
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
