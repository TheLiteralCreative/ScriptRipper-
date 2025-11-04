"""Initial schema

Revision ID: 001
Revises:
Create Date: 2025-11-03 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create ENUM types
    op.execute("CREATE TYPE user_role AS ENUM ('user', 'admin')")
    op.execute("CREATE TYPE profile_status AS ENUM ('draft', 'published', 'deprecated')")
    op.execute("CREATE TYPE llm_provider AS ENUM ('gemini', 'openai', 'anthropic')")
    op.execute("CREATE TYPE job_status AS ENUM ('queued', 'running', 'completed', 'failed')")
    op.execute("CREATE TYPE artifact_kind AS ENUM ('markdown', 'json', 'pdf', 'zip')")

    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True, index=True),
        sa.Column('name', sa.String(255), nullable=True),
        sa.Column('hashed_password', sa.String(255), nullable=True),
        sa.Column('role', postgresql.ENUM('user', 'admin', name='user_role', create_type=False), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('oauth_provider', sa.String(50), nullable=True),
        sa.Column('oauth_id', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    # Create profiles table
    op.create_table(
        'profiles',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('key', sa.String(100), nullable=False, index=True),
        sa.Column('version', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('schema', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('prompts', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('status', postgresql.ENUM('draft', 'published', 'deprecated', name='profile_status', create_type=False), nullable=False),
        sa.Column('provider', postgresql.ENUM('gemini', 'openai', 'anthropic', name='llm_provider', create_type=False), nullable=False),
        sa.Column('model', sa.String(100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    # Create jobs table
    op.create_table(
        'jobs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('profile_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('status', postgresql.ENUM('queued', 'running', 'completed', 'failed', name='job_status', create_type=False), nullable=False, index=True),
        sa.Column('input_uri', sa.Text(), nullable=True),
        sa.Column('metrics', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('cost', sa.Numeric(10, 4), nullable=True),
        sa.Column('provider', sa.String(50), nullable=True),
        sa.Column('model', sa.String(100), nullable=True),
        sa.Column('error', sa.Text(), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('idempotency_key', sa.String(255), nullable=True, unique=True, index=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['profile_id'], ['profiles.id'], ondelete='RESTRICT'),
    )

    # Create artifacts table
    op.create_table(
        'artifacts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('job_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('kind', postgresql.ENUM('markdown', 'json', 'pdf', 'zip', name='artifact_kind', create_type=False), nullable=False),
        sa.Column('uri', sa.Text(), nullable=False),
        sa.Column('checksum', sa.String(64), nullable=True),
        sa.Column('size', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['job_id'], ['jobs.id'], ondelete='CASCADE'),
    )

    # Create custom_prompts table
    op.create_table(
        'custom_prompts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('job_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('prompt', sa.Text(), nullable=False),
        sa.Column('result_artifact_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['job_id'], ['jobs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['result_artifact_id'], ['artifacts.id'], ondelete='SET NULL'),
    )


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table('custom_prompts')
    op.drop_table('artifacts')
    op.drop_table('jobs')
    op.drop_table('profiles')
    op.drop_table('users')

    # Drop ENUM types
    op.execute("DROP TYPE artifact_kind")
    op.execute("DROP TYPE job_status")
    op.execute("DROP TYPE llm_provider")
    op.execute("DROP TYPE profile_status")
    op.execute("DROP TYPE user_role")
