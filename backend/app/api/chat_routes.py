import json
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
    CreateMessageRequest,
    EditMessageRequest,
    FeedbackRequest
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

        "title": session.title,

        "created_at": session.created_at.isoformat() if session.created_at else None
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
            "title": s.title,
            "created_at": s.created_at.isoformat() if s.created_at else None
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

            content=payload.content,

            mode=payload.mode
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

            "content": message.content,

            "created_at": message.created_at.isoformat() if message.created_at else None,

            "feedback": message.feedback,

            "sources": json.loads(message.sources) if message.sources else [],

            "mode": message.mode
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


@router.put("/sessions/{session_id}/messages/{message_id}")
async def edit_message(
    session_id: int,
    message_id: int,
    payload: EditMessageRequest,
    current_user = Depends(get_current_user)
):
    chat_session = await repository.get_session_by_id(session_id)
    if not chat_session:
        raise HTTPException(status_code=404, detail="Session not found")
    if chat_session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    updated = await message_repository.update_message_content(message_id, payload.content)
    if not updated:
        raise HTTPException(status_code=404, detail="Message not found")

    await message_repository.delete_messages_after(session_id, message_id)

    return {"status": "updated"}


@router.delete("/sessions/{session_id}/messages/last")
async def delete_last_message(
    session_id: int,
    current_user = Depends(get_current_user)
):
    chat_session = await repository.get_session_by_id(session_id)
    if not chat_session:
        raise HTTPException(status_code=404, detail="Session not found")
    if chat_session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    messages = await message_repository.get_messages_by_session(session_id)
    if not messages:
        raise HTTPException(status_code=400, detail="No messages in session")

    last_message = messages[-1]
    if last_message.role != "assistant":
        raise HTTPException(status_code=400, detail="Last message is not from assistant")

    deleted = await message_repository.delete_last_message(session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Message not found")

    return {"status": "deleted"}


@router.post("/sessions/{session_id}/messages/{message_id}/feedback")
async def update_feedback(
    session_id: int,
    message_id: int,
    payload: FeedbackRequest,
    current_user = Depends(get_current_user)
):
    chat_session = await repository.get_session_by_id(session_id)
    if not chat_session:
        raise HTTPException(status_code=404, detail="Session not found")
    if chat_session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    updated = await message_repository.update_message_feedback(message_id, payload.feedback)
    if not updated:
        raise HTTPException(status_code=404, detail="Message not found")

    return {"status": "updated"}

