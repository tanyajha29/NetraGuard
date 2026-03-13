from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app import models

router = APIRouter()


@router.get("")
def list_apis(db: Session = Depends(get_db), status: str | None = None, risk: str | None = None):
    q = db.query(models.APIAsset)
    if status:
        q = q.filter(models.APIAsset.current_status == status)
    if risk:
        q = q.filter(models.APIAsset.risk_level.ilike(f\"%{risk}%\"))
    return q.order_by(models.APIAsset.last_seen_at.desc()).all()


@router.get("/{api_id}")
def get_api(api_id: int, db: Session = Depends(get_db)):
    asset = db.query(models.APIAsset).filter(models.APIAsset.id == api_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="API asset not found")
    return asset


@router.get("/{api_id}/traffic")
def api_traffic(api_id: int, db: Session = Depends(get_db)):
    samples = (
        db.query(models.TrafficSample)
        .filter(models.TrafficSample.api_asset_id == api_id)
        .order_by(models.TrafficSample.timestamp.desc())
        .limit(50)
        .all()
    )
    return [{"timestamp": s.timestamp, "count": s.count, "path": s.path, "method": s.method} for s in samples]


@router.get("/{api_id}/security")
def api_security(api_id: int, db: Session = Depends(get_db)):
    findings = (
        db.query(models.APIFinding)
        .filter(models.APIFinding.api_asset_id == api_id)
        .order_by(models.APIFinding.created_at.desc())
        .all()
    )
    return findings
