from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    openai_key = Column(String, nullable=True)
    anthropic_key = Column(String, nullable=True)
    mistral_key = Column(String, nullable=True)
    google_key = Column(String, nullable=True)

    # Связь с пользователем
    user = relationship("User", back_populates="settings") 