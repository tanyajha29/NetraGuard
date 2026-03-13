import os
import tempfile
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

os.environ["DATABASE_URL_OVERRIDE"] = "sqlite:///:memory:"

from app.db.base import Base
from app import models
from app.services.classification import classify_endpoint
from app.services.security_analysis import analyze_api
from app.services.orchestration import run_scan
from app.services.reporting import render_report


@pytest.fixture(scope="function")
def db_session():
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()


def test_classify_endpoint():
    result = classify_endpoint("/api/v1/old-login", 0, source_type="traffic_log", documented=False, has_owner=False, version="v1")
    assert result["status"] == "zombie"
    assert result["risk_level"] in {"High", "Critical"}


def test_security_analysis_flags():
    res = analyze_api({"path": "/internal/debug", "requires_auth": False, "rate_limit_detected": False}, "http://example.com")
    types = [f[0] for f in res["findings"]]
    assert "missing_auth" in types
    assert "insecure_transport" in types
    assert res["risky_path"] is True


def test_run_scan_creates_records(db_session, monkeypatch):
    user = models.User(full_name="Test User", email="u@example.com", password_hash="x", role=models.UserRole.admin)
    target = models.Target(name="Mock", base_url="http://mock", created_by=1)
    db_session.add_all([user, target])
    db_session.commit()

    def fake_openapi(url):
        return [{"path": "/api/v1/users", "method": "GET", "source_type": "openapi", "source_reference": url}]

    def fake_logs(log_file):
        return {"/api/v1/users": 0}

    monkeypatch.setattr("app.services.orchestration.fetch_openapi_endpoints", fake_openapi)
    monkeypatch.setattr("app.services.orchestration.load_log_traffic", fake_logs)
    monkeypatch.setattr("app.services.orchestration.crawl_endpoints", lambda *_args, **_kwargs: [])

    scan = run_scan(db_session, target, initiated_by=user.id, trigger_type="test", log_file=None)
    assert scan.total_apis == 1
    assets = db_session.query(models.APIAsset).all()
    assert assets[0].current_status == "zombie"


def test_render_report(tmp_path, db_session):
    scan = models.ScanRun(
        target_id=1,
        initiated_by=None,
        status=models.ScanStatus.completed,
        trigger_type="test",
        started_at=None,
        ended_at=None,
        total_apis=0,
        active_count=0,
        deprecated_count=0,
        orphaned_count=0,
        shadow_count=0,
        zombie_count=0,
    )
    db_session.add(scan)
    db_session.commit()
    path = render_report(scan, [], [])
    assert os.path.exists(path)
