# Pydantic validation schemas for Chat Messages
from pydantic import BaseModel


class CreateMessageRequest(
    BaseModel
):

    content: str


class EditMessageRequest(
    BaseModel
):

    content: str


class FeedbackRequest(
    BaseModel
):

    feedback: str | None = None

