from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON, Table, Enum
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
import uuid

from app.db.base import Base

# Ассоциативная таблица для связи many-to-many между документами и коллекциями
document_collection_association = Table(
    "document_collection_association",
    Base.metadata,
    Column("document_id", Integer, ForeignKey("documents.id")),
    Column("collection_id", Integer, ForeignKey("document_collections.id")),
)

class ProcessingStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class DocumentCollection(Base):
    """Коллекция документов"""
    
    __tablename__ = "document_collections"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    
    # Даты создания и обновления
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Связи
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="document_collections")
    documents = relationship("Document", secondary=document_collection_association, back_populates="collections")
    
    @property
    def documents_count(self) -> int:
        """Возвращает количество документов в коллекции"""
        return len(self.documents) if self.documents else 0

class Document(Base):
    """Модель документа для системы RAG"""
    
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255))
    file_type = Column(String(50))  # pdf, docx, txt, и т.д.
    file_size = Column(Integer)
    file_path = Column(String(500))  # путь к файлу в системе
    content_hash = Column(String(64), unique=True)  # SHA-256 хеш содержимого
    title = Column(String, index=True)
    author = Column(String)
    doc_metadata = Column(JSON, nullable=True)  # JSON-метаданные о документе
    processing_status = Column(Enum(ProcessingStatus), default=ProcessingStatus.PENDING)
    
    # Даты создания и обновления
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Связи
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    collections = relationship("DocumentCollection", secondary=document_collection_association, back_populates="documents")

class DocumentChunk(Base):
    """Фрагмент документа с эмбеддингом для векторного поиска"""
    
    __tablename__ = "document_chunks"
    
    id = Column(Integer, primary_key=True, index=True)
    chunk_id = Column(String(255), default=lambda: str(uuid.uuid4()), unique=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    content = Column(Text)
    chunk_metadata = Column(JSON, nullable=True)  # JSON-метаданные о чанке
    embedding = Column(Text, nullable=True)  # Сохраняем векторное представление как JSON или используем специальный тип для векторов
    embedding_model = Column(String(255), nullable=True)  # Модель, использованная для создания эмбеддинга
    page_number = Column(Integer, nullable=True)  # Для документов с постраничной структурой
    chunk_order = Column(Integer)  # Порядок чанка в документе
    
    # Даты создания и обновления
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Связи
    document = relationship("Document", back_populates="chunks") 