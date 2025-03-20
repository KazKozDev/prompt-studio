import os
import json
import logging
import shutil
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, Body
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.api import deps
from app.db.models.user import User
from app.db.models.document import Document, DocumentCollection
from app.services.document_processor import DocumentProcessor
from app.services.document_service import DocumentService
from app.services.embedding_service import EmbeddingService

# Настройка логгера
logger = logging.getLogger(__name__)

# Инициализация роутера
router = APIRouter()

# API эндпоинты для системы RAG

@router.post("/documents/upload", response_model=Dict[str, Any])
async def upload_document(
    file: UploadFile = File(...),
    collection_id: Optional[int] = Form(None),
    chunk_size: Optional[int] = Form(1000),
    chunk_overlap: Optional[int] = Form(200),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Загружает документ, обрабатывает его и сохраняет в базе данных
    """
    try:
        # Проверяем расширение файла
        processor = DocumentProcessor(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        
        # Читаем содержимое файла
        file_content = await file.read()
        
        # Проверяем, что файл не пустой
        if not file_content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
        
        # Обрабатываем документ
        document_data = await processor.process_document(
            file_content=file_content,
            filename=file.filename,
            content_type=file.content_type
        )
        
        # Создаем сервис для работы с документами
        document_service = DocumentService(db)
        
        # Сохраняем документ в базе данных
        document = await document_service.create_document(
            user_id=current_user.id,
            document_metadata=document_data,
            chunks=document_data["chunks"],
            collection_id=collection_id
        )
        
        # Возвращаем информацию о созданном документе
        return {
            "success": True,
            "document_id": document.id,
            "filename": document.filename,
            "file_type": document.file_type,
            "file_size": document.file_size,
            "chunks_count": len(document.chunks),
            "collection_id": collection_id
        }
        
    except ValueError as e:
        logger.error(f"Value error during document upload: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error during document upload: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

@router.get("/documents", response_model=Dict[str, Any])
async def get_documents(
    skip: int = 0,
    limit: int = 20,
    collection_id: Optional[int] = None,
    search_query: Optional[str] = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Получает список документов пользователя с опциональной фильтрацией
    """
    try:
        document_service = DocumentService(db)
        
        # Получаем документы
        documents, total = document_service.get_documents(
            user_id=current_user.id,
            skip=skip,
            limit=limit,
            collection_id=collection_id,
            search_query=search_query
        )
        
        # Форматируем результат
        result = {
            "total": total,
            "items": [
                {
                    "id": doc.id,
                    "filename": doc.filename,
                    "file_type": doc.file_type,
                    "file_size": doc.file_size,
                    "title": doc.title,
                    "author": doc.author,
                    "created_at": doc.created_at.isoformat(),
                    "updated_at": doc.updated_at.isoformat(),
                    "is_processed": doc.is_processed,
                    "processing_error": doc.processing_error,
                    "chunks_count": len(doc.chunks),
                    "collections": [
                        {"id": col.id, "name": col.name}
                        for col in doc.collections
                    ]
                }
                for doc in documents
            ]
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Error retrieving documents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents/{document_id}", response_model=Dict[str, Any])
async def get_document(
    document_id: int,
    include_chunks: bool = False,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Получает детальную информацию о документе по его ID
    """
    try:
        document_service = DocumentService(db)
        
        # Получаем документ
        document = document_service.get_document(
            document_id=document_id,
            user_id=current_user.id
        )
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Форматируем результат
        result = {
            "id": document.id,
            "filename": document.filename,
            "file_type": document.file_type,
            "file_size": document.file_size,
            "title": document.title,
            "author": document.author,
            "metadata": document.metadata,
            "created_at": document.created_at.isoformat(),
            "updated_at": document.updated_at.isoformat(),
            "is_processed": document.is_processed,
            "processing_error": document.processing_error,
            "collections": [
                {"id": col.id, "name": col.name}
                for col in document.collections
            ]
        }
        
        # Включаем чанки, если запрошено
        if include_chunks:
            result["chunks"] = [
                {
                    "id": chunk.id,
                    "chunk_index": chunk.chunk_index,
                    "content": chunk.content,
                    "start_char_idx": chunk.start_char_idx,
                    "end_char_idx": chunk.end_char_idx,
                    "page_number": chunk.page_number,
                    "metadata": chunk.metadata
                }
                for chunk in document.chunks
            ]
        else:
            result["chunks_count"] = len(document.chunks)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/documents/{document_id}", response_model=Dict[str, bool])
async def delete_document(
    document_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Удаляет документ по его ID
    """
    try:
        document_service = DocumentService(db)
        
        # Удаляем документ
        success = document_service.delete_document(
            document_id=document_id,
            user_id=current_user.id
        )
        
        if not success:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return {"success": True}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/collections", response_model=Dict[str, Any])
async def create_collection(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Создает новую коллекцию документов
    """
    try:
        name = data.get("name")
        if not name:
            raise HTTPException(status_code=400, detail="Collection name is required")
        
        description = data.get("description", "")
        
        document_service = DocumentService(db)
        
        # Создаем коллекцию
        collection = document_service.create_collection(
            user_id=current_user.id,
            name=name,
            description=description
        )
        
        return {
            "id": collection.id,
            "name": collection.name,
            "description": collection.description,
            "created_at": collection.created_at.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating collection: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/collections", response_model=Dict[str, Any])
async def get_collections(
    skip: int = 0,
    limit: int = 20,
    search_query: Optional[str] = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Получает список коллекций документов пользователя
    """
    try:
        document_service = DocumentService(db)
        
        # Получаем коллекции
        collections, total = document_service.get_collections(
            user_id=current_user.id,
            skip=skip,
            limit=limit,
            search_query=search_query
        )
        
        # Форматируем результат
        result = {
            "total": total,
            "items": [
                {
                    "id": col.id,
                    "name": col.name,
                    "description": col.description,
                    "created_at": col.created_at.isoformat(),
                    "documents_count": len(col.documents)
                }
                for col in collections
            ]
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Error retrieving collections: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/collections/{collection_id}", response_model=Dict[str, bool])
async def delete_collection(
    collection_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Удаляет коллекцию документов по ее ID
    """
    try:
        document_service = DocumentService(db)
        
        # Удаляем коллекцию
        success = document_service.delete_collection(
            collection_id=collection_id,
            user_id=current_user.id
        )
        
        if not success:
            raise HTTPException(status_code=404, detail="Collection not found")
        
        return {"success": True}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting collection: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/collections/{collection_id}/add_document/{document_id}", response_model=Dict[str, bool])
async def add_document_to_collection(
    collection_id: int,
    document_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Добавляет документ в коллекцию
    """
    try:
        document_service = DocumentService(db)
        
        # Добавляем документ в коллекцию
        success = document_service.add_document_to_collection(
            document_id=document_id,
            collection_id=collection_id,
            user_id=current_user.id
        )
        
        if not success:
            raise HTTPException(status_code=404, detail="Document or collection not found")
        
        return {"success": True}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding document to collection: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/collections/{collection_id}/remove_document/{document_id}", response_model=Dict[str, bool])
async def remove_document_from_collection(
    collection_id: int,
    document_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Удаляет документ из коллекции
    """
    try:
        document_service = DocumentService(db)
        
        # Удаляем документ из коллекции
        success = document_service.remove_document_from_collection(
            document_id=document_id,
            collection_id=collection_id,
            user_id=current_user.id
        )
        
        if not success:
            raise HTTPException(status_code=404, detail="Document or collection not found")
        
        return {"success": True}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing document from collection: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/search", response_model=Dict[str, Any])
async def search_documents(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Выполняет семантический поиск по документам/коллекциям
    """
    try:
        # Получаем параметры запроса
        query = data.get("query")
        if not query:
            raise HTTPException(status_code=400, detail="Search query is required")
        
        collection_ids = data.get("collection_ids", [])
        document_ids = data.get("document_ids", [])
        max_chunks = data.get("max_chunks", 5)
        min_similarity = data.get("min_similarity", 0.5)
        provider = data.get("provider", "openai")
        model = data.get("model", "text-embedding-3-small")
        
        # Проверяем, что указаны либо коллекции, либо документы
        if not collection_ids and not document_ids:
            raise HTTPException(
                status_code=400, 
                detail="At least one collection_id or document_id must be specified"
            )
        
        # Создаем сервис документов
        document_service = DocumentService(db)
        
        # Выполняем поиск
        results = await document_service.search_relevant_chunks(
            query=query,
            user_id=current_user.id,
            collection_ids=collection_ids,
            document_ids=document_ids,
            max_chunks=max_chunks,
            min_similarity=min_similarity,
            provider=provider,
            model=model
        )
        
        return {
            "success": True,
            "query": query,
            "results": results,
            "count": len(results)
        }
        
    except Exception as e:
        logger.error(f"Error during document search: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 