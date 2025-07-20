import logging
import traceback
from typing import Dict, Any, Optional
from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError, IntegrityError, OperationalError
from pydantic import ValidationError
import httpx
from datetime import datetime

# Configure logging
logger = logging.getLogger(__name__)

class BaseCustomException(Exception):
    """Base custom exception class"""
    def __init__(self, message: str, error_code: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)

class DatabaseError(BaseCustomException):
    """Database operation errors"""
    pass

class ExternalAPIError(BaseCustomException):
    """External API errors"""
    pass

class CustomValidationError(BaseCustomException):
    """Data validation errors"""
    pass

class BusinessLogicError(BaseCustomException):
    """Business logic errors"""
    pass

class ConflictError(BaseCustomException):
    """Resource conflict errors"""
    pass

class NotFoundError(BaseCustomException):
    """Resource not found errors"""
    pass

class AuthenticationError(BaseCustomException):
    """Authentication errors"""
    pass

class AuthorizationError(BaseCustomException):
    """Authorization errors"""
    pass

class RateLimitError(BaseCustomException):
    """Rate limiting errors"""
    pass

class CircuitBreakerError(BaseCustomException):
    """Circuit breaker errors"""
    pass

def log_error(error: Exception, request: Optional[Request] = None, context: Optional[Dict[str, Any]] = None):
    """Log error with detailed context"""
    error_context = {
        "timestamp": datetime.utcnow().isoformat(),
        "error_type": type(error).__name__,
        "error_message": str(error),
        "traceback": traceback.format_exc(),
    }
    
    if request:
        error_context.update({
            "method": request.method,
            "url": str(request.url),
            "client_ip": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent"),
        })
    
    if context:
        error_context.update(context)
    
    logger.error(f"Error occurred: {error_context}", extra=error_context)

def create_error_response(
    status_code: int,
    message: str,
    error_code: str = None,
    details: Dict[str, Any] = None,
    request_id: str = None
) -> JSONResponse:
    """Create standardized error response"""
    error_response = {
        "error": {
            "message": message,
            "status_code": status_code,
            "timestamp": datetime.utcnow().isoformat(),
        }
    }
    
    if error_code:
        error_response["error"]["code"] = error_code
    
    if details:
        error_response["error"]["details"] = details
    
    if request_id:
        error_response["error"]["request_id"] = request_id
    
    return JSONResponse(
        status_code=status_code,
        content=error_response
    )

async def database_error_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    """Handle database errors"""
    log_error(exc, request, {"error_category": "database"})
    
    if isinstance(exc, IntegrityError):
        # Handle unique constraint violations, foreign key violations, etc.
        if "UNIQUE constraint failed" in str(exc):
            return create_error_response(
                status_code=status.HTTP_409_CONFLICT,
                message="Resource already exists",
                error_code="DUPLICATE_RESOURCE",
                details={"field": "unknown", "value": "duplicate"}
            )
        elif "FOREIGN KEY constraint failed" in str(exc):
            return create_error_response(
                status_code=status.HTTP_400_BAD_REQUEST,
                message="Referenced resource does not exist",
                error_code="INVALID_REFERENCE",
                details={"constraint": "foreign_key"}
            )
        else:
            return create_error_response(
                status_code=status.HTTP_400_BAD_REQUEST,
                message="Data integrity violation",
                error_code="DATA_INTEGRITY_ERROR"
            )
    
    elif isinstance(exc, OperationalError):
        # Handle connection issues, timeouts, etc.
        return create_error_response(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            message="Database service temporarily unavailable",
            error_code="DATABASE_UNAVAILABLE",
            details={"retry_after": 30}
        )
    
    else:
        # Generic database error
        return create_error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message="Database operation failed",
            error_code="DATABASE_ERROR"
        )

