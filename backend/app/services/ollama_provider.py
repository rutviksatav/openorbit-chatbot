from ollama import AsyncClient

from app.services.llm_provider import (
    LLMProvider
)


class OllamaProvider(
    LLMProvider
):

    def __init__(self):
        self.client = AsyncClient()


    async def generate_response(
        self,
        messages: list
    ) -> str:

        response = await self.client.chat(

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

        stream = await self.client.chat(

            model="gemma3:4b",

            messages=messages,

            stream=True
        )

        async for chunk in stream:

            content = (
                chunk["message"]["content"]
            )

            if content:

                yield content
