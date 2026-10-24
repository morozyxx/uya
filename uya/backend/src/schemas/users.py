from pydantic import BaseModel, EmailStr, Field

class SignUpSchema(BaseModel):
    username: str = Field(..., description="User`s username")
    password: str = Field(..., description="User`s password")
    email: EmailStr = Field(..., description="User`s email")

class SingInSchema(BaseModel):
    username: str = Field(..., description="User`s username")
    password: str = Field(..., description="User`s password")

class EditProfileSchema(BaseModel):
    username: str = Field(..., description="User`s username")
    old_password: str = Field(..., description="User`s old password")
    new_password: str = Field(..., description="User`s new password")
    email: EmailStr = Field(..., description="User`s email")

class AuthResponseSchema(BaseModel):
    username: str = Field(..., description="User`s username")
    email: EmailStr = Field(..., description="User`s email")
    user_id: int = Field(..., description="ID of user")

class TokenSchema(BaseModel):
    access_token: str = Field(..., description="Access token")
    token_type: str = "Bearer"

