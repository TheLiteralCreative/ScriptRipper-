"""add_description_and_prompt_json_to_prompts

Revision ID: 20251118_0001
Revises: subscription_source_001
Create Date: 2025-11-18 00:01:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20251118_0001'
down_revision: Union[str, None] = 'subscription_source_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns
    # Add description column (nullable initially for backward compatibility)
    op.add_column('prompts', sa.Column('description', sa.Text(), nullable=True))

    # Add prompt_json column (nullable initially for backward compatibility)
    op.add_column('prompts', sa.Column('prompt_json', sa.Text(), nullable=True))

    # Migrate existing data: copy prompt to both description and prompt_json
    # This ensures backward compatibility - existing prompts will work
    op.execute("""
        UPDATE prompts
        SET description = prompt,
            prompt_json = prompt
        WHERE description IS NULL OR prompt_json IS NULL
    """)

    # Now make columns NOT NULL since we've populated them
    op.alter_column('prompts', 'description', nullable=False)
    op.alter_column('prompts', 'prompt_json', nullable=False)


def downgrade() -> None:
    # Drop the new columns
    op.drop_column('prompts', 'prompt_json')
    op.drop_column('prompts', 'description')
