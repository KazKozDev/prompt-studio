from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Path
from app.api.deps import get_current_active_user
from app.db.models.user import User

router = APIRouter()

@router.get("/{prompt_id}/json")
def export_prompt_as_json(
    prompt_id: int = Path(...),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Export a prompt as JSON."""
    return {"name": "Example Prompt", "content": []}
