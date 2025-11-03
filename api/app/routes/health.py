"""Health check endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import redis.asyncio as redis

from app.config.database import get_db
from app.config.settings import get_settings

router = APIRouter()
settings = get_settings()


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Health check endpoint.

    Checks:
    - API is running
    - Database connectivity
    - Redis connectivity
    """
    checks = {
        "api": "ok",
        "database": "unknown",
        "redis": "unknown",
    }

    # Check database
    try:
        await db.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as e:
        checks["database"] = f"error: {str(e)}"

    # Check Redis
    try:
        r = redis.from_url(settings.REDIS_URL, decode_responses=True)
        await r.ping()
        checks["redis"] = "ok"
        await r.close()
    except Exception as e:
        checks["redis"] = f"error: {str(e)}"

    # Determine overall status
    is_healthy = all(status == "ok" for status in checks.values())

    return {
        "status": "healthy" if is_healthy else "degraded",
        "checks": checks,
    }


@router.get("/ready")
async def readiness_check():
    """
    Readiness check endpoint.

    Simple check to see if the API is ready to serve traffic.
    """
    return {"status": "ready"}
