"""add subscription source tracking

Revision ID: subscription_source_001
Revises: 419316956e2a
Create Date: 2025-11-18 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'subscription_source_001'
down_revision = '419316956e2a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create subscription_source enum type
    subscription_source_enum = postgresql.ENUM(
        'none', 'stripe', 'admin', 'promotional',
        name='subscription_source',
        create_type=True
    )
    subscription_source_enum.create(op.get_bind(), checkfirst=True)

    # Add new columns to users table
    op.add_column('users', sa.Column('display_name', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column(
        'subscription_source',
        sa.Enum('none', 'stripe', 'admin', 'promotional', name='subscription_source'),
        nullable=False,
        server_default='none'
    ))
    op.add_column('users', sa.Column('stripe_customer_id', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('stripe_subscription_id', sa.String(length=255), nullable=True))

    # Create index on stripe_customer_id
    op.create_index(op.f('ix_users_stripe_customer_id'), 'users', ['stripe_customer_id'], unique=False)


def downgrade() -> None:
    # Drop index
    op.drop_index(op.f('ix_users_stripe_customer_id'), table_name='users')

    # Drop columns
    op.drop_column('users', 'stripe_subscription_id')
    op.drop_column('users', 'stripe_customer_id')
    op.drop_column('users', 'subscription_source')
    op.drop_column('users', 'display_name')

    # Drop enum type
    sa.Enum(name='subscription_source').drop(op.get_bind(), checkfirst=True)
