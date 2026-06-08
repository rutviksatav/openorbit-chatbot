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
        content: str,
        sources: str | None = None,
        mode: str | None = None
    ):

        async with AsyncSessionLocal() as session:

            message = Message(

                session_id=session_id,

                role=role,

                content=content,

                sources=sources,

                mode=mode
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


    async def update_message_content(
        self,
        message_id: int,
        content: str
    ):
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(Message).where(Message.id == message_id)
            )
            message = result.scalar_one_or_none()
            if message:
                message.content = content
                await session.commit()
                await session.refresh(message)
            return message

    async def delete_messages_after(
        self,
        session_id: int,
        message_id: int
    ):
        async with AsyncSessionLocal() as session:
            from sqlalchemy import delete
            await session.execute(
                delete(Message)
                .where(Message.session_id == session_id)
                .where(Message.id > message_id)
            )
            await session.commit()

    async def delete_last_message(
        self,
        session_id: int
    ):
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(Message)
                .where(Message.session_id == session_id)
                .order_by(Message.id.desc())
                .limit(1)
            )
            last_message = result.scalar_one_or_none()
            if last_message:
                await session.delete(last_message)
                await session.commit()
                return True
            return False

    async def update_message_feedback(
        self,
        message_id: int,
        feedback: str
    ):
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(Message).where(Message.id == message_id)
            )
            message = result.scalar_one_or_none()
            if message:
                message.feedback = feedback
                await session.commit()
                await session.refresh(message)
            return message
