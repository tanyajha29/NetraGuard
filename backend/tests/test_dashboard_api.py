import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app import models


@pytest.fixture
def client():
    return TestClient(app)


def test_dashboard_summary_empty(client):
    resp = client.get("/api/v1/dashboard/summary")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_apis" in data
