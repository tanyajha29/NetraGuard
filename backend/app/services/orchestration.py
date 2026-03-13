from datetime import datetime
from typing import Dict, List, Optional, Tuple

import requests
from sqlalchemy.orm import Session

from app import models
from app.core.config import get_settings
from app.services.discovery import fetch_openapi_endpoints, load_log_traffic, crawl_endpoints
from app.services.classification import classify_endpoint
from app.services.security_analysis import analyze_api
from app.services.reporting import render_report

settings = get_settings()


def _record_status_change(db: Session, asset: models.APIAsset, new_status: str, reason: str):
    if asset.current_status != new_status:
        history = models.APIStatusHistory(
            api_asset_id=asset.id,
            previous_status=asset.current_status,
            new_status=new_status,
            reason=reason,
        )
        db.add(history)
        asset.current_status = new_status


def _auto_disable_if_demo(target: models.Target, asset: models.APIAsset):
    """
    In demo mode for the mock target, hit /internal/disable so the route returns 410.
    """
    demo_target = (
        settings.demo_mode
        and (
            (target.target_type and target.target_type.lower() in {"demo", "mock"})
            or (target.environment and target.environment.lower() == "demo")
            or "mock_target" in target.base_url
            or "8100" in target.base_url
        )
    )
    if not demo_target:
        return
    try:
        requests.post(f"{target.base_url}/internal/disable", json={"path": asset.path}, timeout=3)
    except Exception:
        # don't fail the scan because of demo hook
        return


def _merge_discoveries(target: models.Target, log_file: Optional[str]) -> Tuple[List[Dict], Dict[str, int]]:
    openapi_eps = fetch_openapi_endpoints(target.base_url)
    crawler_eps = crawl_endpoints(target.base_url)
    traffic = load_log_traffic(log_file)

    merged: Dict[Tuple[str, str], Dict] = {}

    for ep in openapi_eps + crawler_eps:
        key = (ep["path"], ep["method"])
        merged[key] = {**ep, "documented": ep.get("source_type") == "openapi"}

    for path, count in traffic.items():
        key = (path, "GET")
        if key not in merged:
            merged[key] = {
                "path": path,
                "method": "GET",
                "source_type": "traffic_log",
                "source_reference": log_file,
                "requires_auth": False,
                "version": "v1" if "v1" in path else None,
                "documented": False,
            }
        merged[key]["traffic_count"] = count

    return list(merged.values()), traffic


