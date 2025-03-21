from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.db.init_db import init_db
import logging

# Создаем таблицы в базе данных при запуске приложения
Base.metadata.create_all(bind=engine)

# Инициализируем базу данных первоначальными данными
try:
    db = SessionLocal()
    init_db(db)
    db.close()
    logging.info("Database initialized with default templates")
except Exception as e:
    logging.error(f"Error initializing database: {e}")
