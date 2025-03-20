from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

# Base schema with shared attributes
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    is_superuser: bool = False
    full_name: Optional[str] = None

# Schema for creating a user
class UserCreate(UserBase):
    email: EmailStr
    password: str

# Schema for login
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Schema for updating a user
class UserUpdate(UserBase):
    password: Optional[str] = None

# Schema for reading user data from DB
class UserInDBBase(UserBase):
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        populate_by_name = True

# Schema for returning user through API
class User(UserInDBBase):
    pass

# Schema for storing user in DB (including password hash)
class UserInDB(UserInDBBase):
    hashed_password: str
