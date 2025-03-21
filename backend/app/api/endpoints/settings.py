from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.api import deps
from app.models.user import User

router = APIRouter()

@router.get("/api-keys", response_model=schemas.UserSettings)
def get_api_keys(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get API keys for the current user.
    """
    settings = crud.user_settings.get_by_user_id(db, user_id=current_user.id)
    if not settings:
        settings = crud.user_settings.create_with_user(
            db, obj_in=schemas.UserSettingsCreate(), user_id=current_user.id
        )
    return settings

@router.post("/api-keys", response_model=schemas.UserSettings)
def update_api_keys(
    *,
    db: Session = Depends(deps.get_db),
    settings_in: schemas.UserSettingsUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update API keys for the current user.
    """
    settings = crud.user_settings.get_by_user_id(db, user_id=current_user.id)
    if not settings:
        settings = crud.user_settings.create_with_user(
            db, obj_in=settings_in, user_id=current_user.id
        )
    else:
        settings = crud.user_settings.update(db, db_obj=settings, obj_in=settings_in)
    return settings 