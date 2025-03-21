from typing import Any
from fastapi import APIRouter, Depends
from app.api.deps import get_current_active_user
from app.db.models.user import User

router = APIRouter()

@router.get("/")
def get_tests(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Get all tests for the current user."""
    return {"tests": [], "total": 0}
