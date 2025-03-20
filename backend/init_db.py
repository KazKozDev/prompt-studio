import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.core.config import settings
from app.services.auth import create_user

# Import all models to ensure they are registered with Base
from app.db.models.user import User
from app.db.models.prompt import Prompt, PromptVersion
from app.db.models.template import Template, TemplateCategory
from app.db.models.test import Test, TestVariant, TestResult
from app.db.models.analytics import PromptAnalytics

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db(db: Session) -> None:
    # Create tables
    Base.metadata.create_all(bind=engine)
    logger.info("Created database tables")
    
    # Create initial admin user if it doesn't exist
    try:
        user = create_user(
            db, 
            email="admin@example.com", 
            password="adminpassword", 
            full_name="Admin User",
            is_superuser=True
        )
        logger.info(f"Created admin user: {user.email}")
    except IntegrityError:
        db.rollback()
        logger.info("Admin user already exists")

def main() -> None:
    logger.info("Creating initial data")
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
    logger.info("Initial data created")

if __name__ == "__main__":
    main()
