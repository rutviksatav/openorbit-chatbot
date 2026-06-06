# Auth routes API endpoints
from fastapi import (
    APIRouter,
    HTTPException
)

from app.schemas.auth_schema import (
    UserSignup,
    UserLogin
)

from app.repositories.user_repository import (
    UserRepository
)

from app.auth.password_handler import (
    hash_password,
    verify_password
)

from app.auth.jwt_handler import (
    create_access_token
)

from fastapi import Depends

from app.auth.dependencies import (
    get_current_user
)

router = APIRouter()

repository = UserRepository()


@router.post("/signup")
async def signup(
    payload: UserSignup
):

    existing_user = await repository.get_user_by_email(
        payload.email
    )

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )

    hashed_password = hash_password(
        payload.password
    )

    user = await repository.create_user(
        email=payload.email,
        hashed_password=hashed_password
    )

    return {
        "message": "User created",
        "user_id": user.id
    }

@router.post("/login")
async def login(
    payload: UserLogin
):

    user = await repository.get_user_by_email(
        payload.email
    )

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    valid_password = verify_password(
        payload.password,
        user.hashed_password
    )

    if not valid_password:

        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    token = create_access_token(
        user.id
    )

    return {
        "access_token": token
    }

@router.get("/me")
async def get_me(

    current_user = Depends(
        get_current_user
    )

):

    return {

        "id": current_user.id,

        "email": current_user.email
    }
