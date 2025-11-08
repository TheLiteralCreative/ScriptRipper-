"""Tests for admin endpoints."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.models.prompt import Prompt


@pytest.mark.asyncio
async def test_list_users_as_admin(
    client: AsyncClient,
    admin_headers: dict,
    test_admin: User,
    test_user: User,
):
    """Test listing users as admin."""
    response = await client.get(
        "/api/v1/admin/users",
        headers=admin_headers,
    )

    assert response.status_code == 200
    data = response.json()

    assert isinstance(data, list)
    assert len(data) >= 2  # At least admin and test_user

    # Verify user structure
    user = data[0]
    assert "id" in user
    assert "email" in user
    assert "role" in user
    assert "subscription_tier" in user
    assert "total_rips" in user
    assert "rips_today" in user
    assert "total_cost" in user


@pytest.mark.asyncio
async def test_list_users_as_regular_user(
    client: AsyncClient,
    auth_headers: dict,
    test_user: User,
):
    """Test listing users as regular user fails."""
    response = await client.get(
        "/api/v1/admin/users",
        headers=auth_headers,
    )

    assert response.status_code == 403
    data = response.json()
    assert "Admin access required" in data["detail"]


@pytest.mark.asyncio
async def test_list_users_without_auth(client: AsyncClient):
    """Test listing users without authentication."""
    response = await client.get("/api/v1/admin/users")

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_get_user_detail_as_admin(
    client: AsyncClient,
    admin_headers: dict,
    test_admin: User,
    test_user: User,
):
    """Test getting user details as admin."""
    response = await client.get(
        f"/api/v1/admin/users/{test_user.id}",
        headers=admin_headers,
    )

    assert response.status_code == 200
    data = response.json()

    assert data["id"] == str(test_user.id)
    assert data["email"] == test_user.email
    assert data["role"] == "user"
    assert "total_rips" in data
    assert "total_cost" in data
    assert "recent_usage" in data


@pytest.mark.asyncio
async def test_get_user_detail_not_found(
    client: AsyncClient,
    admin_headers: dict,
    test_admin: User,
):
    """Test getting details for non-existent user."""
    import uuid

    fake_id = str(uuid.uuid4())

    response = await client.get(
        f"/api/v1/admin/users/{fake_id}",
        headers=admin_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert "User not found" in data["detail"]


@pytest.mark.asyncio
async def test_get_user_detail_as_regular_user(
    client: AsyncClient,
    auth_headers: dict,
    test_user: User,
):
    """Test getting user details as regular user fails."""
    response = await client.get(
        f"/api/v1/admin/users/{test_user.id}",
        headers=auth_headers,
    )

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_list_prompts_as_admin(
    client: AsyncClient,
    admin_headers: dict,
    test_admin: User,
    test_prompts: list[Prompt],
):
    """Test listing prompts as admin."""
    response = await client.get(
        "/api/v1/admin/prompts",
        headers=admin_headers,
    )

    assert response.status_code == 200
    data = response.json()

    assert isinstance(data, list)
    assert len(data) == 3  # test_prompts fixture creates 3

    # Verify prompt structure
    prompt = data[0]
    assert "id" in prompt
    assert "task_name" in prompt
    assert "prompt" in prompt
    assert "category" in prompt
    assert "is_active" in prompt
    assert "created_at" in prompt
    assert "updated_at" in prompt


@pytest.mark.asyncio
async def test_list_prompts_filtered_by_category(
    client: AsyncClient,
    admin_headers: dict,
    test_admin: User,
    test_prompts: list[Prompt],
):
    """Test listing prompts filtered by category."""
    response = await client.get(
        "/api/v1/admin/prompts?category=meetings",
        headers=admin_headers,
    )

    assert response.status_code == 200
    data = response.json()

    assert len(data) == 2  # Only meetings prompts
    assert all(p["category"] == "meetings" for p in data)


@pytest.mark.asyncio
async def test_create_prompt_as_admin(
    client: AsyncClient,
    admin_headers: dict,
    test_admin: User,
    db_session: AsyncSession,
):
    """Test creating a new prompt as admin."""
    response = await client.post(
        "/api/v1/admin/prompts",
        headers=admin_headers,
        json={
            "task_name": "Test Prompt",
            "prompt": "This is a test prompt",
            "category": "meetings",
        },
    )

    assert response.status_code == 200
    data = response.json()

    assert data["task_name"] == "Test Prompt"
    assert data["prompt"] == "This is a test prompt"
    assert data["category"] == "meetings"
    assert data["is_active"] is True

    # Verify prompt created in database
    result = await db_session.execute(
        select(Prompt).where(Prompt.task_name == "Test Prompt")
    )
    prompt = result.scalar_one_or_none()
    assert prompt is not None


@pytest.mark.asyncio
async def test_create_prompt_invalid_category(
    client: AsyncClient,
    admin_headers: dict,
    test_admin: User,
):
    """Test creating prompt with invalid category."""
    response = await client.post(
        "/api/v1/admin/prompts",
        headers=admin_headers,
        json={
            "task_name": "Test Prompt",
            "prompt": "Test",
            "category": "invalid",
        },
    )

    assert response.status_code == 400
    data = response.json()
    assert "Category must be" in data["detail"]


@pytest.mark.asyncio
async def test_create_prompt_as_regular_user(
    client: AsyncClient,
    auth_headers: dict,
    test_user: User,
):
    """Test creating prompt as regular user fails."""
    response = await client.post(
        "/api/v1/admin/prompts",
        headers=auth_headers,
        json={
            "task_name": "Test",
            "prompt": "Test",
            "category": "meetings",
        },
    )

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_update_prompt_as_admin(
    client: AsyncClient,
    admin_headers: dict,
    test_admin: User,
    test_prompts: list[Prompt],
    db_session: AsyncSession,
):
    """Test updating a prompt as admin."""
    prompt_to_update = test_prompts[0]

    response = await client.patch(
        f"/api/v1/admin/prompts/{prompt_to_update.id}",
        headers=admin_headers,
        json={
            "task_name": "Updated Prompt",
            "is_active": False,
        },
    )

    assert response.status_code == 200
    data = response.json()

    assert data["task_name"] == "Updated Prompt"
    assert data["is_active"] is False
    assert data["id"] == str(prompt_to_update.id)

    # Verify update in database
    await db_session.refresh(prompt_to_update)
    assert prompt_to_update.task_name == "Updated Prompt"
    assert prompt_to_update.is_active is False


@pytest.mark.asyncio
async def test_update_prompt_not_found(
    client: AsyncClient,
    admin_headers: dict,
    test_admin: User,
):
    """Test updating non-existent prompt."""
    import uuid

    fake_id = str(uuid.uuid4())

    response = await client.patch(
        f"/api/v1/admin/prompts/{fake_id}",
        headers=admin_headers,
        json={
            "task_name": "Updated",
        },
    )

    assert response.status_code == 404
    data = response.json()
    assert "Prompt not found" in data["detail"]


@pytest.mark.asyncio
async def test_update_prompt_as_regular_user(
    client: AsyncClient,
    auth_headers: dict,
    test_user: User,
    test_prompts: list[Prompt],
):
    """Test updating prompt as regular user fails."""
    prompt_id = test_prompts[0].id

    response = await client.patch(
        f"/api/v1/admin/prompts/{prompt_id}",
        headers=auth_headers,
        json={
            "task_name": "Updated",
        },
    )

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_delete_prompt_as_admin(
    client: AsyncClient,
    admin_headers: dict,
    test_admin: User,
    test_prompts: list[Prompt],
    db_session: AsyncSession,
):
    """Test deleting a prompt as admin."""
    prompt_to_delete = test_prompts[0]
    prompt_id = prompt_to_delete.id

    response = await client.delete(
        f"/api/v1/admin/prompts/{prompt_id}",
        headers=admin_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert "deleted successfully" in data["message"]

    # Verify deletion in database
    result = await db_session.execute(
        select(Prompt).where(Prompt.id == prompt_id)
    )
    prompt = result.scalar_one_or_none()
    assert prompt is None


@pytest.mark.asyncio
async def test_delete_prompt_not_found(
    client: AsyncClient,
    admin_headers: dict,
    test_admin: User,
):
    """Test deleting non-existent prompt."""
    import uuid

    fake_id = str(uuid.uuid4())

    response = await client.delete(
        f"/api/v1/admin/prompts/{fake_id}",
        headers=admin_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert "Prompt not found" in data["detail"]


@pytest.mark.asyncio
async def test_delete_prompt_as_regular_user(
    client: AsyncClient,
    auth_headers: dict,
    test_user: User,
    test_prompts: list[Prompt],
):
    """Test deleting prompt as regular user fails."""
    prompt_id = test_prompts[0].id

    response = await client.delete(
        f"/api/v1/admin/prompts/{prompt_id}",
        headers=auth_headers,
    )

    assert response.status_code == 403
