from datetime import datetime
from pydantic import BaseModel
from app.schemas.common import Timestamped


class AlertOut(Timestamped):
    id: int
    scan_run_id: int
    api_asset_id: int
    alert_type: str
    severity: str
    message: str
    status: str
    created_at: datetime | None = None

    class Config:
        orm_mode = True
