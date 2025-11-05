"""Application settings."""

from functools import lru_cache
from typing import Optional, List
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    APP_NAME: str = "ScriptRipper"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = Field(default="development")
    LOG_LEVEL: str = Field(default="info")

    # Database
    DATABASE_URL: str = Field(..., description="PostgreSQL connection string")

    # Redis
    REDIS_URL: str = Field(..., description="Redis connection string")

    # JWT
    JWT_SECRET: str = Field(..., description="Secret key for JWT tokens")
    JWT_ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7)

    # LLM Providers
    GEMINI_API_KEY: Optional[str] = Field(default=None)
    OPENAI_API_KEY: Optional[str] = Field(default=None)
    ANTHROPIC_API_KEY: Optional[str] = Field(default=None)
    DEFAULT_LLM_PROVIDER: str = Field(default="gemini")

    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = Field(default=None)
    GOOGLE_CLIENT_SECRET: Optional[str] = Field(default=None)
    GOOGLE_REDIRECT_URI: Optional[str] = Field(default=None)

    # Email (Magic Link)
    SENDGRID_API_KEY: Optional[str] = Field(default=None)
    FROM_EMAIL: str = Field(default="noreply@scriptripper.example.com")
    MAGIC_LINK_EXPIRE_MINUTES: int = Field(default=15)

    # CORS
    CORS_ORIGINS: str = Field(default="http://localhost:3000")

    def get_cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        if isinstance(self.CORS_ORIGINS, str):
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
        return self.CORS_ORIGINS if isinstance(self.CORS_ORIGINS, list) else [self.CORS_ORIGINS]

    # n8n
    N8N_WEBHOOK_URL: Optional[str] = Field(default=None)

    # Object Storage (S3-compatible)
    S3_ENDPOINT_URL: Optional[str] = Field(default=None)
    S3_ACCESS_KEY_ID: Optional[str] = Field(default=None)
    S3_SECRET_ACCESS_KEY: Optional[str] = Field(default=None)
    S3_BUCKET_NAME: str = Field(default="scriptripper-artifacts")
    S3_REGION: str = Field(default="us-east-1")

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = Field(default=60)

    # File Upload
    MAX_UPLOAD_SIZE_MB: int = Field(default=50)
    ALLOWED_EXTENSIONS: str = Field(default="json,txt,srt,vtt")

    def get_allowed_extensions_list(self) -> List[str]:
        """Parse allowed extensions from comma-separated string."""
        if isinstance(self.ALLOWED_EXTENSIONS, str):
            return [ext.strip() for ext in self.ALLOWED_EXTENSIONS.split(",")]
        return self.ALLOWED_EXTENSIONS if isinstance(self.ALLOWED_EXTENSIONS, list) else [self.ALLOWED_EXTENSIONS]

    # Security
    ENCRYPTION_KEY: Optional[str] = Field(default=None)

    # Stripe
    STRIPE_SECRET_KEY: Optional[str] = Field(default=None)
    STRIPE_PUBLISHABLE_KEY: Optional[str] = Field(default=None)
    STRIPE_WEBHOOK_SECRET: Optional[str] = Field(default=None)
    STRIPE_PRO_PRICE_ID: Optional[str] = Field(default=None)
    STRIPE_SUCCESS_URL: str = Field(default="http://localhost:3000/subscription/success")
    STRIPE_CANCEL_URL: str = Field(default="http://localhost:3000/subscription/cancel")

    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.ENVIRONMENT.lower() in ["development", "dev", "local"]

    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.ENVIRONMENT.lower() in ["production", "prod"]

    @property
    def max_upload_size_bytes(self) -> int:
        """Get max upload size in bytes."""
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
