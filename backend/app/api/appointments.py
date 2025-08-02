from fastapi import APIRouter, Depends, HTTPException, Query # type: ignore
from sqlalchemy.orm import Session # type: ignore
from typing import List, Optional
from datetime import datetime, timedelta
import uuid

from ..db.database import get_db
from ..models.models import Appointment, Client, Analytics
from ..models.schemas import (
    Appointment as AppointmentSchema, 
    AppointmentWithClient, 
    AppointmentCreate, 
    AppointmentUpdate,
    AppointmentAnalytics,
    SystemAnalytics
)
from ..services.mock_api_service import MockAPIService

router = APIRouter()

def _check_appointment_conflicts_internal(
    client_id: str,
    appointment_time: datetime,
    appointment_duration: int = 60,
    exclude_appointment_id: Optional[str] = None,
    db: Session = None
):
    """Internal helper function to check for appointment conflicts"""
    # Calculate time window
    start_time = appointment_time
    end_time = appointment_time + timedelta(minutes=appointment_duration)
    
    # Query for conflicting appointments
    query = db.query(Appointment).filter(
        Appointment.client_id == client_id,
        Appointment.status.in_(["scheduled", "completed"]),
        Appointment.time < end_time,
        Appointment.time + timedelta(minutes=60) > start_time  # Assume 60-minute appointments
    )
    
    if exclude_appointment_id:
        query = query.filter(Appointment.id != exclude_appointment_id)
    
    conflicts = query.all()
    
    return {
        "has_conflicts": len(conflicts) > 0,
        "conflicts": [
            {
                "id": apt.id,
                "time": apt.time,
                "status": apt.status,
                "client_name": apt.client.name if apt.client else "Unknown"
            }
            for apt in conflicts
        ]
    }

@router.get("/", response_model=List[AppointmentWithClient])
async def get_appointments(
    client_id: Optional[str] = Query(None, description="Filter by client ID"),
    status: Optional[str] = Query(None, description="Filter by appointment status"),
    date_from: Optional[datetime] = Query(None, description="Filter appointments from this date"),
    date_to: Optional[datetime] = Query(None, description="Filter appointments to this date"),
    is_recurring: Optional[bool] = Query(None, description="Filter by recurring appointments"),
    db: Session = Depends(get_db)
):
    """Get all appointments with optional filtering"""
    query = db.query(Appointment)
    
    if client_id:
        query = query.filter(Appointment.client_id == client_id)
    
    if status:
        query = query.filter(Appointment.status == status)
    
    if date_from is not None:
        query = query.filter(Appointment.time >= date_from)
    
    if date_to is not None:
        query = query.filter(Appointment.time <= date_to)
    
    if is_recurring is not None:
        query = query.filter(Appointment.is_recurring == is_recurring)
    
    appointments = query.order_by(Appointment.time).all()
    return appointments

@router.get("/conflicts")
async def check_appointment_conflicts(
    client_id: str,
    appointment_time: datetime,
    appointment_duration: int = Query(60, description="Appointment duration in minutes"),
    exclude_appointment_id: Optional[str] = Query(None, description="Exclude this appointment from conflict check"),
    db: Session = Depends(get_db)
):
    """Check for appointment conflicts"""
    # Calculate time window
    start_time = appointment_time
    end_time = appointment_time + timedelta(minutes=appointment_duration)
    
    # Query for conflicting appointments
    query = db.query(Appointment).filter(
        Appointment.client_id == client_id,
        Appointment.status.in_(["scheduled", "completed"]),
        Appointment.time < end_time,
        Appointment.time + timedelta(minutes=60) > start_time  # Assume 60-minute appointments
    )
    
    if exclude_appointment_id:
        query = query.filter(Appointment.id != exclude_appointment_id)
    
    conflicts = query.all()
    
    return {
        "has_conflicts": len(conflicts) > 0,
        "conflicts": [
            {
                "id": apt.id,
                "time": apt.time,
                "status": apt.status,
                "client_name": apt.client.name if apt.client else "Unknown"
            }
            for apt in conflicts
        ]
    }

