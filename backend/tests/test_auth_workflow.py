import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

os.environ["DATABASE_URL_OVERRIDE"] = "sqlite:///:memory:"

from app.db.base import Base
from app import models
from app.core.security import get_password_hash, verify_password


@pytest.fixture()
def db_session():
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()


def test_password_hash_roundtrip():
    hashed = get_password_hash("secret123")
    assert verify_password("secret123", hashed) is True


def test_workflow_creation(db_session):
    asset = models.APIAsset(target_id=1, path="/api/v1/users", method="GET")
    scan = models.ScanRun(target_id=1, initiated_by=None)
    db_session.add_all([asset, scan])
    db_session.commit()
    wf = models.DecommissionWorkflow(
        api_asset_id=asset.id,
        scan_run_id=scan.id,
        workflow_status=models.WorkflowStatus.pending_review,
        mode=models.WorkflowMode.demo,
    )
    db_session.add(wf)
    db_session.commit()
    assert wf.id is not None
    assert wf.workflow_status == models.WorkflowStatus.pending_review
