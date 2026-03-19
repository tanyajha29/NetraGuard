from datetime import datetime
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
        status_value = scan.status.value if hasattr(scan.status, "value") else str(scan.status)
        return {"message": "Scan completed", "scan_id": scan.id, "status": status_value}

    # create a pending scan record so the frontend immediately gets an id
    scan = models.ScanRun(
        target_id=target.id,
        initiated_by=current_user.id if current_user else None,
        status=models.ScanStatus.pending,
        progress_stage="queued",
        trigger_type=body.trigger_type,
        started_at=datetime.utcnow(),
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)

    task = run_scan_task.delay(
        target_id=target.id,
        initiated_by=current_user.id if current_user else None,
        trigger_type=body.trigger_type,
        log_file=body.log_file,
        scan_id=scan.id,
    )
    status_value = scan.status.value if hasattr(scan.status, "value") else str(scan.status)
    return {"message": "Scan dispatched", "task_id": task.id, "scan_id": scan.id, "status": status_value}


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
    findings_count = db.query(models.APIFinding).filter(models.APIFinding.scan_run_id == scan_id).count()
    alerts_count = db.query(models.Alert).filter(models.Alert.scan_run_id == scan_id).count()
    return {
        "scan_id": scan.id,
        "status": scan.status.value if hasattr(scan.status, "value") else str(scan.status),
        "progress_stage": getattr(scan, "progress_stage", None),
        "started_at": scan.started_at,
        "completed_at": scan.ended_at,
        "total_apis": scan.total_apis,
        "active_count": scan.active_count,
        "deprecated_count": scan.deprecated_count,
        "shadow_count": scan.shadow_count,
        "zombie_count": scan.zombie_count,
        "orphaned_count": scan.orphaned_count,
        "findings": findings_count,
        "alerts": alerts_count,
        "summary": scan.summary_json,
    }
