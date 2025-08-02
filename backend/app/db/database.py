from sqlalchemy import create_engine # type: ignore
from sqlalchemy.ext.declarative import declarative_base # type: ignore
from sqlalchemy.orm import sessionmaker # type: ignore
import os

# Database URL from environment variable or default
# For Railway, use the default database name (usually 'railway')
DEFAULT_DB_URL = "postgresql://postgres:1234@localhost/wellness_db"
RAILWAY_DEFAULT_DB_URL = "postgresql://postgres:1234@localhost/railway"

# Use Railway default if in production
environment = os.getenv("ENVIRONMENT", "development")
if environment == "production":
    DATABASE_URL = os.getenv("DATABASE_URL", RAILWAY_DEFAULT_DB_URL)
else:
    DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DB_URL)

# Create engine with SSL configuration for production
environment = os.getenv("ENVIRONMENT", "development")
if environment == "production" or "railway" in DATABASE_URL:
    # Production/Railway configuration with SSL
    engine = create_engine(
        DATABASE_URL,
        connect_args={"sslmode": "require"},
        pool_pre_ping=True,  # Verify connections before use
        pool_recycle=300,    # Recycle connections every 5 minutes
        pool_timeout=20,     # Timeout for getting connection from pool
        max_overflow=0,      # Don't allow connections beyond pool size
        echo=False
    )
else:
    # Local development without SSL
    engine = create_engine(DATABASE_URL)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()