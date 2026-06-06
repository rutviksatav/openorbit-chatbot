from fastapi import (
    APIRouter
)

from sse_starlette.sse import (
    EventSourceResponse
)

from app.services.provider_factory import (
    get_llm_provider
)

from app.chat.chat_service import (
    ChatService
)

from fastapi import (
    Depends,
    HTTPException
)

from app.auth.dependencies import (
    get_current_user
)

chat_service = ChatService()

router = APIRouter()

provider = get_llm_provider()


@router.get("/stream-test")
async def stream_test():

    async def event_generator():

        async for chunk in (
            provider.stream_response(
                [
                    {
                        "role": "user",
                        "content": (
                            "Explain FastAPI briefly"
                        )
                    }
                ]
            )
        ):

            yield {
                "data": chunk
            }

        yield {

            "event": "done",

            "data": "finished"
        }

    return EventSourceResponse(
        event_generator()
    )


@router.get(
    "/sessions/{session_id}/stream"
)
async def stream_chat(

    session_id: int,

    current_user = Depends(
        get_current_user
    )
):

    chat_session = (
        await chat_service
        .session_repository
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
        != current_user.id
    ):

        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    async def event_generator():

        print(
            f"STREAM STARTED FOR SESSION {session_id}"
        )

        async for chunk in (
            chat_service
            .stream_ai_response(
                session_id
            )
        ):

            print(
                f"CHUNK: {chunk}"
            )

            yield {
                "data": chunk
            }

        print(
            f"STREAM FINISHED FOR SESSION {session_id}"
        )

        yield {

            "event": "done",

            "data": "finished"
        }

    return EventSourceResponse(
        event_generator()
    )
