# Import all models so that Alembic can autogenerate migrations.
from app.db.base import Base  # noqa
from app import models  # noqa
