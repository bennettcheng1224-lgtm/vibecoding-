from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.models.announcement import Base
import os

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./announcements.db")

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
    echo=True  # Set to False in production
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initialize database and create all tables"""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
