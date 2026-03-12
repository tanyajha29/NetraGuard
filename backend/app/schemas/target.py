from datetime import datetime
from pydantic import BaseModel
from app.schemas.common import Timestamped


class TargetBase(BaseModel):
    name: str
    base_url: str
    environment: str | None = None
    owner: str | None = None
    description: str | None = None
    target_type: str | None = None
    is_active: bool = True


class TargetCreate(TargetBase):
    pass


class TargetOut(TargetBase, Timestamped):
    id: int
    created_by: int | None = None

    class Config:
        orm_mode = True
