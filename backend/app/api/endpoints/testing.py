from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Path, Query, HTTPException, Body
from sqlalchemy.orm import Session
from app.api.deps import get_current_active_user, get_db
from app.db.models.user import User
from app.db.models.prompt import Prompt
from app.db.models.analytics import PromptAnalytics
import time
import asyncio
from concurrent.futures import ThreadPoolExecutor
from app.core.config import settings
from app.integrations.llm_clients import get_llm_client
from app.db.models.user_settings import UserSettings
import traceback
import logging
from pydantic import BaseModel

router = APIRouter()

# Функция для логирования успешных тестов
async def log_successful_test(
    db: Session,
    user_id: int,
    prompt_id: int,
    provider: str,
    model: str,
    execution_time: float,
    usage: Dict[str, Any]
):
    """
    Логирует успешное тестирование промпта
    """
    metrics = {
        "provider": provider,
        "model": model,
        "execution_time": execution_time,
        "timestamp": time.time(),
        "success": True,
        "usage": usage
    }
    
    analytics_entry = PromptAnalytics(
        prompt_id=prompt_id,
        user_id=user_id,
        provider=provider,
        metrics=metrics,
        usage_count=1,
        average_response_time=execution_time,
        average_token_count=usage.get("total_tokens", 0)
    )
    
    db.add(analytics_entry)
    db.commit()

# Функция для логирования неудачных тестов
async def log_failed_test(
    db: Session,
    user_id: int,
    prompt_id: int,
    provider: str,
    model: str,
    error_message: str
):
    """
    Логирует неудачное тестирование промпта
    """
    metrics = {
        "provider": provider,
        "model": model,
        "timestamp": time.time(),
        "success": False,
        "error": error_message
    }
    
    analytics_entry = PromptAnalytics(
        prompt_id=prompt_id,
        user_id=user_id,
        provider=provider,
        metrics=metrics,
        usage_count=1,
        average_response_time=0
    )
    
    db.add(analytics_entry)
    db.commit()

# Добавим определение схемы ответа
class TestResponse(BaseModel):
    response: str
    metadata: Dict[str, Any]

