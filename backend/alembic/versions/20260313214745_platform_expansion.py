"""platform expansion

Revision ID: 20260313214745_platform_expansion
Revises: 0001_initial
Create Date: 2026-03-13 21:47:45
"""
from alembic import op
import sqlalchemy as sa

revision = "20260313214745_platform_expansion"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('scan_runs', sa.Column('vulnerabilities_found', sa.Integer(), server_default='0'))
    op.add_column('scan_runs', sa.Column('duration_seconds', sa.Integer(), server_default='0'))

    op.add_column('api_assets', sa.Column('service_name', sa.String(), nullable=True))
    op.add_column('api_assets', sa.Column('source', sa.String(), nullable=True))
    op.add_column('api_assets', sa.Column('last_scanned_at', sa.DateTime(), nullable=True))
    op.add_column('api_assets', sa.Column('status_reason', sa.String(), nullable=True))

    op.add_column('api_findings', sa.Column('cwe', sa.String(), nullable=True))
    op.add_column('api_findings', sa.Column('owasp', sa.String(), nullable=True))
    op.add_column('api_findings', sa.Column('evidence', sa.Text(), nullable=True))
    op.add_column('api_findings', sa.Column('parameter', sa.String(), nullable=True))

    op.create_table(
        'remediation_tasks',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('api_asset_id', sa.Integer(), sa.ForeignKey('api_assets.id')),
        sa.Column('status', sa.String(), server_default='open'),
        sa.Column('assigned_to', sa.String()),
        sa.Column('due_date', sa.DateTime()),
        sa.Column('notes', sa.Text()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        'dependency_edges',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('source_api_id', sa.Integer(), sa.ForeignKey('api_assets.id')),
        sa.Column('target_api_id', sa.Integer(), sa.ForeignKey('api_assets.id')),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        'traffic_samples',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('api_asset_id', sa.Integer(), sa.ForeignKey('api_assets.id')),
        sa.Column('timestamp', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('count', sa.Integer(), server_default='0'),
        sa.Column('method', sa.String(), server_default='GET'),
        sa.Column('path', sa.String()),
        sa.Column('source', sa.String(), server_default='logs'),
    )


def downgrade():
    op.drop_table('traffic_samples')
    op.drop_table('dependency_edges')
    op.drop_table('remediation_tasks')
    op.drop_column('api_findings', 'parameter')
    op.drop_column('api_findings', 'evidence')
    op.drop_column('api_findings', 'owasp')
    op.drop_column('api_findings', 'cwe')
    op.drop_column('api_assets', 'status_reason')
    op.drop_column('api_assets', 'last_scanned_at')
    op.drop_column('api_assets', 'source')
    op.drop_column('api_assets', 'service_name')
    op.drop_column('scan_runs', 'duration_seconds')
    op.drop_column('scan_runs', 'vulnerabilities_found')
