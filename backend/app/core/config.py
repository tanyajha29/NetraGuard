"""
Application configuration using environment variables.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field
import secrets


class Settings(BaseSettings):
    project_name: str = Field(default="NetraGuard API Security Platform")
    api_v1_str: str = "/api/v1"
    secret_key: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    access_token_expire_minutes: int = 60 * 12

    # Database
    postgres_host: str = "postgres"
    postgres_port: int = 5432
    postgres_user: str = "netraguard"
    postgres_password: str = "netraguard"
    postgres_db: str = "netraguard"

    # Celery / Redis
    redis_url: str = "redis://redis:6379/0"
    celery_broker_url: str | None = None
    celery_result_backend: str | None = None

    # Discovery / classification thresholds
    active_traffic_min: int = 20
    zombie_traffic_max: int = 0
    deprecated_traffic_max: int = 19
    shadow_keywords: str = "internal,debug,health-raw"
    zombie_keywords: str = "old,test,dev,mock,legacy"

    # Demo logs path
    logs_dir: str = "data"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def database_url(self) -> str:
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
