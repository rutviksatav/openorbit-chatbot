import os

from dotenv import (
    load_dotenv
)

load_dotenv()


SECRET_KEY = os.getenv(
    "SECRET_KEY"
)

ALGORITHM = os.getenv(
    "ALGORITHM"
)

GROQ_API_KEY = os.getenv(
    "GROQ_API_KEY"
)

LLM_PROVIDER = os.getenv(
    "LLM_PROVIDER",
    "groq"
)

LLM_MODEL = os.getenv(
    "LLM_MODEL",
    "llama-3.3-70b-versatile"
)

SEARXNG_BASE_URL = os.getenv(
    "SEARXNG_BASE_URL",
    "http://localhost:8080"
)

# Database URL with postgres async auto-conversion
db_url = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./chat.db")
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
DATABASE_URL = db_url

# CORS Origins parsed from comma-separated list
cors_origins_raw = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173"
)
CORS_ORIGINS = [origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()]

