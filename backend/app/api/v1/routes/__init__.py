from fastapi import APIRouter

from app.api.v1.routes import (
    auth,
    targets,
    scans,
    inventory,
    apis,
    findings,
    alerts,
    reports,
    workflows,
    dashboard,
    zombie,
    security,
    graph,
    remediation,
    health,
    ai,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(targets.router, prefix="/targets", tags=["targets"])
api_router.include_router(scans.router, prefix="/scans", tags=["scans"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(apis.router, prefix="/apis", tags=["apis"])
api_router.include_router(findings.router, prefix="/findings", tags=["findings"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(workflows.router, prefix="/workflows", tags=["workflows"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(zombie.router, prefix="/zombie", tags=["zombie"])
api_router.include_router(security.router, prefix="/security", tags=["security"])
api_router.include_router(graph.router, prefix="/graph", tags=["graph"])
api_router.include_router(remediation.router, prefix="/remediation", tags=["remediation"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(health.router, tags=["health"])
