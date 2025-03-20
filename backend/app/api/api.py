from fastapi import APIRouter

from app.api.endpoints import auth, prompts, templates, analytics, tests, exports, rag

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(prompts.router, prefix="/prompts", tags=["prompts"])
api_router.include_router(templates.router, prefix="/templates", tags=["templates"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(tests.router, prefix="/tests", tags=["tests"])
api_router.include_router(exports.router, prefix="/exports", tags=["exports"])
api_router.include_router(rag.router, prefix="/rag", tags=["rag"]) 