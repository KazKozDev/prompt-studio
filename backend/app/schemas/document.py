from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
from datetime import datetime

# Схемы для работы с документами

class DocumentBase(BaseModel):
    filename: str
    title: Optional[str] = None
    author: Optional[str] = None
    description: Optional[str] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    description: Optional[str] = None

class DocumentRead(DocumentBase):
    id: int
    file_type: str
    file_size: int
    processing_status: str
    processing_error: Optional[str] = None
    chunks_count: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Схемы для работы с чанками документов

class DocumentChunkBase(BaseModel):
    content: str
    chunk_index: int
    page_number: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None

class DocumentChunkCreate(DocumentChunkBase):
    document_id: int

class DocumentChunkRead(DocumentChunkBase):
    id: int
    document_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Схемы для работы с коллекциями документов

class DocumentCollectionBase(BaseModel):
    name: str
    description: Optional[str] = None

class DocumentCollectionCreate(DocumentCollectionBase):
    pass

class DocumentCollectionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class DocumentCollectionRead(DocumentCollectionBase):
    id: int
    documents_count: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Схемы для поиска в документах

class DocumentSearchParams(BaseModel):
    query: str
    document_ids: Optional[List[int]] = None
    collection_ids: Optional[List[int]] = None
    max_chunks: Optional[int] = 5
    min_similarity: Optional[float] = 0.7

class SearchResultItem(BaseModel):
    document_id: int
    document_title: str
    content: str
    similarity: float
    metadata: Optional[Dict[str, Any]] = None

class DocumentSearchResult(BaseModel):
    query: str
    results: List[SearchResultItem]
    count: int 