"""Temporary cleanup endpoint - DELETE AFTER USE"""

from fastapi import APIRouter, Depends
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from collections import defaultdict

from app.config.database import get_db
from app.models.prompt import Prompt

router = APIRouter(prefix="/cleanup", tags=["cleanup"])


@router.post("/remove-duplicate-prompts")
async def remove_duplicate_prompts(db: AsyncSession = Depends(get_db)):
    """Remove duplicate prompts, keeping one of each unique task_name/category combo.

    WARNING: This is a temporary endpoint. Remove after cleaning database.
    """

    # Fetch all prompts
    result = await db.execute(select(Prompt).order_by(Prompt.created_at))
    all_prompts = result.scalars().all()

    if len(all_prompts) == 0:
        return {"message": "Database is clean (no prompts found)", "deleted": 0}

    # Group by task_name + category to find duplicates
    prompt_groups = defaultdict(list)
    for prompt in all_prompts:
        key = (prompt.task_name, prompt.category)
        prompt_groups[key].append(prompt)

    # Find duplicates
    duplicates_to_delete = []
    duplicate_info = []

    for key, prompts in prompt_groups.items():
        if len(prompts) > 1:
            task_name, category = key
            duplicate_info.append({
                "task_name": task_name,
                "category": category,
                "count": len(prompts)
            })
            # Keep the first one (oldest), delete the rest
            duplicates_to_delete.extend([p.id for p in prompts[1:]])

    if not duplicates_to_delete:
        return {
            "message": "No duplicates found!",
            "total_prompts": len(all_prompts),
            "deleted": 0
        }

    # Delete duplicates
    await db.execute(
        delete(Prompt).where(Prompt.id.in_(duplicates_to_delete))
    )
    await db.commit()

    # Verify
    result = await db.execute(select(Prompt))
    remaining = result.scalars().all()

    meetings_count = sum(1 for p in remaining if p.category == "meetings")
    presentations_count = sum(1 for p in remaining if p.category == "presentations")

    return {
        "message": "Database cleaned successfully!",
        "before": len(all_prompts),
        "after": len(remaining),
        "deleted": len(duplicates_to_delete),
        "duplicates_found": duplicate_info,
        "remaining": {
            "meetings": meetings_count,
            "presentations": presentations_count,
            "total": len(remaining)
        }
    }
