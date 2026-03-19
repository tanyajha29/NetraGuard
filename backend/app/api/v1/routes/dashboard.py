from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services import dashboard_service
from app.schemas import dashboard as dashboard_schema

router = APIRouter()


@router.get("/summary", response_model=dashboard_schema.DashboardSummary)
def summary(db: Session = Depends(get_db)):
    return dashboard_service.summary(db)


@router.get("/traffic", response_model=list[dashboard_schema.TrafficPoint])
def traffic(db: Session = Depends(get_db)):
    return dashboard_service.traffic(db)


@router.get("/risk")
def risk(db: Session = Depends(get_db)):
    return dashboard_service.risk_breakdown(db)
