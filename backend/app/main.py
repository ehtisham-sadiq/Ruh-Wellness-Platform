from fastapi import FastAPI, HTTPException, Depends, Request # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from fastapi.exceptions import RequestValidationError
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pydantic import ValidationError as PydanticValidationError
from typing import List
import uvicorn
import asyncio
import logging
import os

from .db.database import engine, get_db, DATABASE_URL
from .models import models
from .api import clients, appointments, analytics
from .services.mock_api_service import MockAPIService
from .core.config import settings
from .core.error_handlers import (
    database_error_handler,
    validation_error_handler,
    custom_exception_handler,
    http_exception_handler,
    general_exception_handler,
    BaseCustomException,
    HTTPException
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Ruh Virtual Wellness Platform API",
    description="A comprehensive API for managing virtual wellness appointments and client data",
    version="1.0.0"
)

# Startup event to create tables
@app.on_event("startup")
async def startup_event():
    try:
        # Create tables
        models.Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        # Don't raise the exception to allow the app to start
        # Tables might already exist

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register error handlers
app.add_exception_handler(SQLAlchemyError, database_error_handler)
app.add_exception_handler(PydanticValidationError, validation_error_handler)
app.add_exception_handler(BaseCustomException, custom_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Include routers
app.include_router(clients.router, prefix="/api/clients", tags=["clients"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["appointments"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])

# Initialize mock API service with external API disabled
mock_api_service = MockAPIService(enable_external_api=False)

@app.on_event("startup")
async def startup_event():
    """Initialize data on startup"""
    logger.info("Starting periodic data sync...")
    try:
        await mock_api_service.sync_all_data()
        logger.info("Initial data sync completed")
    except Exception as e:
        logger.error(f"Error during initial data sync: {e}")

@app.get("/")
async def root():
    return {
        "message": "Ruh Virtual Wellness Platform API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/health/detailed")
async def detailed_health_check():
    """Detailed health check with database connectivity"""
    from datetime import datetime
    import traceback
    
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "database": {"status": "unknown"},
        "services": {}
    }
    
    # Test database connection
    try:
        db = next(get_db())
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        db.close()
        
        health_status["database"] = {
            "status": "healthy",
            "connection_url": DATABASE_URL.split("@")[1] if "@" in DATABASE_URL else "localhost"  # Hide credentials
        }
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["database"] = {
            "status": "unhealthy",
            "error": str(e),
            "error_type": type(e).__name__
        }
        if os.getenv("DEBUG", "false").lower() == "true":
            health_status["database"]["traceback"] = traceback.format_exc()
    
    return health_status

@app.post("/sync")
async def manual_sync(db: Session = Depends(get_db)):
    """Manual data sync endpoint"""
    try:
        await mock_api_service.sync_all_data()
        return {"message": "Data sync completed successfully"}
    except Exception as e:
        logger.error(f"Error during manual sync: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)