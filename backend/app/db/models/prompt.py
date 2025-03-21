from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base

class Prompt(Base):
    __tablename__ = "prompts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    content = Column(JSON, nullable=False)  # Will store multimodal prompt structure
    version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # User relationship
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="prompts")
    
    # Template relationship (optional)
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=True)
    template = relationship("Template", back_populates="prompts")
    
    # Relationships to other tables
    versions = relationship("PromptVersion", back_populates="prompt", cascade="all, delete-orphan")
    tests = relationship("Test", back_populates="prompt", cascade="all, delete-orphan")
    analytics = relationship("PromptAnalytics", back_populates="prompt", cascade="all, delete-orphan")

class PromptVersion(Base):
    __tablename__ = "prompt_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    version_number = Column(Integer, nullable=False)
    content = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Prompt relationship
    prompt_id = Column(Integer, ForeignKey("prompts.id"), nullable=False)
    prompt = relationship("Prompt", back_populates="versions")
    
    # Version metadata
    commit_message = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User")
