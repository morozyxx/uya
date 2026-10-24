from sqlalchemy import Integer, VARCHAR, Text
from sqlalchemy.orm import Mapped, mapped_column

from db import Base

class UsersORM(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(VARCHAR(32), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(Text, nullable=False)
    email: Mapped[str] = mapped_column(VARCHAR(128), nullable=False)
