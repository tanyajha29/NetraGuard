from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services import api_service

router = APIRouter()


@router.get("")
def zombie_apis(db: Session = Depends(get_db)):
    threshold = datetime.utcnow() - timedelta(days=30)
    rows = api_service.zombie_apis(db)
    result = []
    for r in rows:
        result.append(
            {
                "id": r.id,
                "path": r.path,
                "method": r.method,
                "service_name": r.service_name,
                "last_seen_at": r.last_seen_at,
                "days_inactive": (datetime.utcnow() - (r.last_seen_at or threshold)).days,
                "risk_level": r.risk_level,
                "risk_score": r.risk_score,
                "recommendation": r.recommendation,
                "traffic_count": r.traffic_count,
                "status_reason": r.status_reason,
            }
        )
    return result
