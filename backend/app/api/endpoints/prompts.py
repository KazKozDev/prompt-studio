from typing import Any, List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, Query, Body, Path
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.services.prompt import PromptService
from app.schemas.prompt import Prompt, PromptCreate, PromptUpdate, PromptVersion, PromptVersionCreate, PromptWithVersions, PromptList
from app.db.models.user import User
from app.integrations.llm_clients import get_llm_client
import time
from app.api.endpoints.testing import format_prompt_for_provider
from app.services.document import DocumentService
from app.services.testing import TestingService
from app.schemas import TestResult, RagTestCreate
from app.utils import logger

router = APIRouter()

@router.get("/", response_model=PromptList)
def get_prompts(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Get all prompts for the current user."""
    prompts = PromptService.get_multi(db=db, user_id=current_user.id, skip=skip, limit=limit)
    total = PromptService.get_total_count(db=db, user_id=current_user.id)
    return {"prompts": prompts, "total": total}

@router.post("/", response_model=Prompt)
def create_prompt(
    *,
    db: Session = Depends(get_db),
    prompt_in: PromptCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Create a new prompt."""
    prompt = PromptService.create(db=db, obj_in=prompt_in, user_id=current_user.id)
    return prompt

@router.get("/{prompt_id}", response_model=Prompt)
def get_prompt(
    *,
    db: Session = Depends(get_db),
    prompt_id: int = Path(..., title="The ID of the prompt"),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Get a prompt by ID."""
    prompt = PromptService.get(db=db, prompt_id=prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    if prompt.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return prompt

@router.put("/{prompt_id}", response_model=Prompt)
def update_prompt(
    *,
    db: Session = Depends(get_db),
    prompt_id: int = Path(..., title="The ID of the prompt to update"),
    prompt_in: PromptUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Update a prompt."""
    prompt = PromptService.get(db=db, prompt_id=prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    if prompt.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    prompt = PromptService.update(db=db, db_obj=prompt, obj_in=prompt_in)
    return prompt

@router.delete("/{prompt_id}", response_model=Prompt)
def delete_prompt(
    *,
    db: Session = Depends(get_db),
    prompt_id: int = Path(..., title="The ID of the prompt to delete"),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Delete a prompt."""
    prompt = PromptService.get(db=db, prompt_id=prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    if prompt.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    prompt = PromptService.delete(db=db, prompt_id=prompt_id)
    return prompt

@router.get("/{prompt_id}/versions", response_model=List[PromptVersion])
def get_prompt_versions(
    *,
    db: Session = Depends(get_db),
    prompt_id: int = Path(..., title="The ID of the prompt"),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Get all versions of a prompt."""
    prompt = PromptService.get(db=db, prompt_id=prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    if prompt.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    versions = PromptService.get_versions(db=db, prompt_id=prompt_id)
    return versions

@router.post("/{prompt_id}/versions", response_model=PromptVersion)
def create_prompt_version(
    *,
    db: Session = Depends(get_db),
    prompt_id: int = Path(..., title="The ID of the prompt"),
    version_in: PromptVersionCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Create a new version of a prompt."""
    prompt = PromptService.get(db=db, prompt_id=prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    if prompt.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    version = PromptService.create_version(
        db=db, prompt_id=prompt_id, obj_in=version_in, user_id=current_user.id
    )
    return version

@router.get("/{prompt_id}/versions/{version_id}", response_model=PromptVersion)
def get_prompt_version(
    *,
    db: Session = Depends(get_db),
    prompt_id: int = Path(..., title="The ID of the prompt"),
    version_id: int = Path(..., title="The ID of the version"),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Get a specific version of a prompt."""
    prompt = PromptService.get(db=db, prompt_id=prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    if prompt.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    version = PromptService.get_version(db=db, prompt_id=prompt_id, version_id=version_id)
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    
    return version

@router.post("/{prompt_id}/versions/{version_id}/revert", response_model=PromptVersion)
def revert_to_version(
    *,
    db: Session = Depends(get_db),
    prompt_id: int = Path(..., title="The ID of the prompt"),
    version_id: int = Path(..., title="The ID of the version to revert to"),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Revert a prompt to a specific version."""
    prompt = PromptService.get(db=db, prompt_id=prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    if prompt.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    version = PromptService.get_version(db=db, prompt_id=prompt_id, version_id=version_id)
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    
    new_version = PromptService.revert_to_version(
        db=db, prompt_id=prompt_id, version_id=version_id, user_id=current_user.id
    )
    return new_version

@router.get("/{prompt_id}/with-versions", response_model=PromptWithVersions)
def get_prompt_with_versions(
    *,
    db: Session = Depends(get_db),
    prompt_id: int = Path(..., title="The ID of the prompt"),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Get a prompt with all its versions."""
    prompt = PromptService.get(db=db, prompt_id=prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    if prompt.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    versions = PromptService.get_versions(db=db, prompt_id=prompt_id)
    
    # Создаем объект PromptWithVersions
    prompt_with_versions = PromptWithVersions(
        id=prompt.id,
        name=prompt.name,
        description=prompt.description,
        content=prompt.content,
        template_id=prompt.template_id,
        version=prompt.version,
        user_id=prompt.user_id,
        created_at=prompt.created_at,
        updated_at=prompt.updated_at,
        versions=versions
    )
    
    return prompt_with_versions

@router.post("/{prompt_id}/optimize", response_model=Dict[str, Any])
def optimize_prompt(
    *,
    db: Session = Depends(get_db),
    prompt_id: int = Path(..., title="The ID of the prompt to optimize"),
    provider: str = Query("openai", description="The provider to use for optimization"),
    model: str = Query("gpt-4", description="The model to use for optimization"),
    target_tokens: Optional[int] = Query(None, description="Target token count for optimization"),
    focus_areas: List[str] = Query(
        ["clarity", "efficiency", "cost"], 
        description="Areas to focus optimization on"
    ),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Analyze a prompt and suggest optimizations for efficiency and cost reduction.
    
    This endpoint analyzes the prompt structure, content, and token usage to provide
    tailored recommendations for improving prompt effectiveness while reducing costs.
    
    Returns a detailed analysis with specific optimization suggestions.
    """
    # Get the prompt by ID
    prompt = PromptService.get(db=db, prompt_id=prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    # Check user permissions
    if prompt.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Format system prompt for optimization analysis
    system_message = {
        "role": "system",
        "content": f"""You are an expert in prompt engineering and optimization. 
Analyze the given prompt and provide specific recommendations to improve it.
Focus on these areas: {', '.join(focus_areas)}.
{f'Target token usage: {target_tokens} tokens or less.' if target_tokens else ''}

For each recommendation:
1. Describe the issue or opportunity
2. Explain the benefit of addressing it
3. Provide a specific example of how to implement the change

Finally, include a revised version of the entire prompt with all optimizations applied."""
    }
    
    # Prepare user message with the prompt content
    prompt_description = f"Prompt Name: {prompt.name}\nDescription: {prompt.description or 'No description provided'}\n\n"
    
    # Convert prompt content to human-readable format
    readable_content = "Current Prompt Content:\n"
    for idx, item in enumerate(prompt.content):
        if item.get("type") == "text":
            role = item.get("role", "user")
            content = item.get("content", "")
            readable_content += f"[{idx+1}] {role.upper()}: {content}\n\n"
        elif item.get("type") == "image":
            alt_text = item.get("alt_text", "No description")
            readable_content += f"[{idx+1}] IMAGE: {alt_text}\n\n"
        elif item.get("type") == "audio":
            duration = item.get("duration", "Unknown duration")
            readable_content += f"[{idx+1}] AUDIO: Duration - {duration}s\n\n"
    
    user_message = {
        "role": "user",
        "content": prompt_description + readable_content
    }
    
    # Prepare the optimization request
    optimization_request = [system_message, user_message]
    
    # Process the optimization request
    try:
        client = get_llm_client(provider)
        start_time = time.time()
        raw_response = client.process_prompt(optimization_request, model, {
            "temperature": 0.7,
            "max_tokens": 4000,
        })
        response = client.format_response(raw_response)
        execution_time = time.time() - start_time
        
        # Return the optimization results
        optimization_result = {
            "prompt_id": prompt.id,
            "prompt_name": prompt.name,
            "optimization_recommendations": response.get("content", "No recommendations generated"),
            "metrics": {
                "execution_time": execution_time,
                "provider": provider,
                "model": model,
                "usage": response.get("usage", {})
            }
        }
        
        return optimization_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error optimizing prompt: {str(e)}")

@router.post("/{prompt_id}/generate-alternatives", response_model=Dict[str, Any])
def generate_alternatives(
    *,
    db: Session = Depends(get_db),
    prompt_id: int = Path(..., title="The ID of the prompt to generate alternatives for"),
    provider: str = Query("openai", description="The provider to use for generation"),
    model: str = Query("gpt-4", description="The model to use for generation"),
    num_alternatives: int = Query(3, description="Number of alternative versions to generate"),
    variation_factors: List[str] = Query(
        ["tone", "structure", "conciseness"], 
        description="Factors to vary in the alternatives"
    ),
    save_as_versions: bool = Query(False, description="Whether to save alternatives as prompt versions"),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Generate alternative versions of a prompt based on the original.
    
    This endpoint creates variations of the prompt by modifying factors such as:
    - tone (formal, casual, technical, etc.)
    - structure (organization, formatting, sequence)
    - conciseness (level of detail, brevity)
    - complexity (simple/complex language, reasoning steps)
    
    Returns multiple alternative versions of the prompt.
    """
    # Get the prompt by ID
    prompt = PromptService.get(db=db, prompt_id=prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    # Check user permissions
    if prompt.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Format system prompt for generating alternatives
    system_message = {
        "role": "system",
        "content": f"""You are an expert in prompt engineering and creative variation.
Generate {num_alternatives} unique alternative versions of the given prompt.
Create variations based on these factors: {', '.join(variation_factors)}.

For each alternative:
1. Provide a title for the variation (e.g., "Formal Technical Version", "Concise Casual Approach")
2. Explain the key differences from the original
3. Include the full alternative prompt formatted exactly like the original but with your variations
4. Keep the same general purpose and information requirements as the original

Each alternative should maintain the essential elements/questions/requirements but vary in the specified factors."""
    }
    
    # Prepare user message with the prompt content
    prompt_description = f"Prompt Name: {prompt.name}\nDescription: {prompt.description or 'No description provided'}\n\n"
    
    # Convert prompt content to human-readable format for variation
    readable_content = "Current Prompt Content:\n"
    for idx, item in enumerate(prompt.content):
        if item.get("type") == "text":
            role = item.get("role", "user")
            content = item.get("content", "")
            readable_content += f"[{idx+1}] {role.upper()}: {content}\n\n"
        elif item.get("type") == "image":
            alt_text = item.get("alt_text", "No description")
            readable_content += f"[{idx+1}] IMAGE: {alt_text}\n\n"
        elif item.get("type") == "audio":
            duration = item.get("duration", "Unknown duration")
            readable_content += f"[{idx+1}] AUDIO: Duration - {duration}s\n\n"
    
    user_message = {
        "role": "user",
        "content": prompt_description + readable_content
    }
    
    # Prepare the variation request
    variation_request = [system_message, user_message]
    
    # Process the variation request
    try:
        client = get_llm_client(provider)
        start_time = time.time()
        raw_response = client.process_prompt(variation_request, model, {
            "temperature": 0.8,  # Slightly higher temperature for creative variations
            "max_tokens": 4000,
        })
        response = client.format_response(raw_response)
        execution_time = time.time() - start_time
        
        # If requested, save alternatives as versions
        saved_versions = []
        if save_as_versions:
            # Parse variations from the response
            # This is a simplified implementation; in production, use a more robust parsing approach
            alternatives_text = response.get("content", "")
            
            # Quick and dirty parsing of alternatives - in production use a more structured approach
            parts = alternatives_text.split("Alternative")
            
            for i, part in enumerate(parts[1:], 1):  # Skip first part (probably intro text)
                if i <= num_alternatives:
                    # Extract title
                    title_line = part.splitlines()[0].strip(": ")
                    title = title_line if title_line else f"Alternative {i}"
                    
                    # Create a new version with this alternative
                    try:
                        # Content remains the same as we're storing the alternative as text in commit message
                        # In a production implementation, you would parse and transform the alternative 
                        # into the proper prompt structure
                        version = PromptService.create_version(
                            db=db,
                            prompt_id=prompt_id,
                            obj_in=PromptVersionCreate(
                                content=prompt.content,  # keeping same structure for now
                                commit_message=f"Alternative {i}: {title}"
                            ),
                            user_id=current_user.id
                        )
                        saved_versions.append({
                            "version_id": version.id,
                            "version_number": version.version_number,
                            "title": title
                        })
                    except Exception as ve:
                        # Log but continue if one version fails
                        print(f"Error saving version: {str(ve)}")
        
        # Return the generated alternatives
        generation_result = {
            "prompt_id": prompt.id,
            "prompt_name": prompt.name,
            "generated_alternatives": response.get("content", "No alternatives generated"),
            "saved_versions": saved_versions,
            "metrics": {
                "execution_time": execution_time,
                "provider": provider,
                "model": model,
                "usage": response.get("usage", {})
            }
        }
        
        return generation_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating alternatives: {str(e)}")

@router.post("/{prompt_id}/test_with_rag", response_model=TestResult)
async def test_prompt_with_rag(
    prompt_id: int,
    rag_test_data: RagTestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Тестирует промпт с использованием системы RAG (Retrieval Augmented Generation)
    """
    prompt = PromptService.get(db=db, prompt_id=prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    if prompt.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    try:
        # Создаем экземпляры необходимых сервисов
        document_service = DocumentService(db)
        testing_service = TestingService(db)
        llm_client = get_llm_client(rag_test_data.provider)
        
        # Если указаны ID коллекций или документов, получаем релевантные фрагменты
        relevant_chunks = []
        if rag_test_data.collection_ids or rag_test_data.document_ids:
            relevant_chunks = await document_service.search_relevant_chunks(
                query=rag_test_data.prompt_variables.get("query", "") or rag_test_data.prompt_variables.get("user_query", ""),
                user_id=current_user.id,
                collection_ids=rag_test_data.collection_ids,
                document_ids=rag_test_data.document_ids,
                max_chunks=rag_test_data.max_chunks,
                min_similarity=rag_test_data.min_similarity,
                provider=rag_test_data.embedding_provider,
                model=rag_test_data.embedding_model
            )
        
        # Собираем тексты из релевантных фрагментов
        context_texts = [chunk["content"] for chunk in relevant_chunks]
        
        # Обновляем переменные промпта, добавляя контекст из RAG
        rag_variables = rag_test_data.prompt_variables.copy()
        rag_variables["context"] = "\n\n".join(context_texts)
        
        # Логгируем информацию о тестировании
        logger.info(f"Testing prompt {prompt_id} with RAG. Found {len(relevant_chunks)} relevant chunks")
        
        # Выполняем тестирование с использованием модели
        test_result = await testing_service.test_prompt(
            prompt=prompt,
            variables=rag_variables,
            provider=rag_test_data.provider,
            model=rag_test_data.model,
            temperature=rag_test_data.temperature,
            max_tokens=rag_test_data.max_tokens,
            top_p=rag_test_data.top_p,
            frequency_penalty=rag_test_data.frequency_penalty,
            presence_penalty=rag_test_data.presence_penalty,
            llm_client=llm_client
        )
        
        # Добавляем информацию о RAG в результат
        test_result.metadata = test_result.metadata or {}
        test_result.metadata["rag"] = {
            "chunks_count": len(relevant_chunks),
            "chunks": [
                {
                    "document_id": chunk["document_id"],
                    "document_title": chunk["document_title"],
                    "similarity": chunk["similarity"],
                    "content_preview": chunk["content"][:200] + "..." if len(chunk["content"]) > 200 else chunk["content"]
                }
                for chunk in relevant_chunks
            ]
        }
        
        return test_result
    
    except Exception as e:
        logger.error(f"Error testing prompt with RAG: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
