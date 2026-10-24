from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

load_dotenv()


class ApiSettings(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    DOMAIN: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = False
    JWT_SECRET: str

api_settings = ApiSettings()


class DatabaseSettings(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    DB_URL: str
    ECHO: bool = False

database_settings = DatabaseSettings()
