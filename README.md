# 🔐NetraGuard (Zombie API Discovery and Defence Platform)

> A professional cybersecurity prototype for discovering, detecting, and monitoring **Zombie APIs** — inactive, shadow, and deprecated endpoints that pose security risks in production environments.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd zombie-api-platform
pip install -r requirements.txt
```

### 2. Start the mock API server (Terminal 1)
```bash
uvicorn backend.api_server:app --host 0.0.0.0 --port 8000 --reload
```
API docs available at: http://localhost:8000/docs

### 3. Launch the dashboard (Terminal 2)
```bash
streamlit run dashboard/dashboard.py
```
Dashboard available at: http://localhost:8501

---

## 🧟 Demo Scenarios

| Log File | Scenario |
|----------|----------|
| `logs_test1.json` | Normal traffic — healthy system baseline |
| `logs_test2.json` | APIs going inactive — zombie/deprecated APIs appear |
| `logs_test3.json` | New API detected — `/api/v2/new-payments` discovered |

### Expected Demo Flow
1. Launch dashboard → empty state shown
2. Select `logs_test1.json` → Click **START SCAN**
3. System discovers 10 APIs, classifies zombie + shadow APIs
4. Switch to `logs_test3.json` → Click **START SCAN**
5. New API `/api/v2/new-payments` detected and alerted

---

## 🏗 Architecture

```
zombie-api-platform/
├── backend/
│   ├── api_server.py      # Mock banking API (FastAPI)
│   └── models.py          # SQLAlchemy ORM models
├── scanner/
│   ├── api_discovery.py   # OpenAPI spec fetcher
│   ├── log_analyzer.py    # Traffic log parser
│   ├── zombie_detector.py # Classification + risk scoring
│   └── scan_engine.py     # Orchestrates full scan
├── database/
│   └── db.py              # SQLite session management
├── dashboard/
│   └── dashboard.py       # Streamlit interactive UI
├── data/
│   ├── logs_test1.json    # Normal traffic scenario
│   ├── logs_test2.json    # Inactive APIs scenario
│   └── logs_test3.json    # New API detection scenario
└── requirements.txt
```

---

## 🔍 API Classification Rules

| Status | Criteria | Risk |
|--------|----------|------|
| **Active** | traffic > 20 | Low |
| **Deprecated** | 0 < traffic < 20 | Medium |
| **Zombie** | traffic = 0, name contains old/test/dev/mock | High/Critical |
| **Shadow** | path contains internal/debug | Medium/High |

## 📊 Risk Scoring

```
risk_score = inactivity_score + exposure_score + lifecycle_score
```

- **Inactivity**: 40pts (zero traffic), 20pts (low traffic), 0pts (active)
- **Exposure**: 30pts (internal/debug), 10pts (public)
- **Lifecycle**: 30pts (zombie), 20pts (deprecated), 5pts (active)

Score ranges: Low (0–29) · Medium (30–49) · High (50–69) · Critical (70+)
