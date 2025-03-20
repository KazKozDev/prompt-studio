from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel
from datetime import datetime

# Базовая схема для теста
class TestBase(BaseModel):
    name: str
    description: Optional[str] = None
    test_config: Dict[str, Any]
    prompt_id: int

# Схема для создания теста
class TestCreate(TestBase):
    pass

# Схема для обновления теста
class TestUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    test_config: Optional[Dict[str, Any]] = None
    prompt_id: Optional[int] = None

# Схема для варианта теста
class TestVariantBase(BaseModel):
    name: str
    content: Dict[str, Any]

# Схема для создания варианта теста
class TestVariantCreate(TestVariantBase):
    test_id: int

# Схема для чтения варианта теста
class TestVariant(TestVariantBase):
    id: int
    test_id: int

    class Config:
        from_attributes = True

# Схема для результата теста
class TestResultBase(BaseModel):
    metrics: Dict[str, Any]
    response: Optional[Dict[str, Any]] = None

# Схема для создания результата теста
class TestResultCreate(TestResultBase):
    test_id: int
    variant_id: int

# Схема для чтения результата теста
class TestResult(TestResultBase):
    id: int
    test_id: int
    variant_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Информация о токенах
class TokenInfo(BaseModel):
    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0

# Схема для аналитики теста
class TestAnalytics(BaseModel):
    response_time: float
    token_info: TokenInfo
    coherence: Optional[float] = None
    other_metrics: Optional[Dict[str, Any]] = None

# Схема для сравнения промтов
class PromptComparison(BaseModel):
    prompt_a_id: int
    prompt_b_id: int
    prompt_a_name: str
    prompt_b_name: str
    metrics_a: List[Dict[str, Any]]
    metrics_b: List[Dict[str, Any]]
    aggregated_comparison: Dict[str, Any]

# Схема для чтения теста
class Test(TestBase):
    id: int
    status: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    user_id: int
    variants: List[TestVariant] = []
    results: List[TestResult] = []

    class Config:
        from_attributes = True

# Схема для операций с БД
class TestInDB(Test):
    pass 