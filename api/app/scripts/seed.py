"""Seed database with initial data for development."""

import asyncio
import uuid
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import AsyncSessionLocal
from app.models.user import User, UserRole
from app.models.profile import Profile, ProfileStatus, LLMProvider
from app.utils.auth import get_password_hash


async def seed_users(session: AsyncSession) -> dict:
    """Seed initial users."""
    print("Seeding users...")

    # Admin user
    admin = User(
        id=uuid.uuid4(),
        email="admin@scriptripper.local",
        name="Admin User",
        hashed_password=get_password_hash("admin123"),
        role=UserRole.ADMIN,
        is_active=True,
    )
    session.add(admin)

    # Regular user
    user = User(
        id=uuid.uuid4(),
        email="user@scriptripper.local",
        name="Test User",
        hashed_password=get_password_hash("user123"),
        role=UserRole.USER,
        is_active=True,
    )
    session.add(user)

    await session.flush()

    print(f"  ✓ Created admin: {admin.email}")
    print(f"  ✓ Created user: {user.email}")

    return {"admin": admin, "user": user}


async def seed_profiles(session: AsyncSession) -> dict:
    """Seed initial analysis profiles."""
    print("\nSeeding profiles...")

    # Meetings profile
    meetings_profile = Profile(
        id=uuid.uuid4(),
        key="meetings",
        version=1,
        name="Meeting Analysis",
        description="Analyze meeting transcripts with speaker attribution",
        schema={
            "outputs": [
                "summary",
                "key_decisions",
                "action_items",
                "topics",
                "quotables",
            ]
        },
        prompts={
            "system": "You are an expert at analyzing meeting transcripts.",
            "tasks": {
                "summary": "Provide a concise summary of the meeting.",
                "key_decisions": "List all key decisions made during the meeting.",
                "action_items": "Extract action items with assignees if mentioned.",
                "topics": "Identify main topics discussed.",
                "quotables": "Extract memorable quotes with speaker attribution.",
            },
        },
        status=ProfileStatus.PUBLISHED,
        provider=LLMProvider.GEMINI,
        model="models/gemini-2.5-flash",
    )
    session.add(meetings_profile)

    # Presentations profile
    presentations_profile = Profile(
        id=uuid.uuid4(),
        key="presentations",
        version=1,
        name="Presentation Analysis",
        description="Analyze single-speaker presentation transcripts",
        schema={
            "outputs": [
                "summary",
                "main_points",
                "supporting_evidence",
                "quotables",
            ]
        },
        prompts={
            "system": "You are an expert at analyzing presentation transcripts.",
            "tasks": {
                "summary": "Provide a concise summary of the presentation.",
                "main_points": "List the main points made by the speaker.",
                "supporting_evidence": "Extract supporting evidence and examples.",
                "quotables": "Extract memorable quotes.",
            },
        },
        status=ProfileStatus.PUBLISHED,
        provider=LLMProvider.GEMINI,
        model="models/gemini-2.5-flash",
    )
    session.add(presentations_profile)

    await session.flush()

    print(f"  ✓ Created profile: {meetings_profile.name} (v{meetings_profile.version})")
    print(
        f"  ✓ Created profile: {presentations_profile.name} (v{presentations_profile.version})"
    )

    return {
        "meetings": meetings_profile,
        "presentations": presentations_profile,
    }


async def main():
    """Main seed function."""
    print("=" * 60)
    print("ScriptRipper Database Seeding")
    print("=" * 60)

    async with AsyncSessionLocal() as session:
        try:
            # Seed data
            users = await seed_users(session)
            profiles = await seed_profiles(session)

            # Commit all changes
            await session.commit()

            print("\n" + "=" * 60)
            print("✓ Seeding completed successfully!")
            print("=" * 60)
            print("\nTest Credentials:")
            print("  Admin: admin@scriptripper.local / admin123")
            print("  User:  user@scriptripper.local / user123")
            print("\nProfiles Created:")
            print(f"  - {profiles['meetings'].name}")
            print(f"  - {profiles['presentations'].name}")
            print("=" * 60)

        except Exception as e:
            await session.rollback()
            print(f"\n✗ Error during seeding: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(main())
