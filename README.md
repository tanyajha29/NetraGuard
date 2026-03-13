# 🔐 NetraGuard Platform (MVP)

Production-ready API discovery, classification, and zombie/shadow detection platform with:

- FastAPI backend + PostgreSQL (SQLAlchemy + Alembic)
- Celery workers + Redis for scans/monitoring
- React + TypeScript + Vite frontend (protected routes, charts, tables)
- Mock banking target service for demo auto-disable
- Docker Compose for full stack

## Quick start (Docker)
```bash
cp .env.example .env
docker compose up --build
```
- Backend API/Docs: http://localhost:8000/docs  
- Frontend UI: http://localhost:5173  
- Mock target: http://localhost:8100/docs  

Services: postgres, redis, backend, celery_worker, celery_beat, frontend, mock_target. Reports volume is shared across backend/worker/beat.

## Backend (manual dev)
```bash
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# workers
celery -A app.workers.celery_app worker --loglevel=info
celery -A app.workers.celery_app beat --loglevel=info
```

## Frontend (manual dev)
```bash
cd frontend
npm install
npm run dev -- --host --port 5173
```
Set `VITE_API_URL` to your backend base (default http://localhost:8000).

## Migrations
- Config: `backend/alembic.ini`
- Create: `alembic revision --autogenerate -m "msg"`
- Apply: `alembic upgrade head`

## Tests
```bash
pytest backend/tests
```

## Demo flow
1) Ensure mock target running (`mock_target` service).  
2) Register/login via `/api/v1/auth/*` or frontend login (captures JWT).  
3) POST `/api/v1/targets` with `base_url` `http://mock_target:8100` (or `http://localhost:8100` locally).  
4) POST `/api/v1/scans/start` with `log_file` `logs_test1.json` (or use Targets page “Dispatch to Celery”).  
5) View inventory/findings/alerts/reports/workflows in the frontend dashboard.  
6) Zombie APIs auto-create workflows; in demo mode mock routes are disabled (HTTP 410) via `/internal/disable`.  

## Environment variables (key)
- `POSTGRES_*`, `DATABASE_URL_OVERRIDE` — database DSN
- `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`
- `REDIS_URL`, `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND`, `SCHEDULER_INTERVAL_MINUTES`
- `SHADOW_KEYWORDS`, `ZOMBIE_KEYWORDS`, `CRAWL_COMMON_PATHS`, `CRAWL_TIMEOUT_SECONDS`, `LOGS_DIR`
- `DEMO_MODE`, `REPORTS_DIR`
- `VITE_API_URL` (frontend)

## Folder structure
- `backend/app` — FastAPI API, models, services, Celery tasks
- `backend/alembic` — migrations
- `frontend` — React+Vite SPA
- `data/` — sample traffic logs
- `backend/api_server.py` — mock banking target with demo auto-disable
