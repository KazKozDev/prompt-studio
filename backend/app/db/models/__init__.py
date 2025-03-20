# Import all models to ensure they are registered with Base
from app.db.models.document import Document, DocumentChunk, DocumentCollection
from app.db.models.user import User
from app.db.models.prompt import Prompt, PromptVersion
from app.db.models.template import Template, TemplateCategory
from app.db.models.test import Test, TestVariant, TestResult
from app.db.models.analytics import PromptAnalytics
