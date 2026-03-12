from datetime import datetime
from pydantic import BaseModel
from app.schemas.common import Timestamped


class APIAssetBase(BaseModel):
    path: str
    method: str = "GET"
    version: str | None = None
    source_type: str | None = None
    source_reference: str | None = None
    owner: str | None = None
    auth_required: bool = False
    encryption_enabled: bool = False
    rate_limit_detected: bool = False
    traffic_count: int = 0
    current_status: str = "unknown"
    risk_level: str = "unknown"
    risk_score: int = 0
    recommendation: str | None = None


class APIAssetOut(APIAssetBase, Timestamped):
    id: int
    target_id: int

    first_seen_at: datetime | None = None
    last_seen_at: datetime | None = None

    class Config:
        orm_mode = True
