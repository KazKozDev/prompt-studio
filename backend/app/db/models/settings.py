from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    openai_key = Column(String)
    anthropic_key = Column(String)
    mistral_key = Column(String)
    google_key = Column(String)

    user = relationship("User", back_populates="settings") 