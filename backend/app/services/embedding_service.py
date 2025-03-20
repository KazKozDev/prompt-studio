import os
import json
import logging
import time
import asyncio
from typing import List, Dict, Any, Optional, Tuple, Union
import numpy as np
from httpx import AsyncClient, HTTPStatusError
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

from app.core.config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    """
    Сервис для генерации эмбеддингов текстовых фрагментов
    с использованием различных моделей (OpenAI, Anthropic и др.)
    """
    
    # Поддерживаемые модели эмбеддингов
    OPENAI_EMBEDDING_MODELS = {
        "text-embedding-3-small": {"dimensions": 1536, "max_tokens": 8191, "window_size": 8191},
        "text-embedding-3-large": {"dimensions": 3072, "max_tokens": 8191, "window_size": 8191},
        "text-embedding-ada-002": {"dimensions": 1536, "max_tokens": 8191, "window_size": 8191}
    }
    
    ANTHROPIC_EMBEDDING_MODELS = {
        "claude-3-haiku-20240307": {"dimensions": 1536, "max_tokens": 8191, "window_size": 8191},
        "claude-3-sonnet-20240229": {"dimensions": 1536, "max_tokens": 8191, "window_size": 8191},
        "claude-3-opus-20240229": {"dimensions": 4096, "max_tokens": 8191, "window_size": 8191}
    }
    
    def __init__(
        self, 
        provider: str = "openai", 
        model: Optional[str] = None,
        openai_api_key: Optional[str] = None,
        anthropic_api_key: Optional[str] = None,
        batch_size: int = 16
    ):
        """
        Инициализация сервиса эмбеддингов
        
        Args:
            provider: Провайдер API для генерации эмбеддингов ('openai' или 'anthropic')
            model: Название модели для генерации эмбеддингов
            openai_api_key: API ключ OpenAI (если None, берется из переменной окружения)
            anthropic_api_key: API ключ Anthropic (если None, берется из переменной окружения)
            batch_size: Размер пакета для пакетной обработки текстов
        """
        self.provider = provider.lower()
        self.batch_size = batch_size
        
        # Проверяем и устанавливаем провайдера
        if self.provider not in ["openai", "anthropic"]:
            raise ValueError(f"Unsupported provider: {provider}. Use 'openai' or 'anthropic'")
        
        # Устанавливаем API ключи
        self.openai_api_key = openai_api_key or os.getenv("OPENAI_API_KEY", "")
        self.anthropic_api_key = anthropic_api_key or os.getenv("ANTHROPIC_API_KEY", "")
        
        # Проверяем, что ключ доступен для выбранного провайдера
        if self.provider == "openai" and not self.openai_api_key:
            raise ValueError("OpenAI API key is required when using OpenAI provider")
        elif self.provider == "anthropic" and not self.anthropic_api_key:
            raise ValueError("Anthropic API key is required when using Anthropic provider")
        
        # Устанавливаем модель по умолчанию в зависимости от провайдера
        if not model:
            if self.provider == "openai":
                self.model = "text-embedding-3-small"
            else:
                self.model = "claude-3-haiku-20240307"
        else:
            self.model = model
        
        # Проверяем, что модель поддерживается выбранным провайдером
        self._validate_model()
        
        # HTTP клиент для асинхронных запросов
        self.http_client = AsyncClient(timeout=60.0)
    
    def _validate_model(self):
        """Проверяет, поддерживается ли выбранная модель провайдером"""
        if self.provider == "openai" and self.model not in self.OPENAI_EMBEDDING_MODELS:
            raise ValueError(f"Unsupported OpenAI model: {self.model}. Available models: {list(self.OPENAI_EMBEDDING_MODELS.keys())}")
        elif self.provider == "anthropic" and self.model not in self.ANTHROPIC_EMBEDDING_MODELS:
            raise ValueError(f"Unsupported Anthropic model: {self.model}. Available models: {list(self.ANTHROPIC_EMBEDDING_MODELS.keys())}")
    
    def get_model_dimensions(self) -> int:
        """Возвращает размерность эмбеддингов для выбранной модели"""
        if self.provider == "openai":
            return self.OPENAI_EMBEDDING_MODELS[self.model]["dimensions"]
        else:
            return self.ANTHROPIC_EMBEDDING_MODELS[self.model]["dimensions"]
    
    def get_model_max_tokens(self) -> int:
        """Возвращает максимальное количество токенов для выбранной модели"""
        if self.provider == "openai":
            return self.OPENAI_EMBEDDING_MODELS[self.model]["max_tokens"]
        else:
            return self.ANTHROPIC_EMBEDDING_MODELS[self.model]["max_tokens"]
    
    @retry(
        wait=wait_exponential(multiplier=1, min=1, max=10),
        stop=stop_after_attempt(5),
        retry=retry_if_exception_type((HTTPStatusError, ConnectionError, TimeoutError)),
        reraise=True
    )
    async def _generate_embeddings_openai(self, texts: List[str]) -> List[List[float]]:
        """
        Генерирует эмбеддинги текстов с помощью OpenAI API
        
        Args:
            texts: Список текстов для генерации эмбеддингов
            
        Returns:
            Список векторов эмбеддингов
        """
        if not texts:
            return []
        
        base_url = "https://api.openai.com/v1"
        url = f"{base_url}/embeddings"
        
        headers = {
            "Authorization": f"Bearer {self.openai_api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "input": texts,
            "model": self.model,
            "encoding_format": "float"
        }
        
        try:
            response = await self.http_client.post(url, headers=headers, json=data)
            response.raise_for_status()
            result = response.json()
            
            # Извлекаем эмбеддинги из ответа
            embeddings = [item["embedding"] for item in result["data"]]
            
            return embeddings
            
        except HTTPStatusError as e:
            logger.error(f"OpenAI API error: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error generating embeddings with OpenAI API: {str(e)}")
            raise
    
    @retry(
        wait=wait_exponential(multiplier=1, min=1, max=10),
        stop=stop_after_attempt(5),
        retry=retry_if_exception_type((HTTPStatusError, ConnectionError, TimeoutError)),
        reraise=True
    )
    async def _generate_embeddings_anthropic(self, texts: List[str]) -> List[List[float]]:
        """
        Генерирует эмбеддинги текстов с помощью Anthropic API
        
        Args:
            texts: Список текстов для генерации эмбеддингов
            
        Returns:
            Список векторов эмбеддингов
        """
        if not texts:
            return []
        
        url = "https://api.anthropic.com/v1/embeddings"
        
        headers = {
            "x-api-key": self.anthropic_api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
        }
        
        embeddings = []
        
        # Anthropic API принимает только один документ за раз,
        # поэтому обрабатываем каждый элемент отдельно
        for text in texts:
            data = {
                "model": self.model,
                "input": text
            }
            
            try:
                response = await self.http_client.post(url, headers=headers, json=data)
                response.raise_for_status()
                result = response.json()
                
                # Извлекаем эмбеддинг из ответа
                embedding = result["embedding"]
                embeddings.append(embedding)
                
                # Добавляем небольшую задержку, чтобы не превысить лимит запросов
                await asyncio.sleep(0.1)
                
            except HTTPStatusError as e:
                logger.error(f"Anthropic API error: {e.response.status_code} - {e.response.text}")
                raise
            except Exception as e:
                logger.error(f"Error generating embedding with Anthropic API: {str(e)}")
                raise
        
        return embeddings
    
    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Генерирует эмбеддинги для списка текстов
        
        Args:
            texts: Список текстов для генерации эмбеддингов
            
        Returns:
            Список векторов эмбеддингов
        """
        if not texts:
            return []
        
        # Обрабатываем тексты пакетами для снижения нагрузки
        all_embeddings = []
        for i in range(0, len(texts), self.batch_size):
            batch = texts[i:i + self.batch_size]
            
            if self.provider == "openai":
                batch_embeddings = await self._generate_embeddings_openai(batch)
            else:
                batch_embeddings = await self._generate_embeddings_anthropic(batch)
            
            all_embeddings.extend(batch_embeddings)
        
        return all_embeddings
    
    async def generate_chunks_embeddings(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Генерирует эмбеддинги для списка чанков документа
        
        Args:
            chunks: Список словарей с информацией о чанках
            
        Returns:
            Список словарей с информацией о чанках и добавленными эмбеддингами
        """
        # Извлекаем тексты из чанков
        texts = [chunk["content"] for chunk in chunks]
        
        # Генерируем эмбеддинги
        embeddings = await self.generate_embeddings(texts)
        
        # Обновляем чанки с эмбеддингами
        result = []
        for i, chunk in enumerate(chunks):
            chunk_copy = chunk.copy()
            if i < len(embeddings):
                # Сохраняем эмбеддинг как JSON-строку
                chunk_copy["embedding"] = json.dumps(embeddings[i])
                chunk_copy["embedding_model"] = f"{self.provider}/{self.model}"
            result.append(chunk_copy)
        
        return result
    
    def similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """
        Вычисляет косинусное сходство между двумя эмбеддингами
        
        Args:
            embedding1: Первый вектор эмбеддинга
            embedding2: Второй вектор эмбеддинга
            
        Returns:
            Косинусное сходство (от -1 до 1, где 1 - идентичные векторы)
        """
        # Преобразуем в numpy массивы
        v1 = np.array(embedding1)
        v2 = np.array(embedding2)
        
        # Вычисляем косинусное сходство
        return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
    
    def sort_by_similarity(
        self, 
        query_embedding: List[float], 
        embeddings: List[List[float]]
    ) -> List[Tuple[int, float]]:
        """
        Сортирует эмбеддинги по сходству с запросом
        
        Args:
            query_embedding: Эмбеддинг запроса
            embeddings: Список эмбеддингов для сравнения
            
        Returns:
            Список кортежей (индекс, сходство), отсортированных по убыванию сходства
        """
        similarities = [
            (i, self.similarity(query_embedding, emb))
            for i, emb in enumerate(embeddings)
        ]
        
        # Сортировка по убыванию сходства
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        return similarities 