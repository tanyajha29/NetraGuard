from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services import api_service

router = APIRouter()


@router.get("")
def list_apis(
    db: Session = Depends(get_db),
    status: str | None = None,
    risk: str | None = None,
    search: str | None = None,
    service_name: str | None = None,
    source: str | None = None,
):
    assets = api_service.list_apis(db, status=status, risk=risk, search=search, service_name=service_name, source=source)
    return [
        {
            "id": a.id,
            "path": a.path,
            "method": a.method,
            "service_name": a.service_name,
            "current_status": a.current_status,
            "risk_level": a.risk_level,
            "risk_score": a.risk_score,
            "traffic_count": a.traffic_count,
            "last_seen_at": a.last_seen_at,
            "last_scanned_at": a.last_scanned_at,
            "source": a.source,
            "owner": a.owner,
        }
        for a in assets
    ]


@router.get("/{api_id}")
def get_api(api_id: int, db: Session = Depends(get_db)):
    detail = api_service.api_detail(db, api_id)
    if not detail:
        raise HTTPException(status_code=404, detail="API asset not found")
    asset = detail["asset"]
    return {
        "asset": {
            "id": asset.id,
            "path": asset.path,
            "method": asset.method,
            "service_name": asset.service_name,
            "source": asset.source,
            "source_type": asset.source_type,
            "current_status": asset.current_status,
            "risk_level": asset.risk_level,
            "risk_score": asset.risk_score,
            "traffic_count": asset.traffic_count,
            "owner": asset.owner,
            "last_seen_at": asset.last_seen_at,
            "last_scanned_at": asset.last_scanned_at,
            "recommendation": asset.recommendation,
        },
        "traffic": [
            {"timestamp": t.timestamp, "count": t.count, "method": t.method, "path": t.path}
            for t in detail["traffic"]
        ],
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
            for f in detail["findings"]
        ],
        "alerts": [
            {
                "id": a.id,
                "alert_type": a.alert_type,
                "severity": a.severity,
                "message": a.message,
                "status": a.status,
                "created_at": a.created_at,
            }
            for a in detail["alerts"]
        ],
        "remediation_tasks": [
            {
                "id": t.id,
                "status": t.status,
                "assigned_to": t.assigned_to,
                "due_date": t.due_date,
                "notes": t.notes,
                "reason": t.reason,
                "created_at": t.created_at,
            }
            for t in detail["remediation_tasks"]
        ],
        "dependencies": {
            "outbound": [{"source": d.source_api_id, "target": d.target_api_id} for d in detail["dependencies"]["outbound"]],
            "inbound": [{"source": d.source_api_id, "target": d.target_api_id} for d in detail["dependencies"]["inbound"]],
        },
        "status_history": [
            {
                "previous_status": h.previous_status,
                "new_status": h.new_status,
                "reason": h.reason,
                "changed_at": h.changed_at,
            }
            for h in detail["status_history"]
        ],
    }


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
