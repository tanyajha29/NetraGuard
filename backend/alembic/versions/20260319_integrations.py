"""integrations and source metadata

Revision ID: 20260319_integrations
Revises: 20260319_unify_backend
Create Date: 2026-03-19
"""
from alembic import op
import sqlalchemy as sa


revision = "20260319_integrations"
down_revision = "20260319_unify_backend"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("api_assets", sa.Column("source_repo", sa.String(), nullable=True))
    op.add_column("api_assets", sa.Column("source_path", sa.String(), nullable=True))
    op.add_column("api_assets", sa.Column("source_branch", sa.String(), nullable=True))
    op.add_column("api_assets", sa.Column("discovered_from", sa.String(), nullable=True))

    op.add_column("alerts", sa.Column("slack_notified", sa.Boolean(), server_default=sa.text("false")))

    op.add_column("remediation_tasks", sa.Column("external_ticket_id", sa.String(), nullable=True))
    op.add_column("remediation_tasks", sa.Column("external_ticket_url", sa.String(), nullable=True))
    op.add_column("remediation_tasks", sa.Column("ticket_provider", sa.String(), nullable=True))


def downgrade():
    op.drop_column("remediation_tasks", "ticket_provider")
    op.drop_column("remediation_tasks", "external_ticket_url")
    op.drop_column("remediation_tasks", "external_ticket_id")
    op.drop_column("alerts", "slack_notified")
    op.drop_column("api_assets", "discovered_from")
    op.drop_column("api_assets", "source_branch")
    op.drop_column("api_assets", "source_path")
    op.drop_column("api_assets", "source_repo")
