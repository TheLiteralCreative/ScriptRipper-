"""User repository for database operations."""

from typing import List, Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, SubscriptionTier, SubscriptionSource


class UserRepository:
    """Repository for User database operations."""

    def __init__(self, db: AsyncSession):
        """
        Initialize repository with database session.

        Args:
            db: SQLAlchemy async session
        """
        self.db = db

    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        """
        Get user by ID.

        Args:
            user_id: User ID

        Returns:
            User if found, None otherwise
        """
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_id_or_404(self, user_id: UUID) -> User:
        """
        Get user by ID or raise 404.

        Args:
            user_id: User ID

        Returns:
            User

        Raises:
            HTTPException: 404 if user not found
        """
        user = await self.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user

    async def get_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email.

        Args:
            email: User email address

        Returns:
            User if found, None otherwise
        """
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_email_or_404(self, email: str) -> User:
        """
        Get user by email or raise 404.

        Args:
            email: User email address

        Returns:
            User

        Raises:
            HTTPException: 404 if user not found
        """
        user = await self.get_by_email(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user

    async def get_all(self, order_by: str = "created_at", desc: bool = True) -> List[User]:
        """
        Get all users with optional ordering.

        Args:
            order_by: Field to order by (default: created_at)
            desc: Order descending if True (default: True)

        Returns:
            List of users
        """
        order_field = getattr(User, order_by, User.created_at)
        order_clause = order_field.desc() if desc else order_field.asc()

        result = await self.db.execute(select(User).order_by(order_clause))
        return list(result.scalars().all())

    async def email_exists(self, email: str) -> bool:
        """
        Check if email already exists.

        Args:
            email: Email to check

        Returns:
            True if email exists, False otherwise
        """
        user = await self.get_by_email(email)
        return user is not None

    async def create(
        self,
        email: str,
        hashed_password: str,
        name: Optional[str] = None,
        subscription_tier: SubscriptionTier = SubscriptionTier.FREE,
        subscription_source: SubscriptionSource = SubscriptionSource.NONE,
    ) -> User:
        """
        Create a new user.

        Args:
            email: User email
            hashed_password: Hashed password
            name: User name (optional)
            subscription_tier: Subscription tier (default: FREE)
            subscription_source: How subscription was created (default: DIRECT)

        Returns:
            Created user
        """
        user = User(
            email=email,
            hashed_password=hashed_password,
            name=name,
            subscription_tier=subscription_tier,
            subscription_source=subscription_source,
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def update_subscription(
        self,
        user_id: UUID,
        tier: SubscriptionTier,
        stripe_customer_id: Optional[str] = None,
        stripe_subscription_id: Optional[str] = None,
        subscription_source: Optional[SubscriptionSource] = None,
    ) -> User:
        """
        Update user subscription information.

        Args:
            user_id: User ID
            tier: New subscription tier
            stripe_customer_id: Stripe customer ID (optional)
            stripe_subscription_id: Stripe subscription ID (optional)
            subscription_source: Subscription source (optional)

        Returns:
            Updated user

        Raises:
            HTTPException: 404 if user not found
        """
        user = await self.get_by_id_or_404(user_id)

        user.subscription_tier = tier
        if stripe_customer_id is not None:
            user.stripe_customer_id = stripe_customer_id
        if stripe_subscription_id is not None:
            user.stripe_subscription_id = stripe_subscription_id
        if subscription_source is not None:
            user.subscription_source = subscription_source

        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def update_password(self, user_id: UUID, hashed_password: str) -> User:
        """
        Update user password.

        Args:
            user_id: User ID
            hashed_password: New hashed password

        Returns:
            Updated user

        Raises:
            HTTPException: 404 if user not found
        """
        user = await self.get_by_id_or_404(user_id)
        user.hashed_password = hashed_password

        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def delete(self, user_id: UUID) -> bool:
        """
        Delete a user.

        Args:
            user_id: User ID

        Returns:
            True if deleted, False if not found
        """
        user = await self.get_by_id(user_id)
        if not user:
            return False

        await self.db.delete(user)
        await self.db.commit()
        return True
