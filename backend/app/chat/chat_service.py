from fastapi import HTTPException

from app.repositories.message_repository import (
    MessageRepository
)

from app.repositories.session_repository import (
    SessionRepository
)

from app.chat.title_generator import (
    generate_chat_title
)

from app.services.provider_factory import (
    get_llm_provider
)


class ChatService:

    def __init__(self):

        self.message_repository = (
            MessageRepository()
        )

        self.session_repository = (
            SessionRepository()
        )

        self.provider = (
            get_llm_provider()
        )


    async def build_conversation_history(
        self,
        session_id: int
    ):

        messages = (
            await self.message_repository
            .get_messages_by_session(
                session_id
            )
        )

        messages = messages[-20:]


        return [

            {
                "role": message.role,

                "content": message.content
            }

            for message in messages
        ]


    


    async def send_message(
    self,
    session_id: int,
    user_id: int,
    content: str
):

        chat_session = (
            await self.session_repository
            .get_session_by_id(
                session_id
            )
        )

        if not chat_session:

            raise HTTPException(
                status_code=404,
                detail="Session not found"
            )


        if (
            chat_session.user_id
            != user_id
        ):

            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )


        message = await (
            self.message_repository
            .create_message(
                session_id=session_id,
                role="user",
                content=content
            )
        )


        if (
            chat_session.title
            == "New Chat"
        ):

            title = await generate_chat_title(
                content
            )

            await (
                self.session_repository
                .update_title(
                    session_id=session_id,
                    title=title
                )
            )


        return {

            "message_id": message.id,

            "status": "saved"
        }

    async def stream_ai_response(
        self,
        session_id: int
    ):

        conversation = (
            await self.build_conversation_history(
                session_id
            )
        )

        full_response = ""

        async for chunk in (
            self.provider.stream_response(
                conversation
            )
        ):

            full_response += chunk

            yield chunk

        await (
            self.message_repository
            .create_message(
                session_id=session_id,
                role="assistant",
                content=full_response
            )
        )

    async def get_session_details(
    self,
    session_id: int,
    user_id: int
    ):

        session = await (
            self.session_repository
            .get_session_by_id(
                session_id
            )
        )

        if not session:

            raise HTTPException(
                status_code=404,
                detail="Session not found"
            )


        if session.user_id != user_id:

            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )


        messages = await (
            self.message_repository
            .get_messages_by_session(
                session_id
            )
        )

        return {

            "id": session.id,

            "title": session.title,

            "message_count": len(
                messages
            ),

            "created_at": (
                session.created_at
            )
        }
