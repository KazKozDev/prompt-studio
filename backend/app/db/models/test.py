from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base

class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, index=True, default="draft")  # draft, running, completed, stopped
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Test configuration
    test_config = Column(JSON, nullable=False)  # A/B test settings
    
    # Prompt relationship
    prompt_id = Column(Integer, ForeignKey("prompts.id"), nullable=False)
    prompt = relationship("Prompt", back_populates="tests")
    
    # User relationship
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User")
    
    # Test variants
    variants = relationship("TestVariant", back_populates="test", cascade="all, delete-orphan")
    
    # Test results
    results = relationship("TestResult", back_populates="test", cascade="all, delete-orphan")

class TestVariant(Base):
    __tablename__ = "test_variants"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    content = Column(JSON, nullable=False)  # Variant prompt content
    
    # Test relationship
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False)
    test = relationship("Test", back_populates="variants")
    
    # Results for this variant
    results = relationship("TestResult", back_populates="variant")

class TestResult(Base):
    __tablename__ = "test_results"
    
    id = Column(Integer, primary_key=True, index=True)
    metrics = Column(JSON, nullable=False)  # Various performance metrics
    response = Column(JSON, nullable=True)  # Response from the model
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False)
    test = relationship("Test", back_populates="results")
    
    variant_id = Column(Integer, ForeignKey("test_variants.id"), nullable=False)
    variant = relationship("TestVariant", back_populates="results")
