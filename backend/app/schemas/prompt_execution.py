from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class PromptExecutionSchema(BaseModel):
    """Схема для выполнения промпта"""
    
    variables: Dict[str, Any] = Field(default_factory=dict, description="Переменные для подстановки в промпт")
    model: str = Field(..., description="Название модели для выполнения промпта")
    provider: str = Field(..., description="Провайдер LLM (openai, anthropic, mistral, google, и т.д.)")
    parameters: Dict[str, Any] = Field(
        default_factory=lambda: {
            "temperature": 0.7,
            "max_tokens": 1000,
            "top_p": 0.95
        },
        description="Параметры модели"
    ) 