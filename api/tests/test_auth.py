"""Tests for authentication endpoints."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User


@pytest.mark.asyncio
async def test_user_registration(client: AsyncClient, db_session: AsyncSession):
    """Test successful user registration."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "securepass123",
            "name": "New User",
        },
    )

    assert response.status_code == 200
    data = response.json()

    assert "tokens" in data
    assert "user" in data
    assert data["tokens"]["access_token"]
    assert data["tokens"]["refresh_token"]
    assert data["tokens"]["token_type"] == "bearer"
    assert data["user"]["email"] == "newuser@example.com"
    assert data["user"]["name"] == "New User"
    assert data["user"]["role"] == "user"
    assert data["user"]["is_active"] is True

    # Verify user created in database
    result = await db_session.execute(
        select(User).where(User.email == "newuser@example.com")
    )
    user = result.scalar_one_or_none()
    assert user is not None
    assert user.email == "newuser@example.com"
    assert user.name == "New User"


@pytest.mark.asyncio
async def test_user_registration_duplicate_email(
    client: AsyncClient, test_user: User
):
    """Test registration with duplicate email fails."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",  # Already exists
            "password": "securepass123",
        },
    )

    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "already exists" in data["detail"].lower()


@pytest.mark.asyncio
async def test_user_registration_weak_password(client: AsyncClient):
    """Test registration with weak password fails."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "weak",  # Too short
        },
    )

    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "8 characters" in data["detail"].lower()


@pytest.mark.asyncio
async def test_user_login_success(client: AsyncClient, test_user: User):
    """Test successful login."""
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "testpass123",
        },
    )

    assert response.status_code == 200
    data = response.json()

    assert "tokens" in data
    assert "user" in data
    assert data["tokens"]["access_token"]
    assert data["tokens"]["refresh_token"]
    assert data["user"]["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_user_login_invalid_email(client: AsyncClient):
    """Test login with non-existent email."""
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "anypassword",
        },
    )

    assert response.status_code == 401
    data = response.json()
    assert "detail" in data


@pytest.mark.asyncio
async def test_user_login_invalid_password(client: AsyncClient, test_user: User):
    """Test login with wrong password."""
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "wrongpassword",
        },
    )

    assert response.status_code == 401
    data = response.json()
    assert "detail" in data


@pytest.mark.asyncio
async def test_user_login_inactive_account(
    client: AsyncClient, test_user: User, db_session: AsyncSession
):
    """Test login with inactive account fails."""
    # Deactivate user
    test_user.is_active = False
    await db_session.commit()

    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "testpass123",
        },
    )

    assert response.status_code == 403
    data = response.json()
    assert "inactive" in data["detail"].lower()


@pytest.mark.asyncio
async def test_password_reset_request(client: AsyncClient, test_user: User):
    """Test password reset request."""
    response = await client.post(
        "/api/v1/auth/password-reset/request",
        json={
            "email": "test@example.com",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    # Should not reveal if email exists
    assert "sent" in data["message"].lower() or "account exists" in data["message"].lower()


@pytest.mark.asyncio
async def test_password_reset_request_nonexistent_email(client: AsyncClient):
    """Test password reset with non-existent email still returns success."""
    response = await client.post(
        "/api/v1/auth/password-reset/request",
        json={
            "email": "nonexistent@example.com",
        },
    )

    # Should return success to prevent email enumeration
    assert response.status_code == 200
    data = response.json()
    assert "message" in data


@pytest.mark.asyncio
async def test_password_reset_confirm(
    client: AsyncClient, test_user: User, db_session: AsyncSession
):
    """Test password reset confirmation."""
    from app.utils.auth import create_magic_link_token, verify_password

    # Create reset token
    reset_token = create_magic_link_token(test_user.email)

    # Reset password
    response = await client.post(
        "/api/v1/auth/password-reset/confirm",
        json={
            "token": reset_token,
            "new_password": "newpassword123",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "success" in data["message"].lower()

    # Verify password was changed
    await db_session.refresh(test_user)
    assert verify_password("newpassword123", test_user.hashed_password)


@pytest.mark.asyncio
async def test_password_reset_confirm_invalid_token(client: AsyncClient):
    """Test password reset with invalid token."""
    response = await client.post(
        "/api/v1/auth/password-reset/confirm",
        json={
            "token": "invalid-token",
            "new_password": "newpassword123",
        },
    )

    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "invalid" in data["detail"].lower() or "expired" in data["detail"].lower()


@pytest.mark.asyncio
async def test_password_reset_confirm_weak_password(client: AsyncClient, test_user: User):
    """Test password reset with weak password."""
    from app.utils.auth import create_magic_link_token

    reset_token = create_magic_link_token(test_user.email)

    response = await client.post(
        "/api/v1/auth/password-reset/confirm",
        json={
            "token": reset_token,
            "new_password": "weak",  # Too short
        },
    )

    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "8 characters" in data["detail"].lower()
