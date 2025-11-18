"""Admin endpoints for user and system management."""

from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from pydantic import BaseModel

from app.config.database import get_db
from app.models.user import User, UserRole, SubscriptionTier, SubscriptionSource
from app.models.usage import Usage
from app.models.prompt import Prompt
from app.utils.dependencies import get_current_user


router = APIRouter()


async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Verify current user is an admin.

    Args:
        current_user: Current authenticated user

    Returns:
        Admin user

    Raises:
        403: User is not an admin
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


# Response schemas
class UserStats(BaseModel):
    """User statistics summary."""

    id: str
    email: str
    display_name: str | None
    role: str
    subscription_tier: str
    subscription_source: str
    stripe_customer_id: str | None
    is_active: bool
    created_at: datetime
    total_rips: int
    rips_today: int
    total_cost: float
    last_rip_at: datetime | None


class UsageRecord(BaseModel):
    """Individual usage record."""

    id: str
    transcript_type: str
    prompt_count: int
    had_custom_prompt: bool
    total_input_tokens: int
    total_output_tokens: int
    total_cost: float
    created_at: datetime


class UserDetail(BaseModel):
    """Detailed user information."""

    id: str
    email: str
    display_name: str | None
    role: str
    subscription_tier: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    total_rips: int
    total_cost: float
    recent_usage: List[UsageRecord]


class SetProRequest(BaseModel):
    """Request to set a user's subscription tier to Pro."""

    email: str


class SetProResponse(BaseModel):
    """Response after updating a user's tier."""

    email: str
    role: str
    subscription_tier: str


