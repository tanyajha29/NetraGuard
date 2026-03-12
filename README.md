# 🔐 NetraGuard Platform (Refactored)

End-to-end API discovery, classification, and zombie/shadow detection platform with FastAPI + PostgreSQL backend, Celery workers, Redis, React/Vite frontend, and a mock banking target.

---

## Quick start (Docker)
```bash
cp .env.example .env
docker compose up --build
```
- Backend: http://localhost:8000/docs  
- Frontend: http://localhost:5173 (set `VITE_API_URL` in `frontend/.env` if running separately)  
- Mock target: http://localhost:8100/docs

## Backend (manual)
```bash
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head           # run migrations
uvicorn app.main:app --reload  # run from repo root with PYTHONPATH=backend/app
celery -A app.workers.celery_app worker --loglevel=info
celery -A app.workers.celery_app beat --loglevel=info
```

## Frontend (manual)
```bash
cd frontend
npm install
npm run dev -- --host --port 5173
```

## Migrations
- Config: `backend/alembic.ini`
- Initial revision: `backend/alembic/versions/0001_initial.py`
- Commands: `alembic revision --autogenerate -m "msg"` then `alembic upgrade head`

## Tests
```bash
pytest backend/tests
```

## Demo flow
1) Ensure mock target running (`mock_target` service).  
2) Register/login via `/api/v1/auth/*` and capture JWT.  
3) POST `/api/v1/targets` with `base_url` `http://mock_target:8100` (or `http://localhost:8100` locally).  
4) POST `/api/v1/scans/start` with `log_file` `logs_test1.json`.  
5) View inventory/findings/alerts/reports in frontend dashboard.  
6) Zombie APIs auto-create workflows; demo auto-disable causes 410 Gone responses on disabled mock routes.  

## Structure
- `backend/app` — FastAPI app, models, services, Celery tasks
- `backend/alembic` — migrations
- `frontend/` — React + TypeScript + Vite UI (protected routes, tables, charts)
- `data/` — sample traffic logs
- `backend/api_server.py` — mock banking API with demo auto-disable
