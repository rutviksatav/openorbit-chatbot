from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from app.auth.dependencies import (
    get_current_user
)

from app.repositories.session_repository import (
    SessionRepository
)

from app.schemas.chat_schema import (
    CreateSessionRequest
)

from app.repositories.message_repository import (
    MessageRepository
)

from app.schemas.message_schema import (
    CreateMessageRequest
)

from app.chat.title_generator import (
    generate_chat_title
)

from app.chat.chat_service import (
    ChatService
)

router = APIRouter()

repository = SessionRepository()

message_repository = MessageRepository()

chat_service = ChatService()


@router.post("/sessions")
async def create_session(

    payload: CreateSessionRequest,

    current_user = Depends(
        get_current_user
    )
):

    session = await repository.create_session(

        user_id=current_user.id,

        title=payload.title or "New Chat"
    )

    return {

        "id": session.id,

        "title": session.title
    }

@router.get("/sessions")
async def get_sessions(

    current_user = Depends(
        get_current_user
    )
):

    sessions = await repository.get_sessions_by_user(
        current_user.id
    )

    return [

        {
            "id": s.id,
            "title": s.title
        }

        for s in sessions
    ]

@router.get("/sessions/{session_id}")
async def get_session(

    session_id: int,

    current_user = Depends(
        get_current_user
    )
):

    session = await repository.get_session_by_id(
        session_id
    )

    if not session:

        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    if session.user_id != current_user.id:

        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    return {

        "id": session.id,

        "title": session.title
    }

@router.post(
    "/sessions/{session_id}/messages"
)
async def create_message(

    session_id: int,

    payload: CreateMessageRequest,

    current_user = Depends(
        get_current_user
    )
):

    return await (
        chat_service.send_message(
            session_id=session_id,

            user_id=current_user.id,

            content=payload.content
        )
    )

@router.get(
    "/sessions/{session_id}/messages"
)
async def get_messages(

    session_id: int,

    current_user = Depends(
        get_current_user
    )
):

    chat_session = (
        await repository.get_session_by_id(
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
        != current_user.id
    ):

        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )


    messages = (
        await message_repository
        .get_messages_by_session(
            session_id
        )
    )

    return [

        {
            "id": message.id,

            "role": message.role,

            "content": message.content
        }

        for message in messages
    ]

@router.get(
    "/sessions/{session_id}"
)
async def get_session_details(

    session_id: int,

    current_user = Depends(
        get_current_user
    )
):

    return await (
        chat_service
        .get_session_details(
            session_id=session_id,

            user_id=current_user.id
        )
    )
from app.chat.chat_service import (
    ChatService
)

chat_service = ChatService()


@router.get("/test-llm")
async def test_llm():

    response = await chat_service.provider.generate_response(
        [
            {
                "role": "user",
                "content": "Say hello in one sentence."
            }
        ]
    )

    return {
        "response": response
    }

@router.delete(
    "/sessions/{session_id}"
)
async def delete_session(

    session_id: int,

    current_user = Depends(
        get_current_user
    )
):

    session = await (
        repository.get_session_by_id(
            session_id
        )
    )

    if not session:

        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    if session.user_id != current_user.id:

        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    await repository.delete_session(
        session_id
    )

    return {

        "status": "deleted"
    }