@router.get("/")
async def get_tests(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """Get list of all tests for the current user."""
    # Get all analytics entries for the user's prompts
    tests = db.query(PromptAnalytics)\
        .join(Prompt)\
        .filter(Prompt.user_id == current_user.id)\
        .all()
    
    return {
        "tests": [
            {
                "id": test.id,
                "name": f"Test {test.prompt_id} - {test.provider}",
                "prompt_id": test.prompt_id,
                "provider": test.provider,
                "metrics": test.metrics,
                "created_at": test.date
            }
            for test in tests
        ]
    }

@router.get("/providers")
async def get_providers(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """Get information about available LLM providers."""
    # Get user settings
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    
    providers = []
    
    # OpenAI
    if settings and settings.openai_key:
        providers.append({
            "id": "openai",
            "name": "OpenAI",
            "models": get_llm_client("openai", settings.openai_key).get_available_models()
        })
    
    # Anthropic
    if settings and settings.anthropic_key:
        providers.append({
            "id": "anthropic",
            "name": "Anthropic",
            "models": get_llm_client("anthropic", settings.anthropic_key).get_available_models()
        })
    
    # Mistral
    if settings and settings.mistral_key:
        providers.append({
            "id": "mistral",
            "name": "Mistral",
            "models": get_llm_client("mistral", settings.mistral_key).get_available_models()
        })
    
    # Google
    if settings and settings.google_key:
        providers.append({
            "id": "google",
            "name": "Google AI",
            "models": get_llm_client("google", settings.google_key).get_available_models()
        })
    
    return {
        "providers": providers
    }

@router.post("/{prompt_id}/test", response_model=TestResponse)
async def test_prompt(
    prompt_id: int,
    provider: str = Query(..., description="The LLM provider"),
    model: str = Query(..., description="The specific model"),
    parameters: Dict[str, Any] = Body({}, description="Model parameters"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    start_time = time.time()
    response_content = None
    usage = {}
    success = True
    error_message = None
    
    try:
        # Get the prompt
        prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
        if not prompt:
            raise HTTPException(status_code=404, detail=f"Prompt {prompt_id} not found")
        
        # Format the prompt for the provider
        formatted_content = format_prompt_for_provider(prompt.content, provider)
        
        # Get the appropriate client and process prompt
        try:
            client = get_llm_client(provider, user=current_user, db=db)
            raw_response = client.process_prompt(formatted_content, model, parameters)
            response = client.format_response(raw_response)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
            
        # Extract content and usage from response
        response_content = response.get("content", "")
        usage = response.get("usage", {})
    
    except Exception as e:
        success = False
        error_message = str(e)
        traceback_str = traceback.format_exc()
        logging.error(f"Error testing prompt {prompt_id}: {str(e)}\n{traceback_str}")
    
    # Calculate execution time
    execution_time = time.time() - start_time
    
    # Log analytics
    try:
        if success:
            await log_successful_test(
                db=db,
                user_id=current_user.id,
                prompt_id=prompt_id,
                provider=provider,
                model=model,
                execution_time=execution_time,
                usage=usage
            )
        else:
            await log_failed_test(
                db=db,
                user_id=current_user.id, 
                prompt_id=prompt_id,
                provider=provider,
                model=model,
                error_message=error_message
            )
    except Exception as e:
        logging.error(f"Error logging analytics: {str(e)}")
    
    # Return response with metadata
    return {
        "response": response_content or error_message,
        "metadata": {
            "provider": provider,
            "model": model,
            "execution_time": round(execution_time, 2),
            "success": success,
            "usage": usage
        }
    }

@router.post("/{prompt_id}/compare")
async def compare_prompt(
    prompt_id: int = Path(..., description="The ID of the prompt to test"),
    providers: List[str] = Query(..., description="List of providers to test with"),
    models: List[str] = Query(..., description="List of models to test with"),
    parameters: Dict[str, Any] = {},
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Test a prompt with multiple providers and models at once for comparison.
    
    Each provider-model pair will be tested with the same prompt and parameters.
    Results are returned together with performance metrics for comparison.
    """
    # Fetch the prompt
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id, Prompt.user_id == current_user.id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    if len(providers) != len(models):
        raise HTTPException(status_code=400, detail="Number of providers must match number of models")
    
    results = []
    
    # Process each provider-model combination
    for i in range(len(providers)):
        provider = providers[i]
        model = models[i]
        
        # Format the prompt content based on the provider
        formatted_content = format_prompt_for_provider(prompt.content, provider)
        
        # Start timing
        start_time = time.time()
        
        # Initialize metrics
        metrics = {
            "provider": provider,
            "model": model,
            "parameters": parameters,
            "timestamp": start_time,
        }
        
        try:
            # Get the appropriate client and process prompt
            client = get_llm_client(provider)
            raw_response = client.process_prompt(formatted_content, model, parameters)
            response = client.format_response(raw_response)
            
            # Calculate execution time
            execution_time = time.time() - start_time
            
            # Update metrics with results
            metrics.update({
                "execution_time": execution_time,
                "usage": response.get("usage", {}),
                "success": True
            })
            
            # Log analytics
            analytics_entry = PromptAnalytics(
                prompt_id=prompt.id,
                provider=provider,
                metrics=metrics,
                usage_count=1,
                average_response_time=execution_time,
                average_token_count=response.get("usage", {}).get("total_tokens", 0)
            )
            db.add(analytics_entry)
            
            # Add result to the list
            results.append({
                "provider": provider,
                "model": model,
                "response": response.get("content", "No content returned"),
                "metadata": metrics
            })
        
        except Exception as e:
            # Log error in metrics
            execution_time = time.time() - start_time
            metrics.update({
                "execution_time": execution_time,
                "success": False,
                "error": str(e)
            })
            
            # Still log analytics for failed attempts
            analytics_entry = PromptAnalytics(
                prompt_id=prompt.id,
                provider=provider,
                metrics=metrics,
                usage_count=1,
                average_response_time=execution_time
            )
            db.add(analytics_entry)
            
            # Add error result to the list
            results.append({
                "provider": provider,
                "model": model,
                "error": str(e),
                "metadata": metrics
            })
    
    # Commit all analytics entries at once
    db.commit()
    
    return {
        "prompt_id": prompt_id,
        "prompt_name": prompt.name,
        "results": results
    }

@router.post("/{prompt_id}/compare-async")
async def compare_prompt_async(
    prompt_id: int = Path(..., description="The ID of the prompt to test"),
    provider_models: List[Dict[str, str]] = Body(..., description="List of provider-model pairs to test with"),
    parameters: Dict[str, Any] = Body({}),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Test a prompt with multiple providers and models concurrently.
    
    Accepts a list of provider-model pairs and runs tests in parallel.
    This is faster than the sequential version for multiple models.
    """
    # Fetch the prompt
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id, Prompt.user_id == current_user.id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    async def test_single_model(provider, model):
        # Format the prompt content based on the provider
        formatted_content = format_prompt_for_provider(prompt.content, provider)
        
        # Start timing
        start_time = time.time()
        
        # Initialize metrics
        metrics = {
            "provider": provider,
            "model": model,
            "parameters": parameters,
            "timestamp": start_time,
        }
        
        try:
            # We use a thread pool for CPU-bound tasks that might block
            with ThreadPoolExecutor() as executor:
                # Run the API call in a separate thread to avoid blocking the event loop
                client = get_llm_client(provider)
                
                # Execute API call in thread pool
                loop = asyncio.get_event_loop()
                raw_response = await loop.run_in_executor(
                    executor, 
                    lambda: client.process_prompt(formatted_content, model, parameters)
                )
                
                response = client.format_response(raw_response)
                
                # Calculate execution time
                execution_time = time.time() - start_time
                
                # Update metrics with results
                metrics.update({
                    "execution_time": execution_time,
                    "usage": response.get("usage", {}),
                    "success": True
                })
                
                # Create analytics entry
                analytics_entry = PromptAnalytics(
                    prompt_id=prompt.id,
                    provider=provider,
                    metrics=metrics,
                    usage_count=1,
                    average_response_time=execution_time,
                    average_token_count=response.get("usage", {}).get("total_tokens", 0)
                )
                
                # Note: We'll add this to the DB outside this function
                
                return {
                    "provider": provider,
                    "model": model,
                    "response": response.get("content", "No content returned"),
                    "metadata": metrics,
                    "analytics_entry": analytics_entry
                }
        
        except Exception as e:
            # Log error in metrics
            execution_time = time.time() - start_time
            metrics.update({
                "execution_time": execution_time,
                "success": False,
                "error": str(e)
            })
            
            # Create analytics entry
            analytics_entry = PromptAnalytics(
                prompt_id=prompt.id,
                provider=provider,
                metrics=metrics,
                usage_count=1,
                average_response_time=execution_time
            )
            
            return {
                "provider": provider,
                "model": model,
                "error": str(e),
                "metadata": metrics,
                "analytics_entry": analytics_entry
            }
    
    # Create tasks for each provider-model pair
    tasks = []
    for pair in provider_models:
        provider = pair.get("provider")
        model = pair.get("model")
        
        if not provider or not model:
            raise HTTPException(status_code=400, detail="Each item must contain provider and model")
        
        tasks.append(test_single_model(provider, model))
    
    # Run all tasks concurrently
    results = await asyncio.gather(*tasks)
    
    # Add all analytics entries to the DB and commit
    for result in results:
        if "analytics_entry" in result:
            db.add(result.pop("analytics_entry"))
    
    db.commit()
    
    return {
        "prompt_id": prompt_id,
        "prompt_name": prompt.name,
        "results": results
    }

@router.post("/ab-test")
async def ab_test_prompts(
    prompt_a_id: int = Query(..., description="The ID of the first prompt to test"),
    prompt_b_id: int = Query(..., description="The ID of the second prompt to test"),
    provider: str = Query(..., description="The provider to use for testing"),
    model: str = Query(..., description="The model to use for testing"),
    parameters: Dict[str, Any] = Body({}, description="Parameters for the test"),
    iterations: int = Query(3, description="Number of test iterations to run"),
    metrics: List[str] = Query(["response_time", "token_usage", "coherence"], description="Metrics to evaluate"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Perform A/B testing between two prompts.
    
    This endpoint tests two prompts with the same provider and model multiple times,
    and compares their performance across various metrics:
    - response_time: Time taken to generate a response
    - token_usage: Number of tokens used
    - coherence: Estimated coherence of the response (if available)
    
    Returns detailed metrics and statistical significance of differences.
    """
    # Fetch both prompts
    prompt_a = db.query(Prompt).filter(Prompt.id == prompt_a_id, Prompt.user_id == current_user.id).first()
    prompt_b = db.query(Prompt).filter(Prompt.id == prompt_b_id, Prompt.user_id == current_user.id).first()
    
    if not prompt_a or not prompt_b:
        raise HTTPException(status_code=404, detail="One or both prompts not found")
    
    # Format prompts for the provider
    prompt_a_formatted = format_prompt_for_provider(prompt_a.content, provider)
    prompt_b_formatted = format_prompt_for_provider(prompt_b.content, provider)
    
    # Initialize results containers
    results_a = []
    results_b = []
    
    # Run the tests in parallel
    async def run_test_iterations():
        # Create client once for all tests
        client = get_llm_client(provider)
        
        # Test prompt A multiple times
        for i in range(iterations):
            # Start timing for prompt A
            start_time_a = time.time()
            
            try:
                # Process prompt A
                raw_response_a = client.process_prompt(prompt_a_formatted, model, parameters)
                response_a = client.format_response(raw_response_a)
                
                # Calculate metrics for prompt A
                execution_time_a = time.time() - start_time_a
                
                # Get token usage
                input_tokens_a = response_a.get("usage", {}).get("input_tokens", 0) or response_a.get("usage", {}).get("prompt_tokens", 0) or 0
                output_tokens_a = response_a.get("usage", {}).get("output_tokens", 0) or response_a.get("usage", {}).get("completion_tokens", 0) or 0
                total_tokens_a = response_a.get("usage", {}).get("total_tokens", input_tokens_a + output_tokens_a)
                
                # Calculate coherence score (placeholder for actual implementation)
                coherence_a = calculate_coherence(response_a.get("content", ""))
                
                # Store results for prompt A
                results_a.append({
                    "iteration": i + 1,
                    "response": response_a.get("content", ""),
                    "metrics": {
                        "response_time": execution_time_a,
                        "input_tokens": input_tokens_a,
                        "output_tokens": output_tokens_a,
                        "total_tokens": total_tokens_a,
                        "coherence": coherence_a
                    }
                })
                
                # Log analytics for prompt A
                analytics_entry_a = PromptAnalytics(
                    prompt_id=prompt_a.id,
                    provider=provider,
                    metrics={
                        "provider": provider,
                        "model": model,
                        "parameters": parameters,
                        "timestamp": start_time_a,
                        "execution_time": execution_time_a,
                        "usage": response_a.get("usage", {}),
                        "test_type": "ab_test",
                        "success": True
                    },
                    usage_count=1,
                    average_response_time=execution_time_a,
                    average_token_count=total_tokens_a
                )
                db.add(analytics_entry_a)
                
            except Exception as e:
                # Handle errors for prompt A
                results_a.append({
                    "iteration": i + 1,
                    "error": str(e),
                    "metrics": {
                        "response_time": time.time() - start_time_a,
                        "input_tokens": 0,
                        "output_tokens": 0,
                        "total_tokens": 0,
                        "coherence": 0
                    }
                })
            
            # Start timing for prompt B
            start_time_b = time.time()
            
            try:
                # Process prompt B
                raw_response_b = client.process_prompt(prompt_b_formatted, model, parameters)
                response_b = client.format_response(raw_response_b)
                
                # Calculate metrics for prompt B
                execution_time_b = time.time() - start_time_b
                
                # Get token usage
                input_tokens_b = response_b.get("usage", {}).get("input_tokens", 0) or response_b.get("usage", {}).get("prompt_tokens", 0) or 0
                output_tokens_b = response_b.get("usage", {}).get("output_tokens", 0) or response_b.get("usage", {}).get("completion_tokens", 0) or 0
                total_tokens_b = response_b.get("usage", {}).get("total_tokens", input_tokens_b + output_tokens_b)
                
                # Calculate coherence score (placeholder for actual implementation)
                coherence_b = calculate_coherence(response_b.get("content", ""))
                
                # Store results for prompt B
                results_b.append({
                    "iteration": i + 1,
                    "response": response_b.get("content", ""),
                    "metrics": {
                        "response_time": execution_time_b,
                        "input_tokens": input_tokens_b,
                        "output_tokens": output_tokens_b,
                        "total_tokens": total_tokens_b,
                        "coherence": coherence_b
                    }
                })
                
                # Log analytics for prompt B
                analytics_entry_b = PromptAnalytics(
                    prompt_id=prompt_b.id,
                    provider=provider,
                    metrics={
                        "provider": provider,
                        "model": model,
                        "parameters": parameters,
                        "timestamp": start_time_b,
                        "execution_time": execution_time_b,
                        "usage": response_b.get("usage", {}),
                        "test_type": "ab_test",
                        "success": True
                    },
                    usage_count=1,
                    average_response_time=execution_time_b,
                    average_token_count=total_tokens_b
                )
                db.add(analytics_entry_b)
                
            except Exception as e:
                # Handle errors for prompt B
                results_b.append({
                    "iteration": i + 1,
                    "error": str(e),
                    "metrics": {
                        "response_time": time.time() - start_time_b,
                        "input_tokens": 0,
                        "output_tokens": 0,
                        "total_tokens": 0,
                        "coherence": 0
                    }
                })
        
        # Commit all analytics entries
        db.commit()
    
    # Run all tests
    await run_test_iterations()
    
    # Calculate aggregated metrics
    aggregated_metrics = calculate_aggregated_metrics(results_a, results_b, metrics)
    
    # Return comprehensive results
    return {
        "prompt_a": {
            "id": prompt_a.id,
            "name": prompt_a.name,
            "results": results_a
        },
        "prompt_b": {
            "id": prompt_b.id,
            "name": prompt_b.name,
            "results": results_b
        },
        "comparison": aggregated_metrics,
        "winner": determine_winner(aggregated_metrics)
    }

def calculate_coherence(text: str) -> float:
    """
    Calculate a coherence score for the given text.
    
    This is a placeholder implementation. In a production environment,
    this could use an actual NLP model to evaluate coherence.
    
    Returns a score between 0 and 1, where higher is better.
    """
    # Simple implementation based on text length (longer responses often have more context)
    # In a real implementation, you would use a more sophisticated model
    if not text:
        return 0.0
        
    # Simple placeholder algorithm
    words = text.split()
    if len(words) <= 5:
        return 0.3  # Very short responses
    elif len(words) <= 20:
        return 0.6  # Medium length responses
    else:
        return 0.8  # Longer responses
    
    # In a real implementation, you might analyze:
    # - Grammatical correctness
    # - Logical flow between sentences
    # - Topic consistency
    # - Semantic coherence using embeddings

def calculate_aggregated_metrics(results_a, results_b, metrics_list):
    """
    Calculate aggregated metrics from test results.
    
    Args:
        results_a: List of test results for prompt A
        results_b: List of test results for prompt B
        metrics_list: List of metrics to calculate
        
    Returns:
        Dictionary of metric comparisons
    """
    # Initialize results
    comparison = {}
    
    for metric in metrics_list:
        values_a = [r["metrics"].get(metric, 0) for r in results_a if "error" not in r]
        values_b = [r["metrics"].get(metric, 0) for r in results_b if "error" not in r]
        
        if not values_a or not values_b:
            comparison[metric] = {
                "prompt_a_avg": 0,
                "prompt_b_avg": 0,
                "difference": 0,
                "percent_difference": 0,
                "winner": "none"
            }
            continue
        
        # Calculate average values
        avg_a = sum(values_a) / len(values_a)
        avg_b = sum(values_b) / len(values_b)
        
        # Calculate difference
        abs_diff = abs(avg_a - avg_b)
        
        # Calculate percent difference
        base_val = avg_a if avg_a > 0 else avg_b
        percent_diff = (abs_diff / base_val * 100) if base_val > 0 else 0
        
        # Determine winner based on metric type
        # For response time and token usage, lower is better
        # For coherence, higher is better
        if metric in ["response_time", "input_tokens", "output_tokens", "total_tokens"]:
            winner = "A" if avg_a < avg_b else "B" if avg_b < avg_a else "tie"
            is_significant = percent_diff > 5  # Consider >5% difference significant
        else:  # coherence and other "higher is better" metrics
            winner = "A" if avg_a > avg_b else "B" if avg_b > avg_a else "tie"
            is_significant = percent_diff > 10  # Consider >10% difference significant
        
        comparison[metric] = {
            "prompt_a_avg": avg_a,
            "prompt_b_avg": avg_b,
            "difference": avg_a - avg_b,
            "percent_difference": percent_diff,
            "winner": winner,
            "is_significant": is_significant
        }
    
    return comparison

def determine_winner(metrics):
    """
    Determine the overall winner based on all metrics.
    
    Returns:
        Dictionary with winner and explanation
    """
    # Count wins
    wins_a = sum(1 for m in metrics.values() if m["winner"] == "A" and m["is_significant"])
    wins_b = sum(1 for m in metrics.values() if m["winner"] == "B" and m["is_significant"])
    
    # Determine overall winner
    if wins_a > wins_b:
        return {"winner": "A", "explanation": f"Prompt A won in {wins_a} significant metrics vs {wins_b} for Prompt B"}
    elif wins_b > wins_a:
        return {"winner": "B", "explanation": f"Prompt B won in {wins_b} significant metrics vs {wins_a} for Prompt A"}
    else:
        return {"winner": "tie", "explanation": "Both prompts performed similarly across all metrics"}

def format_prompt_for_provider(content, provider):
    """Format prompt content based on the provider requirements."""
    formatted_content = []
    
    if provider == "openai" or provider == "groq":
        # OpenAI и Groq имеют одинаковый формат
        for item in content:
            if item.get("type") == "text":
                formatted_content.append({
                    "role": item.get("role", "user"),
                    "content": item.get("content", "")
                })
            elif item.get("type") == "image":
                # Проверяем, что URL изображения существует и не пустой
                image_url = item.get("url", "")
                if image_url and image_url.strip():  # Проверка на пустую строку или только пробелы
                    formatted_content.append({
                        "role": "user",
                        "content": [
                            {"type": "text", "text": item.get("alt_text", "")},
                            {"type": "image_url", "image_url": {"url": image_url}}
                        ]
                    })
                else:
                    # Если URL пустой, добавляем только текстовое сообщение
                    formatted_content.append({
                        "role": "user",
                        "content": f"[Изображение отсутствует или имеет пустой URL]. {item.get('alt_text', '')}"
                    })
    elif provider in ["anthropic", "mistral", "cohere", "google"]:
        # Anthropic, Mistral, Cohere и Google имеют схожий базовый формат
        for item in content:
            if item.get("type") == "text":
                formatted_content.append({
                    "role": item.get("role", "user"),
                    "content": item.get("content", "")
                })
            elif item.get("type") == "image":
                # Для провайдеров просто игнорируем изображения с пустыми URL
                image_url = item.get("url", "")
                if image_url and image_url.strip():  # Если URL не пустой
                    # Здесь должна быть логика обработки изображений для каждого провайдера
                    # На данный момент просто добавляем текстовое описание
                    formatted_content.append({
                        "role": "user",
                        "content": f"[Изображение: {item.get('alt_text', '')}]"
                    })
                
    return formatted_content
