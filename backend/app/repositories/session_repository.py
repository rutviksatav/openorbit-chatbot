# Repository pattern for Chat Session data access
from sqlalchemy import select

from app.db.models import (
    ChatSession
)

from app.db.database import (
    AsyncSessionLocal
)


class SessionRepository:


    async def create_session(
        self,
        user_id: int,
        title: str = "New Chat"
    ):

        async with AsyncSessionLocal() as session:

            chat_session = ChatSession(

                user_id=user_id,

                title=title
            )

            session.add(chat_session)

            await session.commit()

            await session.refresh(
                chat_session
            )

            return chat_session


    async def get_sessions_by_user(
        self,
        user_id: int
    ):

        async with AsyncSessionLocal() as session:

            result = await session.execute(

                select(ChatSession)

                .where(
                    ChatSession.user_id == user_id
                )
            )

            return result.scalars().all()


    async def get_session_by_id(
        self,
        session_id: int
    ):

        async with AsyncSessionLocal() as session:

            result = await session.execute(

                select(ChatSession)

                .where(
                    ChatSession.id == session_id
                )
            )

            return result.scalar_one_or_none()


    async def update_title(
        self,
        session_id: int,
        title: str
    ):

        async with AsyncSessionLocal() as session:

            result = await session.execute(

                select(ChatSession)

                .where(
                    ChatSession.id == session_id
                )
            )

            chat_session = result.scalar_one_or_none()

            if not chat_session:

                return None

            chat_session.title = title

            await session.commit()

            await session.refresh(
                chat_session
            )

            return chat_session

    async def delete_session(

    self,

    session_id: int

):

        async with AsyncSessionLocal() as session:

            chat_session = await session.get(

                ChatSession,

                session_id

            )

            if not chat_session:

                return False

            await session.delete(
                chat_session
            )

            await session.commit()

            return True
