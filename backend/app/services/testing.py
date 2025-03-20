import time
import logging
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session

from app.db.models.analytics import PromptAnalytics
from app.schemas.test import TestResult
from app.integrations.llm_clients import get_llm_client
from app.api.endpoints.testing import format_prompt_for_provider

logger = logging.getLogger(__name__)

class TestingService:
    """Сервис для тестирования промптов с различными провайдерами и моделями"""
    
    def __init__(self, db: Session):
        self.db = db
        
    async def test_prompt(
        self,
        prompt,
        variables: Dict[str, Any] = None,
        provider: str = "openai",
        model: str = "gpt-4",
        temperature: float = 0.7,
        max_tokens: int = 2048,
        top_p: float = 1.0,
        frequency_penalty: float = 0.0,
        presence_penalty: float = 0.0,
        llm_client = None
    ) -> TestResult:
        """
        Тестирует промпт с заданными параметрами и возвращает результат
        
        Args:
            prompt: Объект промпта для тестирования
            variables: Переменные для использования в промпте
            provider: Провайдер LLM (openai, anthropic, и т.д.)
            model: Модель для использования
            temperature: Параметр temperature для генерации
            max_tokens: Максимальное количество токенов для ответа
            top_p: Параметр top_p для генерации
            frequency_penalty: Штраф за повторение частотных токенов
            presence_penalty: Штраф за повторение любых токенов
            llm_client: Опционально, предварительно созданный клиент LLM
            
        Returns:
            TestResult: Результат выполнения теста
        """
        # Засекаем время начала
        start_time = time.time()
        
        # Установка параметров для провайдера
        parameters = {
            "temperature": temperature,
            "max_tokens": max_tokens,
            "top_p": top_p,
            "frequency_penalty": frequency_penalty,
            "presence_penalty": presence_penalty,
        }
        
        # Метрики для аналитики
        metrics = {
            "provider": provider,
            "model": model,
            "parameters": parameters,
            "timestamp": start_time,
            "variables": variables or {}
        }
        
        try:
            # Подготовка клиента LLM
            if llm_client is None:
                llm_client = get_llm_client(provider)
            
            # Форматирование промпта с учетом провайдера
            formatted_content = format_prompt_for_provider(prompt.content, provider, variables)
            
            # Выполнение запроса к модели
            raw_response = llm_client.process_prompt(formatted_content, model, parameters)
            response = llm_client.format_response(raw_response)
            
            # Рассчет времени выполнения
            execution_time = time.time() - start_time
            
            # Получение данных о токенах
            input_tokens = response.get("usage", {}).get("input_tokens", 0) or response.get("usage", {}).get("prompt_tokens", 0) or 0
            output_tokens = response.get("usage", {}).get("output_tokens", 0) or response.get("usage", {}).get("completion_tokens", 0) or 0
            total_tokens = response.get("usage", {}).get("total_tokens", input_tokens + output_tokens)
            
            # Обновление метрик с результатами
            metrics.update({
                "execution_time": execution_time,
                "usage": response.get("usage", {}),
                "success": True
            })
            
            # Запись аналитики
            analytics_entry = PromptAnalytics(
                prompt_id=prompt.id,
                provider=provider,
                metrics=metrics,
                usage_count=1,
                average_response_time=execution_time,
                average_token_count=total_tokens
            )
            self.db.add(analytics_entry)
            self.db.commit()
            
            # Формирование результата
            return TestResult(
                response=response.get("content", "No content returned"),
                metrics={
                    "response_time": execution_time,
                    "token_info": {
                        "input_tokens": input_tokens,
                        "output_tokens": output_tokens,
                        "total_tokens": total_tokens
                    }
                },
                metadata=metrics
            )
            
        except Exception as e:
            # Логгирование ошибки
            logger.error(f"Error testing prompt: {str(e)}")
            
            # Обновление метрик при ошибке
            metrics.update({
                "success": False,
                "error": str(e),
                "execution_time": time.time() - start_time
            })
            
            # Запись аналитики для неудачных попыток
            analytics_entry = PromptAnalytics(
                prompt_id=prompt.id,
                provider=provider,
                metrics=metrics,
                usage_count=1,
                average_response_time=time.time() - start_time,
                average_token_count=0
            )
            self.db.add(analytics_entry)
            self.db.commit()
            
            # Формирование результата с ошибкой
            return TestResult(
                response="",
                error=str(e),
                metrics={
                    "response_time": time.time() - start_time,
                    "token_info": {
                        "input_tokens": 0,
                        "output_tokens": 0,
                        "total_tokens": 0
                    }
                },
                metadata=metrics
            ) 