def run_scan(
    db: Session,
    target: models.Target,
    initiated_by: Optional[int],
    trigger_type: str,
    log_file: Optional[str] = None,
) -> models.ScanRun:
    scan = models.ScanRun(
        target_id=target.id,
        initiated_by=initiated_by,
        status=models.ScanStatus.running,
        trigger_type=trigger_type,
        started_at=datetime.utcnow(),
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)

    endpoints, traffic = _merge_discoveries(target, log_file)

    total = active = deprecated = shadow = zombie = orphaned = 0
    findings_created: List[models.APIFinding] = []
    alerts_created: List[models.Alert] = []
    assets_for_report: List[models.APIAsset] = []
    new_assets: List[int] = []

    for ep in endpoints:
        count = ep.get("traffic_count", traffic.get(ep["path"], 0))
        documented = ep.get("documented", True)

        asset = (
            db.query(models.APIAsset)
            .filter(
                models.APIAsset.target_id == target.id,
                models.APIAsset.path == ep["path"],
                models.APIAsset.method == ep["method"],
            )
            .first()
        )
        prev_status = None
        prev_traffic = 0
        has_owner = bool(ep.get("owner"))
        if not asset:
            asset = models.APIAsset(
                target_id=target.id,
                scan_run_id=scan.id,
                path=ep["path"],
                method=ep["method"],
                source_type=ep.get("source_type"),
                source_reference=ep.get("source_reference"),
                first_seen_at=datetime.utcnow(),
            )
            db.add(asset)
            db.flush()
            new_assets.append(asset.id)
        else:
            prev_status = asset.current_status
            prev_traffic = asset.traffic_count or 0
            has_owner = bool(asset.owner)

        classification = classify_endpoint(
            ep["path"],
            count,
            source_type=ep.get("source_type", "openapi"),
            documented=documented,
            has_owner=has_owner,
            version=ep.get("version"),
        )
        security = analyze_api(ep, target.base_url)

        _record_status_change(db, asset, classification["status"], reason="status_changed_during_scan")

        asset.scan_run_id = scan.id
        asset.last_seen_at = datetime.utcnow()
        asset.traffic_count = count
        asset.current_status = classification["status"]
        asset.risk_level = classification["risk_level"]
        asset.risk_score = classification["risk_score"]
        asset.recommendation = classification["recommendation"]
        asset.auth_required = security["auth_required"]
        asset.encryption_enabled = security["encryption_enabled"]
        asset.rate_limit_detected = security["rate_limit_detected"]
        asset.source_type = ep.get("source_type", asset.source_type)
        asset.source_reference = ep.get("source_reference", asset.source_reference)

        orphan_flag = not asset.owner
        if orphan_flag:
            _record_status_change(db, asset, "orphaned", reason="missing_owner")
            findings_created.append(
                models.APIFinding(
                    scan_run_id=scan.id,
                    api_asset_id=asset.id,
                    finding_type="orphaned_api",
                    severity="medium",
                    title="Orphaned API",
                    description=f"{asset.method} {asset.path} missing owner metadata",
                    recommendation="Assign an owner in the CMDB and update service catalog.",
                )
            )

        # Classification-based findings
        finding_type = None
        severity = "low"
        if classification["status"] == "zombie":
            zombie += 1
            finding_type = "zombie_api_detected"
            severity = "high"
        elif classification["status"] == "shadow":
            shadow += 1
            finding_type = "shadow_api_detected"
            severity = "high"
        elif classification["status"] == "deprecated":
            deprecated += 1
            finding_type = "deprecated_api"
            severity = "medium"
        elif classification["status"] == "orphaned":
            orphaned += 1
        elif classification["status"] == "active":
            active += 1

        if orphan_flag and classification["status"] != "orphaned":
            orphaned += 1

        if finding_type:
            findings_created.append(
                models.APIFinding(
                    scan_run_id=scan.id,
                    api_asset_id=asset.id,
                    finding_type=finding_type,
                    severity=severity,
                    title=f"API marked {classification['status']}",
                    description=f"{asset.method} {asset.path} classified as {classification['status']}",
                    recommendation=classification["recommendation"],
                )
            )
            alerts_created.append(
                models.Alert(
                    scan_run_id=scan.id,
                    api_asset_id=asset.id,
                    alert_type=finding_type,
                    severity=severity,
                    message=f"{asset.path} is {classification['status']}",
                )
            )

        # Security findings
        for f_type, sev, title, rec in security["findings"]:
            findings_created.append(
                models.APIFinding(
                    scan_run_id=scan.id,
                    api_asset_id=asset.id,
                    finding_type=f_type,
                    severity=sev,
                    title=title,
                    description=title,
                    recommendation=rec,
                )
            )
            alerts_created.append(
                models.Alert(
                    scan_run_id=scan.id,
                    api_asset_id=asset.id,
                    alert_type=f_type,
                    severity=sev,
                    message=title,
                )
            )

        # Traffic drop detection vs previous run
        if prev_traffic and count < prev_traffic * (1 - settings.traffic_drop_pct / 100):
            history = models.APIStatusHistory(
                api_asset_id=asset.id,
                previous_status=prev_status or asset.current_status,
                new_status=asset.current_status,
                reason="traffic_drop",
            )
            db.add(history)
            alerts_created.append(
                models.Alert(
                    scan_run_id=scan.id,
                    api_asset_id=asset.id,
                    alert_type="traffic_drop_detected",
                    severity="medium",
                    message=f"Traffic drop detected on {asset.path}",
                )
            )

        if asset.id in new_assets:
            history = models.APIStatusHistory(
                api_asset_id=asset.id,
                previous_status="unknown",
                new_status=asset.current_status,
                reason="new_api_detected",
            )
            db.add(history)
            alerts_created.append(
                models.Alert(
                    scan_run_id=scan.id,
                    api_asset_id=asset.id,
                    alert_type="new_api_detected",
                    severity="low",
                    message=f"New API discovered: {asset.path}",
                )
            )

        # Workflow auto-create for zombies
        if classification["status"] == "zombie":
            wf_status = models.WorkflowStatus.demo_auto_disabled if settings.demo_mode else models.WorkflowStatus.pending_review
            workflow = models.DecommissionWorkflow(
                api_asset_id=asset.id,
                scan_run_id=scan.id,
                workflow_status=wf_status,
                mode=models.WorkflowMode.demo if settings.demo_mode else models.WorkflowMode.real,
                notes="Auto-created for zombie API",
            )
            db.add(workflow)
            if settings.demo_mode:
                _auto_disable_if_demo(target, asset)

        assets_for_report.append(asset)
        total += 1

    db.add_all(findings_created)
    db.add_all(alerts_created)

    scan.total_apis = total
    scan.active_count = active
    scan.deprecated_count = deprecated
    scan.shadow_count = shadow
    scan.zombie_count = zombie
    scan.orphaned_count = orphaned
    scan.status = models.ScanStatus.completed
    scan.ended_at = datetime.utcnow()
    scan.summary_json = {
        "total": total,
        "active": active,
        "deprecated": deprecated,
        "shadow": shadow,
        "zombie": zombie,
        "orphaned": orphaned,
        "new_assets": len(new_assets),
    }

    db.commit()
    db.refresh(scan)

    report_path = render_report(scan, assets_for_report, findings_created)
    report = models.Report(
        scan_run_id=scan.id,
        target_id=target.id,
        file_path=report_path,
        summary="Scan completed",
    )
    db.add(report)
    db.commit()
    return scan
