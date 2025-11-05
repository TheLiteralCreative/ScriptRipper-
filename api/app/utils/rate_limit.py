"""Rate limiting utilities for rip quotas."""

from datetime import datetime, timedelta
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserRole, SubscriptionTier
from app.models.usage import Usage


async def can_user_rip(user_id: str, db: AsyncSession) -> tuple[bool, str]:
    """Check if a user can perform a rip based on their tier and usage.

    Args:
        user_id: User UUID
        db: Database session

    Returns:
        Tuple of (can_rip: bool, message: str)
    """
    # Get user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        return False, "User not found"

    # Admins have unlimited access
    if user.role == UserRole.ADMIN:
        return True, "Admin user - unlimited access"

    # Pro and Premium tiers have unlimited access
    if user.subscription_tier in [SubscriptionTier.PRO, SubscriptionTier.PREMIUM]:
        return True, f"{user.subscription_tier.value.capitalize()} tier - unlimited access"

    # Free tier: check daily quota
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)

    # Count rips today
    result = await db.execute(
        select(func.count(Usage.id))
        .where(Usage.user_id == user_id)
        .where(Usage.created_at >= today_start)
        .where(Usage.created_at < today_end)
    )
    rips_today = result.scalar() or 0

    if rips_today >= 1:
        return False, "Daily quota exceeded. Free users get 1 rip per day. Upgrade to Pro for unlimited access."

    return True, "Within daily quota"


async def record_rip(
    user_id: str,
    transcript_type: str,
    prompt_count: int,
    had_custom_prompt: bool,
    total_input_tokens: int,
    total_output_tokens: int,
    total_cost: float,
    db: AsyncSession,
) -> Usage:
    """Record a rip in the usage table.

    Args:
        user_id: User UUID
        transcript_type: Type of transcript ('meetings' or 'presentations')
        prompt_count: Number of prompts used
        had_custom_prompt: Whether a custom prompt was included
        total_input_tokens: Total input tokens across all prompts
        total_output_tokens: Total output tokens across all prompts
        total_cost: Total cost in USD
        db: Database session

    Returns:
        Created Usage record
    """
    usage = Usage(
        user_id=user_id,
        transcript_type=transcript_type,
        prompt_count=prompt_count,
        had_custom_prompt=had_custom_prompt,
        total_input_tokens=total_input_tokens,
        total_output_tokens=total_output_tokens,
        total_cost=total_cost,
    )

    db.add(usage)
    await db.commit()
    await db.refresh(usage)

    return usage
