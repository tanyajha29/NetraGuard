from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models
from app.core.security import get_current_user
from app.db.session import get_db
from app.schemas import alert as alert_schema

router = APIRouter()


@router.get("", response_model=list[alert_schema.AlertOut])
def list_alerts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    status: str | None = None,
):
    query = db.query(models.Alert)
    if status:
        query = query.filter(models.Alert.status == status)
    return query.order_by(models.Alert.created_at.desc()).all()
