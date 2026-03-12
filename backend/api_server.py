from fastapi import FastAPI
from fastapi.responses import JSONResponse
from datetime import datetime
import random

app = FastAPI(
    title="SecureBank API Gateway",
    description="Banking system API — Zombie API Discovery Demo Environment",
    version="2.1.0",
    contact={"name": "SecureBank Engineering", "email": "api-team@securebank.example"},
)

# ── Active APIs ──────────────────────────────────────────────────────────────

@app.get("/api/v1/users", tags=["Users"], summary="List all users")
def get_users():
    return {"users": [{"id": i, "name": f"User_{i}", "active": True} for i in range(1, 6)]}

@app.get("/api/v1/payments", tags=["Payments"], summary="List payment records")
def get_payments():
    return {"payments": [{"id": i, "amount": round(random.uniform(10, 5000), 2), "status": "completed"} for i in range(1, 6)]}

@app.get("/api/v1/transactions", tags=["Transactions"], summary="List transactions")
def get_transactions():
    return {"transactions": [{"tx_id": f"TX{i:04d}", "timestamp": datetime.utcnow().isoformat(), "status": "settled"} for i in range(1, 6)]}

@app.get("/api/v1/accounts", tags=["Accounts"], summary="List bank accounts")
def get_accounts():
    return {"accounts": [{"account_id": f"ACC{i:04d}", "balance": round(random.uniform(100, 50000), 2)} for i in range(1, 4)]}

# ── Deprecated APIs ──────────────────────────────────────────────────────────

@app.get("/api/v1/old-login", tags=["Auth (Deprecated)"], summary="[DEPRECATED] Legacy login")
def old_login():
    return {"warning": "This endpoint is deprecated. Use /api/v2/auth/login", "status": "deprecated"}

@app.get("/api/v1/legacy-transfer", tags=["Transfers (Deprecated)"], summary="[DEPRECATED] Legacy transfer")
def legacy_transfer():
    return {"warning": "Deprecated. Use /api/v2/transfers", "status": "deprecated"}

# ── Zombie APIs ───────────────────────────────────────────────────────────────

@app.get("/api/v1/test-api", tags=["Test"], summary="Test endpoint (should be removed)")
def test_api():
    return {"message": "Test API — should not be in production"}

@app.get("/api/v1/dev-mock", tags=["Test"], summary="Developer mock (zombie)")
def dev_mock():
    return {"mock": True, "data": "placeholder"}

# ── Shadow / Internal APIs ────────────────────────────────────────────────────

@app.get("/internal/debug", tags=["Internal"], summary="Debug endpoint (shadow API)")
def internal_debug():
    return {"debug": True, "server_time": datetime.utcnow().isoformat(), "env": "production-leaked"}

@app.get("/internal/health-raw", tags=["Internal"], summary="Raw health check (shadow API)")
def health_raw():
    return {"status": "ok", "db_connections": 42, "memory_mb": 1024}

@app.get("/", tags=["Root"])
def root():
    return {"service": "SecureBank API Gateway", "version": "2.1.0", "docs": "/docs"}
