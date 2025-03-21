from typing import List, Dict, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field, validator

# Схемы для чанков документов
class DocumentChunkBase(BaseModel):
    chunk_index: int
    content: str
    start_char_idx: Optional[int] = None
    end_char_idx: Optional[int] = None
    page_number: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None

class DocumentChunkCreate(DocumentChunkBase):
    pass

class DocumentChunk(DocumentChunkBase):
    id: int
    document_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Схемы для документов
class DocumentBase(BaseModel):
    filename: str
    file_type: str
    file_size: int
    title: Optional[str] = None
    author: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class DocumentCreate(DocumentBase):
    content_hash: str
    file_path: str
    chunks: List[DocumentChunkCreate]

class Document(DocumentBase):
    id: int
    user_id: int
    content_hash: str
    file_path: str
    is_processed: bool
    processing_error: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    chunks_count: Optional[int] = None
    chunks: Optional[List[DocumentChunk]] = None

    class Config:
        from_attributes = True

# Схемы для коллекций документов
class DocumentCollectionBase(BaseModel):
    name: str
    description: Optional[str] = None

class DocumentCollectionCreate(DocumentCollectionBase):
    pass

class DocumentCollectionUpdate(DocumentCollectionBase):
    pass

class DocumentCollection(DocumentCollectionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    documents_count: Optional[int] = None

    class Config:
        from_attributes = True

# Схемы для поиска документов
class SearchQuery(BaseModel):
    query: str
    collection_ids: Optional[List[int]] = None
    document_ids: Optional[List[int]] = None
    max_chunks: Optional[int] = Field(5, ge=1, le=20)
    min_similarity: Optional[float] = Field(0.5, ge=0, le=1.0)
    provider: Optional[str] = "openai"
    model: Optional[str] = "text-embedding-3-small"

class SearchResults(BaseModel):
    query: str
    results: List[Dict[str, Any]]
    count: int

# Схемы для RAG-тестирования
class RagTestCreate(BaseModel):
    prompt_variables: Dict[str, Any]
    collection_ids: Optional[List[int]] = None
    document_ids: Optional[List[int]] = None
    provider: str
    model: str
    max_chunks: Optional[int] = Field(5, ge=1, le=20)
    min_similarity: Optional[float] = Field(0.5, ge=0, le=1.0)
    embedding_provider: Optional[str] = "openai"
    embedding_model: Optional[str] = "text-embedding-3-small"
    temperature: Optional[float] = Field(0.7, ge=0, le=2.0)
    max_tokens: Optional[int] = Field(2048, ge=1, le=16000)
    top_p: Optional[float] = Field(1.0, ge=0, le=1.0)
    frequency_penalty: Optional[float] = Field(0.0, ge=0, le=2.0)
    presence_penalty: Optional[float] = Field(0.0, ge=0, le=2.0)
    
    @validator('prompt_variables')
    def validate_variables(cls, v):
        # Проверяем, что переменные содержат query или user_query для поиска
        if 'query' not in v and 'user_query' not in v:
            raise ValueError("prompt_variables должны содержать 'query' или 'user_query' для поиска релевантных документов")
        return v 