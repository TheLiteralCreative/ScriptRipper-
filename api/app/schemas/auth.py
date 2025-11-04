"""Authentication schemas."""

from typing import Optional
from pydantic import BaseModel, EmailStr


class MagicLinkRequest(BaseModel):
    """Magic link request schema."""

    email: EmailStr


class MagicLinkResponse(BaseModel):
    """Magic link response schema."""

    message: str


class TokenResponse(BaseModel):
    """JWT token response."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class UserResponse(BaseModel):
    """User profile response."""

    id: str
    email: str
    name: Optional[str] = None
    role: str
    is_active: bool


class AuthResponse(BaseModel):
    """Complete authentication response."""

    tokens: TokenResponse
    user: UserResponse
