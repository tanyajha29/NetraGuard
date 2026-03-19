from datetime import datetime, timedelta
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models


def summary(db: Session) -> dict:
    total_apis = db.query(models.APIAsset).count()
    active = db.query(models.APIAsset).filter(models.APIAsset.current_status == "active").count()
    deprecated = db.query(models.APIAsset).filter(models.APIAsset.current_status == "deprecated").count()
    shadow = db.query(models.APIAsset).filter(models.APIAsset.current_status == "shadow").count()
    zombie = db.query(models.APIAsset).filter(models.APIAsset.current_status == "zombie").count()
    orphaned = db.query(models.APIAsset).filter(models.APIAsset.current_status == "orphaned").count()
    high_risk = (
        db.query(models.APIAsset)
        .filter(func.lower(models.APIAsset.risk_level).in_(["high", "critical"]))
        .count()
    )
    critical_findings = (
        db.query(models.APIFinding)
        .filter(func.lower(models.APIFinding.severity).in_(["critical", "high"]))
        .count()
    )
    total_alerts = db.query(models.Alert).count()
    open_alerts = db.query(models.Alert).filter(models.Alert.status == models.AlertStatus.open).count()
    open_tasks = (
        db.query(models.RemediationTask)
        .filter(models.RemediationTask.status != "completed")
        .count()
    )
    return {
        "total_apis": total_apis,
        "active_apis": active,
        "deprecated_apis": deprecated,
        "shadow_apis": shadow,
        "zombie_apis": zombie,
        "orphaned_apis": orphaned,
        "high_risk_apis": high_risk,
        "critical_findings": critical_findings,
        "total_alerts": total_alerts,
        "open_alerts": open_alerts,
        "open_remediation_tasks": open_tasks,
    }


def traffic(db: Session, days: int = 30) -> list[dict]:
    since = datetime.utcnow() - timedelta(days=days)
    samples = (
        db.query(
            models.TrafficSample.api_asset_id,
            models.TrafficSample.path,
            models.TrafficSample.method,
            models.TrafficSample.timestamp,
            models.TrafficSample.count,
        )
        .filter(models.TrafficSample.timestamp >= since)
        .order_by(models.TrafficSample.timestamp.desc())
        .limit(500)
        .all()
    )
    by_path: dict[str, int] = {}
    latest_ts: dict[str, datetime] = {}
    method_by_path: dict[str, str | None] = {}
    for api_asset_id, path, method, ts, cnt in samples:
        key = path or ""
        by_path[key] = by_path.get(key, 0) + (cnt or 0)
        latest_ts[key] = ts if key not in latest_ts else max(latest_ts[key], ts)
        if key not in method_by_path:
            method_by_path[key] = method

    # Return both aggregate and last timestamp for charting
    return [
        {"path": path, "count": count, "last_seen": latest_ts.get(path), "method": method_by_path.get(path)}
        for path, count in sorted(by_path.items(), key=lambda x: x[1], reverse=True)
    ]


def risk_breakdown(db: Session) -> dict:
    levels = ["Critical", "High", "Medium", "Low", "unknown"]
    data = {}
    for lvl in levels:
        data[lvl] = db.query(models.APIAsset).filter(models.APIAsset.risk_level.ilike(lvl)).count()
    return data
