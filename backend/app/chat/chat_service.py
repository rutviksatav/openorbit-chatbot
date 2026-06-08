import asyncio
import json
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

from app.agents.intent_router import IntentRouter
from app.agents.research_agent import ResearchAgent


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
        content: str,
        mode: str = "chat"
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
                content=content,
                mode=mode
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
        # Fetch the message history to check user's requested mode and query
        db_messages = await self.message_repository.get_messages_by_session(session_id)
        
        last_user_message = None
        for msg in reversed(db_messages):
            if msg.role == "user":
                last_user_message = msg
                break
                
        mode = "chat"
        user_query = ""
        if last_user_message:
            mode = last_user_message.mode or "chat"
            user_query = last_user_message.content or ""
            
        intent_router = IntentRouter()
        should_run_search = mode == "research" or (mode == "chat" and await intent_router.should_search(user_query))
        
        if should_run_search:
            # Research Mode flow
            sources_out = []
            
            # Stream status prefixes sequentially
            yield "__status__:🌐 Searching the web..."
            await asyncio.sleep(0.5)
            yield "__status__:📄 Reading sources..."
            await asyncio.sleep(0.5)
            yield "__status__:🧠 Generating answer..."
            await asyncio.sleep(0.3)
            
            agent = ResearchAgent()
            full_response = ""
            try:
                async for chunk in agent.generate_stream(user_query, session_id, sources_out):
                    full_response += chunk
                    yield chunk
            finally:
                if full_response:
                    await self.message_repository.create_message(
                        session_id=session_id,
                        role="assistant",
                        content=full_response,
                        sources=json.dumps(sources_out) if sources_out else None,
                        mode=mode
                    )
        else:
            # Normal Chat flow
            conversation = await self.build_conversation_history(session_id)
            
            from datetime import datetime
            current_time_str = datetime.now().strftime("%A, %B %d, %Y, %I:%M %p")
            conversation.insert(0, {
                "role": "system",
                "content": f"You are OpenOrbit, a helpful AI assistant. Current Date and Time: {current_time_str}"
            })
            
            full_response = ""
            try:
                async for chunk in self.provider.stream_response(conversation):
                    full_response += chunk
                    yield chunk
            finally:
                if full_response:
                    await self.message_repository.create_message(
                        session_id=session_id,
                        role="assistant",
                        content=full_response,
                        mode=mode
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
