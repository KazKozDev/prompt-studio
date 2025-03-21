# Импорт для Alembic и SQLAlchemy ORM
from app.db.base_class import Base  # noqa
# Импорт всех моделей, чтобы Alembic мог их обнаружить
from app.db.models.user import User  # noqa
from app.db.models.prompt import Prompt  # noqa
from app.db.models.template import Template  # noqa
from app.db.models.analytics import PromptAnalytics  # noqa
from app.db.models.user_settings import UserSettings  # noqa
