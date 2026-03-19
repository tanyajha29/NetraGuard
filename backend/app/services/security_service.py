from typing import Dict, List
from sqlalchemy.orm import Session
from app.services.security_analysis import analyze_api
from app import models


SECURITY_BUCKETS = {
    "missing_auth": "missing_auth",
    "insecure_transport": "insecure_transport",
    "no_rate_limit_detected": "no_rate_limit_detected",
    "sensitive_data_exposed": "sensitive_data_exposed",
}


def analyze_endpoint(endpoint: Dict, base_url: str) -> Dict:
    return analyze_api(endpoint, base_url)


def summarize_findings(findings: List[Dict]) -> Dict[str, int]:
    counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for f in findings:
        sev = (f.get("severity") or "low").lower()
        if sev in counts:
            counts[sev] += 1
    return counts


def summary(db: Session) -> Dict[str, int]:
    data = {}
    for key in SECURITY_BUCKETS:
        data[key] = (
            db.query(models.APIFinding)
            .filter(models.APIFinding.finding_type == SECURITY_BUCKETS[key])
            .count()
        )
    high_critical = (
        db.query(models.APIFinding)
        .filter(models.APIFinding.severity.in_(["high", "critical"]))
        .count()
    )
    data["high_critical_findings"] = high_critical
    return data


def findings_for_api(db: Session, api_id: int):
    return (
        db.query(models.APIFinding)
        .filter(models.APIFinding.api_asset_id == api_id)
        .order_by(models.APIFinding.created_at.desc())
        .all()
    )
