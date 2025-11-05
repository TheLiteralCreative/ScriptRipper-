"""Authentication endpoints."""

import secrets
import uuid
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.config.settings import get_settings
from app.models.user import User, UserRole, SubscriptionTier
from app.schemas.auth import AuthResponse, TokenResponse, UserResponse
from app.utils.auth import create_access_token, create_refresh_token, verify_password, get_password_hash

router = APIRouter()
settings = get_settings()

# Store state tokens temporarily (in production, use Redis)
_oauth_states = {}


class LoginRequest(BaseModel):
    """Login request schema."""

    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    """Registration request schema."""

    email: EmailStr
    password: str
    name: Optional[str] = None


class MagicLinkRequest(BaseModel):
    """Magic link request schema."""

    email: EmailStr


class MagicLinkResponse(BaseModel):
    """Magic link response schema."""

    message: str


class PasswordResetRequest(BaseModel):
    """Password reset request schema."""

    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Password reset confirmation schema."""

    token: str
    new_password: str


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Login with email and password.

    Args:
        request: Login request with email and password
        db: Database session

    Returns:
        JWT tokens and user info
    """
    # Find user by email
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    # Verify user exists and password is correct
    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    # Generate JWT tokens
    token_data = {"sub": str(user.id), "email": user.email}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    # Calculate token expiration in seconds
    expires_in = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60

    return AuthResponse(
        tokens=TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=expires_in,
        ),
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            name=user.name,
            role=user.role.value,
            is_active=user.is_active,
        ),
    )


@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """
    Register a new user with email and password.

    Args:
        request: Registration request with email, password, and optional name
        db: Database session

    Returns:
        JWT tokens and user info
    """
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == request.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    # Validate password strength
    if len(request.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long",
        )

    # Create new user
    user = User(
        id=uuid.uuid4(),
        email=request.email,
        name=request.name,
        hashed_password=get_password_hash(request.password),
        role=UserRole.USER,
        subscription_tier=SubscriptionTier.FREE,
        is_active=True,
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Generate JWT tokens
    token_data = {"sub": str(user.id), "email": user.email}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    # Calculate token expiration in seconds
    expires_in = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60

    return AuthResponse(
        tokens=TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=expires_in,
        ),
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            name=user.name,
            role=user.role.value,
            is_active=user.is_active,
        ),
    )


@router.post("/password-reset/request", response_model=MagicLinkResponse)
async def request_password_reset(
    request: PasswordResetRequest, db: AsyncSession = Depends(get_db)
):
    """
    Request password reset link.

    Args:
        request: Password reset request with email
        db: Database session

    Returns:
        Success message
    """
    # Check if user exists
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    # Always return success to prevent email enumeration
    # In production, send email with reset link here
    if user and user.is_active:
        # Generate password reset token
        from app.utils.auth import create_magic_link_token

        reset_token = create_magic_link_token(user.email)

        # TODO: Send email with reset link
        # For development, log the token
        print(f"Password reset token for {user.email}: {reset_token}")
        print(f"Reset link: http://localhost:3000/reset-password?token={reset_token}")

    return {"message": "If an account exists with that email, a password reset link has been sent."}


@router.post("/password-reset/confirm", response_model=MagicLinkResponse)
async def confirm_password_reset(
    request: PasswordResetConfirm, db: AsyncSession = Depends(get_db)
):
    """
    Confirm password reset with token and new password.

    Args:
        request: Password reset confirmation with token and new password
        db: Database session

    Returns:
        Success message
    """
    # Verify token
    from app.utils.auth import verify_magic_link_token

    email = verify_magic_link_token(request.token)

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    # Validate password strength
    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long",
        )

    # Find user
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Update password
    user.hashed_password = get_password_hash(request.new_password)
    await db.commit()

    return {"message": "Password has been reset successfully"}


@router.post("/magic-link", response_model=MagicLinkResponse)
async def request_magic_link(request: MagicLinkRequest):
    """
    Request magic link for passwordless login.

    Args:
        request: Magic link request with email

    Returns:
        Success message
    """
    # TODO: Implement magic link sending
    # 1. Create or get user by email
    # 2. Generate magic link token
    # 3. Send email with magic link
    # 4. Return success message

    return {"message": "Magic link sent to your email"}


@router.post("/verify")
async def verify_magic_link(token: str):
    """
    Verify magic link token and authenticate user.

    Args:
        token: Magic link token

    Returns:
        JWT tokens and user info
    """
    # TODO: Implement magic link verification
    # 1. Verify token
    # 2. Get user from token
    # 3. Generate JWT access + refresh tokens
    # 4. Return tokens and user info

    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Magic link verification not yet implemented",
    )


@router.get("/oauth/google")
async def google_oauth_redirect():
    """
    Initiate Google OAuth flow.

    Returns:
        Redirect to Google OAuth
    """
    # Generate state token for CSRF protection
    state = secrets.token_urlsafe(32)
    _oauth_states[state] = True

    # Configure OAuth flow
    flow = Flow.from_client_config(
        client_config={
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=[
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
        ],
        redirect_uri=settings.GOOGLE_REDIRECT_URI,
    )

    # Generate authorization URL
    authorization_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        state=state,
    )

    return RedirectResponse(url=authorization_url)


@router.get("/oauth/google/callback", response_model=AuthResponse)
async def google_oauth_callback(
    code: str, state: str, db: AsyncSession = Depends(get_db)
):
    """
    Handle Google OAuth callback.

    Args:
        code: Authorization code from Google
        state: State token for CSRF protection
        db: Database session

    Returns:
        JWT tokens and user info
    """
    # Verify state token
    if state not in _oauth_states:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid state token",
        )

    # Remove used state token
    del _oauth_states[state]

    # Exchange authorization code for tokens
    flow = Flow.from_client_config(
        client_config={
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=[
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
        ],
        redirect_uri=settings.GOOGLE_REDIRECT_URI,
    )

    try:
        flow.fetch_token(code=code)
        credentials = flow.credentials
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to exchange authorization code: {str(e)}",
        )

    # Get user info from Google
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {credentials.token}"},
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to fetch user info from Google",
            )

        user_info = response.json()

    # Extract user data
    email = user_info.get("email")
    name = user_info.get("name")
    google_id = user_info.get("id")

    if not email or not google_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or Google ID not provided by Google",
        )

    # Check if user exists
    result = await db.execute(
        select(User).where(
            (User.email == email) | (User.oauth_provider_id == google_id)
        )
    )
    user = result.scalar_one_or_none()

    if user:
        # Update existing user
        user.oauth_provider = "google"
        user.oauth_provider_id = google_id
        if not user.name and name:
            user.name = name
        user.is_active = True
    else:
        # Create new user
        user = User(
            id=uuid.uuid4(),
            email=email,
            name=name,
            oauth_provider="google",
            oauth_provider_id=google_id,
            role=UserRole.USER,
            is_active=True,
        )
        db.add(user)

    await db.commit()
    await db.refresh(user)

    # Generate JWT tokens
    token_data = {"sub": str(user.id), "email": user.email}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    # Calculate token expiration in seconds
    expires_in = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60

    return AuthResponse(
        tokens=TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=expires_in,
        ),
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            name=user.name,
            role=user.role.value,
            is_active=user.is_active,
        ),
    )
