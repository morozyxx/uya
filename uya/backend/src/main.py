import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import api_settings
from db import init_db
from endpoints import users, posts

async def api_lifespan(app):
    await init_db()
    yield

app = FastAPI(lifespan=api_lifespan)
app.add_middleware(
    CORSMiddleware
    , allow_origins=["http://localhost:3000"]
    , allow_credentials=True
    , allow_methods=["POST", "PATCH", "GET", "OPTIONS", "DELETE", "PUT"]
    , allow_headers=["*"]
)
app.include_router(users.router)
app.include_router(posts.router)

if __name__ == "__main__":
    uvicorn.run(
        "main:app"
        , host=api_settings.DOMAIN
        , port=api_settings.PORT
        , reload=api_settings.RELOAD
    )
