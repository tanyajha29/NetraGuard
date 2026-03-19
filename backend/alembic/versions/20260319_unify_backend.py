"""unify backend pipeline

Revision ID: 20260319_unify_backend
Revises: 20260313214745_platform_expansion
Create Date: 2026-03-19
"""
from alembic import op
import sqlalchemy as sa


revision = "20260319_unify_backend"
down_revision = "20260313214745_platform_expansion"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("scan_runs", sa.Column("progress_stage", sa.String(), server_default="pending"))
    op.add_column("remediation_tasks", sa.Column("reason", sa.Text(), nullable=True))
    op.add_column("remediation_tasks", sa.Column("source_finding_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_remediation_tasks_source_finding",
        "remediation_tasks",
        "api_findings",
        ["source_finding_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade():
    op.drop_constraint("fk_remediation_tasks_source_finding", "remediation_tasks", type_="foreignkey")
    op.drop_column("remediation_tasks", "source_finding_id")
    op.drop_column("remediation_tasks", "reason")
    op.drop_column("scan_runs", "progress_stage")
