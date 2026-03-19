from app.workers.celery_app import celery_app
from app.db.session import SessionLocal
from app import models
from app.services.orchestration import run_scan
from app.services.monitoring import rescan_active_targets


@celery_app.task(name="app.workers.tasks.run_scan_task")
def run_scan_task(
    target_id: int,
    initiated_by: int | None,
    trigger_type: str,
    log_file: str | None,
    scan_id: int | None = None,
):
    db = SessionLocal()
    try:
        target = db.query(models.Target).filter(models.Target.id == target_id).first()
        if not target:
            return {"error": "Target not found"}
        existing_scan = None
        if scan_id:
            existing_scan = db.query(models.ScanRun).filter(models.ScanRun.id == scan_id).first()
        scan = run_scan(
            db,
            target,
            initiated_by=initiated_by,
            trigger_type=trigger_type,
            log_file=log_file,
            scan=existing_scan,
        )
        return {"scan_id": scan.id, "status": scan.status.value if hasattr(scan.status, 'value') else str(scan.status)}
    finally:
        db.close()


@celery_app.task(name="app.workers.tasks.scheduled_rescan")
def scheduled_rescan():
    db = SessionLocal()
    try:
        rescan_active_targets(db)
    finally:
        db.close()
