from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app import models

router = APIRouter()


@router.get("/summary")
def summary(db: Session = Depends(get_db)):
    total = db.query(models.APIFinding).count()
    critical = db.query(models.APIFinding).filter(models.APIFinding.severity.ilike("critical") | models.APIFinding.severity.ilike("high")).count()
    medium = db.query(models.APIFinding).filter(models.APIFinding.severity.ilike("medium")).count()
    low = db.query(models.APIFinding).filter(models.APIFinding.severity.ilike("low")).count()
    return {"total": total, "critical": critical, "medium": medium, "low": low}


@router.get("/{api_id}")
def api_findings(api_id: int, db: Session = Depends(get_db)):
    asset = db.query(models.APIAsset).filter(models.APIAsset.id == api_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="API not found")
    findings = (
        db.query(models.APIFinding)
        .filter(models.APIFinding.api_asset_id == api_id)
        .order_by(models.APIFinding.created_at.desc())
        .all()
    )
    return {"asset": asset, "findings": findings}
