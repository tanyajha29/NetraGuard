import sys
from pathlib import Path

# Ensure the FastAPI backend package is importable when running Streamlit/demo scripts
ROOT_DIR = Path(__file__).resolve().parents[1]
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.db.session import SessionLocal, engine  # type: ignore
from app.db.base import Base  # type: ignore


def init_db():
    """
    Idempotently ensure production tables exist using the canonical SQLAlchemy Base.
    In production this should be handled by Alembic migrations; this remains
    as a convenience for demo/Streamlit runs.
    """
    Base.metadata.create_all(bind=engine)


def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
