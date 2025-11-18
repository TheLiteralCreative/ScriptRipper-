"""Temporary debug endpoint for admin setup - DELETE AFTER USE"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.config.database import get_db
from app.models.user import User, UserRole
from pydantic import BaseModel

router = APIRouter(prefix="/debug-admin", tags=["debug-admin"])


class UserInfo(BaseModel):
    """User information for debugging."""
    id: int
    email: str
    role: str
    is_active: bool
    created_at: str


class PromoteRequest(BaseModel):
    """Request to promote user to admin."""
    email: str


@router.get("/list-all-users", response_model=List[UserInfo])
async def list_all_users(db: AsyncSession = Depends(get_db)):
    """List all users with their roles.

    WARNING: This is a temporary debug endpoint. Remove after admin setup.
    """
    result = await db.execute(select(User).order_by(User.created_at))
    users = result.scalars().all()

    return [
        UserInfo(
            id=user.id,
            email=user.email,
            role=user.role.value,
            is_active=user.is_active,
            created_at=user.created_at.isoformat()
        )
        for user in users
    ]


@router.post("/promote-to-admin")
async def promote_to_admin(
    request: PromoteRequest,
    db: AsyncSession = Depends(get_db)
):
    """Promote a user to admin role.

    WARNING: This is a temporary debug endpoint. Remove after admin setup.
    """
    # Find user by email
    result = await db.execute(
        select(User).where(User.email == request.email)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail=f"User with email {request.email} not found")

    if user.role == UserRole.ADMIN:
        return {
            "message": f"User {user.email} is already an admin",
            "user_id": user.id,
            "role": user.role.value
        }

    # Promote to admin
    user.role = UserRole.ADMIN
    await db.commit()
    await db.refresh(user)

    return {
        "message": f"User {user.email} promoted to admin successfully",
        "user_id": user.id,
        "previous_role": "user",
        "new_role": user.role.value
    }


@router.get("/admin-count")
async def admin_count(db: AsyncSession = Depends(get_db)):
    """Count how many admin users exist.

    WARNING: This is a temporary debug endpoint. Remove after admin setup.
    """
    result = await db.execute(
        select(User).where(User.role == UserRole.ADMIN)
    )
    admins = result.scalars().all()

    return {
        "admin_count": len(admins),
        "admins": [
            {
                "id": admin.id,
                "email": admin.email,
                "created_at": admin.created_at.isoformat()
            }
            for admin in admins
        ]
    }