@router.get("/users", response_model=List[UserStats])
async def list_users(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> List[UserStats]:
    """Get list of all users with statistics.

    Args:
        admin: Admin user
        db: Database session

    Returns:
        List of users with stats
    """
    # Get all users
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()

    # Calculate today's start
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    user_stats = []
    for user in users:
        # Get total rips count
        total_result = await db.execute(
            select(func.count(Usage.id)).where(Usage.user_id == user.id)
        )
        total_rips = total_result.scalar() or 0

        # Get today's rips count
        today_result = await db.execute(
            select(func.count(Usage.id))
            .where(Usage.user_id == user.id)
            .where(Usage.created_at >= today_start)
        )
        rips_today = today_result.scalar() or 0

        # Get total cost
        cost_result = await db.execute(
            select(func.sum(Usage.total_cost)).where(Usage.user_id == user.id)
        )
        total_cost = cost_result.scalar() or 0.0

        # Get last rip timestamp
        last_rip_result = await db.execute(
            select(Usage.created_at)
            .where(Usage.user_id == user.id)
            .order_by(desc(Usage.created_at))
            .limit(1)
        )
        last_rip = last_rip_result.scalar_one_or_none()

        user_stats.append(
            UserStats(
                id=str(user.id),
                email=user.email,
                display_name=user.display_name,
                role=user.role.value,
                subscription_tier=user.subscription_tier.value,
                subscription_source=user.subscription_source.value,
                stripe_customer_id=user.stripe_customer_id,
                is_active=user.is_active,
                created_at=user.created_at,
                total_rips=total_rips,
                rips_today=rips_today,
                total_cost=total_cost,
                last_rip_at=last_rip,
            )
        )

    return user_stats


@router.get("/users/{user_id}", response_model=UserDetail)
async def get_user_detail(
    user_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> UserDetail:
    """Get detailed information about a specific user.

    Args:
        user_id: User UUID
        admin: Admin user
        db: Database session

    Returns:
        Detailed user info

    Raises:
        404: User not found
    """
    # Get user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Get total rips count
    total_result = await db.execute(
        select(func.count(Usage.id)).where(Usage.user_id == user.id)
    )
    total_rips = total_result.scalar() or 0

    # Get total cost
    cost_result = await db.execute(
        select(func.sum(Usage.total_cost)).where(Usage.user_id == user.id)
    )
    total_cost = cost_result.scalar() or 0.0

    # Get recent usage (last 20 records)
    usage_result = await db.execute(
        select(Usage)
        .where(Usage.user_id == user.id)
        .order_by(desc(Usage.created_at))
        .limit(20)
    )
    usage_records = usage_result.scalars().all()

    recent_usage = [
        UsageRecord(
            id=str(record.id),
            transcript_type=record.transcript_type,
            prompt_count=record.prompt_count,
            had_custom_prompt=record.had_custom_prompt,
            total_input_tokens=record.total_input_tokens,
            total_output_tokens=record.total_output_tokens,
            total_cost=record.total_cost,
            created_at=record.created_at,
        )
        for record in usage_records
    ]

    return UserDetail(
        id=str(user.id),
        email=user.email,
        display_name=user.display_name,
        role=user.role.value,
        subscription_tier=user.subscription_tier.value,
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at,
        total_rips=total_rips,
        total_cost=total_cost,
        recent_usage=recent_usage,
    )


@router.post("/users/set-pro", response_model=SetProResponse)
async def set_user_pro(
    request: SetProRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> SetProResponse:
    """Promote a user to the Pro subscription tier by email (admin grant)."""
    result = await db.execute(
        select(User).where(func.lower(User.email) == func.lower(request.email))
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user.subscription_tier = SubscriptionTier.PRO
    user.subscription_source = SubscriptionSource.ADMIN  # Mark as admin-granted
    await db.commit()
    await db.refresh(user)

    return SetProResponse(
        email=user.email,
        role=user.role.value,
        subscription_tier=user.subscription_tier.value,
    )


# Prompt management schemas
class PromptResponse(BaseModel):
    """Prompt response schema."""

    id: str
    task_name: str
    prompt: str  # Legacy field
    description: str
    prompt_json: str
    category: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


class CreatePromptRequest(BaseModel):
    """Create prompt request schema."""

    task_name: str
    description: str
    prompt_json: str
    category: str  # 'meetings' or 'presentations'


class UpdatePromptRequest(BaseModel):
    """Update prompt request schema."""

    task_name: str | None = None
    description: str | None = None
    prompt_json: str | None = None
    category: str | None = None
    is_active: bool | None = None


@router.get("/prompts", response_model=List[PromptResponse])
async def list_prompts(
    category: str | None = None,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> List[PromptResponse]:
    """Get list of all prompts.

    Args:
        category: Optional filter by category ('meetings' or 'presentations')
        admin: Admin user
        db: Database session

    Returns:
        List of prompts
    """
    query = select(Prompt).order_by(Prompt.category, Prompt.task_name)

    if category:
        query = query.where(Prompt.category == category)

    result = await db.execute(query)
    prompts = result.scalars().all()

    return [
        PromptResponse(
            id=str(prompt.id),
            task_name=prompt.task_name,
            prompt=prompt.prompt,  # Legacy field
            description=prompt.description,
            prompt_json=prompt.prompt_json,
            category=prompt.category,
            is_active=prompt.is_active,
            created_at=prompt.created_at,
            updated_at=prompt.updated_at,
        )
        for prompt in prompts
    ]


@router.post("/prompts", response_model=PromptResponse)
async def create_prompt(
    request: CreatePromptRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> PromptResponse:
    """Create a new prompt.

    Args:
        request: Create prompt request
        admin: Admin user
        db: Database session

    Returns:
        Created prompt

    Raises:
        400: Invalid category
    """
    # Validate category
    if request.category not in ["meetings", "presentations"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category must be 'meetings' or 'presentations'",
        )

    prompt = Prompt(
        task_name=request.task_name,
        prompt=request.prompt_json,  # Legacy field gets prompt_json value for backward compatibility
        description=request.description,
        prompt_json=request.prompt_json,
        category=request.category,
    )

    db.add(prompt)
    await db.commit()
    await db.refresh(prompt)

    return PromptResponse(
        id=str(prompt.id),
        task_name=prompt.task_name,
        prompt=prompt.prompt,  # Legacy field
        description=prompt.description,
        prompt_json=prompt.prompt_json,
        category=prompt.category,
        is_active=prompt.is_active,
        created_at=prompt.created_at,
        updated_at=prompt.updated_at,
    )


@router.patch("/prompts/{prompt_id}", response_model=PromptResponse)
async def update_prompt(
    prompt_id: str,
    request: UpdatePromptRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> PromptResponse:
    """Update a prompt.

    Args:
        prompt_id: Prompt UUID
        request: Update prompt request
        admin: Admin user
        db: Database session

    Returns:
        Updated prompt

    Raises:
        404: Prompt not found
        400: Invalid category
    """
    result = await db.execute(select(Prompt).where(Prompt.id == prompt_id))
    prompt = result.scalar_one_or_none()

    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found",
        )

    # Update fields if provided
    if request.task_name is not None:
        prompt.task_name = request.task_name
    if request.description is not None:
        prompt.description = request.description
    if request.prompt_json is not None:
        prompt.prompt_json = request.prompt_json
        prompt.prompt = request.prompt_json  # Keep legacy field in sync
    if request.category is not None:
        if request.category not in ["meetings", "presentations"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category must be 'meetings' or 'presentations'",
            )
        prompt.category = request.category
    if request.is_active is not None:
        prompt.is_active = request.is_active

    prompt.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(prompt)

    return PromptResponse(
        id=str(prompt.id),
        task_name=prompt.task_name,
        prompt=prompt.prompt,  # Legacy field
        description=prompt.description,
        prompt_json=prompt.prompt_json,
        category=prompt.category,
        is_active=prompt.is_active,
        created_at=prompt.created_at,
        updated_at=prompt.updated_at,
    )


@router.delete("/prompts/{prompt_id}")
async def delete_prompt(
    prompt_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Delete a prompt.

    Args:
        prompt_id: Prompt UUID
        admin: Admin user
        db: Database session

    Returns:
        Success message

    Raises:
        404: Prompt not found
    """
    result = await db.execute(select(Prompt).where(Prompt.id == prompt_id))
    prompt = result.scalar_one_or_none()

    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found",
        )

    await db.delete(prompt)
    await db.commit()

    return {"message": "Prompt deleted successfully"}


# Subscription management schemas
class UpdateSubscriptionTierRequest(BaseModel):
    """Request to update a user's subscription tier."""

    tier: str  # 'free', 'pro', or 'premium'


class SubscriptionInfo(BaseModel):
    """Subscription information for a user."""

    user_id: str
    email: str
    current_tier: str
    stripe_customer_id: str | None
    has_stripe_subscription: bool


@router.post("/users/{user_id}/subscription-tier", response_model=SubscriptionInfo)
async def update_user_subscription_tier(
    user_id: str,
    request: UpdateSubscriptionTierRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> SubscriptionInfo:
    """Update a user's subscription tier (admin-only).

    Args:
        user_id: User UUID
        request: Subscription tier update request
        admin: Admin user
        db: Database session

    Returns:
        Updated subscription info

    Raises:
        404: User not found
        400: Invalid subscription tier
    """
    # Validate tier
    valid_tiers = ["free", "pro", "premium"]
    if request.tier not in valid_tiers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid tier. Must be one of: {', '.join(valid_tiers)}",
        )

    # Get user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Update tier
    if request.tier == "free":
        user.subscription_tier = SubscriptionTier.FREE
    elif request.tier == "pro":
        user.subscription_tier = SubscriptionTier.PRO
    elif request.tier == "premium":
        user.subscription_tier = SubscriptionTier.PREMIUM

    await db.commit()
    await db.refresh(user)

    # Check if user has Stripe subscription
    has_stripe = hasattr(user, 'stripe_customer_id') and user.stripe_customer_id is not None

    return SubscriptionInfo(
        user_id=str(user.id),
        email=user.email,
        current_tier=user.subscription_tier.value,
        stripe_customer_id=user.stripe_customer_id if hasattr(user, 'stripe_customer_id') else None,
        has_stripe_subscription=has_stripe,
    )


@router.get("/users/{user_id}/subscription", response_model=SubscriptionInfo)
async def get_user_subscription(
    user_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> SubscriptionInfo:
    """Get subscription information for a user (admin-only).

    Args:
        user_id: User UUID
        admin: Admin user
        db: Database session

    Returns:
        Subscription info

    Raises:
        404: User not found
    """
    # Get user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Check if user has Stripe subscription
    has_stripe = hasattr(user, 'stripe_customer_id') and user.stripe_customer_id is not None

    return SubscriptionInfo(
        user_id=str(user.id),
        email=user.email,
        current_tier=user.subscription_tier.value,
        stripe_customer_id=user.stripe_customer_id if hasattr(user, 'stripe_customer_id') else None,
        has_stripe_subscription=has_stripe,
    )
