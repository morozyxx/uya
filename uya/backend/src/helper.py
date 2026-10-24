import bcrypt, jwt
from datetime import datetime, timedelta

from src.schemas.users import TokenSchema
from src.config import api_settings

def hash_pwd(password: str) -> str:
    return bcrypt.hashpw(
        password.encode("utf-8")
        , bcrypt.gensalt(12)
    ).decode("utf-8")

def verify_pwd(pwd: str, hashed_pwd: str) -> bool:
    return bcrypt.checkpw(
        pwd.encode("utf-8")
        , hashed_pwd.encode("utf-8")
    )


def create_token(
        data: dict
        , key: str = api_settings.JWT_SECRET
        , algorithm: str = "HS256"
) -> TokenSchema:
    to_encode = data.copy()
    to_encode.update({"exp": datetime.utcnow() + timedelta(minutes=15)})
    token = jwt.encode(
        payload=to_encode
        , key=key
        , algorithm=algorithm
    )
    return TokenSchema.model_validate({"access_token": token})

def decode_token(
        token: str
        , key: str = api_settings.JWT_SECRET
        , algorithm: str = "HS256"
) -> dict | None:
    decoded_data = jwt.decode(
        jwt=token
        , key=key
        , algorithms=[algorithm]
    )

    return decoded_data if decoded_data else None

