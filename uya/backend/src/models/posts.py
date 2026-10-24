from sqlalchemy import Integer, ForeignKey, VARCHAR, Text
from sqlalchemy.orm import Mapped, mapped_column

from db import Base

class PostsORM(Base):
    __tablename__ = "posts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(VARCHAR(128), nullable=False)
    description: Mapped[str] = mapped_column(VARCHAR(512), nullable=False)
    platform: Mapped[str] = mapped_column(VARCHAR(128), nullable=False)
    link: Mapped[str] = mapped_column(Text, nullable=False)
    image: Mapped[str] = mapped_column(Text, nullable=False)
    likes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
