from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.api.routes import api_router
from app.core.config import settings
from app.db.init_db import init_db
from app.db.session import SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Multimodal Prompt Studio",
    openapi_url="/api/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Initialize database
@app.on_event("startup")
async def init_data():
    db = SessionLocal()
    try:
        init_db(db)
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
    finally:
        db.close()

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5000",
    "http://localhost:5173",
    "http://localhost:8000",
    "http://localhost:8080",
    "http://127.0.0.1",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:5000",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:8080",
    "*"  # Разрешить все источники в режиме разработки
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Welcome to Multimodal Prompt Studio API"}

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "API is healthy and running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
