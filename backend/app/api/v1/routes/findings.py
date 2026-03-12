from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models
from app.core.security import get_current_user
from app.db.session import get_db
from app.schemas import finding as finding_schema

router = APIRouter()


@router.get("", response_model=list[finding_schema.FindingOut])
def list_findings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    scan_run_id: int | None = None,
):
    query = db.query(models.APIFinding)
    if scan_run_id:
        query = query.filter(models.APIFinding.scan_run_id == scan_run_id)
    return query.order_by(models.APIFinding.created_at.desc()).all()
