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
        try:
            query = query.filter(models.Alert.status == models.AlertStatus(status))
        except ValueError:
            return []
    return query.order_by(models.Alert.created_at.desc()).all()


@router.patch("/{alert_id}")
def update_alert(
    alert_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    try:
        alert.status = models.AlertStatus(status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")
    db.commit()
    db.refresh(alert)
    return alert
