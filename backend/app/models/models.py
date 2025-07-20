from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text, Integer, JSON # type: ignore
from sqlalchemy.orm import relationship # type: ignore
from datetime import datetime

from ..db.database import Base

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone = Column(String(20))
    status = Column(String(20), default="active")  # active, inactive, pending
    notes = Column(Text)  # Additional client notes
    created_at = Column(DateTime, default=lambda: datetime.now())
    updated_at = Column(DateTime, onupdate=lambda: datetime.now())
    is_active = Column(Boolean, default=True)
    
    # Relationship with appointments
    appointments = relationship("Appointment", back_populates="client")

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(String, primary_key=True, index=True)
    client_id = Column(String, ForeignKey("clients.id"), nullable=False)
    time = Column(DateTime, nullable=False)
    status = Column(String(20), default="scheduled")  # scheduled, completed, cancelled, no-show
    notes = Column(Text)  # Appointment notes/comments
    is_recurring = Column(Boolean, default=False)
    recurring_pattern = Column(JSON)  # Store recurring pattern (weekly, monthly, etc.)
    reminder_sent = Column(Boolean, default=False)
    reminder_time = Column(DateTime)  # When reminder should be sent
    created_at = Column(DateTime, default=lambda: datetime.now())
    updated_at = Column(DateTime, onupdate=lambda: datetime.now())
    is_active = Column(Boolean, default=True)
    
    # Relationship with client
    client = relationship("Client", back_populates="appointments")

class Analytics(Base):
    __tablename__ = "analytics"
    
    id = Column(String, primary_key=True, index=True)
    date = Column(DateTime, nullable=False)
    metric_type = Column(String(50), nullable=False)  # appointment_count, client_count, etc.
    metric_value = Column(Integer, nullable=False)
    analytics_metadata = Column(JSON)  # Additional analytics data
    created_at = Column(DateTime, default=lambda: datetime.now()) 