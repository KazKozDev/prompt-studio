import os
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Multimodal Prompt Studio"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    SECRET_KEY: str
    
    # CORS settings
    ALLOWED_ORIGINS: str = "http://localhost,http://localhost:3000"
    
    # JWT Settings
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Database
    DATABASE_URL: str
    
    # API Keys
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    MISTRAL_API_KEY: Optional[str] = None
    GOOGLE_AI_API_KEY: Optional[str] = None
    COHERE_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        case_sensitive = True

settings = Settings()
