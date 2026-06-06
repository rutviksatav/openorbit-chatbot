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
