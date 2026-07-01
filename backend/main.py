"""FastAPI application entrypoint with Socket.IO mounted."""
import socketio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import minds, chat, compare, sources, build
from cognee_layer import initialize_cognee
from config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize Cognee on app startup."""
    await initialize_cognee()
    yield


sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

app = FastAPI(
    title="Persona API",
    description="Intellectual graph platform for historical minds",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(minds.router, prefix="/api/minds", tags=["minds"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(compare.router, prefix="/api/compare", tags=["compare"])
app.include_router(sources.router, prefix="/api/sources", tags=["sources"])
app.include_router(build.router, prefix="/api/build", tags=["build"])

# Mount Socket.IO on the ASGI app
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)
