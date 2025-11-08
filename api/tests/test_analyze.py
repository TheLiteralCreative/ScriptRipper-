"""Tests for analysis endpoints."""

import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch, MagicMock
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.prompt import Prompt


@pytest.mark.asyncio
async def test_get_prompts_no_filter(
    client: AsyncClient, test_prompts: list[Prompt]
):
    """Test fetching all prompts without category filter."""
    response = await client.get("/api/v1/prompts")

    assert response.status_code == 200
    data = response.json()

    assert "meetings" in data
    assert "presentations" in data
    assert len(data["meetings"]) == 2  # Summary and Action Items
    assert len(data["presentations"]) == 1  # Key Points

    # Verify structure
    meeting_prompt = data["meetings"][0]
    assert "task_name" in meeting_prompt
    assert "prompt" in meeting_prompt


@pytest.mark.asyncio
async def test_get_prompts_with_category_filter(
    client: AsyncClient, test_prompts: list[Prompt]
):
    """Test fetching prompts filtered by category."""
    response = await client.get("/api/v1/prompts?category=meetings")

    assert response.status_code == 200
    data = response.json()

    assert "meetings" in data
    assert len(data["meetings"]) == 2


@pytest.mark.asyncio
async def test_custom_analysis_without_auth(
    client: AsyncClient, sample_transcript: str
):
    """Test custom analysis without authentication (should work for this endpoint)."""
    # Mock the LLM provider
    mock_response = MagicMock()
    mock_response.content = "This is a summary of the meeting."
    mock_response.input_tokens = 100
    mock_response.output_tokens = 50
    mock_response.cost = 0.0001
    mock_response.model = "gemini-2.5-flash"

    with patch("app.routes.analyze.LLMProviderFactory.create") as mock_factory:
        mock_provider = AsyncMock()
        mock_provider.generate.return_value = mock_response
        mock_factory.return_value = mock_provider

        response = await client.post(
            "/api/v1/analyze/custom",
            json={
                "transcript": sample_transcript,
                "task_name": "Summary",
                "prompt": "Summarize this transcript",
                "provider": "gemini",
                "model": "gemini-2.5-flash",
            },
        )

    assert response.status_code == 200
    data = response.json()

    assert data["task_name"] == "Summary"
    assert data["result"] == "This is a summary of the meeting."
    assert data["input_tokens"] == 100
    assert data["output_tokens"] == 50
    assert data["cost"] == 0.0001
    assert data["model"] == "gemini-2.5-flash"


@pytest.mark.asyncio
async def test_batch_analyze_authenticated(
    client: AsyncClient,
    auth_headers: dict,
    sample_transcript: str,
    test_user: User,
):
    """Test batch analysis with authentication."""
    # Mock the LLM provider to avoid real API calls
    mock_response = MagicMock()
    mock_response.content = "This is a summary of the transcript."
    mock_response.input_tokens = 100
    mock_response.output_tokens = 50
    mock_response.cost = 0.0001
    mock_response.model = "gemini-2.5-flash"

    with patch("app.routes.analyze.LLMProviderFactory.create") as mock_factory:
        mock_provider = AsyncMock()
        mock_provider.generate.return_value = mock_response
        mock_factory.return_value = mock_provider

        response = await client.post(
            "/api/v1/analyze/batch",
            headers=auth_headers,
            json={
                "transcript": sample_transcript,
                "transcript_type": "meeting",
                "provider": "gemini",
                "model": "gemini-2.5-flash",
                "tasks": [
                    {"task_name": "Summary", "prompt": "Summarize this transcript"},
                    {"task_name": "Action Items", "prompt": "List action items"},
                ],
            },
        )

    assert response.status_code == 200
    data = response.json()

    assert "results" in data
    assert len(data["results"]) == 2
    assert data["results"][0]["task_name"] == "Summary"
    assert data["results"][1]["task_name"] == "Action Items"
    assert "total_input_tokens" in data
    assert "total_output_tokens" in data
    assert "total_cost" in data
    assert "rip_id" in data
    assert data["model"] == "gemini-2.5-flash"


