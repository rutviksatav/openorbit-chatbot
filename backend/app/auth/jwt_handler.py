# JWT handling utilities
from datetime import (
    datetime,
    timedelta
)

from jose import jwt

from app.core.config import (
    SECRET_KEY,
    ALGORITHM
)


def create_access_token(
    user_id: int
):

    expire = datetime.utcnow() + timedelta(
        days=1
    )

    payload = {

        "sub": str(user_id),

        "exp": expire
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
