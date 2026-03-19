from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from app import models


def list_apis(
    db: Session,
    status: str | None = None,
    risk: str | None = None,
    search: str | None = None,
    service_name: str | None = None,
    source: str | None = None,
):
    query = db.query(models.APIAsset)
    if status:
        query = query.filter(models.APIAsset.current_status == status)
    if risk:
        query = query.filter(models.APIAsset.risk_level.ilike(f"%{risk}%"))
    if search:
        like = f"%{search}%"
        query = query.filter(or_(models.APIAsset.path.ilike(like), models.APIAsset.service_name.ilike(like)))
    if service_name:
        query = query.filter(models.APIAsset.service_name.ilike(f"%{service_name}%"))
    if source:
        query = query.filter(models.APIAsset.source.ilike(f"%{source}%"))
    return query.order_by(models.APIAsset.last_seen_at.desc()).all()


def api_detail(db: Session, api_id: int) -> dict | None:
    asset = (
        db.query(models.APIAsset)
        .options(
            joinedload(models.APIAsset.findings),
            joinedload(models.APIAsset.alerts),
            joinedload(models.APIAsset.traffic_samples),
        )
        .filter(models.APIAsset.id == api_id)
        .first()
    )
    if not asset:
        return None

    traffic = (
        db.query(models.TrafficSample)
        .filter(models.TrafficSample.api_asset_id == api_id)
        .order_by(models.TrafficSample.timestamp.desc())
        .limit(100)
        .all()
    )
    dependencies_out = (
        db.query(models.DependencyEdge).filter(models.DependencyEdge.source_api_id == api_id).all()
    )
    dependencies_in = (
        db.query(models.DependencyEdge).filter(models.DependencyEdge.target_api_id == api_id).all()
    )
    status_history = (
        db.query(models.APIStatusHistory)
        .filter(models.APIStatusHistory.api_asset_id == api_id)
        .order_by(models.APIStatusHistory.changed_at.desc())
        .all()
    )
    remediation_tasks = (
        db.query(models.RemediationTask)
        .filter(models.RemediationTask.api_asset_id == api_id)
        .order_by(models.RemediationTask.created_at.desc())
        .all()
    )

    return {
        "asset": asset,
        "traffic": traffic,
        "findings": asset.findings,
        "alerts": asset.alerts,
        "remediation_tasks": remediation_tasks,
        "dependencies": {
            "outbound": dependencies_out,
            "inbound": dependencies_in,
        },
        "status_history": status_history,
    }


def zombie_apis(db: Session):
    return (
        db.query(models.APIAsset)
        .filter(models.APIAsset.current_status.in_(["zombie", "shadow", "deprecated"]))
        .order_by(models.APIAsset.last_seen_at.asc())
        .all()
    )
