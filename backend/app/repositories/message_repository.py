# Repository pattern for Chat Message data access
from sqlalchemy import select

from app.db.models import (
    Message
)

from app.db.database import (
    AsyncSessionLocal
)


class MessageRepository:


    async def create_message(
        self,
        session_id: int,
        role: str,
        content: str
    ):

        async with AsyncSessionLocal() as session:

            message = Message(

                session_id=session_id,

                role=role,

                content=content
            )

            session.add(message)

            await session.commit()

            await session.refresh(
                message
            )

            return message


    async def get_messages_by_session(
        self,
        session_id: int
    ):

        async with AsyncSessionLocal() as session:

            result = await session.execute(

                select(Message)

                .where(
                    Message.session_id == session_id
                )
            )

            return result.scalars().all()
