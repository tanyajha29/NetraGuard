from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app import models

router = APIRouter()


@router.get("/summary")
def summary(db: Session = Depends(get_db)):
    total = db.query(models.APIAsset).count()
    active = db.query(models.APIAsset).filter(models.APIAsset.current_status == "active").count()
    zombie = db.query(models.APIAsset).filter(models.APIAsset.current_status == "zombie").count()
    shadow = db.query(models.APIAsset).filter(models.APIAsset.current_status == "shadow").count()
    critical_findings = db.query(models.APIFinding).filter(models.APIFinding.severity.ilike("high%")).count()
    return {
        "total_apis": total,
        "active_apis": active,
        "zombie_apis": zombie,
        "shadow_apis": shadow,
        "critical_findings": critical_findings,
    }


@router.get("/traffic")
def traffic(db: Session = Depends(get_db)):
    rows = (
        db.query(models.APIAsset.path, models.APIAsset.traffic_count)
        .order_by(models.APIAsset.traffic_count.desc())
        .limit(20)
        .all()
    )
    return [{"path": r[0], "count": r[1]} for r in rows]


@router.get("/risk")
def risk(db: Session = Depends(get_db)):
    levels = ["Critical", "High", "Medium", "Low", "unknown"]
    data = {}
    for lvl in levels:
        data[lvl] = db.query(models.APIAsset).filter(models.APIAsset.risk_level.ilike(lvl)).count()
    return data
