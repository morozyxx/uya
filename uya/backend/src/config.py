import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
load_dotenv()

class ApiSettings(BaseSettings):
    DOMAIN: str = os.getenv("DOMAIN")
    PORT: int = int(os.getenv("PORT"))
    RELOAD: bool = False
    JWT_SECRET: str = os.getenv("JWT_SECRET")

api_settings = ApiSettings()


class DatabaseSettings(BaseSettings):
    DB_URL: str = f"{os.getenv("DB_URL")}"
    DB_PROTOCOL: str = os.getenv("DB_PROTOCOL")
    DB_HOST: str = os.getenv("DB_HOST")
    DB_PORT: int = int(os.getenv("DB_PORT"))
    DB_NAME: str = os.getenv("DB_NAME")
    DB_USER: str = os.getenv("DB_USER")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD")
    ECHO: bool = False

database_settings = DatabaseSettings()
