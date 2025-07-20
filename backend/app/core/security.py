import httpx   
from typing import Dict, Any, List
from .config import settings

class MockAPIClient:
    def __init__(self):
        self.base_url = settings.mock_api_url
        self.headers = {
            "Authorization": f"Bearer {settings.mock_api_key}",
            "Content-Type": "application/json"
        }
    
    async def get_clients(self) -> List[Dict[str, Any]]:
        """Fetch clients from mock API"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/clients",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
    
    async def get_appointments(self) -> List[Dict[str, Any]]:
        """Fetch appointments from mock API"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/appointments",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
    
    async def create_appointment(self, appointment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create appointment in mock API"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/appointments",
                headers=self.headers,
                json=appointment_data
            )
            response.raise_for_status()
            return response.json()