"""Billing and subscription endpoints."""

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.config.settings import get_settings
from app.models.user import User, SubscriptionTier
from app.utils.dependencies import get_current_user

router = APIRouter()
settings = get_settings()

# Initialize Stripe
if settings.STRIPE_SECRET_KEY:
    stripe.api_key = settings.STRIPE_SECRET_KEY


class CheckoutSessionResponse(BaseModel):
    """Checkout session response schema."""

    session_id: str
    url: str


class SubscriptionStatusResponse(BaseModel):
    """Subscription status response schema."""

    tier: str
    has_active_subscription: bool
    stripe_customer_id: str | None = None


@router.post("/create-checkout-session", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    current_user: User = Depends(get_current_user),
):
    """
    Create a Stripe checkout session for Pro subscription.

    Args:
        current_user: Current authenticated user

    Returns:
        Checkout session with URL
    """
    if not settings.STRIPE_SECRET_KEY or not settings.STRIPE_PRO_PRICE_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stripe is not configured",
        )

    # Check if user already has Pro subscription
    if current_user.subscription_tier == SubscriptionTier.PRO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has Pro subscription",
        )

    try:
        # Create Stripe checkout session
        checkout_session = stripe.checkout.Session.create(
            customer_email=current_user.email,
            payment_method_types=["card"],
            line_items=[
                {
                    "price": settings.STRIPE_PRO_PRICE_ID,
                    "quantity": 1,
                }
            ],
            mode="subscription",
            success_url=settings.STRIPE_SUCCESS_URL + f"?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=settings.STRIPE_CANCEL_URL,
            metadata={
                "user_id": str(current_user.id),
                "user_email": current_user.email,
            },
            subscription_data={
                "metadata": {
                    "user_id": str(current_user.id),
                }
            },
        )

        return CheckoutSessionResponse(
            session_id=checkout_session.id,
            url=checkout_session.url,
        )

    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}",
        )


@router.get("/subscription-status", response_model=SubscriptionStatusResponse)
async def get_subscription_status(
    current_user: User = Depends(get_current_user),
):
    """
    Get current subscription status.

    Args:
        current_user: Current authenticated user

    Returns:
        Subscription status
    """
    return SubscriptionStatusResponse(
        tier=current_user.subscription_tier.value,
        has_active_subscription=current_user.subscription_tier in [
            SubscriptionTier.PRO,
            SubscriptionTier.PREMIUM,
        ],
        stripe_customer_id=current_user.stripe_customer_id if hasattr(current_user, 'stripe_customer_id') else None,
    )


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Handle Stripe webhook events.

    Args:
        request: FastAPI request with Stripe event
        db: Database session

    Returns:
        Success message
    """
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stripe webhook secret not configured",
        )

    # Get the webhook signature
    signature = request.headers.get("stripe-signature")
    if not signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing stripe-signature header",
        )

    # Get the raw body
    body = await request.body()

    try:
        # Verify and construct the event
        event = stripe.Webhook.construct_event(
            body, signature, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payload",
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid signature",
        )

    # Handle the event
    from sqlalchemy import select
    import uuid

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session.get("metadata", {}).get("user_id")

        if user_id:
            # Update user subscription
            result = await db.execute(
                select(User).where(User.id == uuid.UUID(user_id))
            )
            user = result.scalar_one_or_none()

            if user:
                user.subscription_tier = SubscriptionTier.PRO
                # Store Stripe customer ID if available
                if hasattr(user, 'stripe_customer_id'):
                    user.stripe_customer_id = session.get("customer")
                await db.commit()

    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        user_id = subscription.get("metadata", {}).get("user_id")

        if user_id:
            # Downgrade user to free tier
            result = await db.execute(
                select(User).where(User.id == uuid.UUID(user_id))
            )
            user = result.scalar_one_or_none()

            if user:
                user.subscription_tier = SubscriptionTier.FREE
                await db.commit()

    elif event["type"] == "customer.subscription.updated":
        subscription = event["data"]["object"]
        user_id = subscription.get("metadata", {}).get("user_id")

        if user_id:
            # Check subscription status
            result = await db.execute(
                select(User).where(User.id == uuid.UUID(user_id))
            )
            user = result.scalar_one_or_none()

            if user and subscription.get("status") == "active":
                user.subscription_tier = SubscriptionTier.PRO
                await db.commit()
            elif user and subscription.get("status") in ["canceled", "unpaid", "past_due"]:
                user.subscription_tier = SubscriptionTier.FREE
                await db.commit()

    return {"status": "success"}


@router.post("/cancel-subscription")
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
):
    """
    Cancel current subscription.

    Args:
        current_user: Current authenticated user

    Returns:
        Success message
    """
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stripe is not configured",
        )

    if current_user.subscription_tier == SubscriptionTier.FREE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not have an active subscription",
        )

    # For now, return a message to cancel via Stripe portal
    # In production, you'd implement Stripe Customer Portal
    return {
        "message": "To cancel your subscription, please contact support or use the Stripe customer portal"
    }
