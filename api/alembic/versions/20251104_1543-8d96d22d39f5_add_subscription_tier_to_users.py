"""Add subscription tier to users

Revision ID: 8d96d22d39f5
Revises: 96745fdb93ac
Create Date: 2025-11-04 15:43:50.286383

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8d96d22d39f5'
down_revision: Union[str, None] = '96745fdb93ac'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create subscription_tier enum type
    subscription_tier_enum = sa.Enum('free', 'pro', 'premium', name='subscription_tier')
    subscription_tier_enum.create(op.get_bind(), checkfirst=True)

    # Add subscription_tier column to users table
    op.add_column('users', sa.Column('subscription_tier', subscription_tier_enum, nullable=False, server_default='free'))


def downgrade() -> None:
    # Remove subscription_tier column
    op.drop_column('users', 'subscription_tier')

    # Drop subscription_tier enum type
    sa.Enum(name='subscription_tier').drop(op.get_bind(), checkfirst=True)
