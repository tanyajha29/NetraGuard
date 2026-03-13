from sqlalchemy.orm import Session
from app import models


def list_tasks(db: Session):
    return db.query(models.RemediationTask).order_by(models.RemediationTask.created_at.desc()).all()


def start_task(db: Session, api_asset_id: int, assigned_to: str | None = None, notes: str | None = None):
    task = models.RemediationTask(api_asset_id=api_asset_id, assigned_to=assigned_to, notes=notes)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, task_id: int, status: str | None = None, notes: str | None = None):
    task = db.query(models.RemediationTask).filter(models.RemediationTask.id == task_id).first()
    if not task:
        return None
    if status:
        task.status = status
    if notes is not None:
        task.notes = notes
    db.commit()
    db.refresh(task)
    return task
