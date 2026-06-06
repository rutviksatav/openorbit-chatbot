from groq import Groq

from app.services.llm_provider import (
    LLMProvider
)

from app.core.config import (
    GROQ_API_KEY,
    LLM_MODEL
)


class GroqProvider(
    LLMProvider
):

    def __init__(self):

        self.client = Groq(
            api_key=GROQ_API_KEY
        )


    async def generate_response(
        self,
        messages: list
    ) -> str:

        response = (
            self.client.chat.completions.create(
                model=LLM_MODEL,
                messages=messages
            )
        )

        return (
            response
            .choices[0]
            .message
            .content
        )


    async def stream_response(
        self,
        messages: list
    ):

        stream = (
            self.client.chat.completions.create(
                model=LLM_MODEL,
                messages=messages,
                stream=True
            )
        )

        for chunk in stream:

            delta = (
                chunk
                .choices[0]
                .delta
                .content
            )

            if delta:

                print(
                    f"DELTA: [{delta}]"
                )

                yield delta
