from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, Field
from datetime import datetime

# Base schemas for prompt elements of different modalities
class TextModalityBase(BaseModel):
    type: str = "text"
    content: str
    role: Optional[str] = None
    variables: Optional[List[str]] = None

class ImageModalityBase(BaseModel):
    type: str = "image"
    url: Optional[str] = None
    data: Optional[str] = None  # Base64
    alt_text: Optional[str] = None

class AudioModalityBase(BaseModel):
    type: str = "audio"
    url: Optional[str] = None
    data: Optional[str] = None  # Base64
    duration: Optional[float] = None

# Prompt element - can be text, image, or audio
PromptElement = Union[TextModalityBase, ImageModalityBase, AudioModalityBase]

# Base schema for prompt
class PromptBase(BaseModel):
    name: str
    description: Optional[str] = None
    content: List[Dict[str, Any]]
    template_id: Optional[int] = None

# Schema for creating a prompt
class PromptCreate(PromptBase):
    pass

# Schema for updating a prompt
class PromptUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    content: Optional[List[Dict[str, Any]]] = None
    template_id: Optional[int] = None
    create_version: Optional[bool] = False
    version_commit_message: Optional[str] = None

# Base schema for prompt version
class PromptVersionBase(BaseModel):
    content: List[Dict[str, Any]]
    commit_message: Optional[str] = None

# Schema for creating a prompt version
class PromptVersionCreate(PromptVersionBase):
    pass

# Schema for reading a prompt version
class PromptVersion(PromptVersionBase):
    id: int
    prompt_id: int
    version_number: int
    created_at: datetime
    user_id: int

    class Config:
        from_attributes = True

# Schema for reading a prompt
class Prompt(PromptBase):
    id: int
    version: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Schema for database operations with prompt
class PromptInDB(Prompt):
    pass

# Schema for list item representation of prompt
class PromptListItem(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    user_id: int
    version: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Schema for prompt with all versions
class PromptWithVersions(Prompt):
    versions: List[PromptVersion] = []
    
    class Config:
        from_attributes = True

# Schema for list of prompts
class PromptList(BaseModel):
    prompts: List[Prompt]
    total: int

# Модели для сравнительного тестирования промптов
class ComparisonResult(BaseModel):
    provider: str
    model: str
    response: Optional[str] = None
    error: Optional[str] = None
    metadata: Dict[str, Any]

class PromptComparisonResponse(BaseModel):
    prompt_id: int
    prompt_name: str
    results: List[ComparisonResult]

class ProviderModelPair(BaseModel):
    provider: str
    model: str

class PromptComparisonRequest(BaseModel):
    provider_models: List[ProviderModelPair]
    parameters: Dict[str, Any] = {}

# Alias for PromptCompare
PromptCompare = PromptComparisonRequest
