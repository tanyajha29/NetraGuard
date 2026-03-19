import sys
from datetime import datetime
from pathlib import Path

# Make backend package importable when launched from Streamlit/CLI
ROOT_DIR = Path(__file__).resolve().parents[1]
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from database.db import SessionLocal, init_db  # type: ignore
from app import models  # type: ignore
from app.services.orchestration import run_scan as orchestrate_scan  # type: ignore


def _get_default_user(db):
    return db.query(models.User).order_by(models.User.id.asc()).first()


def _ensure_target(db, target_url: str):
    target = db.query(models.Target).filter(models.Target.base_url == target_url).first()
    if target:
        return target
    name = target_url.replace("http://", "").replace("https://", "").split("/")[0]
    target = models.Target(
        name=name or "Ad-hoc Target",
        base_url=target_url,
        environment="adhoc",
        owner="streamlit",
        description="Created by Streamlit scan",
        target_type="demo",
        is_active=True,
    )
    db.add(target)
    db.commit()
    db.refresh(target)
    return target


def _format_endpoint(asset: models.APIAsset):
    return {
        "endpoint": asset.path,
        "method": asset.method,
        "traffic_count": asset.traffic_count or 0,
        "status": asset.current_status,
        "risk_level": asset.risk_level,
        "risk_score": asset.risk_score,
        "last_seen": asset.last_seen_at.isoformat() if asset.last_seen_at else "",
        "recommendation": asset.recommendation,
    }


def run_scan(target_url: str, log_file: str | None = None) -> dict:
    """
    Bridge the legacy Streamlit runner to the production FastAPI/Postgres pipeline.
    """
    init_db()
    db = SessionLocal()
    scan_id = None
    try:
        target = _ensure_target(db, target_url)
        user = _get_default_user(db)
        scan = orchestrate_scan(
            db=db,
            target=target,
            initiated_by=user.id if user else None,
            trigger_type="streamlit",
            log_file=log_file,
        )
        scan_id = scan.id

        assets = (
            db.query(models.APIAsset)
            .filter(models.APIAsset.scan_run_id == scan.id)
            .order_by(models.APIAsset.traffic_count.desc())
            .all()
        )
        summary = scan.summary_json or {}
        statuses = [a.current_status or "unknown" for a in assets]
        now = datetime.utcnow()
        return {
            "scan_id": scan.id,
            "timestamp": (scan.started_at or now).isoformat(),
            "target_url": target_url,
            "log_file": log_file,
            "total_apis": summary.get("total", len(assets)),
            "active_count": summary.get("active", statuses.count("active")),
            "zombie_count": summary.get("zombie", statuses.count("zombie")),
            "shadow_count": summary.get("shadow", statuses.count("shadow")),
            "deprecated_count": summary.get("deprecated", statuses.count("deprecated")),
            "orphaned_count": summary.get("orphaned", statuses.count("orphaned")),
            "new_apis_detected": summary.get("new_assets", 0),
            "endpoints": [_format_endpoint(a) for a in assets],
        }
    except Exception as exc:
        db.rollback()
        return {"error": str(exc), "scan_id": scan_id}
    finally:
        db.close()


def get_all_endpoints():
    init_db()
    db = SessionLocal()
    try:
        rows = (
            db.query(models.APIAsset)
            .order_by(models.APIAsset.last_seen_at.desc())
            .all()
        )
        return [_format_endpoint(r) for r in rows]
    finally:
        db.close()


def get_scan_history():
    init_db()
    db = SessionLocal()
    try:
        rows = (
            db.query(models.ScanRun)
            .order_by(models.ScanRun.started_at.desc())
            .limit(10)
            .all()
        )
        return [
            {
                "scan_id": r.id,
                "timestamp": r.started_at.isoformat() if r.started_at else "",
                "log_file": "",
                "total_apis": r.total_apis,
                "zombie_count": r.zombie_count,
                "active_count": r.active_count,
                "shadow_count": r.shadow_count,
                "deprecated_count": r.deprecated_count,
                "new_apis_detected": (r.summary_json or {}).get("new_assets", 0),
            }
            for r in rows
        ]
    finally:
        db.close()
