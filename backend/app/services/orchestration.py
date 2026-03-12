from datetime import datetime
from sqlalchemy.orm import Session
from typing import Optional

from app import models
from app.services.discovery import fetch_openapi_endpoints, load_log_traffic
from app.services.classification import classify_endpoint
from app.services.security_analysis import analyze_api
from app.services.reporting import render_report


def _record_status_change(db: Session, asset: models.APIAsset, new_status: str):
    if asset.current_status != new_status:
        history = models.APIStatusHistory(
            api_asset_id=asset.id,
            previous_status=asset.current_status,
            new_status=new_status,
            reason="status_changed_during_scan",
        )
        db.add(history)
        asset.current_status = new_status


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

    endpoints = fetch_openapi_endpoints(target.base_url)
    traffic = load_log_traffic(log_file)

    total = active = deprecated = shadow = zombie = orphaned = 0
    findings_created = []
    alerts_created = []
    assets_for_report = []

    for ep in endpoints:
        count = traffic.get(ep["path"], 0)
        classification = classify_endpoint(ep["path"], count)
        security = analyze_api(
            ep["path"],
            target.base_url,
            has_auth=True,
            rate_limit=True,
        )

        asset = (
            db.query(models.APIAsset)
            .filter(
                models.APIAsset.target_id == target.id,
                models.APIAsset.path == ep["path"],
                models.APIAsset.method == ep["method"],
            )
            .first()
        )
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

        _record_status_change(db, asset, classification["status"])
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

        if not asset.owner:
            orphaned += 1
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
        else:
            active += 1
            finding_type = None
            severity = "low"

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

        # Workflow auto-create for zombies
        if classification["status"] == "zombie":
            workflow = models.DecommissionWorkflow(
                api_asset_id=asset.id,
                scan_run_id=scan.id,
                workflow_status=models.WorkflowStatus.demo_auto_disabled,
                mode=models.WorkflowMode.demo,
                notes="Auto-created for zombie API",
            )
            db.add(workflow)

        assets_for_report.append(asset)
        total += 1

    # Persist changes
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
    }

    db.commit()
    db.refresh(scan)

    # Generate report
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
