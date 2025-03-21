from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base

class UserSettings(Base):
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    user = relationship("User", back_populates="settings")
    
    # API keys
    openai_key = Column(String, nullable=True)
    anthropic_key = Column(String, nullable=True)
    mistral_key = Column(String, nullable=True)
    google_key = Column(String, nullable=True)
    
    # Settings
    theme = Column(String, default="light")
    notifications_enabled = Column(Boolean, default=True)
    auto_save = Column(Boolean, default=True) 