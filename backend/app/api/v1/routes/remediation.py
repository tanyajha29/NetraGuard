from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services import remediation_service

router = APIRouter()


@router.get("/tasks")
def list_tasks(db: Session = Depends(get_db)):
    return remediation_service.list_tasks(db)


@router.post("/start")
def start_task(
    api_asset_id: int,
    assigned_to: str | None = None,
    notes: str | None = None,
    reason: str | None = None,
    due_date: str | None = None,
    db: Session = Depends(get_db),
):
    parsed_due = None
    if due_date:
        try:
            parsed_due = datetime.fromisoformat(due_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid due_date format")
    return remediation_service.start_task(
        db,
        api_asset_id,
        assigned_to=assigned_to,
        notes=notes,
        reason=reason,
        due_date=parsed_due,
    )


@router.patch("/{task_id}")
def update_task(task_id: int, status: str | None = None, notes: str | None = None, db: Session = Depends(get_db)):
    task = remediation_service.update_task(db, task_id, status, notes)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
