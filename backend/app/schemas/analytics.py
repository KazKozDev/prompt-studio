from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from datetime import datetime, timedelta
from enum import Enum

class UsagePeriod(str, Enum):
    DAY = "day"
    WEEK = "week"
    MONTH = "month"
    YEAR = "year"
    ALL = "all"

class UseCase(str, Enum):
    GENERAL = "general"
    BUSINESS = "business"
    CREATIVE = "creative"
    TECHNICAL = "technical"
    EDUCATIONAL = "educational"
    OTHER = "other"

class PromptAnalyticsCreate(BaseModel):
    prompt_id: int
    provider: str
    usage_count: int = 1
    average_response_time: float
    average_token_count: int
    metrics: Dict[str, Any]

class PromptUsage(BaseModel):
    id: int
    prompt_id: int
    prompt_name: str
    prompt_version: int
    provider: str
    model: str
    count: int
    total_tokens: int
    average_tokens: float
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UsageStats(BaseModel):
    total_prompts: int
    total_runs: int
    total_tokens: int
    average_tokens_per_run: float
    providers: List[str]
    models: List[str]
    most_used_provider: str
    most_used_model: str

class ProviderUsage(BaseModel):
    provider: str
    models: List[str]
    count: int
    total_tokens: int
    percentage: float  # Доля от общего использования

class AggregatedAnalytics(BaseModel):
    period: UsagePeriod
    start_date: datetime
    end_date: datetime
    usage_stats: UsageStats
    providers: List[ProviderUsage]
    prompt_usage: List[PromptUsage] 