"""Analysis endpoints."""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config.database import get_db
from app.models.profile import Profile
from app.schemas.analyze import AnalyzeRequest, AnalyzeResponse
from app.services.analysis import AnalysisService

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_transcript(
    request: AnalyzeRequest,
    db: AsyncSession = Depends(get_db),
) -> AnalyzeResponse:
    """Analyze a transcript using the specified profile.

    This is a synchronous endpoint that processes the transcript immediately
    and returns the results. For long transcripts, consider using the async
    job-based API (coming soon).

    Args:
        request: Analysis request with transcript and profile key
        db: Database session

    Returns:
        Analysis results with metadata

    Raises:
        404: Profile not found
        400: Invalid transcript or profile
        500: Analysis failed
    """
    # Find profile by key
    result = await db.execute(
        select(Profile).where(Profile.key == request.profile_key)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail={
                "error": {
                    "code": "profile_not_found",
                    "message": f"Profile '{request.profile_key}' not found",
                    "retryable": False,
                }
            },
        )

    # Check if profile is published
    if profile.status.value != "published":
        raise HTTPException(
            status_code=400,
            detail={
                "error": {
                    "code": "profile_not_published",
                    "message": f"Profile '{request.profile_key}' is not published (status: {profile.status.value})",
                    "retryable": False,
                }
            },
        )

    # Analyze transcript
    try:
        service = AnalysisService()
        result = await service.analyze_transcript(
            transcript=request.transcript,
            profile=profile,
        )

        return AnalyzeResponse(**result)

    except Exception as e:
        # Log error (in production, use proper logging)
        print(f"Analysis failed: {e}")

        raise HTTPException(
            status_code=500,
            detail={
                "error": {
                    "code": "analysis_failed",
                    "message": "Failed to analyze transcript",
                    "retryable": True,
                }
            },
        )
