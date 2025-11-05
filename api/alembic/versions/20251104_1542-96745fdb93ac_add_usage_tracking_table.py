"""Add usage tracking table

Revision ID: 96745fdb93ac
Revises: 001
Create Date: 2025-11-04 15:42:54.642190

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '96745fdb93ac'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'usage',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('transcript_type', sa.String(length=50), nullable=False),
        sa.Column('prompt_count', sa.Integer(), nullable=False),
        sa.Column('had_custom_prompt', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('total_input_tokens', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('total_output_tokens', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('total_cost', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_usage_user_id', 'usage', ['user_id'])


def downgrade() -> None:
    op.drop_index('ix_usage_user_id', table_name='usage')
    op.drop_table('usage')
