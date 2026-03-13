"""
Application configuration using environment variables.
Keeps all tunable thresholds and external service URLs in one place.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field
import secrets


class Settings(BaseSettings):
    project_name: str = Field(default="NetraGuard API Security Platform")
    api_v1_str: str = "/api/v1"
    app_env: str = Field(default="dev")
    secret_key: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    access_token_expire_minutes: int = 60 * 12

    # Database
    database_url_override: str | None = None
    postgres_host: str = "postgres"
    postgres_port: int = 5432
    postgres_user: str = "netraguard"
    postgres_password: str = "netraguard"
    postgres_db: str = "netraguard"

    # Celery / Redis
    redis_url: str = "redis://redis:6379/0"
    celery_broker_url: str | None = None
    celery_result_backend: str | None = None
    scheduler_interval_minutes: int = 30

    # Discovery / classification thresholds
    active_traffic_min: int = 20
    zombie_traffic_max: int = 0
    deprecated_traffic_max: int = 19
    traffic_drop_pct: int = 50
    shadow_keywords: str = "internal,debug,health-raw"
    zombie_keywords: str = "old,test,dev,mock,legacy"
    crawl_common_paths: str = (
        "/health,/metrics,/internal/debug,/internal/health-raw,"
        "/api/v1/users,/api/v1/payments,/api/v1/transactions,/api/v1/old-login,"
        "/api/v1/test-api,/api/v1/dev-mock"
    )
    crawl_timeout_seconds: int = 3
    crawl_enabled: bool = True

    # Demo / mock
    demo_mode: bool = True

    # Reporting / data
    logs_dir: str = "data"
    reports_dir: str = "backend/reports"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def database_url(self) -> str:
        if self.database_url_override:
            return self.database_url_override
        return (
            f"postgresql+psycopg2://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def celery_broker(self) -> str:
        return self.celery_broker_url or self.redis_url

    @property
    def celery_backend(self) -> str:
        return self.celery_result_backend or self.redis_url


@lru_cache
def get_settings() -> Settings:
    return Settings()
