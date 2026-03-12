from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.schemas.common import Timestamped


class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role: str = "analyst"


class UserCreate(UserBase):
    password: str


class UserOut(UserBase, Timestamped):
    id: int
    is_active: bool


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class MeResponse(UserOut):
    pass