async def validation_error_handler(request: Request, exc: ValidationError) -> JSONResponse:
    """Handle Pydantic validation errors"""
    log_error(exc, request, {"error_category": "validation"})
    
    # Extract field-specific errors
    field_errors = []
    for error in exc.errors():
        field_errors.append({
            "field": " -> ".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    return create_error_response(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        message="Validation failed",
        error_code="VALIDATION_ERROR",
        details={"field_errors": field_errors}
    )

async def custom_exception_handler(request: Request, exc: BaseCustomException) -> JSONResponse:
    """Handle custom exceptions"""
    log_error(exc, request, {"error_category": "custom"})
    
    # Map custom exceptions to HTTP status codes
    status_mapping = {
        DatabaseError: status.HTTP_500_INTERNAL_SERVER_ERROR,
        ExternalAPIError: status.HTTP_502_BAD_GATEWAY,
        ValidationError: status.HTTP_422_UNPROCESSABLE_ENTITY,
        BusinessLogicError: status.HTTP_400_BAD_REQUEST,
        ConflictError: status.HTTP_409_CONFLICT,
        NotFoundError: status.HTTP_404_NOT_FOUND,
        AuthenticationError: status.HTTP_401_UNAUTHORIZED,
        AuthorizationError: status.HTTP_403_FORBIDDEN,
        RateLimitError: status.HTTP_429_TOO_MANY_REQUESTS,
        CircuitBreakerError: status.HTTP_503_SERVICE_UNAVAILABLE,
    }
    
    status_code = status_mapping.get(type(exc), status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return create_error_response(
        status_code=status_code,
        message=exc.message,
        error_code=exc.error_code,
        details=exc.details
    )

async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle HTTP exceptions"""
    log_error(exc, request, {"error_category": "http"})
    
    return create_error_response(
        status_code=exc.status_code,
        message=exc.detail,
        error_code=f"HTTP_{exc.status_code}"
    )

async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle all other exceptions"""
    log_error(exc, request, {"error_category": "general"})
    
    return create_error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        message="Internal server error",
        error_code="INTERNAL_ERROR"
    )

# Circuit Breaker Implementation
class CircuitBreaker:
    def __init__(self, failure_threshold: int = 5, recovery_timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
    
    def call(self, func, *args, **kwargs):
        if self.state == "OPEN":
            if self._should_attempt_reset():
                self.state = "HALF_OPEN"
            else:
                raise CircuitBreakerError(
                    "Service temporarily unavailable",
                    error_code="CIRCUIT_BREAKER_OPEN",
                    details={"retry_after": self.recovery_timeout}
                )
        
        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise e
    
    def _on_success(self):
        self.failure_count = 0
        self.state = "CLOSED"
    
    def _on_failure(self):
        self.failure_count += 1
        self.last_failure_time = datetime.utcnow()
        
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"
    
    def _should_attempt_reset(self):
        if not self.last_failure_time:
            return True
        
        time_since_failure = (datetime.utcnow() - self.last_failure_time).total_seconds()
        return time_since_failure >= self.recovery_timeout

# Retry Logic Implementation
class RetryHandler:
    def __init__(self, max_retries: int = 3, base_delay: float = 1.0, max_delay: float = 60.0):
        self.max_retries = max_retries
        self.base_delay = base_delay
        self.max_delay = max_delay
    
    async def retry_async(self, func, *args, **kwargs):
        last_exception = None
        
        for attempt in range(self.max_retries + 1):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                last_exception = e
                
                if attempt == self.max_retries:
                    break
                
                # Calculate delay with exponential backoff
                delay = min(self.base_delay * (2 ** attempt), self.max_delay)
                
                logger.warning(f"Attempt {attempt + 1} failed, retrying in {delay}s: {str(e)}")
                
                import asyncio
                await asyncio.sleep(delay)
        
        raise last_exception

# Database Connection Health Check
class DatabaseHealthChecker:
    def __init__(self, db_session):
        self.db_session = db_session
    
    async def check_health(self) -> Dict[str, Any]:
        """Check database connection health"""
        try:
            # Simple query to test connection
            self.db_session.execute("SELECT 1")
            return {
                "status": "healthy",
                "timestamp": datetime.utcnow().isoformat(),
                "response_time": 0  # Could be measured
            }
        except Exception as e:
            logger.error(f"Database health check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e)
            } 