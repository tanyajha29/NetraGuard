from datetime import datetime
from sqlalchemy import (
    Column,
    DateTime,
    Integer,
    String,
    Boolean,
    ForeignKey,
    Text,
    JSON,
    Enum,
    Float,
)
from sqlalchemy.orm import relationship
import enum

from app.db.base import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    analyst = "analyst"


class ScanStatus(str, enum.Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"


class AlertStatus(str, enum.Enum):
    open = "open"
    acknowledged = "acknowledged"
    resolved = "resolved"


class WorkflowStatus(str, enum.Enum):
    pending_review = "pending_review"
    approved = "approved"
    rejected = "rejected"
    demo_auto_disabled = "demo_auto_disabled"
    completed = "completed"


class WorkflowMode(str, enum.Enum):
    demo = "demo"
    real = "real"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.analyst)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    targets = relationship("Target", back_populates="creator")
    scans = relationship("ScanRun", back_populates="initiator")


class Target(Base):
    __tablename__ = "targets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    base_url = Column(String, nullable=False)
    environment = Column(String, nullable=True)
    owner = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    target_type = Column(String, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    creator = relationship("User", back_populates="targets")
    scans = relationship("ScanRun", back_populates="target")
    api_assets = relationship("APIAsset", back_populates="target")


class ScanRun(Base):
    __tablename__ = "scan_runs"

    id = Column(Integer, primary_key=True, index=True)
    target_id = Column(Integer, ForeignKey("targets.id"))
    initiated_by = Column(Integer, ForeignKey("users.id"))
    status = Column(Enum(ScanStatus), default=ScanStatus.pending)
    trigger_type = Column(String, default="manual")
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    total_apis = Column(Integer, default=0)
    active_count = Column(Integer, default=0)
    deprecated_count = Column(Integer, default=0)
    orphaned_count = Column(Integer, default=0)
    shadow_count = Column(Integer, default=0)
    zombie_count = Column(Integer, default=0)
    summary_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    vulnerabilities_found = Column(Integer, default=0)
    duration_seconds = Column(Integer, default=0)

    target = relationship("Target", back_populates="scans")
    initiator = relationship("User", back_populates="scans")
    api_assets = relationship("APIAsset", back_populates="scan_run")
    findings = relationship("APIFinding", back_populates="scan_run")
    alerts = relationship("Alert", back_populates="scan_run")
    reports = relationship("Report", back_populates="scan_run")


class APIAsset(Base):
    __tablename__ = "api_assets"

    id = Column(Integer, primary_key=True, index=True)
    target_id = Column(Integer, ForeignKey("targets.id"))
    scan_run_id = Column(Integer, ForeignKey("scan_runs.id"), nullable=True)
    path = Column(String, index=True)
    method = Column(String, default="GET")
    version = Column(String, nullable=True)
    source_type = Column(String, nullable=True)
    source_reference = Column(String, nullable=True)
    service_name = Column(String, nullable=True)
    source = Column(String, nullable=True)
    owner = Column(String, nullable=True)
    auth_required = Column(Boolean, default=False)
    encryption_enabled = Column(Boolean, default=False)
    rate_limit_detected = Column(Boolean, default=False)
    traffic_count = Column(Integer, default=0)
    first_seen_at = Column(DateTime, default=datetime.utcnow)
    last_seen_at = Column(DateTime, default=datetime.utcnow)
    current_status = Column(String, default="unknown")
    risk_level = Column(String, default="unknown")
    risk_score = Column(Integer, default=0)
    last_scanned_at = Column(DateTime, nullable=True)
    recommendation = Column(Text, nullable=True)
    status_reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    target = relationship("Target", back_populates="api_assets")
    scan_run = relationship("ScanRun", back_populates="api_assets")
    status_history = relationship(
        "APIStatusHistory", back_populates="api_asset", cascade="all,delete"
    )
    findings = relationship("APIFinding", back_populates="api_asset")
    alerts = relationship("Alert", back_populates="api_asset")
    workflows = relationship("DecommissionWorkflow", back_populates="api_asset")
    traffic_samples = relationship("TrafficSample", back_populates="api_asset")
    dependencies_out = relationship(
        "DependencyEdge",
        foreign_keys="DependencyEdge.source_api_id",
        back_populates="source_api",
    )
    dependencies_in = relationship(
        "DependencyEdge",
        foreign_keys="DependencyEdge.target_api_id",
        back_populates="target_api",
    )


class APIStatusHistory(Base):
    __tablename__ = "api_status_history"

    id = Column(Integer, primary_key=True, index=True)
    api_asset_id = Column(Integer, ForeignKey("api_assets.id"))
    previous_status = Column(String)
    new_status = Column(String)
    reason = Column(String)
    changed_at = Column(DateTime, default=datetime.utcnow)

    api_asset = relationship("APIAsset", back_populates="status_history")


class APIFinding(Base):
    __tablename__ = "api_findings"

    id = Column(Integer, primary_key=True, index=True)
    scan_run_id = Column(Integer, ForeignKey("scan_runs.id"))
    api_asset_id = Column(Integer, ForeignKey("api_assets.id"))
    finding_type = Column(String)
    severity = Column(String)
    title = Column(String)
    description = Column(Text)
    recommendation = Column(Text)
    cwe = Column(String, nullable=True)
    owasp = Column(String, nullable=True)
    evidence = Column(Text, nullable=True)
    parameter = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    api_asset = relationship("APIAsset", back_populates="findings")
    scan_run = relationship("ScanRun", back_populates="findings")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    scan_run_id = Column(Integer, ForeignKey("scan_runs.id"))
    api_asset_id = Column(Integer, ForeignKey("api_assets.id"))
    alert_type = Column(String)
    severity = Column(String)
    message = Column(Text)
    status = Column(Enum(AlertStatus), default=AlertStatus.open)
    created_at = Column(DateTime, default=datetime.utcnow)

    api_asset = relationship("APIAsset", back_populates="alerts")
    scan_run = relationship("ScanRun", back_populates="alerts")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    scan_run_id = Column(Integer, ForeignKey("scan_runs.id"))
    target_id = Column(Integer, ForeignKey("targets.id"))
    format = Column(String, default="html")
    file_path = Column(String)
    summary = Column(Text)
    generated_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    scan_run = relationship("ScanRun", back_populates="reports")
    target = relationship("Target")


class DecommissionWorkflow(Base):
    __tablename__ = "decommission_workflows"

    id = Column(Integer, primary_key=True, index=True)
    api_asset_id = Column(Integer, ForeignKey("api_assets.id"))
    scan_run_id = Column(Integer, ForeignKey("scan_runs.id"))
    workflow_status = Column(Enum(WorkflowStatus), default=WorkflowStatus.pending_review)
    mode = Column(Enum(WorkflowMode), default=WorkflowMode.demo)
    action_taken = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    initiated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    api_asset = relationship("APIAsset", back_populates="workflows")
    scan_run = relationship("ScanRun")


class RemediationTask(Base):
    __tablename__ = "remediation_tasks"

    id = Column(Integer, primary_key=True, index=True)
    api_asset_id = Column(Integer, ForeignKey("api_assets.id"))
    status = Column(String, default="open")
    assigned_to = Column(String, nullable=True)
    due_date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    api_asset = relationship("APIAsset")


class DependencyEdge(Base):
    __tablename__ = "dependency_edges"

    id = Column(Integer, primary_key=True, index=True)
    source_api_id = Column(Integer, ForeignKey("api_assets.id"))
    target_api_id = Column(Integer, ForeignKey("api_assets.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    source_api = relationship("APIAsset", foreign_keys=[source_api_id], back_populates="dependencies_out")
    target_api = relationship("APIAsset", foreign_keys=[target_api_id], back_populates="dependencies_in")


class TrafficSample(Base):
    __tablename__ = "traffic_samples"

    id = Column(Integer, primary_key=True, index=True)
    api_asset_id = Column(Integer, ForeignKey("api_assets.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    count = Column(Integer, default=0)
    method = Column(String, default="GET")
    path = Column(String)
    source = Column(String, default="logs")

    api_asset = relationship("APIAsset", back_populates="traffic_samples")
