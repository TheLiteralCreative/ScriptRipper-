"""Tests for health check endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Test /health endpoint returns healthy status."""
    response = await client.get("/health")

    assert response.status_code == 200
    data = response.json()

    assert "status" in data
    assert "checks" in data
    assert data["checks"]["api"] == "ok"
    assert data["checks"]["database"] == "ok"


@pytest.mark.asyncio
async def test_readiness_check(client: AsyncClient):
    """Test /ready endpoint returns ready status."""
    response = await client.get("/ready")

    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "ready"


@pytest.mark.asyncio
async def test_root_endpoint(client: AsyncClient):
    """Test root endpoint returns app info."""
    response = await client.get("/")

    assert response.status_code == 200
    data = response.json()

    assert "name" in data
    assert "version" in data
    assert "environment" in data
    assert data["name"] == "ScriptRipper"
