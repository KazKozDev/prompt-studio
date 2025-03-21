from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_active_user
from app.db.models.user import User
from app.db.models.user_settings import UserSettings
from pydantic import BaseModel

router = APIRouter()

class UserSettingsSchema(BaseModel):
    openai_key: str = None
    anthropic_key: str = None
    mistral_key: str = None
    google_key: str = None
    cohere_key: str = None
    groq_key: str = None

@router.get("/settings", response_model=UserSettingsSchema)
def get_user_settings(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Получить настройки текущего пользователя.
    """
    # Проверить, существуют ли настройки для пользователя
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    
    # Если настроек нет, создать их
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return UserSettingsSchema(
        openai_key=settings.openai_key or "",
        anthropic_key=settings.anthropic_key or "",
        mistral_key=settings.mistral_key or "",
        google_key=settings.google_key or "",
        cohere_key=settings.cohere_key or "",
        groq_key=settings.groq_key or ""
    )

@router.put("/settings", response_model=UserSettingsSchema)
def update_user_settings(
    settings_update: UserSettingsSchema,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Обновить настройки текущего пользователя.
    """
    # Получить существующие настройки
    db_settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    
    # Если настроек нет, создать их
    if not db_settings:
        db_settings = UserSettings(user_id=current_user.id)
        db.add(db_settings)
    
    # Обновить настройки
    db_settings.openai_key = settings_update.openai_key
    db_settings.anthropic_key = settings_update.anthropic_key
    db_settings.mistral_key = settings_update.mistral_key
    db_settings.google_key = settings_update.google_key
    db_settings.cohere_key = settings_update.cohere_key
    db_settings.groq_key = settings_update.groq_key
    
    # Сохранить изменения
    db.commit()
    db.refresh(db_settings)
    
    return UserSettingsSchema(
        openai_key=db_settings.openai_key or "",
        anthropic_key=db_settings.anthropic_key or "",
        mistral_key=db_settings.mistral_key or "",
        google_key=db_settings.google_key or "",
        cohere_key=db_settings.cohere_key or "",
        groq_key=db_settings.groq_key or ""
    ) 