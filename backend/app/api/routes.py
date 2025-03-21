from fastapi import APIRouter

from app.api.endpoints import (
    auth,
    prompts,
    testing,
    templates,
    analytics,
    documents
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(prompts.router, prefix="/prompts", tags=["prompts"])
api_router.include_router(testing.router, prefix="/tests", tags=["testing"])
api_router.include_router(templates.router, prefix="/templates", tags=["templates"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"]) 