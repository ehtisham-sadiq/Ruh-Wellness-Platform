"""
Database models and schemas for the Virtual Wellness Platform.

This module contains SQLAlchemy models for data persistence
and Pydantic schemas for API request/response validation.
"""

from .models import Base, Client, Appointment

__all__ = ["Base", "Client", "Appointment"]