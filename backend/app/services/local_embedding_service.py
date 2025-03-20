import os
import json
import numpy as np
import logging
from typing import List, Dict, Any, Optional, Union
import asyncio
from pathlib import Path

logger = logging.getLogger(__name__)

class LocalEmbeddingService:
    """
    Сервис для генерации эмбеддингов на основе локальной модели SentenceTransformers.
    Поддерживает кэширование модели и многоязычные модели.
    """
    
    def __init__(
        self, 
        model_name: str = "paraphrase-multilingual-MiniLM-L12-v2", 
        cache_dir: Optional[str] = None,
        use_gpu: bool = False
    ):
        """
        Инициализирует сервис эмбеддингов с выбранной моделью.
        
        Args:
            model_name: Название модели для генерации эмбеддингов
            cache_dir: Директория для кэширования модели
            use_gpu: Использовать GPU для вывода, если доступно
        """
        self.model_name = model_name
        self.cache_dir = cache_dir
        self.use_gpu = use_gpu
        self.model = None
        self.embedding_dim = None
        logger.info(f"Инициализирован LocalEmbeddingService с моделью {model_name}")
        
    async def _load_model(self):
        """
        Асинхронно загружает модель для генерации эмбеддингов.
        """
        if self.model is not None:
            return
        
        # Используем блокирующую операцию в отдельном потоке через loop.run_in_executor
        logger.info(f"Загружаем модель {self.model_name}...")
        
        try:
            # Импортируем здесь, чтобы не требовать зависимость, если не используется
            from sentence_transformers import SentenceTransformer
            
            # Определяем устройство для модели
            device = "cuda" if self.use_gpu and torch_available() else "cpu"
            
            # Создаем каталог для кэша, если он не существует
            if self.cache_dir:
                os.makedirs(self.cache_dir, exist_ok=True)
            
            # Загружаем модель
            loop = asyncio.get_event_loop()
            self.model = await loop.run_in_executor(
                None, 
                lambda: SentenceTransformer(
                    self.model_name, 
                    cache_folder=self.cache_dir,
                    device=device
                )
            )
            
            # Получаем размерность эмбеддингов
            self.embedding_dim = self.model.get_sentence_embedding_dimension()
            logger.info(f"Модель {self.model_name} успешно загружена. Размерность эмбеддингов: {self.embedding_dim}")
        
        except ImportError:
            logger.error("Не удалось импортировать SentenceTransformer. Установите библиотеку: pip install sentence-transformers")
            raise ImportError("Требуется установить sentence-transformers")
        
        except Exception as e:
            logger.error(f"Ошибка при загрузке модели: {str(e)}")
            raise
    
    async def get_embeddings(self, text: Union[str, List[str]]) -> Union[List[float], List[List[float]]]:
        """
        Генерирует эмбеддинги для текста или списка текстов.
        
        Args:
            text: Текст или список текстов для генерации эмбеддингов
            
        Returns:
            Эмбеддинги в виде списка float значений или списка списков
        """
        # Проверяем загружена ли модель
        await self._load_model()
        
        # Преобразуем в список, если передана строка
        is_single = isinstance(text, str)
        texts = [text] if is_single else text
        
        # Отфильтровываем пустые строки и ограничиваем длину
        texts = [t[:10000] for t in texts if t and t.strip()]
        
        if not texts:
            if is_single:
                return [0.0] * self.embedding_dim
            return [[0.0] * self.embedding_dim]
        
        try:
            # Выполняем генерацию эмбеддингов в отдельном потоке
            loop = asyncio.get_event_loop()
            embeddings = await loop.run_in_executor(
                None,
                lambda: self.model.encode(texts, convert_to_numpy=True)
            )
            
            # Преобразуем numpy массивы в списки
            embeddings_list = embeddings.tolist() if isinstance(embeddings, np.ndarray) else embeddings
            
            # Возвращаем одиночный эмбеддинг или список
            return embeddings_list[0] if is_single else embeddings_list
            
        except Exception as e:
            logger.error(f"Ошибка при генерации эмбеддингов: {str(e)}")
            
            # В случае ошибки возвращаем нулевые векторы
            if is_single:
                return [0.0] * self.embedding_dim
            return [[0.0] * self.embedding_dim for _ in range(len(texts))]
    
    async def semantic_search(
        self, 
        query_embedding: List[float], 
        document_embeddings: List[List[float]], 
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Выполняет семантический поиск по эмбеддингам.
        
        Args:
            query_embedding: Эмбеддинг запроса
            document_embeddings: Список эмбеддингов документов
            top_k: Количество наиболее релевантных результатов для возврата
            
        Returns:
            Список словарей с индексами и значениями сходства
        """
        # Проверяем, что эмбеддинги имеют одинаковую размерность
        if not document_embeddings:
            return []
        
        # Преобразуем в numpy массивы
        query_embedding_np = np.array(query_embedding)
        document_embeddings_np = np.array(document_embeddings)
        
        # Нормализуем векторы для косинусного сходства
        query_embedding_norm = query_embedding_np / np.linalg.norm(query_embedding_np)
        document_embeddings_norm = document_embeddings_np / np.linalg.norm(document_embeddings_np, axis=1, keepdims=True)
        
        # Вычисляем косинусное сходство
        similarities = np.dot(document_embeddings_norm, query_embedding_norm)
        
        # Находим top_k наиболее похожих документов
        results = []
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        for idx in top_indices:
            results.append({
                "index": int(idx),
                "similarity": float(similarities[idx])
            })
        
        return results

def torch_available() -> bool:
    """Проверяет доступность CUDA для PyTorch"""
    try:
        import torch
        return torch.cuda.is_available()
    except ImportError:
        return False 