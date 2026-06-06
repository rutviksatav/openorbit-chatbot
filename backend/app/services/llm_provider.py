from abc import (
    ABC,
    abstractmethod
)


class LLMProvider(ABC):

    @abstractmethod
    async def generate_response(
        self,
        messages: list
    ) -> str:
        pass


    @abstractmethod
    async def stream_response(
        self,
        messages: list
    ):
        pass
