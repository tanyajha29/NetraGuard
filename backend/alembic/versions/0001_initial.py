"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-03-12
"""

from alembic import op
import sqlalchemy as sa

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("full_name", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(), nullable=False),
        sa.Column("role", sa.Enum("admin", "analyst", name="userrole"), server_default="analyst"),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "targets",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("base_url", sa.String(), nullable=False),
        sa.Column("environment", sa.String()),
        sa.Column("owner", sa.String()),
        sa.Column("description", sa.Text()),
        sa.Column("target_type", sa.String()),
        sa.Column("created_by", sa.Integer(), sa.ForeignKey("users.id")),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "scan_runs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("target_id", sa.Integer(), sa.ForeignKey("targets.id")),
        sa.Column("initiated_by", sa.Integer(), sa.ForeignKey("users.id")),
        sa.Column("status", sa.Enum("pending", "running", "completed", "failed", name="scanstatus"), server_default="pending"),
        sa.Column("trigger_type", sa.String()),
        sa.Column("started_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("ended_at", sa.DateTime()),
        sa.Column("total_apis", sa.Integer(), server_default="0"),
        sa.Column("active_count", sa.Integer(), server_default="0"),
        sa.Column("deprecated_count", sa.Integer(), server_default="0"),
        sa.Column("orphaned_count", sa.Integer(), server_default="0"),
        sa.Column("shadow_count", sa.Integer(), server_default="0"),
        sa.Column("zombie_count", sa.Integer(), server_default="0"),
        sa.Column("summary_json", sa.JSON(), server_default=sa.text("'{}'::json")),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "api_assets",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("target_id", sa.Integer(), sa.ForeignKey("targets.id")),
        sa.Column("scan_run_id", sa.Integer(), sa.ForeignKey("scan_runs.id")),
        sa.Column("path", sa.String()),
        sa.Column("method", sa.String(), server_default="GET"),
        sa.Column("version", sa.String()),
        sa.Column("source_type", sa.String()),
        sa.Column("source_reference", sa.String()),
        sa.Column("owner", sa.String()),
        sa.Column("auth_required", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("encryption_enabled", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("rate_limit_detected", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("traffic_count", sa.Integer(), server_default="0"),
        sa.Column("first_seen_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("last_seen_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("current_status", sa.String(), server_default="unknown"),
        sa.Column("risk_level", sa.String(), server_default="unknown"),
        sa.Column("risk_score", sa.Integer(), server_default="0"),
        sa.Column("recommendation", sa.Text()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "api_status_history",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("api_asset_id", sa.Integer(), sa.ForeignKey("api_assets.id")),
        sa.Column("previous_status", sa.String()),
        sa.Column("new_status", sa.String()),
        sa.Column("reason", sa.String()),
        sa.Column("changed_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "api_findings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("scan_run_id", sa.Integer(), sa.ForeignKey("scan_runs.id")),
        sa.Column("api_asset_id", sa.Integer(), sa.ForeignKey("api_assets.id")),
        sa.Column("finding_type", sa.String()),
        sa.Column("severity", sa.String()),
        sa.Column("title", sa.String()),
        sa.Column("description", sa.Text()),
        sa.Column("recommendation", sa.Text()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "alerts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("scan_run_id", sa.Integer(), sa.ForeignKey("scan_runs.id")),
        sa.Column("api_asset_id", sa.Integer(), sa.ForeignKey("api_assets.id")),
        sa.Column("alert_type", sa.String()),
        sa.Column("severity", sa.String()),
        sa.Column("message", sa.Text()),
        sa.Column("status", sa.Enum("open", "acknowledged", "resolved", name="alertstatus"), server_default="open"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "reports",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("scan_run_id", sa.Integer(), sa.ForeignKey("scan_runs.id")),
        sa.Column("target_id", sa.Integer(), sa.ForeignKey("targets.id")),
        sa.Column("format", sa.String(), server_default="html"),
        sa.Column("file_path", sa.String()),
        sa.Column("summary", sa.Text()),
        sa.Column("generated_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "decommission_workflows",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("api_asset_id", sa.Integer(), sa.ForeignKey("api_assets.id")),
        sa.Column("scan_run_id", sa.Integer(), sa.ForeignKey("scan_runs.id")),
        sa.Column("workflow_status", sa.Enum("pending_review", "approved", "rejected", "demo_auto_disabled", "completed", name="workflowstatus"), server_default="pending_review"),
        sa.Column("mode", sa.Enum("demo", "real", name="workflowmode"), server_default="demo"),
        sa.Column("action_taken", sa.String()),
        sa.Column("notes", sa.Text()),
        sa.Column("initiated_by", sa.Integer(), sa.ForeignKey("users.id")),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )


def downgrade():
    op.drop_table("decommission_workflows")
    op.drop_table("reports")
    op.drop_table("alerts")
    op.drop_table("api_findings")
    op.drop_table("api_status_history")
    op.drop_table("api_assets")
    op.drop_table("scan_runs")
    op.drop_table("targets")
    op.drop_table("users")
