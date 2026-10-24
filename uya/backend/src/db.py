from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base

from src.config import database_settings

engine = create_async_engine(
    url=database_settings.DB_URL
    , echo=database_settings.ECHO
)

SessionLocal = async_sessionmaker(
    bind=engine
    , expire_on_commit=False
)

Base = declarative_base()

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_session():
    async with SessionLocal() as session:
        yield session
