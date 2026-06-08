
from fastapi import FastAPI

from fastapi.middleware.cors import (
    CORSMiddleware
)
from app.db.database import (
    engine,
    Base
)

from app.api.chat_routes import (
    router as chat_router
)

from app.api.auth_routes import (
    router as auth_router
)

from app.api.stream_routes import (
    router as stream_router
)


from app.core.config import CORS_ORIGINS

app = FastAPI(
    title="OpenOrbit Chatbot"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(chat_router)

app.include_router(auth_router)

app.include_router(
    stream_router
)

@app.on_event("startup")
async def startup():

    async with engine.begin() as conn:

        await conn.run_sync(
            Base.metadata.create_all
        )



@app.get("/")
async def root():

    return {
        "message": "OpenOrbit Chatbot API"
    }
