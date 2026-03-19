from sqlalchemy.orm import Session
from app import models


def list_tasks(db: Session):
    tasks = (
        db.query(models.RemediationTask)
        .order_by(models.RemediationTask.created_at.desc())
        .all()
    )
    result = []
    for t in tasks:
        result.append(
            {
                "id": t.id,
                "api_asset_id": t.api_asset_id,
                "api_path": t.api_asset.path if t.api_asset else None,
                "status": t.status,
                "assigned_to": t.assigned_to,
                "due_date": t.due_date,
                "notes": t.notes,
                "reason": getattr(t, "reason", None),
                "ticket_provider": getattr(t, "ticket_provider", None),
                "external_ticket_id": getattr(t, "external_ticket_id", None),
                "external_ticket_url": getattr(t, "external_ticket_url", None),
                "created_at": t.created_at,
                "updated_at": t.updated_at,
            }
        )
    return result


def start_task(
    db: Session,
    api_asset_id: int,
    assigned_to: str | None = None,
    notes: str | None = None,
    reason: str | None = None,
    due_date=None,
    source_finding_id: int | None = None,
):
    task = models.RemediationTask(
        api_asset_id=api_asset_id,
        assigned_to=assigned_to,
        notes=notes,
        reason=reason,
        due_date=due_date,
        source_finding_id=source_finding_id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return {
        "id": task.id,
        "api_asset_id": task.api_asset_id,
        "api_path": task.api_asset.path if task.api_asset else None,
        "status": task.status,
        "assigned_to": task.assigned_to,
        "due_date": task.due_date,
        "notes": task.notes,
        "reason": task.reason,
        "created_at": task.created_at,
        "updated_at": task.updated_at,
    }


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
    return {
        "id": task.id,
        "api_asset_id": task.api_asset_id,
        "api_path": task.api_asset.path if task.api_asset else None,
        "status": task.status,
        "assigned_to": task.assigned_to,
        "due_date": task.due_date,
        "notes": task.notes,
        "reason": task.reason,
        "created_at": task.created_at,
        "updated_at": task.updated_at,
    }
