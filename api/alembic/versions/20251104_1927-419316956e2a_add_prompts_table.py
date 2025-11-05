"""add_prompts_table

Revision ID: 419316956e2a
Revises: 8d96d22d39f5
Create Date: 2025-11-04 19:27:36.835593

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '419316956e2a'
down_revision: Union[str, None] = '8d96d22d39f5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create prompts table (using String for category to avoid enum conflicts)
    op.create_table(
        'prompts',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('task_name', sa.String(length=255), nullable=False),
        sa.Column('prompt', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes
    op.create_index('ix_prompts_category', 'prompts', ['category'])
    op.create_index('ix_prompts_is_active', 'prompts', ['is_active'])


def downgrade() -> None:
    op.drop_index('ix_prompts_is_active', 'prompts')
    op.drop_index('ix_prompts_category', 'prompts')
    op.drop_table('prompts')
