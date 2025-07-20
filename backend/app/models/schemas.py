from pydantic import BaseModel, EmailStr # type: ignore
from typing import Optional, List, Dict, Any
from datetime import datetime

# Client schemas
class ClientBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    status: Optional[str] = "active"
    notes: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class Client(ClientBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_active: bool = True

    class Config:
        from_attributes = True

# Appointment schemas
class AppointmentBase(BaseModel):
    client_id: str
    time: datetime
    status: str = "scheduled"
    notes: Optional[str] = None
    is_recurring: Optional[bool] = False
    recurring_pattern: Optional[Dict[str, Any]] = None
    reminder_time: Optional[datetime] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    client_id: Optional[str] = None
    time: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    is_recurring: Optional[bool] = None
    recurring_pattern: Optional[Dict[str, Any]] = None
    reminder_time: Optional[datetime] = None

class Appointment(AppointmentBase):
    id: str
    reminder_sent: Optional[bool] = False
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Analytics schemas
class AnalyticsBase(BaseModel):
    date: datetime
    metric_type: str
    metric_value: int
    analytics_metadata: Optional[Dict[str, Any]] = None

class AnalyticsCreate(AnalyticsBase):
    pass

class Analytics(AnalyticsBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Schemas with relationships
class ClientWithAppointments(Client):
    appointments: List[Appointment] = []

class AppointmentWithClient(Appointment):
    client: Optional[Client] = None

# Analytics response schemas
class ClientAnalytics(BaseModel):
    total_clients: int
    active_clients: int
    inactive_clients: int
    new_clients_this_month: int
    client_growth_rate: float

class AppointmentAnalytics(BaseModel):
    total_appointments: int
    scheduled_appointments: int
    completed_appointments: int
    cancelled_appointments: int
    no_show_appointments: int
    upcoming_appointments: int
    completion_rate: float
    cancellation_rate: float

class SystemAnalytics(BaseModel):
    clients: ClientAnalytics
    appointments: AppointmentAnalytics
    performance_metrics: Dict[str, Any] 