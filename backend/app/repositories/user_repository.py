# Repository pattern for User data access
from sqlalchemy import select

from app.db.models import User

from app.db.database import (
    AsyncSessionLocal
)


class UserRepository:


    async def get_user_by_email(
        self,
        email: str
    ):

        async with AsyncSessionLocal() as session:

            result = await session.execute(

                select(User)

                .where(
                    User.email == email
                )
            )

            return result.scalar_one_or_none()


    async def create_user(
        self,
        email: str,
        hashed_password: str
    ):

        async with AsyncSessionLocal() as session:

            user = User(

                email=email,

                hashed_password=hashed_password
            )

            session.add(user)

            await session.commit()

            await session.refresh(user)

            return user

    async def get_user_by_id(
            self,
            user_id: int
        ):

        async with AsyncSessionLocal() as session:

            result = await session.execute(

                select(User)

                .where(
                    User.id == user_id
                )
            )

            return result.scalar_one_or_none()
