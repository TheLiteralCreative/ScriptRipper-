"""Tests for async job endpoints."""

import pytest
from httpx import AsyncClient
from unittest.mock import MagicMock, patch

from app.models.user import User


@pytest.mark.asyncio
async def test_create_analysis_job(
    client: AsyncClient,
    auth_headers: dict,
    sample_transcript: str,
    test_user: User,
):
    """Test creating an async analysis job."""
    # Mock the queue service
    mock_job = MagicMock()
    mock_job.id = "test-job-123"

    with patch("app.routes.jobs.QueueService") as mock_queue_service:
        mock_queue_instance = MagicMock()
        mock_queue_instance.enqueue_analysis.return_value = mock_job
        mock_queue_service.return_value = mock_queue_instance

        response = await client.post(
            "/api/v1/jobs/analyze",
            headers=auth_headers,
            json={
                "transcript": sample_transcript,
                "provider": "gemini",
                "model": "gemini-2.5-flash",
                "system_prompt": "You are an expert at analyzing transcripts.",
                "tasks": {
                    "summary": "Provide a summary",
                    "action_items": "List action items",
                },
                "priority": "default",
            },
        )

    assert response.status_code == 202  # Accepted
    data = response.json()

    assert data["job_id"] == "test-job-123"
    assert data["status"] == "queued"
    assert "message" in data
    assert "queued" in data["message"].lower()


@pytest.mark.asyncio
async def test_create_analysis_job_without_auth(
    client: AsyncClient, sample_transcript: str
):
    """Test creating job without authentication fails."""
    response = await client.post(
        "/api/v1/jobs/analyze",
        json={
            "transcript": sample_transcript,
            "provider": "gemini",
            "model": "gemini-2.5-flash",
            "tasks": {
                "summary": "Summarize",
            },
        },
    )

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_get_job_status_queued(
    client: AsyncClient,
    auth_headers: dict,
    test_user: User,
):
    """Test getting status of a queued job."""
    mock_status = {
        "job_id": "test-job-123",
        "status": "queued",
        "created_at": "2024-11-06T10:00:00Z",
        "started_at": None,
        "ended_at": None,
        "result": None,
        "error": None,
    }

    with patch("app.routes.jobs.QueueService") as mock_queue_service:
        mock_queue_instance = MagicMock()
        mock_queue_instance.get_job_status.return_value = mock_status
        mock_queue_service.return_value = mock_queue_instance

        response = await client.get(
            "/api/v1/jobs/test-job-123",
            headers=auth_headers,
        )

    assert response.status_code == 200
    data = response.json()

    assert data["job_id"] == "test-job-123"
    assert data["status"] == "queued"
    assert data["created_at"] is not None
    assert data["result"] is None


@pytest.mark.asyncio
async def test_get_job_status_finished(
    client: AsyncClient,
    auth_headers: dict,
    test_user: User,
):
    """Test getting status of a finished job."""
    mock_status = {
        "job_id": "test-job-123",
        "status": "finished",
        "created_at": "2024-11-06T10:00:00Z",
        "started_at": "2024-11-06T10:00:05Z",
        "ended_at": "2024-11-06T10:01:30Z",
        "result": {
            "results": {
                "summary": "Meeting summary",
                "action_items": "1. Task 1\n2. Task 2",
            },
            "metadata": {
                "total_tokens": 150,
                "cost": 0.0002,
            },
        },
        "error": None,
    }

    with patch("app.routes.jobs.QueueService") as mock_queue_service:
        mock_queue_instance = MagicMock()
        mock_queue_instance.get_job_status.return_value = mock_status
        mock_queue_service.return_value = mock_queue_instance

        response = await client.get(
            "/api/v1/jobs/test-job-123",
            headers=auth_headers,
        )

    assert response.status_code == 200
    data = response.json()

    assert data["job_id"] == "test-job-123"
    assert data["status"] == "finished"
    assert data["result"] is not None
    assert data["result"]["results"]["summary"] == "Meeting summary"


@pytest.mark.asyncio
async def test_get_job_status_failed(
    client: AsyncClient,
    auth_headers: dict,
    test_user: User,
):
    """Test getting status of a failed job."""
    mock_status = {
        "job_id": "test-job-123",
        "status": "failed",
        "created_at": "2024-11-06T10:00:00Z",
        "started_at": "2024-11-06T10:00:05Z",
        "ended_at": "2024-11-06T10:00:10Z",
        "result": None,
        "error": "LLM API error",
    }

    with patch("app.routes.jobs.QueueService") as mock_queue_service:
        mock_queue_instance = MagicMock()
        mock_queue_instance.get_job_status.return_value = mock_status
        mock_queue_service.return_value = mock_queue_instance

        response = await client.get(
            "/api/v1/jobs/test-job-123",
            headers=auth_headers,
        )

    assert response.status_code == 200
    data = response.json()

    assert data["job_id"] == "test-job-123"
    assert data["status"] == "failed"
    assert data["error"] == "LLM API error"


@pytest.mark.asyncio
async def test_get_job_status_not_found(
    client: AsyncClient,
    auth_headers: dict,
    test_user: User,
):
    """Test getting status of non-existent job."""
    with patch("app.routes.jobs.QueueService") as mock_queue_service:
        mock_queue_instance = MagicMock()
        mock_queue_instance.get_job_status.side_effect = Exception("Job not found")
        mock_queue_service.return_value = mock_queue_instance

        response = await client.get(
            "/api/v1/jobs/nonexistent-job",
            headers=auth_headers,
        )

    assert response.status_code == 404
    data = response.json()
    assert "error" in data["detail"]
    assert data["detail"]["error"]["code"] == "job_not_found"


@pytest.mark.asyncio
async def test_get_job_status_without_auth(client: AsyncClient):
    """Test getting job status without authentication."""
    response = await client.get("/api/v1/jobs/test-job-123")

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_cancel_job_success(
    client: AsyncClient,
    auth_headers: dict,
    test_user: User,
):
    """Test cancelling a queued job."""
    with patch("app.routes.jobs.QueueService") as mock_queue_service:
        mock_queue_instance = MagicMock()
        mock_queue_instance.cancel_job.return_value = True
        mock_queue_service.return_value = mock_queue_instance

        response = await client.delete(
            "/api/v1/jobs/test-job-123",
            headers=auth_headers,
        )

    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "cancelled" in data["message"].lower()


@pytest.mark.asyncio
async def test_cancel_job_already_running(
    client: AsyncClient,
    auth_headers: dict,
    test_user: User,
):
    """Test cancelling a job that's already running."""
    with patch("app.routes.jobs.QueueService") as mock_queue_service:
        mock_queue_instance = MagicMock()
        mock_queue_instance.cancel_job.return_value = False
        mock_queue_service.return_value = mock_queue_instance

        response = await client.delete(
            "/api/v1/jobs/test-job-123",
            headers=auth_headers,
        )

    assert response.status_code == 400
    data = response.json()
    assert "error" in data["detail"]
    assert data["detail"]["error"]["code"] == "cannot_cancel"


@pytest.mark.asyncio
async def test_cancel_job_without_auth(client: AsyncClient):
    """Test cancelling job without authentication."""
    response = await client.delete("/api/v1/jobs/test-job-123")

    assert response.status_code == 403
