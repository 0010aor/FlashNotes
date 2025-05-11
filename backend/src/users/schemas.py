import uuid
from typing import Optional

from pydantic import EmailStr
from sqlmodel import Field, SQLModel


class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False


class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)


class UserCreate(UserBase):
    password: Optional[str] = Field(default=None, min_length=8, max_length=40)
    auth0_id: Optional[str] = None


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)


class UserPublic(UserBase):
    id: uuid.UUID
    auth0_id: Optional[str] = None
