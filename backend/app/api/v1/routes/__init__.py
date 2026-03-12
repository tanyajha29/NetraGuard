from fastapi import APIRouter

from app.api.v1.routes import (
    auth,
    targets,
    scans,
    inventory,
    findings,
    alerts,
    reports,
    workflows,
    health,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(targets.router, prefix="/targets", tags=["targets"])
api_router.include_router(scans.router, prefix="/scans", tags=["scans"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(findings.router, prefix="/findings", tags=["findings"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(workflows.router, prefix="/workflows", tags=["workflows"])
api_router.include_router(health.router, tags=["health"])