@router.get("/analytics", response_model=AppointmentAnalytics)
async def get_appointment_analytics(
    date_from: Optional[datetime] = Query(None, description="Start date for analytics"),
    date_to: Optional[datetime] = Query(None, description="End date for analytics"),
    db: Session = Depends(get_db)
):
    """Get appointment analytics"""
    query = db.query(Appointment)
    
    if date_from is not None:
        query = query.filter(Appointment.time >= date_from)
    
    if date_to is not None:
        query = query.filter(Appointment.time <= date_to)
    
    appointments = query.all()
    
    # Calculate statistics
    total_appointments = len(appointments)
    scheduled_appointments = len([apt for apt in appointments if apt.status == "scheduled"])
    completed_appointments = len([apt for apt in appointments if apt.status == "completed"])
    cancelled_appointments = len([apt for apt in appointments if apt.status == "cancelled"])
    no_show_appointments = len([apt for apt in appointments if apt.status == "no-show"])
    
    current_time = datetime.now()
    upcoming_appointments = len([apt for apt in appointments if apt.status == "scheduled" and apt.time > current_time])
    
    completion_rate = (completed_appointments / total_appointments * 100) if total_appointments > 0 else 0
    cancellation_rate = (cancelled_appointments / total_appointments * 100) if total_appointments > 0 else 0
    
    return AppointmentAnalytics(
        total_appointments=total_appointments,
        scheduled_appointments=scheduled_appointments,
        completed_appointments=completed_appointments,
        cancelled_appointments=cancelled_appointments,
        no_show_appointments=no_show_appointments,
        upcoming_appointments=upcoming_appointments,
        completion_rate=completion_rate,
        cancellation_rate=cancellation_rate
    )

