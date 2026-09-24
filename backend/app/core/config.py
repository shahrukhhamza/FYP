from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central app configuration, read from environment variables / .env.
    This is the one place backend config lives — routers and services
    import `settings` rather than reading os.environ directly.
    """

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Buniyad API"
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"

    # Comma-separated list of allowed frontend origins for CORS.
    cors_origins: str = "http://localhost:3000"

    # No default: a hardcoded default would bake in one developer's local
    # OS username/setup and silently misconfigure everyone else's machine.
    # Each developer sets their own in .env (see .env.example).
    database_url: str

    # DEV-ONLY default. Any shared or deployed environment must override
    # this in its own .env — never commit a real secret here. Padded to
    # 32+ bytes so PyJWT doesn't emit InsecureKeyLengthWarning on every
    # token operation during normal local dev (HS256 wants >= 32 bytes
    # per RFC 7518 Section 3.2); the padding doesn't make it any more
    # suitable for production — it was never meant to be.
    jwt_secret_key: str = "dev-only-secret-change-me-0123456789"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


# Fields are populated from the environment at runtime; mypy can't see that.
settings = Settings()  # type: ignore[call-arg]
