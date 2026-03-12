from datetime import datetime
from pydantic import BaseModel
from app.schemas.common import Timestamped


class ReportOut(Timestamped):
    id: int
    scan_run_id: int
    target_id: int
    format: str
    file_path: str
    summary: str | None = None
    generated_at: datetime | None = None

    class Config:
        orm_mode = True
