# Pydantic validation schemas for Chat Messages
from pydantic import BaseModel


class CreateMessageRequest(
    BaseModel
):

    content: str
