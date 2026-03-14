from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models
from app.core.security import get_current_user
from app.db.session import get_db
from app.schemas import scan as scan_schema
from app.workers.tasks import run_scan_task
from app.services.orchestration import run_scan
from app.core.config import get_settings

settings = get_settings()

router = APIRouter()


@router.post("/start")
def start_scan(
    body: scan_schema.ScanStartRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    target = db.query(models.Target).filter(models.Target.id == body.target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")

    # In demo/dev mode, run synchronously to avoid Celery dependency for UI demo.
    if settings.demo_mode or settings.app_env == "dev":
        scan = run_scan(
            db=db,
            target=target,
            initiated_by=current_user.id if current_user else None,
            trigger_type=body.trigger_type,
            log_file=body.log_file,
        )
        return {"message": "Scan completed", "scan_id": scan.id, "status": scan.status}

    task = run_scan_task.delay(
        target_id=target.id,
        initiated_by=current_user.id if current_user else None,
        trigger_type=body.trigger_type,
        log_file=body.log_file,
    )
    return {"message": "Scan dispatched", "task_id": task.id}


@router.get("", response_model=list[scan_schema.ScanRunOut])
def list_scans(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.ScanRun).order_by(models.ScanRun.created_at.desc()).all()


@router.get("/{scan_id}", response_model=scan_schema.ScanRunOut)
def get_scan(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    scan = db.query(models.ScanRun).filter(models.ScanRun.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan


@router.get("/{scan_id}/status")
def scan_status(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    scan = db.query(models.ScanRun).filter(models.ScanRun.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return {"status": scan.status, "summary": scan.summary_json}
