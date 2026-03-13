from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app import models

router = APIRouter()


@router.get("")
def zombie_apis(db: Session = Depends(get_db)):
    threshold = datetime.utcnow() - timedelta(days=30)
    rows = (
        db.query(models.APIAsset)
        .filter(models.APIAsset.current_status == "zombie")
        .filter(models.APIAsset.last_seen_at <= threshold)
        .all()
    )
    return rows
