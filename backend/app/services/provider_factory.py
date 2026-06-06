from app.core.config import (
    LLM_PROVIDER
)

from app.services.groq_provider import (
    GroqProvider
)

from app.services.ollama_provider import (
    OllamaProvider
)


def get_llm_provider():

    if LLM_PROVIDER == "groq":

        return GroqProvider()

    if LLM_PROVIDER == "ollama":

        return OllamaProvider()

    raise Exception(
        f"Unsupported provider: {LLM_PROVIDER}"
    )
