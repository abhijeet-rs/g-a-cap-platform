import os


class Settings:
    APP_NAME: str = "CSA Extraction Service"
    API_PREFIX: str = "/api"
    LLAMAPARSE_API_KEY: str = os.getenv("LLAMAPARSE_API_KEY", "llx-fWx3SiFSzneMWFlk2QjAR4EJ9QiT6u57BgtnfLqUIvVEJW8v")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads"))
    MAX_FILE_SIZE_MB: int = 50
    CONFIDENCE_AUTO_APPROVE: float = 0.95
    CONFIDENCE_REVIEW_THRESHOLD: float = 0.80
    CONFIDENCE_REJECT_THRESHOLD: float = 0.60
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001"]
    CLAUDE_OAUTH_TOKEN: str = os.getenv("CLAUDE_CODE_OAUTH_TOKEN", "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")
    CLAUDE_MODEL: str = os.getenv("CLAUDE_MODEL", "claude-haiku-4-5-20251001")


settings = Settings()

# Ensure upload directory exists at import time
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
