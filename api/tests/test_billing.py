"""Tests for billing and subscription endpoints."""

import pytest
from httpx import AsyncClient
from unittest.mock import MagicMock, patch

from app.models.user import User, SubscriptionTier


@pytest.mark.asyncio
async def test_get_subscription_status_free_user(
    client: AsyncClient,
    auth_headers: dict,
    test_user: User,
):
    """Test getting subscription status for free user."""
    response = await client.get(
        "/api/v1/billing/subscription-status",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()

    assert data["tier"] == "free"
    assert data["has_active_subscription"] is False


@pytest.mark.asyncio
async def test_get_subscription_status_pro_user(
    client: AsyncClient,
    pro_auth_headers: dict,
    test_pro_user: User,
):
    """Test getting subscription status for pro user."""
    response = await client.get(
        "/api/v1/billing/subscription-status",
        headers=pro_auth_headers,
    )

    assert response.status_code == 200
    data = response.json()

    assert data["tier"] == "pro"
    assert data["has_active_subscription"] is True


@pytest.mark.asyncio
async def test_get_subscription_status_without_auth(client: AsyncClient):
    """Test getting subscription status without authentication."""
    response = await client.get("/api/v1/billing/subscription-status")

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_create_checkout_session(
    client: AsyncClient,
    auth_headers: dict,
    test_user: User,
):
    """Test creating Stripe checkout session."""
    # Mock Stripe checkout session
    mock_session = MagicMock()
    mock_session.id = "cs_test_123"
    mock_session.url = "https://checkout.stripe.com/test"

    with patch("stripe.checkout.Session.create") as mock_create:
        mock_create.return_value = mock_session

        response = await client.post(
            "/api/v1/billing/create-checkout-session",
            headers=auth_headers,
        )

    assert response.status_code == 200
    data = response.json()

    assert data["session_id"] == "cs_test_123"
    assert data["url"] == "https://checkout.stripe.com/test"


@pytest.mark.asyncio
async def test_create_checkout_session_already_pro(
    client: AsyncClient,
    pro_auth_headers: dict,
    test_pro_user: User,
):
    """Test creating checkout session when already pro."""
    response = await client.post(
        "/api/v1/billing/create-checkout-session",
        headers=pro_auth_headers,
    )

    assert response.status_code == 400
    data = response.json()
    assert "already has Pro" in data["detail"]


@pytest.mark.asyncio
async def test_create_checkout_session_without_auth(client: AsyncClient):
    """Test creating checkout session without authentication."""
    response = await client.post("/api/v1/billing/create-checkout-session")

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_create_checkout_session_stripe_error(
    client: AsyncClient,
    auth_headers: dict,
    test_user: User,
):
    """Test checkout session creation handles Stripe errors."""
    import stripe

    with patch("stripe.checkout.Session.create") as mock_create:
        mock_create.side_effect = stripe.error.StripeError("API error")

        response = await client.post(
            "/api/v1/billing/create-checkout-session",
            headers=auth_headers,
        )

    assert response.status_code == 400
    data = response.json()
    assert "Stripe error" in data["detail"]


@pytest.mark.asyncio
async def test_cancel_subscription_free_user(
    client: AsyncClient,
    auth_headers: dict,
    test_user: User,
):
    """Test cancelling subscription when user is on free tier."""
    response = await client.post(
        "/api/v1/billing/cancel-subscription",
        headers=auth_headers,
    )

    assert response.status_code == 400
    data = response.json()
    assert "does not have an active subscription" in data["detail"]


@pytest.mark.asyncio
async def test_cancel_subscription_pro_user(
    client: AsyncClient,
    pro_auth_headers: dict,
    test_pro_user: User,
):
    """Test cancelling subscription for pro user."""
    response = await client.post(
        "/api/v1/billing/cancel-subscription",
        headers=pro_auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert "message" in data


@pytest.mark.asyncio
async def test_cancel_subscription_without_auth(client: AsyncClient):
    """Test cancelling subscription without authentication."""
    response = await client.post("/api/v1/billing/cancel-subscription")

    assert response.status_code == 403
