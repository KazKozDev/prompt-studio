from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.services.auth import authenticate, create_user, generate_auth_token
from app.schemas.user import UserCreate, UserUpdate
from app.schemas.user import User as UserSchema
from app.db.models.user import User as UserModel

router = APIRouter()

@router.post("/login", response_model=dict)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """Get JWT access token for authentication"""
    user = authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    return {
        "access_token": generate_auth_token(user.id),
        "token_type": "bearer",
    }

@router.post("/register", response_model=UserSchema)
def register_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    """Register a new user"""
    user = db.query(UserModel).filter(UserModel.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists",
        )
    user = create_user(db, email=user_in.email, password=user_in.password, 
                       full_name=user_in.full_name)
    return user

@router.get("/me", response_model=UserSchema)
def read_current_user(
    current_user: UserModel = Depends(get_current_active_user),
) -> Any:
    """Get current user information"""
    return current_user
