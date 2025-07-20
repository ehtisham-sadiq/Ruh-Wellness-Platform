import httpx
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime, timezone
import logging
from sqlalchemy.orm import Session # type: ignore

from ..db.database import SessionLocal
from ..models.models import Client, Appointment
from ..core.error_handlers import (
    ExternalAPIError,
    CircuitBreaker,
    RetryHandler,
    log_error
)

logger = logging.getLogger(__name__)

class MockAPIService:
    def __init__(self, enable_external_api=False):
        self.enable_external_api = enable_external_api
        self.base_url = "https://your-mock-server-url.com"
        self.api_key = "YOUR_API_KEY"
        self.timeout = 30.0
        
        # Initialize circuit breaker and retry handler
        self.circuit_breaker = CircuitBreaker(failure_threshold=3, recovery_timeout=60)
        self.retry_handler = RetryHandler(max_retries=3, base_delay=1.0, max_delay=10.0)
        
        # Health check cache
        self._health_cache = None
        self._health_cache_time = None
        self._cache_duration = 300  # 5 minutes
    
    async def _make_request(self, method: str, endpoint: str, data: Optional[Dict[str, Any]] = None) -> Any:
        """Make HTTP request with error handling and retry logic"""
        if not self.enable_external_api:
            # Return mock data when external API is disabled
            return self._get_mock_response(method, endpoint, data)
        
        url = f"{self.base_url}{endpoint}"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        async def _request():
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                try:
                    if method.upper() == "GET":
                        response = await client.get(url, headers=headers)
                    elif method.upper() == "POST":
                        response = await client.post(url, headers=headers, json=data)
                    elif method.upper() == "PUT":
                        response = await client.put(url, headers=headers, json=data)
                    elif method.upper() == "DELETE":
                        response = await client.delete(url, headers=headers)
                    else:
                        raise ExternalAPIError(f"Unsupported HTTP method: {method}")
                    
                    response.raise_for_status()
                    return response.json()
                    
                except httpx.TimeoutException:
                    raise ExternalAPIError(
                        "Request timeout",
                        error_code="TIMEOUT_ERROR",
                        details={"timeout": self.timeout}
                    )
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 429:
                        raise ExternalAPIError(
                            "Rate limit exceeded",
                            error_code="RATE_LIMIT_ERROR",
                            details={"retry_after": e.response.headers.get("Retry-After", 60)}
                        )
                    elif e.response.status_code >= 500:
                        raise ExternalAPIError(
                            "External service error",
                            error_code="EXTERNAL_SERVICE_ERROR",
                            details={"status_code": e.response.status_code}
                        )
                    else:
                        raise ExternalAPIError(
                            f"HTTP error: {e.response.status_code}",
                            error_code="HTTP_ERROR",
                            details={"status_code": e.response.status_code}
                        )
                except httpx.RequestError as e:
                    raise ExternalAPIError(
                        "Network error",
                        error_code="NETWORK_ERROR",
                        details={"error": str(e)}
                    )
        
        # Use circuit breaker and retry logic
        try:
            return await self.retry_handler.retry_async(
                lambda: self.circuit_breaker.call(_request)
            )
        except Exception as e:
            log_error(e, context={"service": "mock_api", "endpoint": endpoint})
            # Return mock data on error
            return self._get_mock_response(method, endpoint, data)
    
    def _get_mock_response(self, method: str, endpoint: str, data: Optional[Dict[str, Any]] = None) -> Any:
        """Return mock responses when external API is not available"""
        if endpoint == "/health":
            return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
        elif endpoint == "/clients":
            return [
                {"id": "1", "name": "John Doe", "email": "john@example.com", "phone": "1234567890"},
                {"id": "2", "name": "Jane Smith", "email": "jane@example.com", "phone": "9876543210"},
                {"id": "3", "name": "Ahmed Hassan", "email": "ahmed@example.com", "phone": "5555555555"},
                {"id": "4", "name": "Fatima Ali", "email": "fatima@example.com", "phone": "4444444444"},
                {"id": "5", "name": "Omar Khan", "email": "omar@example.com", "phone": "3333333333"},
            ]
        elif endpoint == "/appointments":
            return [
                {"id": "a1", "client_id": "1", "time": "2025-07-15T10:00:00Z"},
                {"id": "a2", "client_id": "2", "time": "2025-07-16T11:00:00Z"},
                {"id": "a3", "client_id": "3", "time": "2025-07-17T14:00:00Z"},
                {"id": "a4", "client_id": "4", "time": "2025-07-18T09:00:00Z"},
                {"id": "a5", "client_id": "5", "time": "2025-07-19T15:00:00Z"},
            ]
        elif method == "POST" and "/appointments" in endpoint:
            return {
                "id": f"demo_{datetime.now().timestamp()}",
                "client_id": data.get("client_id") if data else None,
                "time": data.get("time") if data else None
            }
        else:
            return {"message": "Mock response", "endpoint": endpoint}
    
    async def check_health(self) -> Dict[str, Any]:
        """Check external API health with caching"""
        current_time = datetime.utcnow()
        
        # Return cached result if still valid
        if (self._health_cache and self._health_cache_time and 
            (current_time - self._health_cache_time).total_seconds() < self._cache_duration):
            return self._health_cache
        
        try:
            health_data = await self._make_request("GET", "/health")
            self._health_cache = {
                "status": "healthy",
                "timestamp": current_time.isoformat(),
                "external_api": health_data
            }
            self._health_cache_time = current_time
            return self._health_cache
        except Exception as e:
            self._health_cache = {
                "status": "unhealthy",
                "timestamp": current_time.isoformat(),
                "error": str(e)
            }
            self._health_cache_time = current_time
            return self._health_cache
    
    async def sync_all_data(self):
        """Sync all clients and appointments from mock API with enhanced error handling"""
        db = SessionLocal()
        try:
            # Always use fallback data for demo purposes
            await self._create_fallback_data(db)
            db.commit()
            logger.info("Successfully created fallback data for demo")
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating fallback data: {e}")
            raise
        finally:
            db.close()
    
    async def sync_clients(self, db: Session):
        """Sync clients from mock API with error handling"""
        try:
            clients_data = await self._make_request("GET", "/clients")
            
            for client_data in clients_data:
                existing_client = db.query(Client).filter(Client.id == client_data["id"]).first()
                
                if existing_client:
                    existing_client.name = client_data["name"]
                    existing_client.email = client_data["email"]
                    existing_client.phone = client_data.get("phone")
                    existing_client.updated_at = datetime.now(timezone.utc)
                else:
                    new_client = Client(
                        id=client_data["id"],
                        name=client_data["name"],
                        email=client_data["email"],
                        phone=client_data.get("phone")
                    )
                    db.add(new_client)
            
            logger.info(f"Synced {len(clients_data)} clients")
            
        except Exception as e:
            logger.error(f"Error syncing clients: {e}")
            await self._create_fallback_clients(db)
    
    async def sync_appointments(self, db: Session):
        """Sync appointments from mock API with error handling"""
        try:
            appointments_data = await self._make_request("GET", "/appointments")
            
            for appointment_data in appointments_data:
                existing_appointment = db.query(Appointment).filter(
                    Appointment.id == appointment_data["id"]
                ).first()
                
                if existing_appointment:
                    existing_appointment.client_id = appointment_data["client_id"]
                    existing_appointment.time = datetime.fromisoformat(
                        appointment_data["time"].replace('Z', '+00:00')
                    )
                    existing_appointment.updated_at = datetime.now(timezone.utc)
                else:
                    new_appointment = Appointment(
                        id=appointment_data["id"],
                        client_id=appointment_data["client_id"],
                        time=datetime.fromisoformat(
                            appointment_data["time"].replace('Z', '+00:00')
                        )
                    )
                    db.add(new_appointment)
            
            logger.info(f"Synced {len(appointments_data)} appointments")
            
        except Exception as e:
            logger.error(f"Error syncing appointments: {e}")
            await self._create_fallback_appointments(db)
    
    async def create_appointment_in_mock_api(self, appointment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create appointment in external API with enhanced error handling"""
        try:
            # Validate required fields
            required_fields = ["client_id", "time"]
            for field in required_fields:
                if field not in appointment_data:
                    raise ExternalAPIError(
                        f"Missing required field: {field}",
                        error_code="VALIDATION_ERROR",
                        details={"missing_field": field}
                    )
            
            # Check external API health before making request
            health = await self.check_health()
            if health["status"] != "healthy":
                raise ExternalAPIError(
                    "External API is unhealthy",
                    error_code="EXTERNAL_API_UNHEALTHY",
                    details={"health_status": health}
                )
            
            response = await self._make_request("POST", "/appointments", appointment_data)
            
            logger.info(f"Successfully created appointment in external API: {response.get('id')}")
            return response
            
        except ExternalAPIError:
            # Re-raise external API errors
            raise
        except Exception as e:
            # Wrap other errors
            raise ExternalAPIError(
                f"Failed to create appointment in external API: {str(e)}",
                error_code="CREATION_ERROR",
                details={"original_error": str(e)}
            )
    
    async def update_appointment_in_mock_api(self, appointment_id: str, appointment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update appointment in external API"""
        try:
            response = await self._make_request("PUT", f"/appointments/{appointment_id}", appointment_data)
            logger.info(f"Successfully updated appointment in external API: {appointment_id}")
            return response
        except Exception as e:
            raise ExternalAPIError(
                f"Failed to update appointment in external API: {str(e)}",
                error_code="UPDATE_ERROR",
                details={"appointment_id": appointment_id}
            )
    
    async def delete_appointment_in_mock_api(self, appointment_id: str) -> Dict[str, Any]:
        """Delete appointment in external API"""
        try:
            response = await self._make_request("DELETE", f"/appointments/{appointment_id}")
            logger.info(f"Successfully deleted appointment in external API: {appointment_id}")
            return response
        except Exception as e:
            raise ExternalAPIError(
                f"Failed to delete appointment in external API: {str(e)}",
                error_code="DELETE_ERROR",
                details={"appointment_id": appointment_id}
            )
    
    async def sync_data(self) -> Dict[str, Any]:
        """Sync data with external API"""
        try:
            # Check health first
            health = await self.check_health()
            if health["status"] != "healthy":
                raise ExternalAPIError(
                    "Cannot sync data - external API is unhealthy",
                    error_code="SYNC_ERROR",
                    details={"health_status": health}
                )
            
            # Perform sync operations
            sync_results = {
                "appointments_synced": 0,
                "clients_synced": 0,
                "errors": []
            }
            
            # Mock sync operations
            await asyncio.sleep(2)  # Simulate sync time
            
            logger.info("Data sync completed successfully")
            return {
                "status": "success",
                "timestamp": datetime.utcnow().isoformat(),
                "results": sync_results
            }
            
        except Exception as e:
            raise ExternalAPIError(
                f"Data sync failed: {str(e)}",
                error_code="SYNC_ERROR"
            )
    
    async def _create_fallback_data(self, db: Session):
        """Create fallback data for demo purposes"""
        await self._create_fallback_clients(db)
        await self._create_fallback_appointments(db)
    
    async def _create_fallback_clients(self, db: Session):
        """Create fallback clients for demo purposes"""
        fallback_clients = [
            {"id": "1", "name": "John Doe", "email": "john@example.com", "phone": "1234567890"},
            {"id": "2", "name": "Jane Smith", "email": "jane@example.com", "phone": "9876543210"},
            {"id": "3", "name": "Ahmed Hassan", "email": "ahmed@example.com", "phone": "5555555555"},
            {"id": "4", "name": "Fatima Ali", "email": "fatima@example.com", "phone": "4444444444"},
            {"id": "5", "name": "Omar Khan", "email": "omar@example.com", "phone": "3333333333"},
        ]
        
        for client_data in fallback_clients:
            existing_client = db.query(Client).filter(Client.id == client_data["id"]).first()
            if not existing_client:
                new_client = Client(
                    id=client_data["id"],
                    name=client_data["name"],
                    email=client_data["email"],
                    phone=client_data["phone"]
                )
                db.add(new_client)
        
        logger.info("Created fallback clients for demo")
    
    async def _create_fallback_appointments(self, db: Session):
        """Create fallback appointments for demo purposes"""
        fallback_appointments = [
            {"id": "a1", "client_id": "1", "time": "2025-07-15T10:00:00Z"},
            {"id": "a2", "client_id": "2", "time": "2025-07-16T11:00:00Z"},
            {"id": "a3", "client_id": "3", "time": "2025-07-17T14:00:00Z"},
            {"id": "a4", "client_id": "4", "time": "2025-07-18T09:00:00Z"},
            {"id": "a5", "client_id": "5", "time": "2025-07-19T15:00:00Z"},
        ]
        
        for appointment_data in fallback_appointments:
            existing_appointment = db.query(Appointment).filter(
                Appointment.id == appointment_data["id"]
            ).first()
            if not existing_appointment:
                new_appointment = Appointment(
                    id=appointment_data["id"],
                    client_id=appointment_data["client_id"],
                    time=datetime.fromisoformat(
                        appointment_data["time"].replace('Z', '+00:00')
                    )
                )
                db.add(new_appointment)
        
        logger.info("Created fallback appointments for demo")
    
    def get_circuit_breaker_status(self) -> Dict[str, Any]:
        """Get circuit breaker status for monitoring"""
        return {
            "state": self.circuit_breaker.state,
            "failure_count": self.circuit_breaker.failure_count,
            "last_failure_time": self.circuit_breaker.last_failure_time.isoformat() if self.circuit_breaker.last_failure_time else None,
            "failure_threshold": self.circuit_breaker.failure_threshold,
            "recovery_timeout": self.circuit_breaker.recovery_timeout
        }