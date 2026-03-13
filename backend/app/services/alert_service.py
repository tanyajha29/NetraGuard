from sqlalchemy.orm import Session
from app import models


def create_alert(db: Session, scan_run_id: int, api_asset_id: int, alert_type: str, severity: str, message: str):
    alert = models.Alert(
        scan_run_id=scan_run_id,
        api_asset_id=api_asset_id,
        alert_type=alert_type,
        severity=severity,
        message=message,
    )
    db.add(alert)
    return alert


def list_alerts(db: Session, status: str | None = None):
    q = db.query(models.Alert).order_by(models.Alert.created_at.desc())
    if status:
        try:
            q = q.filter(models.Alert.status == models.AlertStatus(status))
        except ValueError:
            q = q.filter(models.Alert.status == models.AlertStatus.open)
    return q.all()
