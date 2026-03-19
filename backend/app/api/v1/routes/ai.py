from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services import ai_service

router = APIRouter()


@router.post("/explain/finding/{finding_id}")
def explain_finding(finding_id: int, db: Session = Depends(get_db)):
    result = ai_service.explain_finding(db, finding_id)
    if not result:
        raise HTTPException(status_code=404, detail="Finding not found")
    return result


@router.post("/explain/api/{api_id}")
def explain_api(api_id: int, db: Session = Depends(get_db)):
    result = ai_service.explain_api(db, api_id)
    if not result:
        raise HTTPException(status_code=404, detail="API not found")
    return result


@router.post("/scan-summary/{scan_id}")
def scan_summary(scan_id: int, db: Session = Depends(get_db)):
    result = ai_service.scan_summary(db, scan_id)
    if not result:
        raise HTTPException(status_code=404, detail="Scan not found")
    return result
