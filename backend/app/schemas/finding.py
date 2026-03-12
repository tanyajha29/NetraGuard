from datetime import datetime
from pydantic import BaseModel
from app.schemas.common import Timestamped


class FindingOut(Timestamped):
    id: int
    scan_run_id: int
    api_asset_id: int
    finding_type: str
    severity: str
    title: str
    description: str
    recommendation: str
    created_at: datetime | None = None

    class Config:
        orm_mode = True
