"""Pytest fixtures for integration tests."""

import asyncio
import uuid
import pytest
import pytest_asyncio
from typing import AsyncGenerator, Generator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

from app.main import app
from app.config.database import get_db
from app.models.base import Base
from app.models.user import User, UserRole, SubscriptionTier
from app.models.prompt import Prompt
from app.utils.auth import get_password_hash, create_access_token

# Test database URL (use separate test database)
TEST_DATABASE_URL = "postgresql+asyncpg://scriptripper:dev_password@localhost:5432/scriptripper_test"


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def db_engine():
    """Create test database engine."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        poolclass=NullPool,
        echo=False,
    )

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    # Cleanup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(db_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create test database session."""
    async_session = async_sessionmaker(
        db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with async_session() as session:
        yield session


@pytest_asyncio.fixture(scope="function")
async def client(db_session) -> AsyncGenerator[AsyncClient, None]:
    """Create test client with database override."""

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create a test user."""
    user = User(
        id=uuid.uuid4(),
        email="test@example.com",
        hashed_password=get_password_hash("testpass123"),
        role=UserRole.USER,
        subscription_tier=SubscriptionTier.FREE,
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def test_pro_user(db_session: AsyncSession) -> User:
    """Create a test pro user."""
    user = User(
        id=uuid.uuid4(),
        email="pro@example.com",
        hashed_password=get_password_hash("propass123"),
        role=UserRole.USER,
        subscription_tier=SubscriptionTier.PRO,
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def test_admin(db_session: AsyncSession) -> User:
    """Create a test admin user."""
    admin = User(
        id=uuid.uuid4(),
        email="admin@example.com",
        hashed_password=get_password_hash("adminpass123"),
        role=UserRole.ADMIN,
        subscription_tier=SubscriptionTier.PRO,
        is_active=True,
    )
    db_session.add(admin)
    await db_session.commit()
    await db_session.refresh(admin)
    return admin


@pytest.fixture
def auth_headers(test_user: User) -> dict:
    """Create authentication headers for test user."""
    token = create_access_token(data={"sub": str(test_user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def pro_auth_headers(test_pro_user: User) -> dict:
    """Create authentication headers for pro user."""
    token = create_access_token(data={"sub": str(test_pro_user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(test_admin: User) -> dict:
    """Create authentication headers for admin user."""
    token = create_access_token(data={"sub": str(test_admin.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def sample_transcript() -> str:
    """Sample transcript for testing."""
    return """
[00:00] Speaker 1: Welcome to today's meeting.
[00:05] Speaker 2: Thanks for having me.
[00:10] Speaker 1: Let's discuss the project timeline.
[00:15] Speaker 2: I think we should aim for a Q1 launch.
[00:20] Speaker 1: Agreed. Let's make that our target.
[00:25] Speaker 2: I'll prepare the roadmap by next week.
[00:30] Speaker 1: Perfect. What about the budget?
[00:35] Speaker 2: I estimate around 50K for development.
[00:40] Speaker 1: That sounds reasonable. Let's move forward.
"""


@pytest_asyncio.fixture
async def test_prompts(db_session: AsyncSession) -> list[Prompt]:
    """Create test prompts."""
    prompts = [
        Prompt(
            id=uuid.uuid4(),
            task_name="Summary",
            prompt="Provide a concise summary of the transcript",
            category="meetings",
            is_active=True,
        ),
        Prompt(
            id=uuid.uuid4(),
            task_name="Action Items",
            prompt="List all action items mentioned in the transcript",
            category="meetings",
            is_active=True,
        ),
        Prompt(
            id=uuid.uuid4(),
            task_name="Key Points",
            prompt="Extract the key points from the presentation",
            category="presentations",
            is_active=True,
        ),
    ]

    for prompt in prompts:
        db_session.add(prompt)

    await db_session.commit()

    for prompt in prompts:
        await db_session.refresh(prompt)

    return prompts
