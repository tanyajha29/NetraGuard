from datetime import datetime
from pydantic import BaseModel
from app.schemas.common import Timestamped


class ScanStartRequest(BaseModel):
    target_id: int
    trigger_type: str = "manual"
    log_file: str | None = None


class ScanRunOut(Timestamped):
    id: int
    target_id: int
    initiated_by: int | None
    status: str
    progress_stage: str | None = None
    trigger_type: str
    started_at: datetime | None
    ended_at: datetime | None
    total_apis: int
    active_count: int
    deprecated_count: int
    orphaned_count: int
    shadow_count: int
    zombie_count: int
    summary_json: dict | None = None
    vulnerabilities_found: int | None = None
    duration_seconds: int | None = None

    class Config:
        orm_mode = True
