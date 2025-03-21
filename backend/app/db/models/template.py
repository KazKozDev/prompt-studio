from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base

# Association table for templates and categories
template_category_association = Table(
    "template_category_association",
    Base.metadata,
    Column("template_id", Integer, ForeignKey("templates.id"), primary_key=True),
    Column("category_id", Integer, ForeignKey("template_categories.id"), primary_key=True),
)

class Template(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    structure = Column(JSON, nullable=False)  # Template structure
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # User relationship
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="templates")
    
    # Relationships to other tables
    prompts = relationship("Prompt", back_populates="template")
    
    # Categories (many-to-many)
    categories = relationship("TemplateCategory", secondary=template_category_association, backref="templates")

class TemplateCategory(Base):
    __tablename__ = "template_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
