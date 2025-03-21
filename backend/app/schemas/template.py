from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from datetime import datetime

# Schema for template element structure
class TemplateElementSchema(BaseModel):
    type: str  # text, image, audio
    required: bool = False
    default_value: Optional[Any] = None
    placeholder: Optional[str] = None
    description: Optional[str] = None
    constraints: Optional[Dict[str, Any]] = None

# Base schema for template
class TemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    structure: Dict[str, TemplateElementSchema]
    is_public: bool = False

# Schema for creating a template
class TemplateCreate(TemplateBase):
    pass

# Schema for updating a template
class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    structure: Optional[Dict[str, TemplateElementSchema]] = None
    is_public: Optional[bool] = None

# Schema for template category
class TemplateCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

# Schema for creating a template category
class TemplateCategoryCreate(TemplateCategoryBase):
    pass

# Schema for reading a template category
class TemplateCategory(TemplateCategoryBase):
    id: int

    class Config:
        from_attributes = True

# Schema for reading a template
class Template(TemplateBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    user_id: int
    categories: List[TemplateCategory] = []

    class Config:
        from_attributes = True

# Schema for database operations with template
class TemplateInDB(Template):
    pass

# Schema for public template representation (without user specific data)
class TemplatePublic(TemplateBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    categories: List[TemplateCategory] = []

    class Config:
        from_attributes = True

# Schema for list of templates
class TemplateList(BaseModel):
    templates: List[Template]
    total: int
