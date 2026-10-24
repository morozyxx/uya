import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import api_settings
from src.db import init_db
from src.endpoints import users, posts

async def api_lifespan(app):
    await init_db()
    yield

app = FastAPI(lifespan=api_lifespan)
app.add_middleware(
    CORSMiddleware
    , allow_origins=["https://uya-highlights.vercel.app"]
    , allow_credentials=True
    , allow_methods=["POST", "PATCH", "GET", "OPTIONS", "DELETE", "PUT"]
    , allow_headers=["*"]
)
app.include_router(users.router, prefix="/api")
app.include_router(posts.router, prefix="/api")

if __name__ == "__main__":
    uvicorn.run(
        "src.main:app"
        , host=api_settings.DOMAIN
        , port=api_settings.PORT
        , reload=api_settings.RELOAD
    )
