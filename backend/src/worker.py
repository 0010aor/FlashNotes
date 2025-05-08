from celery import Celery

from src.core.config import settings

celery = Celery(
    "worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery.conf.task_routes = {
    "src.tasks.*": {"queue": "default"},
}
