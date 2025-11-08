"""Async job endpoints for background processing."""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Optional

from app.models.user import User
from app.utils.dependencies import get_current_user
from app.utils.queue import QueueService
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

router = APIRouter()


class JobCreateRequest(BaseModel):
    """Request to create an async analysis job."""
    transcript: str
    provider: str = "gemini"
    model: str = "gemini-2.5-flash"
    system_prompt: str = "You are an expert at analyzing transcripts."
    tasks: dict  # {task_name: task_prompt}
    priority: Optional[str] = "default"


class JobStatusResponse(BaseModel):
    """Job status response."""
    job_id: str
    status: str  # queued, started, finished, failed
    created_at: Optional[str] = None
    started_at: Optional[str] = None
    ended_at: Optional[str] = None
    result: Optional[dict] = None
    error: Optional[str] = None


class JobCreateResponse(BaseModel):
    """Job creation response."""
    job_id: str
    status: str
    message: str


@router.post("/jobs/analyze", response_model=JobCreateResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_analysis_job(
    request: JobCreateRequest,
    current_user: User = Depends(get_current_user),
) -> JobCreateResponse:
    """Create an async transcript analysis job.

    This endpoint queues the analysis for background processing and returns
    immediately with a job ID. Use GET /jobs/{job_id} to check status.

    Args:
        request: Job creation request
        current_user: Authenticated user

    Returns:
        Job ID and status

    Example:
        POST /api/v1/jobs/analyze
        {
            "transcript": "...",
            "provider": "gemini",
            "model": "gemini-2.5-flash",
            "tasks": {
                "summary": "Provide a brief summary...",
                "key_points": "List the key points..."
            }
        }

        Response:
        {
            "job_id": "abc-123-def",
            "status": "queued",
            "message": "Job queued for processing"
        }
    """
    try:
        queue_service = QueueService()

        job = queue_service.enqueue_analysis(
            transcript=request.transcript,
            provider=request.provider,
            model=request.model,
            system_prompt=request.system_prompt,
            tasks=request.tasks,
            priority=request.priority or "default",
        )

        return JobCreateResponse(
            job_id=job.id,
            status="queued",
            message="Job queued for processing",
        )

    except Exception as e:
        logger.error(f"Failed to create job: {e}", exc_info=True)

        raise HTTPException(
            status_code=500,
            detail={
                "error": {
                    "code": "job_creation_failed",
                    "message": f"Failed to create analysis job: {str(e)}",
                    "retryable": True,
                }
            },
        )


@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_status(
    job_id: str,
    current_user: User = Depends(get_current_user),
) -> JobStatusResponse:
    """Get the status of an async job.

    Args:
        job_id: Job ID
        current_user: Authenticated user

    Returns:
        Job status and result (if complete)

    Example:
        GET /api/v1/jobs/abc-123-def

        Response (queued):
        {
            "job_id": "abc-123-def",
            "status": "queued",
            "created_at": "2024-11-06T10:00:00Z"
        }

        Response (finished):
        {
            "job_id": "abc-123-def",
            "status": "finished",
            "created_at": "2024-11-06T10:00:00Z",
            "started_at": "2024-11-06T10:00:05Z",
            "ended_at": "2024-11-06T10:01:30Z",
            "result": {
                "results": {...},
                "metadata": {...}
            }
        }
    """
    try:
        queue_service = QueueService()
        status_data = queue_service.get_job_status(job_id)

        return JobStatusResponse(**status_data)

    except Exception as e:
        logger.error(f"Failed to get job status: {e}")

        raise HTTPException(
            status_code=404,
            detail={
                "error": {
                    "code": "job_not_found",
                    "message": f"Job '{job_id}' not found",
                    "retryable": False,
                }
            },
        )


@router.delete("/jobs/{job_id}")
async def cancel_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
):
    """Cancel a queued job.

    Args:
        job_id: Job ID
        current_user: Authenticated user

    Returns:
        Cancellation confirmation
    """
    try:
        queue_service = QueueService()
        cancelled = queue_service.cancel_job(job_id)

        if cancelled:
            return {"message": "Job cancelled successfully"}
        else:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": {
                        "code": "cannot_cancel",
                        "message": "Job cannot be cancelled (may already be running or complete)",
                        "retryable": False,
                    }
                },
            )

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Failed to cancel job: {e}")

        raise HTTPException(
            status_code=500,
            detail={
                "error": {
                    "code": "cancellation_failed",
                    "message": f"Failed to cancel job: {str(e)}",
                    "retryable": True,
                }
            },
        )
