import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.api.v1.routes import api_router
from sqlalchemy.orm import Session

from app.db.session import engine, SessionLocal
from app.db.base import Base
from app import models
from app.core.security import get_password_hash
from datetime import datetime

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.project_name, version="1.0.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def on_startup():
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables ensured.")
        seed_demo_data()

    app.include_router(api_router, prefix=settings.api_v1_str)
    return app


app = create_app()


def seed_demo_data():
    """
    Populate a small, idempotent demo dataset so the dashboard has live data
    and a known login (tester@example.com / Password123).
    """
    db: Session = SessionLocal()
    try:
        # User
        user = db.query(models.User).filter(models.User.email == "tester@example.com").first()
        if not user:
            user = models.User(
                full_name="Demo Tester",
                email="tester@example.com",
                password_hash=get_password_hash("Password123"),
                role=models.UserRole.admin,
                is_active=True,
            )
            db.add(user)
            db.flush()

        # Target
        target = db.query(models.Target).filter(models.Target.name == "Mock Target").first()
        if not target:
            target = models.Target(
                name="Mock Target",
                base_url="http://mock_target:8100",
                environment="dev",
                owner="demo",
                description="Mock API for demo scans",
                target_type="demo",
                created_by=user.id,
                is_active=True,
            )
            db.add(target)
            db.flush()

        # Latest scan
        scan = (
            db.query(models.ScanRun)
            .filter(models.ScanRun.target_id == target.id)
            .order_by(models.ScanRun.started_at.desc())
            .first()
        )
        if not scan:
            scan = models.ScanRun(
                target_id=target.id,
                initiated_by=user.id,
                status=models.ScanStatus.completed,
                trigger_type="demo_seed",
                started_at=datetime.utcnow(),
                ended_at=datetime.utcnow(),
                summary_json={},
            )
            db.add(scan)
            db.flush()

        # API assets
        existing_assets = db.query(models.APIAsset).filter(models.APIAsset.target_id == target.id).all()
        if not existing_assets:
            sample_assets = [
                ("GET", "/api/v1/users", "active", "medium", 3200),
                ("POST", "/api/v1/auth/login", "active", "low", 2100),
                ("GET", "/api/v1/old-login", "zombie", "high", 12),
                ("GET", "/api/v1/dev-mock", "shadow", "high", 34),
                ("DELETE", "/api/v1/admin/legacy", "deprecated", "medium", 5),
            ]
            assets = []
            for method, path, status, risk, traffic in sample_assets:
                asset = models.APIAsset(
                    target_id=target.id,
                    scan_run_id=scan.id,
                    path=path,
                    method=method,
                    current_status=status,
                    risk_level=risk,
                    risk_score=75 if risk == "high" else 50,
                    traffic_count=traffic,
                    source_type="openapi",
                    source_reference="mock",
                    last_seen_at=datetime.utcnow(),
                    last_scanned_at=datetime.utcnow(),
                )
                db.add(asset)
                db.flush()
                assets.append(asset)

                # traffic samples
                for i in range(3):
                    db.add(
                        models.TrafficSample(
                            api_asset_id=asset.id,
                            count=max(1, traffic // 10 - i * 5),
                            method=method,
                            path=path,
                        )
                    )

                # findings / alerts
                finding = models.APIFinding(
                    scan_run_id=scan.id,
                    api_asset_id=asset.id,
                    finding_type=f"{status}_api_detected",
                    severity="high" if status in {"zombie", "shadow"} else "medium",
                    title=f"{status.title()} API detected",
                    description=f"{method} {path} flagged as {status}",
                    recommendation="Review and deprecate if unused." if status != "active" else "Monitor regularly.",
                )
                db.add(finding)
                db.add(
                    models.Alert(
                        scan_run_id=scan.id,
                        api_asset_id=asset.id,
                        alert_type=finding.finding_type,
                        severity=finding.severity,
                        message=finding.title,
                    )
                )

            # dependency edges
            if len(assets) >= 2:
                db.add(models.DependencyEdge(source_api_id=assets[0].id, target_api_id=assets[1].id))
                db.add(models.DependencyEdge(source_api_id=assets[1].id, target_api_id=assets[2].id))

        # Reports
        if not db.query(models.Report).filter(models.Report.scan_run_id == scan.id).first():
            report = models.Report(
                scan_run_id=scan.id,
                target_id=target.id,
                format="html",
                file_path="reports/demo.html",
                summary="Demo report",
            )
            db.add(report)

        db.commit()
    except Exception as exc:
        db.rollback()
        logger.warning(f"Demo seed failed: {exc}")
    finally:
        db.close()
