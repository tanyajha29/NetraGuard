from datetime import datetime
from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_apis: int
    active_apis: int
    deprecated_apis: int
    shadow_apis: int
    zombie_apis: int
    orphaned_apis: int
    high_risk_apis: int
    critical_findings: int
    total_alerts: int
    open_alerts: int
    open_remediation_tasks: int


class TrafficPoint(BaseModel):
    path: str
    count: int
    last_seen: datetime | None = None
    method: str | None = None
