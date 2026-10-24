from pydantic import BaseModel, Field

class NewPostSchema(BaseModel):
    title: str = Field(..., description="Post title")
    description: str = Field(..., description="Post description")
    platform: str = Field(..., description="Post platform")
    link: str = Field(..., description="Post link")
    image: str = Field(..., description="Post image")

class PostSchema(BaseModel):
    id: int = Field(..., description="Post id")
    title: str = Field(..., description="Post title")
    description: str = Field(..., description="Post description")
    platform: str = Field(..., description="Post platform")
    link: str = Field(..., description="Post link")
    image: str = Field(..., description="Post image")

class AllPostsResponseSchema(BaseModel):
    title: str = Field(..., description="Post title")
    description: str = Field(..., description="Post description")
    platform: str = Field(..., description="Post platform")
    link: str = Field(..., description="Post link")
    image: str = Field(..., description="Post image")
    username: str = Field(..., description="Post user username")

class DeletePostSchema(BaseModel):
    id: int = Field(..., description="Post id")
