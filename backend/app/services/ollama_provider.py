from ollama import chat

from app.services.llm_provider import (
    LLMProvider
)


class OllamaProvider(
    LLMProvider
):

    async def generate_response(
        self,
        messages: list
    ) -> str:

        response = chat(

            model="gemma4:e2b",

            messages=messages
        )

        return (
            response["message"]["content"]
        )


    async def stream_response(
        self,
        messages: list
    ):

        stream = chat(

            model="gemma3:4b",

            messages=messages,

            stream=True
        )

        for chunk in stream:

            content = (
                chunk["message"]["content"]
            )

            if content:

                yield content
