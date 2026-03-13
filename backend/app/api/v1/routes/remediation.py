from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services import remediation_service

router = APIRouter()


@router.get("/tasks")
def list_tasks(db: Session = Depends(get_db)):
    return remediation_service.list_tasks(db)


@router.post("/start")
def start_task(api_asset_id: int, assigned_to: str | None = None, notes: str | None = None, db: Session = Depends(get_db)):
    return remediation_service.start_task(db, api_asset_id, assigned_to, notes)


@router.patch("/{task_id}")
def update_task(task_id: int, status: str | None = None, notes: str | None = None, db: Session = Depends(get_db)):
    task = remediation_service.update_task(db, task_id, status, notes)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
