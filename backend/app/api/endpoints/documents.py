from typing import Any, List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import os
import uuid
import logging
import re
import math
import numpy as np

from app.api.deps import get_current_user, get_db
from app.db.models.user import User
from app.db.models.document import Document, DocumentChunk, ProcessingStatus
from app.schemas.document import (
    DocumentCreate, 
    DocumentRead, 
    DocumentSearchParams,
    DocumentSearchResult,
    SearchResultItem
)
from app.services.document_processor import DocumentProcessor
from app.services.local_embedding_service import LocalEmbeddingService

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/upload", response_model=DocumentRead)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Загрузить новый документ и запустить его обработку.
    """
    try:
        logger.info(f"Началась загрузка файла: {file.filename}")
        
        # Проверка размера файла (5 МБ максимум)
        max_size = 5 * 1024 * 1024  # 5 МБ
        file_size = 0
        contents = bytearray()
        
        while True:
            chunk = await file.read(1024)
            if not chunk:
                break
            file_size += len(chunk)
            if file_size > max_size:
                logger.warning(f"Превышен размер файла {file.filename}: {file_size} > {max_size}")
                raise HTTPException(
                    status_code=400, 
                    detail="Размер файла превышает максимально допустимый (5 МБ)"
                )
            contents.extend(chunk)
        
        # Получение расширения файла
        _, file_extension = os.path.splitext(file.filename)
        file_extension = file_extension.lower().lstrip(".")
        
        # Проверка поддерживаемых типов файлов
        supported_formats = ['pdf', 'docx', 'txt', 'md', 'csv', 'json', 'html']
        if file_extension not in supported_formats:
            logger.warning(f"Неподдерживаемый формат файла: {file_extension}")
            raise HTTPException(
                status_code=400, 
                detail=f"Неподдерживаемый формат файла. Поддерживаемые форматы: {', '.join(supported_formats)}"
            )
        
        # Создание файла на диске
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        
        file_id = str(uuid.uuid4())
        filename = f"{file_id}.{file_extension}"
        file_path = os.path.join(upload_dir, filename)
        
        with open(file_path, "wb") as f:
            f.write(contents)
        
        logger.info(f"Файл сохранен на диск: {file_path}")
        
        # Создание записи в БД
        document = Document(
            filename=file.filename,
            file_type=file_extension,
            file_path=file_path,
            file_size=file_size,
            user_id=current_user.id,
            processing_status=ProcessingStatus.PENDING,
        )
        
        db.add(document)
        db.commit()
        db.refresh(document)
        
        logger.info(f"Создана запись документа в БД, ID: {document.id}")
        
        # Запуск асинхронной обработки документа
        try:
            logger.info(f"Начинаем обработку документа ID: {document.id}")
            
            if not document or not document.id:
                logger.error("Ошибка: документ не был корректно создан в БД")
                raise ValueError("Документ не был корректно создан в БД")
                
            processor = DocumentProcessor(document_id=document.id, db=db)
            logger.info(f"Создан процессор документов для ID: {document.id}")
            
            # В реальном приложении здесь была бы асинхронная обработка
            # Например, через Celery или другую систему очередей
            # Для примера сделаем синхронно
            success = processor.process()
            
            if not success:
                logger.error(f"Ошибка при обработке документа ID: {document.id}")
                # Проверяем результат после завершения
                updated_doc = db.query(Document).filter(Document.id == document.id).first()
                if updated_doc:
                    logger.info(f"Статус документа после обработки: {updated_doc.processing_status}, ошибка: {updated_doc.processing_error}")
        except Exception as e:
            logger.exception(f"Исключение при обработке документа ID: {document.id}: {str(e)}")
            document.processing_error = str(e)
            document.processing_status = ProcessingStatus.FAILED
            db.commit()
        
        # Получаем актуальное состояние документа
        db.refresh(document)
        logger.info(f"Финальный статус документа ID: {document.id}: {document.processing_status}")
        
        return document
    except Exception as e:
        logger.exception(f"Необработанная ошибка при загрузке документа: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при загрузке документа: {str(e)}"
        )

@router.get("/", response_model=List[DocumentRead])
def read_documents(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Получить список документов текущего пользователя.
    """
    documents = db.query(Document).filter(
        Document.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return documents

@router.get("/{document_id}", response_model=DocumentRead)
def read_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Получить документ по ID.
    """
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Документ не найден")
    
    return document

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Удалить документ.
    """
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Документ не найден")
    
    # Удаление файла с диска
    try:
        if os.path.exists(document.file_path):
            os.remove(document.file_path)
    except Exception as e:
        # Логгирование ошибки, но продолжаем удаление из БД
        print(f"Ошибка при удалении файла: {e}")
    
    # Удаление связанных чанков
    db.query(DocumentChunk).filter(DocumentChunk.document_id == document.id).delete()
    
    # Удаление документа
    db.delete(document)
    db.commit()
    
    return {"message": "Документ успешно удален"}

@router.get("/search", response_model=List[DocumentSearchResult])
async def search_documents(
    query: str = Query(..., description="Поисковый запрос"),
    document_ids: Optional[str] = Query(None, description="ID документов для поиска, разделенные запятыми"),
    max_chunks: int = Query(5, description="Максимальное количество чанков для возврата"),
    min_similarity: float = Query(0.0, description="Минимальное сходство для возврата результата", ge=0.0, le=1.0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Поиск по документам с использованием семантического поиска на основе векторных эмбеддингов.
    Поиск производится либо по всем документам пользователя, либо по указанным ID документов.
    """
    logger.info(f"Поисковый запрос: '{query}' от пользователя ID={current_user.id}")
    logger.info(f"Параметры поиска: document_ids={document_ids}, max_chunks={max_chunks}, min_similarity={min_similarity}")
    
    # Парсим document_ids из строки в список
    doc_ids = None
    if document_ids:
        try:
            doc_ids = [int(id.strip()) for id in document_ids.split(",") if id.strip()]
            logger.info(f"Поиск будет выполнен по документам с ID: {doc_ids}")
        except ValueError:
            logger.error(f"Неверный формат document_ids: {document_ids}")
            raise HTTPException(
                status_code=400,
                detail="document_ids должны быть числами, разделенными запятыми"
            )
    
    # Получаем все документы текущего пользователя (или только запрошенные)
    if doc_ids:
        documents = db.query(Document).filter(
            Document.user_id == current_user.id,
            Document.id.in_(doc_ids),
            Document.processing_status == ProcessingStatus.COMPLETED
        ).all()
    else:
        documents = db.query(Document).filter(
            Document.user_id == current_user.id,
            Document.processing_status == ProcessingStatus.COMPLETED
        ).all()
    
    if not documents:
        logger.info("Документы не найдены для указанных параметров")
        return []
    
    logger.info(f"Найдено {len(documents)} документов для поиска")
    
    # Создаем сервис для работы с эмбеддингами
    # Используем локальную модель для семантического поиска
    cache_folder = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "model_cache")
    os.makedirs(cache_folder, exist_ok=True)
    
    embedding_service = LocalEmbeddingService(cache_dir=cache_folder)
    
    # Получаем эмбеддинг для запроса
    try:
        query_embedding = await embedding_service.get_embeddings(query)
    except Exception as e:
        logger.error(f"Ошибка при создании эмбеддинга для запроса: {e}")
        # Если не удалось получить эмбеддинг, выполняем текстовый поиск
        return await text_based_search(query, documents, max_chunks, db, min_similarity)
    
    # Получаем чанки документов
    chunks = []
    for document in documents:
        doc_chunks = db.query(DocumentChunk).filter(
            DocumentChunk.document_id == document.id
        ).all()
        chunks.extend(doc_chunks)
    
    logger.info(f"Всего найдено {len(chunks)} чанков для поиска")
    
    if not chunks:
        logger.warning("Чанки документов не найдены")
        return []
    
    # Выполняем векторный поиск
    search_results = []
    
    # Получаем эмбеддинги чанков или используем существующие
    for chunk in chunks:
        if not chunk.embedding:
            try:
                # Если эмбеддинг отсутствует, создаем его
                chunk_embedding = await embedding_service.get_embeddings(chunk.content)
                chunk.embedding = chunk_embedding
                db.add(chunk)
                db.commit()
            except Exception as e:
                logger.error(f"Ошибка при создании эмбеддинга для чанка: {e}")
                continue
        
        # Вычисляем косинусное сходство между эмбеддингами
        similarity = cosine_similarity(query_embedding, chunk.embedding)
        
        if similarity >= min_similarity:
            document = next((doc for doc in documents if doc.id == chunk.document_id), None)
            if document:
                search_results.append({
                    "document_id": document.id,
                    "document_name": document.filename,
                    "chunk_id": chunk.id,
                    "chunk_order": chunk.chunk_order,
                    "page_number": chunk.page_number,
                    "content": chunk.content,
                    "similarity": float(similarity),
                    "metadata": chunk.chunk_metadata
                })
    
    # Сортируем результаты по убыванию релевантности
    search_results.sort(key=lambda x: x["similarity"], reverse=True)
    
    # Ограничиваем количество результатов
    search_results = search_results[:max_chunks]
    
    # Если результатов мало, дополняем текстовым поиском
    if len(search_results) < max_chunks:
        logger.info(f"Недостаточно результатов ({len(search_results)}), дополняем текстовым поиском")
        text_results = await text_based_search(query, documents, max_chunks - len(search_results), db, min_similarity)
        
        # Объединяем результаты, исключая дубликаты по document_id и chunk_id
        seen_chunks = {(r["document_id"], r["chunk_id"]) for r in search_results}
        for result in text_results:
            if (result["document_id"], result["chunk_id"]) not in seen_chunks:
                search_results.append(result)
                seen_chunks.add((result["document_id"], result["chunk_id"]))
    
    # Ограничиваем итоговое количество результатов
    search_results = search_results[:max_chunks]
    
    logger.info(f"Возвращено {len(search_results)} результатов поиска")
    return search_results

async def text_based_search(
    query: str, 
    documents: List[Document], 
    max_chunks: int, 
    db: Session,
    min_similarity: float = 0.0
) -> List[Dict[str, Any]]:
    """
    Выполняет текстовый поиск по документам, когда векторный поиск недоступен или дал мало результатов
    """
    logger.info(f"Выполняем текстовый поиск по запросу: '{query}'")
    
    # Нормализуем запрос для лучшего поиска
    normalized_query = query.lower()
    words = [w for w in re.split(r'\W+', normalized_query) if w]
    
    # Исключаем стоп-слова (можно расширить список)
    stop_words = {"and", "or", "the", "a", "an", "in", "on", "at", "to", "for", 
                 "и", "или", "в", "на", "с", "по", "для", "от", "к", "у"}
    keywords = [w for w in words if w not in stop_words and len(w) > 1]
    
    if not keywords:
        keywords = words  # Если все слова были стоп-словами, используем исходные слова
    
    logger.info(f"Ключевые слова для поиска: {keywords}")
    
    results = []
    for document in documents:
        # Получаем чанки документа
        chunks = db.query(DocumentChunk).filter(
            DocumentChunk.document_id == document.id
        ).all()
        
        for chunk in chunks:
            content_lower = chunk.content.lower()
            
            # Считаем количество совпадений ключевых слов в содержимом чанка
            matches = sum(1 for kw in keywords if kw in content_lower)
            
            # Если есть хотя бы одно совпадение
            if matches > 0:
                # Вычисляем релевантность на основе количества совпадений и длины содержимого
                relevance = matches / (len(keywords) * (1 + math.log10(len(content_lower) / 100)))
                
                # Нормализуем значение релевантности в диапазоне от 0 до 1
                # чем ближе к 1, тем более релевантный результат
                normalized_relevance = min(0.7, relevance * 0.7)  # Максимум 0.7, чтобы векторные результаты имели приоритет
                
                if normalized_relevance >= min_similarity:
                    results.append({
                        "document_id": document.id,
                        "document_name": document.filename,
                        "chunk_id": chunk.id,
                        "chunk_order": chunk.chunk_order,
                        "page_number": chunk.page_number,
                        "content": chunk.content,
                        "similarity": normalized_relevance,
                        "metadata": chunk.chunk_metadata
                    })
    
    # Сортируем по релевантности
    results.sort(key=lambda x: x["similarity"], reverse=True)
    
    # Возвращаем топ результаты
    return results[:max_chunks]

def cosine_similarity(vec1, vec2):
    """
    Вычисляет косинусное сходство между двумя векторами.
    """
    # Преобразуем к numpy массивам, если они ещё не являются ими
    if not isinstance(vec1, np.ndarray):
        vec1 = np.array(vec1)
    if not isinstance(vec2, np.ndarray):
        vec2 = np.array(vec2)
    
    # Проверяем, что оба вектора имеют одинаковую размерность
    if vec1.shape != vec2.shape:
        raise ValueError(f"Векторы имеют разные размерности: {vec1.shape} vs {vec2.shape}")
    
    # Вычисляем косинусное сходство
    dot_product = np.dot(vec1, vec2)
    norm_vec1 = np.linalg.norm(vec1)
    norm_vec2 = np.linalg.norm(vec2)
    
    # Избегаем деления на ноль
    if norm_vec1 == 0 or norm_vec2 == 0:
        return 0.0
    
    return dot_product / (norm_vec1 * norm_vec2) 