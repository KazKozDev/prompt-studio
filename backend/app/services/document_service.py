import json
import logging
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_, func
import numpy as np

from app.db.models.document import Document, DocumentChunk, DocumentCollection
from app.db.models.user import User
from app.services.embedding_service import EmbeddingService

logger = logging.getLogger(__name__)

class DocumentService:
    """Сервис для управления документами, коллекциями и поиска"""
    
    def __init__(
        self,
        db: Session,
        embedding_service: Optional[EmbeddingService] = None
    ):
        self.db = db
        self.embedding_service = embedding_service or EmbeddingService()
    
    # --- Управление документами ---
    
    async def create_document(
        self,
        user_id: int,
        document_metadata: Dict[str, Any],
        chunks: List[Dict[str, Any]],
        collection_id: Optional[int] = None
    ) -> Document:
        """
        Создает новый документ и его чанки в базе данных
        
        Args:
            user_id: ID пользователя-владельца
            document_metadata: Метаданные документа
            chunks: Список чанков документа
            collection_id: ID коллекции (опционально)
            
        Returns:
            Созданный документ
        """
        try:
            # Создаем документ
            document = Document(
                filename=document_metadata.get("filename", ""),
                file_type=document_metadata.get("file_type", ""),
                file_size=document_metadata.get("file_size", 0),
                file_path=document_metadata.get("file_path", ""),
                content_hash=document_metadata.get("content_hash", ""),
                title=document_metadata.get("metadata", {}).get("title", ""),
                author=document_metadata.get("metadata", {}).get("author", ""),
                metadata=document_metadata.get("metadata", {}),
                user_id=user_id,
                is_processed=False
            )
            
            self.db.add(document)
            self.db.commit()
            self.db.refresh(document)
            
            # Генерируем эмбеддинги для чанков
            if self.embedding_service and chunks:
                chunks_with_embeddings = await self.embedding_service.generate_chunks_embeddings(chunks)
            else:
                chunks_with_embeddings = chunks
            
            # Создаем чанки
            document_chunks = []
            for chunk_data in chunks_with_embeddings:
                chunk = DocumentChunk(
                    document_id=document.id,
                    chunk_index=chunk_data.get("chunk_index", 0),
                    content=chunk_data.get("content", ""),
                    start_char_idx=chunk_data.get("start_char_idx"),
                    end_char_idx=chunk_data.get("end_char_idx"),
                    page_number=chunk_data.get("page_number"),
                    metadata=chunk_data.get("metadata", {}),
                    embedding=chunk_data.get("embedding"),
                    embedding_model=chunk_data.get("embedding_model")
                )
                self.db.add(chunk)
                document_chunks.append(chunk)
            
            # Если указан ID коллекции, добавляем документ в коллекцию
            if collection_id:
                collection = self.db.query(DocumentCollection).filter(
                    DocumentCollection.id == collection_id,
                    DocumentCollection.user_id == user_id
                ).first()
                
                if collection:
                    document.collections.append(collection)
            
            # Отмечаем документ как обработанный
            document.is_processed = True
            document.processing_error = None
            
            self.db.commit()
            self.db.refresh(document)
            
            return document
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating document: {str(e)}")
            raise
    
    def get_document(self, document_id: int, user_id: int) -> Optional[Document]:
        """
        Получает документ по ID
        
        Args:
            document_id: ID документа
            user_id: ID пользователя для проверки доступа
            
        Returns:
            Документ или None, если не найден
        """
        return self.db.query(Document).filter(
            Document.id == document_id,
            Document.user_id == user_id
        ).first()
    
    def get_documents(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 100,
        collection_id: Optional[int] = None,
        search_query: Optional[str] = None
    ) -> Tuple[List[Document], int]:
        """
        Получает список документов пользователя с опциональной фильтрацией
        
        Args:
            user_id: ID пользователя
            skip: Сколько записей пропустить
            limit: Максимальное количество записей
            collection_id: ID коллекции для фильтрации
            search_query: Строка поиска
            
        Returns:
            Кортеж (список документов, общее количество)
        """
        query = self.db.query(Document).filter(Document.user_id == user_id)
        
        # Фильтрация по коллекции
        if collection_id:
            query = query.join(Document.collections).filter(DocumentCollection.id == collection_id)
        
        # Поиск по имени файла, заголовку или автору
        if search_query:
            search_filter = or_(
                Document.filename.ilike(f"%{search_query}%"),
                Document.title.ilike(f"%{search_query}%"),
                Document.author.ilike(f"%{search_query}%")
            )
            query = query.filter(search_filter)
        
        # Получаем общее количество
        total = query.count()
        
        # Пагинация и сортировка
        documents = query.order_by(desc(Document.created_at)).offset(skip).limit(limit).all()
        
        return documents, total
    
    def delete_document(self, document_id: int, user_id: int) -> bool:
        """
        Удаляет документ по ID
        
        Args:
            document_id: ID документа
            user_id: ID пользователя для проверки доступа
            
        Returns:
            True, если документ успешно удален, иначе False
        """
        document = self.db.query(Document).filter(
            Document.id == document_id,
            Document.user_id == user_id
        ).first()
        
        if not document:
            return False
        
        # Удаляем документ (чанки удалятся каскадно)
        self.db.delete(document)
        self.db.commit()
        
        return True
    
    # --- Управление коллекциями ---
    
    def create_collection(
        self,
        user_id: int,
        name: str,
        description: Optional[str] = None
    ) -> DocumentCollection:
        """
        Создает новую коллекцию документов
        
        Args:
            user_id: ID пользователя-владельца
            name: Название коллекции
            description: Описание коллекции
            
        Returns:
            Созданная коллекция
        """
        collection = DocumentCollection(
            name=name,
            description=description,
            user_id=user_id
        )
        
        self.db.add(collection)
        self.db.commit()
        self.db.refresh(collection)
        
        return collection
    
    def get_collections(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 100,
        search_query: Optional[str] = None
    ) -> Tuple[List[DocumentCollection], int]:
        """
        Получает список коллекций пользователя
        
        Args:
            user_id: ID пользователя
            skip: Сколько записей пропустить
            limit: Максимальное количество записей
            search_query: Строка поиска
            
        Returns:
            Кортеж (список коллекций, общее количество)
        """
        query = self.db.query(DocumentCollection).filter(DocumentCollection.user_id == user_id)
        
        # Поиск по названию или описанию
        if search_query:
            search_filter = or_(
                DocumentCollection.name.ilike(f"%{search_query}%"),
                DocumentCollection.description.ilike(f"%{search_query}%")
            )
            query = query.filter(search_filter)
        
        # Получаем общее количество
        total = query.count()
        
        # Пагинация и сортировка
        collections = query.order_by(desc(DocumentCollection.created_at)).offset(skip).limit(limit).all()
        
        return collections, total
    
    def delete_collection(self, collection_id: int, user_id: int) -> bool:
        """
        Удаляет коллекцию по ID
        
        Args:
            collection_id: ID коллекции
            user_id: ID пользователя для проверки доступа
            
        Returns:
            True, если коллекция успешно удалена, иначе False
        """
        collection = self.db.query(DocumentCollection).filter(
            DocumentCollection.id == collection_id,
            DocumentCollection.user_id == user_id
        ).first()
        
        if not collection:
            return False
        
        # Удаляем коллекцию (связи с документами удалятся автоматически)
        self.db.delete(collection)
        self.db.commit()
        
        return True
    
    def add_document_to_collection(
        self,
        document_id: int,
        collection_id: int,
        user_id: int
    ) -> bool:
        """
        Добавляет документ в коллекцию
        
        Args:
            document_id: ID документа
            collection_id: ID коллекции
            user_id: ID пользователя для проверки доступа
            
        Returns:
            True, если документ успешно добавлен, иначе False
        """
        document = self.db.query(Document).filter(
            Document.id == document_id,
            Document.user_id == user_id
        ).first()
        
        collection = self.db.query(DocumentCollection).filter(
            DocumentCollection.id == collection_id,
            DocumentCollection.user_id == user_id
        ).first()
        
        if not document or not collection:
            return False
        
        # Проверяем, не добавлен ли документ уже в коллекцию
        if collection in document.collections:
            return True
        
        # Добавляем документ в коллекцию
        document.collections.append(collection)
        self.db.commit()
        
        return True
    
    def remove_document_from_collection(
        self,
        document_id: int,
        collection_id: int,
        user_id: int
    ) -> bool:
        """
        Удаляет документ из коллекции
        
        Args:
            document_id: ID документа
            collection_id: ID коллекции
            user_id: ID пользователя для проверки доступа
            
        Returns:
            True, если документ успешно удален из коллекции, иначе False
        """
        document = self.db.query(Document).filter(
            Document.id == document_id,
            Document.user_id == user_id
        ).first()
        
        collection = self.db.query(DocumentCollection).filter(
            DocumentCollection.id == collection_id,
            DocumentCollection.user_id == user_id
        ).first()
        
        if not document or not collection:
            return False
        
        # Проверяем, есть ли документ в коллекции
        if collection not in document.collections:
            return True
        
        # Удаляем документ из коллекции
        document.collections.remove(collection)
        self.db.commit()
        
        return True
    
    # --- Поиск ---
    
    async def search_relevant_chunks(
        self,
        query: str,
        user_id: int,
        collection_ids: Optional[List[int]] = None,
        document_ids: Optional[List[int]] = None,
        max_chunks: int = 5,
        min_similarity: float = 0.5,
        provider: str = "openai",
        model: str = "text-embedding-3-small"
    ) -> List[Dict[str, Any]]:
        """
        Ищет релевантные чанки документов на основе векторного поиска
        
        Args:
            query: Текстовый запрос
            user_id: ID пользователя
            collection_ids: IDs коллекций для поиска
            document_ids: IDs документов для поиска
            max_chunks: Максимальное количество возвращаемых чанков
            min_similarity: Минимальное сходство для включения чанка в результаты
            provider: Провайдер для генерации эмбеддингов
            model: Модель для генерации эмбеддингов
            
        Returns:
            Список словарей с информацией о релевантных чанках
        """
        # Создаем эмбеддинг для запроса
        embedding_service = EmbeddingService(provider=provider, model=model)
        query_embeddings = await embedding_service.generate_embeddings([query])
        
        if not query_embeddings or len(query_embeddings) == 0:
            return []
        
        query_embedding = query_embeddings[0]
        
        # Получаем чанки документов пользователя
        chunks_query = self.db.query(DocumentChunk).join(Document).filter(Document.user_id == user_id)
        
        # Фильтрация по коллекциям
        if collection_ids:
            chunks_query = chunks_query.join(Document.collections).filter(
                DocumentCollection.id.in_(collection_ids)
            ).group_by(DocumentChunk.id)
        
        # Фильтрация по документам
        if document_ids:
            chunks_query = chunks_query.filter(Document.id.in_(document_ids))
        
        # Получаем все чанки
        chunks = chunks_query.all()
        
        # Вычисляем сходство с запросом для каждого чанка
        chunk_similarities = []
        for chunk in chunks:
            if not chunk.embedding:
                continue
            
            # Десериализуем эмбеддинг из JSON-строки
            chunk_embedding = json.loads(chunk.embedding)
            
            # Вычисляем косинусное сходство
            similarity = embedding_service.similarity(query_embedding, chunk_embedding)
            
            if similarity >= min_similarity:
                chunk_similarities.append({
                    "chunk": chunk,
                    "similarity": similarity
                })
        
        # Сортируем по убыванию сходства и берем top-N результатов
        chunk_similarities.sort(key=lambda x: x["similarity"], reverse=True)
        top_chunks = chunk_similarities[:max_chunks]
        
        # Форматируем результаты
        results = []
        for item in top_chunks:
            chunk = item["chunk"]
            document = chunk.document
            
            results.append({
                "chunk_id": chunk.id,
                "document_id": document.id,
                "document_filename": document.filename,
                "document_title": document.title or document.filename,
                "content": chunk.content,
                "similarity": item["similarity"],
                "metadata": {
                    "chunk_index": chunk.chunk_index,
                    "page_number": chunk.page_number,
                    "document_type": document.file_type,
                }
            })
        
        return results 