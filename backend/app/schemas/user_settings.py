from pydantic import BaseModel

class UserSettingsBase(BaseModel):
    openai_key: str | None = None
    anthropic_key: str | None = None
    mistral_key: str | None = None
    google_key: str | None = None

class UserSettingsCreate(UserSettingsBase):
    pass

class UserSettingsUpdate(UserSettingsBase):
    pass

class UserSettings(UserSettingsBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True 