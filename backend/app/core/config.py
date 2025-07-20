from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Application Settings
    app_name: str = "Virtual Wellness Platform"
    app_version: str = "1.0.0"
    debug: bool = True
    environment: str = "development"
    
    # Database Configuration - Default to SQLite for development
    database_url: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./app.db"  # Default to SQLite for development
    )
    
    # Mock API Configuration
    mock_api_url: str = os.getenv("MOCK_API_URL", "https://your-mock-server-url.com")
    mock_api_key: str = os.getenv("MOCK_API_KEY", "YOUR_API_KEY")
    
    # Security Settings
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Logging Configuration
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    log_file: str = os.getenv("LOG_FILE", "app.log")
    
    # Redis Configuration (for future use)
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()