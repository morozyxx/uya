from typing import List
from pydantic import BaseModel, EmailStr, Field

from src.schemas.posts import PostSchema

class SignUpSchema(BaseModel):
    username: str = Field(
        ..., description="User`s username", pattern=r"^[A-Za-z0-9]+$"
    )
    password: str = Field(..., description="User`s password")
    email: EmailStr = Field(..., description="User`s email")

class SignInSchema(BaseModel):
    username: str = Field(..., description="User`s username")
    password: str = Field(..., description="User`s password")

class EditProfileSchema(BaseModel):
    username: str | None = Field(default=None, pattern=r"^[A-Za-z0-9]+$")
    old_password: str | None = None
    new_password: str | None = None
    email: EmailStr | None = None

class AuthResponseSchema(BaseModel):
    username: str = Field(..., description="User`s username")
    email: EmailStr = Field(..., description="User`s email")
    user_id: int = Field(..., description="ID of user")

class UserProfileSchema(BaseModel):
    username: str = Field(..., description="User`s username")

class UserProfileResponseSchema(BaseModel):
    username: str = Field(..., description="User`s username")
    posts: List[PostSchema] = Field(..., description="List of posts")

class TokenSchema(BaseModel):
    access_token: str = Field(..., description="Access token")
    token_type: str = "Bearer"
