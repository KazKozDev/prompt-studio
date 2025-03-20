from typing import Optional
from datetime import timedelta
from sqlalchemy.orm import Session

from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.db.models.user import User

def authenticate(db: Session, *, email: str, password: str) -> Optional[User]:
    """Authenticate user by email and password"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def create_user(db: Session, *, email: str, password: str, full_name: Optional[str] = None, 
                is_superuser: bool = False) -> User:
    """Create a new user"""
    hashed_password = get_password_hash(password)
    user = User(
        email=email,
        hashed_password=hashed_password,
        full_name=full_name,
        is_superuser=is_superuser
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def generate_auth_token(user_id: int) -> str:
    """Generate JWT token for a user"""
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return create_access_token(
        subject=user_id, expires_delta=access_token_expires
    )
