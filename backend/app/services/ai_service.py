from sqlalchemy.orm import Session
from app import models


def explain_finding(db: Session, finding_id: int) -> dict | None:
    f = db.query(models.APIFinding).filter(models.APIFinding.id == finding_id).first()
    if not f:
        return None
    api = db.query(models.APIAsset).filter(models.APIAsset.id == f.api_asset_id).first()
    summary = []
    summary.append(f"The finding '{f.title}' on {api.method if api else ''} {api.path if api else 'API'} is classified as {f.severity}.")
    if f.finding_type == "missing_auth":
        summary.append("Authentication is not enforced; require JWT/API keys and validate at gateway.")
    if f.finding_type == "insecure_transport":
        summary.append("HTTPS is not enforced; terminate TLS and redirect HTTP to HTTPS.")
    if f.finding_type == "sensitive_data_exposed":
        summary.append("Sensitive indicators present; mask PII and scrub logs.")
    return {
        "finding_id": finding_id,
        "api_asset_id": f.api_asset_id,
        "severity": f.severity,
        "explanation": " ".join(summary),
        "recommendation": f.recommendation,
    }


def explain_api(db: Session, api_id: int) -> dict | None:
    api = db.query(models.APIAsset).filter(models.APIAsset.id == api_id).first()
    if not api:
        return None
    findings = db.query(models.APIFinding).filter(models.APIFinding.api_asset_id == api_id).all()
    alerts = db.query(models.Alert).filter(models.Alert.api_asset_id == api_id).all()
    text = []
    text.append(f"{api.method} {api.path} is {api.current_status} with risk {api.risk_level} (score {api.risk_score}).")
    if api.current_status in {"zombie", "shadow", "deprecated"}:
        text.append(f"Status indicates lifecycle risk; reason: {api.recommendation or 'review required'}.")
    if api.traffic_count is not None:
        text.append(f"Observed traffic count: {api.traffic_count}.")
    if findings:
        top = sorted(findings, key=lambda f: f.severity, reverse=True)[0]
        text.append(f"Most significant finding: {top.title} ({top.severity}).")
    if alerts:
        text.append(f"{len(alerts)} alerts are linked to this API.")
    return {
        "api_asset_id": api_id,
        "explanation": " ".join(text),
    }


def scan_summary(db: Session, scan_id: int) -> dict | None:
    scan = db.query(models.ScanRun).filter(models.ScanRun.id == scan_id).first()
    if not scan:
        return None
    parts = [
        f"Scan #{scan.id} on target {scan.target_id} completed with {scan.total_apis} APIs.",
        f"Active: {scan.active_count}, Zombie: {scan.zombie_count}, Shadow: {scan.shadow_count}, Deprecated: {scan.deprecated_count}, Orphaned: {scan.orphaned_count}.",
    ]
    findings = db.query(models.APIFinding).filter(models.APIFinding.scan_run_id == scan_id).count()
    alerts = db.query(models.Alert).filter(models.Alert.scan_run_id == scan_id).count()
    parts.append(f"Findings: {findings}, Alerts: {alerts}. Duration: {scan.duration_seconds}s.")
    return {
        "scan_id": scan_id,
        "summary": " ".join(parts),
    }
