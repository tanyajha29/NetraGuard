from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from datetime import datetime
import random

disabled_routes = set()


def ensure_enabled(path: str):
    if path in disabled_routes:
        raise HTTPException(status_code=410, detail="API route disabled in demo mode")

app = FastAPI(
    title="SecureBank API Gateway",
    description="Banking system API — Zombie API Discovery Demo Environment",
    version="2.1.0",
    contact={"name": "SecureBank Engineering", "email": "api-team@securebank.example"},
)

# ── Active APIs ──────────────────────────────────────────────────────────────

@app.get("/api/v1/users", tags=["Users"], summary="List all users")
def get_users():
    ensure_enabled("/api/v1/users")
    return {"users": [{"id": i, "name": f"User_{i}", "active": True} for i in range(1, 6)]}

@app.get("/api/v1/payments", tags=["Payments"], summary="List payment records")
def get_payments():
    ensure_enabled("/api/v1/payments")
    return {"payments": [{"id": i, "amount": round(random.uniform(10, 5000), 2), "status": "completed"} for i in range(1, 6)]}

@app.get("/api/v1/transactions", tags=["Transactions"], summary="List transactions")
def get_transactions():
    ensure_enabled("/api/v1/transactions")
    return {"transactions": [{"tx_id": f"TX{i:04d}", "timestamp": datetime.utcnow().isoformat(), "status": "settled"} for i in range(1, 6)]}

@app.get("/api/v1/accounts", tags=["Accounts"], summary="List bank accounts")
def get_accounts():
    ensure_enabled("/api/v1/accounts")
    return {"accounts": [{"account_id": f"ACC{i:04d}", "balance": round(random.uniform(100, 50000), 2)} for i in range(1, 4)]}

# ── Deprecated APIs ──────────────────────────────────────────────────────────

@app.get("/api/v1/old-login", tags=["Auth (Deprecated)"], summary="[DEPRECATED] Legacy login")
def old_login():
    ensure_enabled("/api/v1/old-login")
    return {"warning": "This endpoint is deprecated. Use /api/v2/auth/login", "status": "deprecated"}

@app.get("/api/v1/legacy-transfer", tags=["Transfers (Deprecated)"], summary="[DEPRECATED] Legacy transfer")
def legacy_transfer():
    ensure_enabled("/api/v1/legacy-transfer")
    return {"warning": "Deprecated. Use /api/v2/transfers", "status": "deprecated"}

# ── Zombie APIs ───────────────────────────────────────────────────────────────

@app.get("/api/v1/test-api", tags=["Test"], summary="Test endpoint (should be removed)")
def test_api():
    ensure_enabled("/api/v1/test-api")
    return {"message": "Test API — should not be in production"}

@app.get("/api/v1/dev-mock", tags=["Test"], summary="Developer mock (zombie)")
def dev_mock():
    ensure_enabled("/api/v1/dev-mock")
    return {"mock": True, "data": "placeholder"}

# ── Shadow / Internal APIs ────────────────────────────────────────────────────

@app.get("/internal/debug", tags=["Internal"], summary="Debug endpoint (shadow API)")
def internal_debug():
    ensure_enabled("/internal/debug")
    return {"debug": True, "server_time": datetime.utcnow().isoformat(), "env": "production-leaked"}

@app.get("/internal/health-raw", tags=["Internal"], summary="Raw health check (shadow API)")
def health_raw():
    ensure_enabled("/internal/health-raw")
    return {"status": "ok", "db_connections": 42, "memory_mb": 1024}


@app.post("/internal/disable", tags=["Internal"], summary="Disable an endpoint for demo auto-decommission")
def disable_route(payload: dict):
    path = payload.get("path")
    if not path:
        raise HTTPException(status_code=400, detail="path required")
    disabled_routes.add(path)
    return {"disabled": list(disabled_routes)}

@app.get("/", tags=["Root"])
def root():
    return {"service": "SecureBank API Gateway", "version": "2.1.0", "docs": "/docs"}
