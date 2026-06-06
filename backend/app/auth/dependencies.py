# Auth dependencies for routes
from fastapi import (
    Depends,
    HTTPException
)

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)

from jose import jwt

from app.core.config import (
    SECRET_KEY,
    ALGORITHM
)

from app.repositories.user_repository import (
    UserRepository
)


security = HTTPBearer()

repository = UserRepository()


from fastapi import (
    Depends,
    HTTPException,
    Request
)

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)

from jose import jwt

from app.core.config import (
    SECRET_KEY,
    ALGORITHM
)

from app.repositories.user_repository import (
    UserRepository
)


security = HTTPBearer(
    auto_error=False
)

repository = UserRepository()


async def get_current_user(

    request: Request,

    credentials: HTTPAuthorizationCredentials
    = Depends(security)

):

    token = None

    if credentials:

        token = credentials.credentials

    else:

        token = request.query_params.get(
            "token"
        )

    if not token:

        raise HTTPException(
            status_code=401,
            detail="Missing token"
        )

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

    except Exception:

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user_id = payload.get("sub")

    if not user_id:

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user = await repository.get_user_by_id(
        int(user_id)
    )

    if not user:

        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user