@router.get("/trends")
async def get_appointment_trends(
    days: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """Get appointment trends over time"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    # Get appointments in the date range
    appointments = db.query(Appointment).filter(
        Appointment.time >= start_date,
        Appointment.time <= end_date
    ).all()
    
    # Group by date
    daily_stats = {}
    for apt in appointments:
        date_key = apt.time.date().isoformat()
        if date_key not in daily_stats:
            daily_stats[date_key] = {
                "total": 0,
                "completed": 0,
                "cancelled": 0,
                "no_show": 0
            }
        
        daily_stats[date_key]["total"] += 1
        if apt.status == "completed":
            daily_stats[date_key]["completed"] += 1
        elif apt.status == "cancelled":
            daily_stats[date_key]["cancelled"] += 1
        elif apt.status == "no-show":
            daily_stats[date_key]["no_show"] += 1
    
    return {
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "days": days
        },
        "daily_stats": daily_stats,
        "summary": {
            "total_appointments": len(appointments),
            "avg_daily_appointments": len(appointments) / days if days > 0 else 0
        }
    }

@router.post("/", response_model=AppointmentSchema)
async def create_appointment(appointment_data: AppointmentCreate, db: Session = Depends(get_db)):
    """Create a new appointment with conflict checking"""
    # Check if client exists
    client = db.query(Client).filter(Client.id == appointment_data.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Check for conflicts
    conflicts = _check_appointment_conflicts_internal(
        appointment_data.client_id,
        appointment_data.time,
        60,
        None,
        db
    )
    
    if conflicts["has_conflicts"]:
        raise HTTPException(status_code=400, detail="Appointment conflicts with existing appointments")
    
    # Generate unique ID
    appointment_id = str(uuid.uuid4())
    
    appointment = Appointment(
        id=appointment_id,
        client_id=appointment_data.client_id,
        time=appointment_data.time,
        status=appointment_data.status,
        notes=appointment_data.notes,
        is_recurring=appointment_data.is_recurring,
        recurring_pattern=appointment_data.recurring_pattern,
        reminder_time=appointment_data.reminder_time
    )
    
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment

@router.post("/recurring")
async def create_recurring_appointments(
    base_appointment: AppointmentCreate,
    recurring_pattern: dict,
    db: Session = Depends(get_db)
):
    """Create recurring appointments based on pattern"""
    # Validate recurring pattern
    if "frequency" not in recurring_pattern or "count" not in recurring_pattern:
        raise HTTPException(status_code=400, detail="Invalid recurring pattern")
    
    frequency = recurring_pattern["frequency"]  # daily, weekly, monthly
    count = recurring_pattern["count"]
    
    if count <= 0 or count > 52:  # Limit to 52 appointments max
        raise HTTPException(status_code=400, detail="Invalid appointment count")
    
    created_appointments = []
    current_time = base_appointment.time
    
    for i in range(count):
        # Check for conflicts
        conflicts = _check_appointment_conflicts_internal(
            base_appointment.client_id,
            current_time,
            60,
            None,
            db
        )
        
        if not conflicts["has_conflicts"]:
            appointment_id = str(uuid.uuid4())
            appointment = Appointment(
                id=appointment_id,
                client_id=base_appointment.client_id,
                time=current_time,
                status=base_appointment.status,
                notes=base_appointment.notes,
                is_recurring=True,
                recurring_pattern=recurring_pattern,
                reminder_time=base_appointment.reminder_time
            )
            db.add(appointment)
            created_appointments.append(appointment)
        
        # Calculate next appointment time
        if frequency == "daily":
            current_time += timedelta(days=1)
        elif frequency == "weekly":
            current_time += timedelta(weeks=1)
        elif frequency == "monthly":
            # Simple monthly increment (30 days)
            current_time += timedelta(days=30)
    
    db.commit()
    return {
        "message": f"Created {len(created_appointments)} recurring appointments",
        "appointments": [apt.id for apt in created_appointments]
    }

@router.get("/{appointment_id}", response_model=AppointmentWithClient)
async def get_appointment(appointment_id: str, db: Session = Depends(get_db)):
    """Get a specific appointment"""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment

@router.put("/{appointment_id}", response_model=AppointmentSchema)
async def update_appointment(appointment_id: str, appointment_data: AppointmentUpdate, db: Session = Depends(get_db)):
    """Update an appointment"""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Check for conflicts if time is being changed
    if appointment_data.time and appointment_data.time != appointment.time:
        conflicts = _check_appointment_conflicts_internal(
            appointment.client_id,
            appointment_data.time,
            60,
            appointment_id,
            db
        )
        
        if conflicts["has_conflicts"]:
            raise HTTPException(status_code=400, detail="Appointment conflicts with existing appointments")
    
    # Update appointment fields
    update_data = appointment_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(appointment, field, value)
    
    db.commit()
    db.refresh(appointment)
    return appointment

@router.delete("/{appointment_id}")
async def delete_appointment(appointment_id: str, db: Session = Depends(get_db)):
    """Delete an appointment"""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    db.delete(appointment)
    db.commit()
    return {"message": "Appointment deleted successfully"}

@router.get("/reminders/pending")
async def get_pending_reminders(db: Session = Depends(get_db)):
    """Get appointments that need reminders sent"""
    current_time = datetime.now()
    
    # Find appointments that need reminders (within next 24 hours, not sent yet)
    reminder_cutoff = current_time + timedelta(hours=24)
    
    pending_reminders = db.query(Appointment).filter(
        Appointment.reminder_time <= reminder_cutoff,
        Appointment.reminder_sent == False,
        Appointment.status == "scheduled"
    ).all()
    
    return {
        "pending_reminders": [
            {
                "id": apt.id,
                "client_id": apt.client_id,
                "appointment_time": apt.time.isoformat(),
                "reminder_time": apt.reminder_time.isoformat() if apt.reminder_time else None
            }
            for apt in pending_reminders
        ]
    }

@router.post("/{appointment_id}/send-reminder")
async def send_appointment_reminder(appointment_id: str, db: Session = Depends(get_db)):
    """Mark appointment reminder as sent"""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment.reminder_sent = True
    db.commit()
    
    return {"message": "Reminder marked as sent"}