from typing import Any, List, Dict, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from sqlalchemy import desc, cast, Date
import json
from app.api.deps import get_db, get_current_active_user
from app.db.models.user import User
from app.db.models.prompt import Prompt
from app.db.models.analytics import PromptAnalytics
from app.db.models.test import Test, TestResult
from app.integrations.llm_clients import get_llm_client

router = APIRouter()

@router.get("/usage/prompts")
def get_prompt_usage(
    days: int = Query(30, description="Number of days to consider for usage statistics"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """Get usage statistics for prompts."""
    # Вычисляем дату начала периода
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Получаем данные из таблицы аналитики
    analytics_data = db.query(
        PromptAnalytics,
        Prompt.name.label("prompt_name")
    ).join(
        Prompt, PromptAnalytics.prompt_id == Prompt.id
    ).filter(
        Prompt.user_id == current_user.id,
        PromptAnalytics.date >= start_date
    ).all()
    
    # Форматируем данные для фронтенда
    result = []
    for record in analytics_data:
        metrics = record.PromptAnalytics.metrics
        date_str = record.PromptAnalytics.date.strftime("%Y-%m-%d")
        
        # Извлекаем метрики использования из JSON
        input_tokens = metrics.get("usage", {}).get("prompt_tokens", 0) or metrics.get("usage", {}).get("input_tokens", 0) or 0
        output_tokens = metrics.get("usage", {}).get("completion_tokens", 0) or metrics.get("usage", {}).get("output_tokens", 0) or 0
        
        result.append({
            "date": date_str,
            "prompt_name": record.prompt_name,
            "runs": 1,  # Каждая запись - это один запуск
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "total_tokens": input_tokens + output_tokens,
            "provider": record.PromptAnalytics.provider
        })
    
    return result

@router.get("/usage/providers")
def get_provider_usage(
    days: int = Query(30, description="Number of days to consider for usage statistics"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """Get usage statistics aggregated by provider."""
    # Вычисляем дату начала периода
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Получаем данные из таблицы аналитики
    analytics_data = db.query(
        PromptAnalytics
    ).join(
        Prompt, PromptAnalytics.prompt_id == Prompt.id
    ).filter(
        Prompt.user_id == current_user.id,
        PromptAnalytics.date >= start_date
    ).all()
    
    # Агрегируем данные по провайдерам
    provider_stats = {}
    for record in analytics_data:
        provider = record.provider or "unknown"
        if provider not in provider_stats:
            provider_stats[provider] = {
                "runs": 0,
                "input_tokens": 0,
                "output_tokens": 0
            }
        
        metrics = record.metrics
        input_tokens = metrics.get("usage", {}).get("prompt_tokens", 0) or metrics.get("usage", {}).get("input_tokens", 0) or 0
        output_tokens = metrics.get("usage", {}).get("completion_tokens", 0) or metrics.get("usage", {}).get("output_tokens", 0) or 0
        
        provider_stats[provider]["runs"] += 1
        provider_stats[provider]["input_tokens"] += input_tokens
        provider_stats[provider]["output_tokens"] += output_tokens
    
    # Форматируем данные для фронтенда
    result = []
    for provider, stats in provider_stats.items():
        result.append({
            "provider": provider,
            "runs": stats["runs"],
            "input_tokens": stats["input_tokens"],
            "output_tokens": stats["output_tokens"],
            "total_tokens": stats["input_tokens"] + stats["output_tokens"]
        })
    
    return result

@router.get("/aggregated")
def get_aggregated_analytics(
    period: str = Query("month", description="Period for aggregation: day, week, month, year, or custom like '30d'"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """Get aggregated analytics data for the user."""
    # Определяем начальную дату периода
    start_date = None
    
    if period == "day":
        start_date = datetime.utcnow() - timedelta(days=1)
    elif period == "week":
        start_date = datetime.utcnow() - timedelta(weeks=1)
    elif period == "month":
        start_date = datetime.utcnow() - timedelta(days=30)
    elif period == "year":
        start_date = datetime.utcnow() - timedelta(days=365)
    elif period.endswith('d') and period[:-1].isdigit():
        days = int(period[:-1])
        start_date = datetime.utcnow() - timedelta(days=days)
    else:
        # По умолчанию - 30 дней
        start_date = datetime.utcnow() - timedelta(days=30)
    
    # Количество промптов пользователя
    total_prompts = db.query(func.count(Prompt.id)).filter(
        Prompt.user_id == current_user.id
    ).scalar() or 0
    
    # Количество тестов пользователя
    total_tests = db.query(func.count(Test.id)).join(
        Prompt, Test.prompt_id == Prompt.id
    ).filter(
        Prompt.user_id == current_user.id
    ).scalar() or 0
    
    # Собираем статистику из таблицы аналитики
    analytics_data = db.query(PromptAnalytics).join(
        Prompt, PromptAnalytics.prompt_id == Prompt.id
    ).filter(
        Prompt.user_id == current_user.id,
        PromptAnalytics.date >= start_date
    ).all()
    
    # Агрегируем метрики
    total_runs = len(analytics_data)
    total_input_tokens = 0
    total_output_tokens = 0
    
    for record in analytics_data:
        metrics = record.metrics
        input_tokens = metrics.get("usage", {}).get("prompt_tokens", 0) or metrics.get("usage", {}).get("input_tokens", 0) or 0
        output_tokens = metrics.get("usage", {}).get("completion_tokens", 0) or metrics.get("usage", {}).get("output_tokens", 0) or 0
        
        total_input_tokens += input_tokens
        total_output_tokens += output_tokens
    
    # Форматируем результат
    result = {
        "total_prompts": total_prompts,
        "total_tests": total_tests,
        "total_runs": total_runs,
        "total_input_tokens": total_input_tokens,
        "total_output_tokens": total_output_tokens,
        "period": period
    }
    
    return result

@router.post("/semantic-analysis")
def analyze_response(
    response_text: str = Body(..., description="Response text to analyze"),
    reference_text: Optional[str] = Body(None, description="Optional reference text for comparison"),
    metrics: List[str] = Body(["relevance", "factuality", "coherence", "toxicity"], description="Metrics to analyze"),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Analyze the semantic qualities of a response.
    
    This endpoint evaluates response text against several metrics:
    - relevance: How relevant the response is to a reference text or context
    - factuality: Estimated factual accuracy of statements
    - coherence: Logical flow and consistency of the text
    - toxicity: Detection of potentially harmful or toxic content
    """
    analysis_results = {}
    
    # Helper function for simple analysis
    def simple_analysis(text, aspect):
        # This is a placeholder for more sophisticated analysis models
        
        # Perform basic checks based on the aspect
        if aspect == "coherence":
            # Simple coherence check based on text length and sentence count
            if not text or len(text) < 10:
                return 0.1
                
            sentences = [s.strip() for s in text.replace('!', '.').replace('?', '.').split('.') if s.strip()]
            words_per_sentence = [len(s.split()) for s in sentences]
            
            # Very simple coherence heuristic
            if len(sentences) < 2:
                return 0.3  # Single sentence has limited coherence evaluation
            
            # Calculate variance in sentence length as one coherence indicator
            avg_words = sum(words_per_sentence) / len(words_per_sentence)
            variance = sum((w - avg_words) ** 2 for w in words_per_sentence) / len(words_per_sentence)
            
            # Lower variance often indicates more consistent writing style
            coherence_score = max(0.3, min(0.9, 0.7 - (variance / 100)))
            return coherence_score
            
        elif aspect == "toxicity":
            # Simple toxicity check for demonstration purposes
            # In production, use a proper toxicity detection model
            toxic_words = ["hate", "stupid", "idiot", "damn", "kill", "harmful"]
            toxicity_count = sum(1 for word in toxic_words if word.lower() in text.lower())
            toxicity_score = min(1.0, toxicity_count / 10)  # Scale to 0-1
            return toxicity_score
            
        elif aspect == "relevance" and reference_text:
            # Simple relevance check using word overlap
            response_words = set(w.lower() for w in text.split())
            reference_words = set(w.lower() for w in reference_text.split())
            
            if not reference_words:
                return 0.5  # No reference to compare against
                
            overlap = len(response_words.intersection(reference_words))
            relevance_score = min(1.0, overlap / len(reference_words))
            return relevance_score
            
        elif aspect == "factuality":
            # Factuality is hard to determine without external knowledge
            # In a real implementation, consider using fact-checking APIs
            return 0.5  # Neutral score since we can't verify facts
            
        return 0.5  # Default score for unsupported aspects
    
    # For more sophisticated analysis, you would use a dedicated LLM or specialized models
    # Here we use our simple analysis as a placeholder
    for metric in metrics:
        analysis_results[metric] = {
            "score": simple_analysis(response_text, metric),
            "explanation": f"Analysis of {metric} based on text characteristics."
        }
    
    # For a production implementation, consider an evaluation approach using an LLM:
    # 1. Define specific criteria for each aspect (coherence, factuality, etc.)
    # 2. Use a powerful LLM like GPT-4 or Claude to evaluate the response
    # 3. Provide the evaluation criteria and ask for a structured assessment
    
    return {
        "text_length": len(response_text),
        "word_count": len(response_text.split()),
        "metrics": analysis_results,
        "overall_quality": sum(m["score"] for m in analysis_results.values()) / len(analysis_results)
    }

@router.post("/cost-prediction")
def predict_cost(
    prompt_id: int = Body(None, description="Prompt ID to analyze cost for"),
    prompt_content: Optional[List[Dict[str, Any]]] = Body(None, description="Prompt content (if prompt_id not provided)"),
    provider: str = Body(..., description="LLM provider to use"),
    model: str = Body(..., description="Model to use"),
    expected_output_tokens: Optional[int] = Body(None, description="Expected output token count (estimated if not provided)"),
    iterations: int = Body(1, description="Number of executions to calculate cost for"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Predict the cost of executing a prompt.
    
    This endpoint calculates the estimated cost based on:
    - Input prompt token count
    - Expected output token count
    - Provider's pricing model
    - Model used
    - Number of iterations
    
    Returns detailed cost breakdown and total estimated cost.
    """
    # Get the prompt content
    if prompt_id:
        prompt = db.query(Prompt).filter(Prompt.id == prompt_id, Prompt.user_id == current_user.id).first()
        if not prompt:
            return {"error": "Prompt not found or access denied"}
        prompt_content = prompt.content
    
    if not prompt_content:
        return {"error": "Either prompt_id or prompt_content must be provided"}
    
    # Format the prompt for the provider
    from app.api.endpoints.testing import format_prompt_for_provider
    formatted_prompt = format_prompt_for_provider(prompt_content, provider)
    
    # Calculate input tokens (estimate)
    input_tokens = estimate_token_count(formatted_prompt, provider, model)
    
    # Calculate expected output tokens if not provided
    if not expected_output_tokens:
        # Estimate based on historical data or basic heuristics
        # For this example, we'll use a simple heuristic based on input token count
        expected_output_tokens = estimate_output_tokens(input_tokens, provider, model)
    
    # Get pricing information
    pricing = get_provider_pricing(provider, model)
    
    # Calculate costs
    input_cost = (input_tokens * pricing["input_price_per_1k"] / 1000) * iterations
    output_cost = (expected_output_tokens * pricing["output_price_per_1k"] / 1000) * iterations
    total_cost = input_cost + output_cost
    
    return {
        "provider": provider,
        "model": model,
        "input_tokens": input_tokens,
        "estimated_output_tokens": expected_output_tokens,
        "iterations": iterations,
        "cost_breakdown": {
            "input_cost": round(input_cost, 6),
            "output_cost": round(output_cost, 6),
            "total_cost": round(total_cost, 6)
        },
        "pricing_info": pricing,
        "currency": "USD"
    }

def estimate_token_count(formatted_prompt, provider, model):
    """
    Estimate the token count for a prompt.
    
    In a production system, this would use the actual tokenizer from the provider.
    Here we use a very simplified approximation.
    """
    # Simple estimation based on word count (rough approximation)
    total_words = 0
    
    for item in formatted_prompt:
        if isinstance(item, dict) and "content" in item:
            content = item["content"]
            if isinstance(content, str):
                total_words += len(content.split())
            elif isinstance(content, list):
                # Handle rich text format (like OpenAI's format)
                for content_item in content:
                    if isinstance(content_item, dict) and "text" in content_item:
                        total_words += len(content_item["text"].split())
    
    # Rough estimation: 1.3 tokens per word (industry average approximation)
    return int(total_words * 1.3)

def estimate_output_tokens(input_tokens, provider, model):
    """
    Estimate the output token count based on input tokens.
    
    This is a highly simplified model. In production, use historical data
    or provider-specific heuristics.
    """
    # Simple heuristic based on model type
    if "gpt-4" in model or "claude-3" in model:
        # More verbose models tend to generate more tokens
        return int(input_tokens * 1.5)
    else:
        # Less verbose models
        return int(input_tokens * 1.2)

def get_provider_pricing(provider, model):
    """
    Get pricing information for a specific provider and model.
    
    In production, this should be stored in a database or fetched from provider APIs.
    """
    # Simplified pricing data (approximate as of 2024)
    pricing_data = {
        "openai": {
            "gpt-4o": {"input_price_per_1k": 0.01, "output_price_per_1k": 0.03},
            "gpt-4-turbo": {"input_price_per_1k": 0.01, "output_price_per_1k": 0.03},
            "gpt-4": {"input_price_per_1k": 0.03, "output_price_per_1k": 0.06},
            "gpt-3.5-turbo": {"input_price_per_1k": 0.0005, "output_price_per_1k": 0.0015}
        },
        "anthropic": {
            "claude-3-opus-20240229": {"input_price_per_1k": 0.015, "output_price_per_1k": 0.075},
            "claude-3-sonnet-20240229": {"input_price_per_1k": 0.003, "output_price_per_1k": 0.015},
            "claude-3-haiku-20240307": {"input_price_per_1k": 0.00025, "output_price_per_1k": 0.00125}
        },
        "mistral": {
            "mistral-large-latest": {"input_price_per_1k": 0.002, "output_price_per_1k": 0.006},
            "mistral-medium-latest": {"input_price_per_1k": 0.0006, "output_price_per_1k": 0.0018},
            "mistral-small-latest": {"input_price_per_1k": 0.0002, "output_price_per_1k": 0.0006}
        },
        "google": {
            "gemini-1.5-pro": {"input_price_per_1k": 0.0005, "output_price_per_1k": 0.0015},
            "gemini-1.5-flash": {"input_price_per_1k": 0.00035, "output_price_per_1k": 0.00105},
            "gemini-1.0-pro": {"input_price_per_1k": 0.0005, "output_price_per_1k": 0.0015}
        }
    }
    
    # Return pricing info for the specific model or default values
    provider_pricing = pricing_data.get(provider, {})
    model_pricing = provider_pricing.get(model, {
        "input_price_per_1k": 0.01,  # Default fallback prices
        "output_price_per_1k": 0.03
    })
    
    return model_pricing
