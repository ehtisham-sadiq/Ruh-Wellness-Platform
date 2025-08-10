from pydantic_settings import BaseSettings
from typing import Optional, List
import os

class Settings(BaseSettings):
    # Application Settings
    app_name: str = "Virtual Wellness Platform"
    app_version: str = "1.0.0"
    debug: bool = os.getenv("DEBUG", "true").lower() == "true"
    environment: str = os.getenv("ENVIRONMENT", "development")
    
    # Database Configuration - Default to SQLite for development
    database_url: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./app.db"  # Default to SQLite for development
    )
    
    # Mock API Configuration
    mock_api_url: str = os.getenv("MOCK_API_URL", "https://your-mock-server-url.com")
    mock_api_key: str = os.getenv("MOCK_API_KEY", "safe-api-key-placeholder")
    
    # Security Settings
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Logging Configuration
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    log_file: str = os.getenv("LOG_FILE", "app.log")
    
    # Redis Configuration (for future use)
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    @property
    def allowed_origins(self) -> List[str]:
        """Get all allowed origins including environment variable origins"""
        # Base allowed origins
        base_origins = [
            "http://localhost:3000",  # Local development
            "https://ruh-wellness-platform.vercel.app",  # Production Vercel
            "https://ruh-wellness-platform-git-main-ehtishams-projects-933e01fb.vercel.app",  # Git branch
            "https://ruh-wellness-platform-1caj5ysrv-ehtishams-projects-933e01fb.vercel.app"  # Preview deployment
        ]
        
        # Add additional origins from environment variable
        additional_origins = os.getenv("ALLOWED_ORIGINS", "")
        if additional_origins:
            env_origins = [origin.strip() for origin in additional_origins.split(",") if origin.strip()]
            base_origins.extend(env_origins)
        
        return base_origins
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Create settings instance
settings = Settings()