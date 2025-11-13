"""Seed database with prompts from JSON files."""

import asyncio
import json
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config.database import AsyncSessionLocal
from app.models.prompt import Prompt


async def seed_prompts():
    """Seed prompts from JSON files into database."""
    from sqlalchemy import select

    # Read JSON files
    script_dir = Path(__file__).parent
    meetings_path = script_dir / "meetings_prompts.json"
    presentations_path = script_dir / "presentations_prompts.json"

    with open(meetings_path) as f:
        meetings_prompts = json.load(f)

    with open(presentations_path) as f:
        presentations_prompts = json.load(f)

    async with AsyncSessionLocal() as db:
        # Check if prompts already exist
        result = await db.execute(select(Prompt))
        existing_prompts = result.scalars().all()

        if existing_prompts:
            print(f"ℹ️  Database already has {len(existing_prompts)} prompts, skipping seed")
            return

        meetings_added = 0
        presentations_added = 0

        # Add meetings prompts
        for prompt_data in meetings_prompts:
            prompt = Prompt(
                task_name=prompt_data["task_name"],
                prompt=prompt_data["prompt"],
                category="meetings",
                is_active=True,
            )
            db.add(prompt)
            meetings_added += 1

        # Add presentations prompts
        for prompt_data in presentations_prompts:
            prompt = Prompt(
                task_name=prompt_data["task_name"],
                prompt=prompt_data["prompt"],
                category="presentations",
                is_active=True,
            )
            db.add(prompt)
            presentations_added += 1

        await db.commit()
        print(f"✅ Seeded {meetings_added} meetings prompts")
        print(f"✅ Seeded {presentations_added} presentations prompts")


if __name__ == "__main__":
    asyncio.run(seed_prompts())
