from typing import Optional
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.db.models.user_settings import UserSettings
from app.schemas.user_settings import UserSettingsCreate, UserSettingsUpdate

class CRUDUserSettings(CRUDBase[UserSettings, UserSettingsCreate, UserSettingsUpdate]):
    def get_by_user_id(self, db: Session, *, user_id: int) -> Optional[UserSettings]:
        return db.query(UserSettings).filter(UserSettings.user_id == user_id).first()

    def create_with_user(
        self, db: Session, *, obj_in: UserSettingsCreate, user_id: int
    ) -> UserSettings:
        db_obj = UserSettings(
            user_id=user_id,
            openai_key=obj_in.openai_key,
            anthropic_key=obj_in.anthropic_key,
            mistral_key=obj_in.mistral_key,
            google_key=obj_in.google_key
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

user_settings = CRUDUserSettings(UserSettings) 