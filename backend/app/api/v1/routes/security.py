from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app import models
from app.services import security_service

router = APIRouter()


@router.get("/summary")
def summary(db: Session = Depends(get_db)):
    return security_service.summary(db)


@router.get("/{api_id}")
def api_findings(api_id: int, db: Session = Depends(get_db)):
    asset = db.query(models.APIAsset).filter(models.APIAsset.id == api_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="API not found")
    findings = security_service.findings_for_api(db, api_id)
    return {
        "asset": {
            "id": asset.id,
            "path": asset.path,
            "method": asset.method,
            "risk_level": asset.risk_level,
            "risk_score": asset.risk_score,
            "current_status": asset.current_status,
        },
        "findings": [
            {
                "id": f.id,
                "finding_type": f.finding_type,
                "severity": f.severity,
                "title": f.title,
                "description": f.description,
                "recommendation": f.recommendation,
                "created_at": f.created_at,
            }
            for f in findings
        ],
    }
