from celery import Celery
from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "netraguard",
    broker=settings.celery_broker,
    backend=settings.celery_backend,
)

celery_app.conf.beat_schedule = {
    "scheduled-rescan": {
        "task": "app.workers.tasks.scheduled_rescan",
        "schedule": 60.0 * settings.scheduler_interval_minutes,  # configurable minutes
    }
}

# ensure task modules are registered
celery_app.autodiscover_tasks(["app.workers"])
