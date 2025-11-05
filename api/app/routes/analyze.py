"""Analysis endpoints."""

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config.database import get_db
from app.models.profile import Profile
from app.models.user import User
from app.models.prompt import Prompt
from app.schemas.analyze import AnalyzeRequest, AnalyzeResponse
from app.schemas.custom_analyze import CustomAnalyzeRequest, CustomAnalyzeResponse
from app.schemas.batch_analyze import BatchAnalyzeRequest, BatchAnalyzeResponse, TaskResult
from app.services.analysis import AnalysisService
from app.services.llm import LLMProviderFactory
from app.utils.dependencies import get_current_user
from app.utils.rate_limit import can_user_rip, record_rip

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


@router.post("/analyze/custom", response_model=CustomAnalyzeResponse)
async def analyze_custom_task(
    request: CustomAnalyzeRequest,
) -> CustomAnalyzeResponse:
    """Analyze a transcript with a custom prompt.

    This endpoint allows running a single custom task on a transcript.

    Args:
        request: Custom analysis request with transcript, task name, and prompt

    Returns:
        Analysis result with token usage and cost

    Raises:
        500: Analysis failed
    """
    try:
        # Create LLM provider
        provider = LLMProviderFactory.create(
            provider=request.provider,
            model=request.model,
        )

        # Build full prompt
        full_prompt = f"TRANSCRIPT:\n{request.transcript}\n\nTASK:\n{request.prompt}"

        # Execute task
        response = await provider.generate(
            prompt=full_prompt.strip(),
            system_prompt="You are an expert at analyzing transcripts.",
            temperature=0.7,
        )

        return CustomAnalyzeResponse(
            task_name=request.task_name,
            result=response.content,
            input_tokens=response.input_tokens,
            output_tokens=response.output_tokens,
            cost=response.cost or 0.0,
            model=response.model,
        )

    except Exception as e:
        # Log error (in production, use proper logging)
        print(f"Custom analysis failed: {e}")
        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail={
                "error": {
                    "code": "analysis_failed",
                    "message": f"Failed to analyze transcript: {str(e)}",
                    "retryable": True,
                }
            },
        )


@router.post("/analyze/batch", response_model=BatchAnalyzeResponse)
async def analyze_batch(
    request: BatchAnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BatchAnalyzeResponse:
    """Analyze a transcript with multiple prompts as a single rip.

    This endpoint processes up to 5 prompts on a single transcript,
    counting as one "rip" for rate limiting purposes.

    Args:
        request: Batch analysis request
        current_user: Authenticated user
        db: Database session

    Returns:
        Analysis results for all tasks with usage tracking

    Raises:
        429: Daily quota exceeded
        500: Analysis failed
    """
    # Check rate limit
    can_proceed, message = await can_user_rip(str(current_user.id), db)
    if not can_proceed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": {
                    "code": "quota_exceeded",
                    "message": message,
                    "retryable": False,
                }
            },
        )

    try:
        # Create LLM provider
        provider = LLMProviderFactory.create(
            provider=request.provider,
            model=request.model,
        )

        results = []
        total_input = 0
        total_output = 0
        total_cost = 0.0

        # Process each task
        for task in request.tasks:
            # Build full prompt
            full_prompt = f"TRANSCRIPT:\n{request.transcript}\n\nTASK:\n{task.prompt}"

            # Execute task
            response = await provider.generate(
                prompt=full_prompt.strip(),
                system_prompt="You are an expert at analyzing transcripts.",
                temperature=0.7,
            )

            # Accumulate totals
            total_input += response.input_tokens
            total_output += response.output_tokens
            total_cost += response.cost or 0.0

            results.append(
                TaskResult(
                    task_name=task.task_name,
                    result=response.content,
                    input_tokens=response.input_tokens,
                    output_tokens=response.output_tokens,
                    cost=response.cost or 0.0,
                )
            )

        # Check if any task had "Custom" in the name
        had_custom = any("custom" in task.task_name.lower() for task in request.tasks)

        # Record the rip
        usage = await record_rip(
            user_id=str(current_user.id),
            transcript_type=request.transcript_type,
            prompt_count=len(request.tasks),
            had_custom_prompt=had_custom,
            total_input_tokens=total_input,
            total_output_tokens=total_output,
            total_cost=total_cost,
            db=db,
        )

        return BatchAnalyzeResponse(
            results=results,
            total_input_tokens=total_input,
            total_output_tokens=total_output,
            total_cost=total_cost,
            model=request.model,
            rip_id=str(usage.id),
        )

    except HTTPException:
        # Re-raise HTTP exceptions (like quota exceeded)
        raise

    except Exception as e:
        # Log error (in production, use proper logging)
        print(f"Batch analysis failed: {e}")
        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail={
                "error": {
                    "code": "analysis_failed",
                    "message": f"Failed to analyze transcript: {str(e)}",
                    "retryable": True,
                }
            },
        )

@router.get("/prompts")
async def get_prompts(
    category: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Get active prompts for the configure page.

    Args:
        category: Optional filter by category ('meetings' or 'presentations')
        db: Database session

    Returns:
        Dictionary with prompts by category
    """
    query = select(Prompt).where(Prompt.is_active == True).order_by(Prompt.task_name)

    if category:
        query = query.where(Prompt.category == category)

    result = await db.execute(query)
    prompts = result.scalars().all()

    # Group by category
    meetings_prompts = [
        {"task_name": p.task_name, "prompt": p.prompt}
        for p in prompts
        if p.category == "meetings"
    ]
    presentations_prompts = [
        {"task_name": p.task_name, "prompt": p.prompt}
        for p in prompts
        if p.category == "presentations"
    ]

    return {
        "meetings": meetings_prompts,
        "presentations": presentations_prompts,
    }
