"""Remove duplicate prompts from database, keeping only unique ones."""

import asyncio
import sys
from pathlib import Path
from collections import defaultdict

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select, delete
from app.config.database import AsyncSessionLocal
from app.models.prompt import Prompt


async def clean_duplicate_prompts():
    """Remove duplicate prompts, keeping one of each unique task_name/category combo."""

    async with AsyncSessionLocal() as db:
        # Fetch all prompts
        result = await db.execute(select(Prompt).order_by(Prompt.created_at))
        all_prompts = result.scalars().all()

        print(f"📊 Found {len(all_prompts)} total prompts in database")

        if len(all_prompts) == 0:
            print("✅ Database is clean (no prompts found)")
            return

        # Group by task_name + category to find duplicates
        prompt_groups = defaultdict(list)
        for prompt in all_prompts:
            key = (prompt.task_name, prompt.category)
            prompt_groups[key].append(prompt)

        # Find duplicates
        duplicates_to_delete = []
        for key, prompts in prompt_groups.items():
            if len(prompts) > 1:
                # Keep the first one (oldest), delete the rest
                task_name, category = key
                print(f"🔍 Found {len(prompts)} duplicates of '{task_name}' ({category})")
                duplicates_to_delete.extend([p.id for p in prompts[1:]])

        if not duplicates_to_delete:
            print("✅ No duplicates found!")
            return

        # Delete duplicates
        print(f"🗑️  Deleting {len(duplicates_to_delete)} duplicate prompts...")

        await db.execute(
            delete(Prompt).where(Prompt.id.in_(duplicates_to_delete))
        )
        await db.commit()

        # Verify
        result = await db.execute(select(Prompt))
        remaining = result.scalars().all()

        print(f"✅ Cleaned database!")
        print(f"   Before: {len(all_prompts)} prompts")
        print(f"   After: {len(remaining)} prompts")
        print(f"   Deleted: {len(duplicates_to_delete)} duplicates")

        # Show what's left
        meetings_count = sum(1 for p in remaining if p.category == "meetings")
        presentations_count = sum(1 for p in remaining if p.category == "presentations")
        print(f"\n📋 Remaining prompts:")
        print(f"   Meetings: {meetings_count}")
        print(f"   Presentations: {presentations_count}")


if __name__ == "__main__":
    asyncio.run(clean_duplicate_prompts())
