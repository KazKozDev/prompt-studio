from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base

class PromptAnalytics(Base):
    __tablename__ = "prompt_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime(timezone=True), server_default=func.now())
    metrics = Column(JSON, nullable=False)  # Various usage and effectiveness metrics
    
    # Prompt relationship
    prompt_id = Column(Integer, ForeignKey("prompts.id"), nullable=False)
    prompt = relationship("Prompt", back_populates="analytics")
    
    # User relationship
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="prompt_analytics")
    
    # Provider info
    provider = Column(String, nullable=True)
    
    # Additional metrics
    usage_count = Column(Integer, default=0)
    average_response_time = Column(Float, nullable=True)
    average_token_count = Column(Integer, nullable=True)
    estimated_cost = Column(Float, nullable=True)
