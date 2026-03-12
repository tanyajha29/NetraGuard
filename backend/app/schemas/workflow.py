from datetime import datetime
from pydantic import BaseModel
from app.schemas.common import Timestamped


class WorkflowCreate(BaseModel):
    api_asset_id: int
    scan_run_id: int
    workflow_status: str = "pending_review"
    mode: str = "demo"
    notes: str | None = None
    action_taken: str | None = None


class WorkflowOut(Timestamped):
    id: int
    api_asset_id: int
    scan_run_id: int
    workflow_status: str
    mode: str
    action_taken: str | None = None
    notes: str | None = None
    initiated_by: int | None = None

    class Config:
        orm_mode = True