@pytest.mark.asyncio
async def test_batch_analyze_without_auth(
    client: AsyncClient, sample_transcript: str
):
    """Test batch analysis without authentication fails."""
    response = await client.post(
        "/api/v1/analyze/batch",
        json={
            "transcript": sample_transcript,
            "transcript_type": "meeting",
            "provider": "gemini",
            "model": "gemini-2.5-flash",
            "tasks": [
                {"task_name": "Summary", "prompt": "Summarize this"},
            ],
        },
    )

    # Should return 403 (Forbidden) for missing auth
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_batch_analyze_multiple_tasks(
    client: AsyncClient,
    auth_headers: dict,
    sample_transcript: str,
    test_user: User,
):
    """Test batch analysis with multiple tasks (up to 5)."""
    mock_response = MagicMock()
    mock_response.content = "Analysis result"
    mock_response.input_tokens = 100
    mock_response.output_tokens = 50
    mock_response.cost = 0.0001
    mock_response.model = "gemini-2.5-flash"

    with patch("app.routes.analyze.LLMProviderFactory.create") as mock_factory:
        mock_provider = AsyncMock()
        mock_provider.generate.return_value = mock_response
        mock_factory.return_value = mock_provider

        response = await client.post(
            "/api/v1/analyze/batch",
            headers=auth_headers,
            json={
                "transcript": sample_transcript,
                "transcript_type": "meeting",
                "provider": "gemini",
                "model": "gemini-2.5-flash",
                "tasks": [
                    {"task_name": "Summary", "prompt": "Summarize"},
                    {"task_name": "Action Items", "prompt": "List actions"},
                    {"task_name": "Decisions", "prompt": "List decisions"},
                    {"task_name": "Next Steps", "prompt": "List next steps"},
                    {"task_name": "Participants", "prompt": "List participants"},
                ],
            },
        )

    assert response.status_code == 200
    data = response.json()

    assert len(data["results"]) == 5
    assert data["total_input_tokens"] == 500  # 100 * 5
    assert data["total_output_tokens"] == 250  # 50 * 5
    assert data["total_cost"] == 0.0005  # 0.0001 * 5


@pytest.mark.asyncio
async def test_batch_analyze_custom_prompt_tracking(
    client: AsyncClient,
    auth_headers: dict,
    sample_transcript: str,
    test_user: User,
    db_session: AsyncSession,
):
    """Test that custom prompts are tracked in usage."""
    mock_response = MagicMock()
    mock_response.content = "Result"
    mock_response.input_tokens = 100
    mock_response.output_tokens = 50
    mock_response.cost = 0.0001
    mock_response.model = "gemini-2.5-flash"

    with patch("app.routes.analyze.LLMProviderFactory.create") as mock_factory:
        mock_provider = AsyncMock()
        mock_provider.generate.return_value = mock_response
        mock_factory.return_value = mock_provider

        response = await client.post(
            "/api/v1/analyze/batch",
            headers=auth_headers,
            json={
                "transcript": sample_transcript,
                "transcript_type": "meeting",
                "provider": "gemini",
                "model": "gemini-2.5-flash",
                "tasks": [
                    {"task_name": "Custom Analysis", "prompt": "Do something custom"},
                ],
            },
        )

    assert response.status_code == 200
    data = response.json()
    assert "rip_id" in data

    # Verify usage was recorded with custom flag
    from app.models.usage import Usage
    from sqlalchemy import select

    result = await db_session.execute(
        select(Usage).where(Usage.user_id == test_user.id)
    )
    usage = result.scalar_one_or_none()

    assert usage is not None
    assert usage.had_custom_prompt is True


@pytest.mark.asyncio
async def test_custom_analysis_llm_error(
    client: AsyncClient, sample_transcript: str
):
    """Test custom analysis handles LLM errors gracefully."""
    with patch("app.routes.analyze.LLMProviderFactory.create") as mock_factory:
        mock_provider = AsyncMock()
        mock_provider.generate.side_effect = Exception("LLM API error")
        mock_factory.return_value = mock_provider

        response = await client.post(
            "/api/v1/analyze/custom",
            json={
                "transcript": sample_transcript,
                "task_name": "Summary",
                "prompt": "Summarize this",
                "provider": "gemini",
                "model": "gemini-2.5-flash",
            },
        )

    assert response.status_code == 500
    data = response.json()
    assert "error" in data["detail"]
    assert data["detail"]["error"]["code"] == "analysis_failed"
