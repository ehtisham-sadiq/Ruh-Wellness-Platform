"""
API endpoints for the Virtual Wellness Platform.

This module contains all the API route handlers for managing
clients, appointments, and system operations.
"""

# API module - imports and exposes routers from individual modules
from .clients import router as clients_router
from .appointments import router as appointments_router

# This allows main.py to import like: from .api import clients, appointments
class ClientsModule:
    router = clients_router

class AppointmentsModule:
    router = appointments_router

clients = ClientsModule()
appointments = AppointmentsModule()