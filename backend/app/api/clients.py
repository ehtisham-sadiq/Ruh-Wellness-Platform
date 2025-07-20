from fastapi import APIRouter, Depends, HTTPException, Query, Response # type: ignore
from sqlalchemy.orm import Session # type: ignore
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import uuid
import csv
import io

from ..db.database import get_db
from ..models.models import Client, Appointment, Analytics
from ..models.schemas import (
    Client as ClientSchema, 
    ClientWithAppointments, 
    ClientCreate, 
    ClientUpdate,
    ClientAnalytics
)

router = APIRouter()

@router.get("/", response_model=List[ClientSchema])
async def get_clients(
    search: Optional[str] = Query(None, description="Search clients by name or email"),
    status: Optional[str] = Query(None, description="Filter by client status"),
    created_after: Optional[datetime] = Query(None, description="Filter clients created after this date"),
    created_before: Optional[datetime] = Query(None, description="Filter clients created before this date"),
    db: Session = Depends(get_db)
):
    """Get all clients with advanced filtering"""
    query = db.query(Client)
    
    if search:
        query = query.filter(
            (Client.name.ilike(f"%{search}%")) |
            (Client.email.ilike(f"%{search}%")) |
            (Client.phone.ilike(f"%{search}%"))
        )
    
    if status:
        query = query.filter(Client.status == status)
    
    if created_after is not None:
        query = query.filter(Client.created_at >= created_after)
    
    if created_before is not None:
        query = query.filter(Client.created_at <= created_before)
    
    clients = query.order_by(Client.created_at.desc()).all()
    return clients

@router.get("/export/csv")
async def export_clients_csv(
    status: Optional[str] = Query(None, description="Filter by client status"),
    db: Session = Depends(get_db)
):
    """Export clients to CSV format"""
    query = db.query(Client)
    
    if status:
        query = query.filter(Client.status == status)
    
    clients = query.all()
    
    # Create CSV content
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        'ID', 'Name', 'Email', 'Phone', 'Status', 
        'Notes', 'Created At', 'Updated At'
    ])
    
    # Write data
    for client in clients:
        writer.writerow([
            client.id,
            client.name,
            client.email,
            client.phone or '',
            client.status,
            client.notes or '',
            client.created_at.isoformat() if client.created_at else '',
            client.updated_at.isoformat() if client.updated_at else ''
        ])
    
    output.seek(0)
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=clients_export.csv"}
    )

@router.get("/analytics", response_model=ClientAnalytics)
async def get_client_analytics(db: Session = Depends(get_db)):
    """Get client analytics and statistics"""
    # Total clients
    total_clients = db.query(Client).count()
    
    # Active clients
    active_clients = db.query(Client).filter(Client.status == "active").count()
    
    # Inactive clients
    inactive_clients = db.query(Client).filter(Client.status == "inactive").count()
    
    # New clients this month
    start_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    new_clients_this_month = db.query(Client).filter(Client.created_at >= start_of_month).count()
    
    # Client growth rate (comparing to last month)
    start_of_last_month = (start_of_month - timedelta(days=1)).replace(day=1)
    end_of_last_month = start_of_month - timedelta(seconds=1)
    new_clients_last_month = db.query(Client).filter(
        Client.created_at >= start_of_last_month,
        Client.created_at <= end_of_last_month
    ).count()
    
    growth_rate = 0.0
    if new_clients_last_month > 0:
        growth_rate = ((new_clients_this_month - new_clients_last_month) / new_clients_last_month) * 100
    
    return ClientAnalytics(
        total_clients=total_clients,
        active_clients=active_clients,
        inactive_clients=inactive_clients,
        new_clients_this_month=new_clients_this_month,
        client_growth_rate=growth_rate
    )

@router.post("/", response_model=ClientSchema)
async def create_client(client_data: ClientCreate, db: Session = Depends(get_db)):
    """Create a new client"""
    # Check if client with same email already exists
    existing_client = db.query(Client).filter(Client.email == client_data.email).first()
    if existing_client:
        raise HTTPException(status_code=400, detail="Client with this email already exists")
    
    # Generate unique ID
    client_id = str(uuid.uuid4())
    
    client = Client(
        id=client_id,
        name=client_data.name,
        email=client_data.email,
        phone=client_data.phone,
        status=client_data.status or "active",
        notes=client_data.notes
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    return client

@router.get("/{client_id}", response_model=ClientWithAppointments)
async def get_client(client_id: str, db: Session = Depends(get_db)):
    """Get a specific client with their appointments"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.put("/{client_id}", response_model=ClientSchema)
async def update_client(client_id: str, client_data: ClientUpdate, db: Session = Depends(get_db)):
    """Update a client"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Check if email is being changed and if it conflicts with another client
    if client_data.email and client_data.email != client.email:
        existing_client = db.query(Client).filter(
            Client.email == client_data.email,
            Client.id != client_id
        ).first()
        if existing_client:
            raise HTTPException(status_code=400, detail="Client with this email already exists")
    
    # Update client fields
    update_data = client_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(client, field, value)
    
    db.commit()
    db.refresh(client)
    return client

@router.delete("/{client_id}")
async def delete_client(client_id: str, db: Session = Depends(get_db)):
    """Delete a client"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Check if client has appointments
    appointments = db.query(Appointment).filter(Appointment.client_id == client_id).count()
    if appointments > 0:
        raise HTTPException(status_code=400, detail="Cannot delete client with existing appointments")
    
    db.delete(client)
    db.commit()
    return {"message": "Client deleted successfully"}

@router.get("/{client_id}/appointments")
async def get_client_appointments(client_id: str, db: Session = Depends(get_db)):
    """Get appointments for a specific client"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    appointments = db.query(Appointment).filter(
        Appointment.client_id == client_id
    ).order_by(Appointment.time).all()
    
    return appointments

@router.get("/{client_id}/analytics")
async def get_single_client_analytics(client_id: str, db: Session = Depends(get_db)):
    """Get analytics for a specific client"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Get client's appointments
    appointments = db.query(Appointment).filter(Appointment.client_id == client_id).all()
    
    # Calculate statistics
    total_appointments = len(appointments)
    completed_appointments = len([apt for apt in appointments if apt.status == "completed"])
    cancelled_appointments = len([apt for apt in appointments if apt.status == "cancelled"])
    no_show_appointments = len([apt for apt in appointments if apt.status == "no-show"])
    current_time = datetime.now()
    upcoming_appointments = len([apt for apt in appointments if apt.status == "scheduled" and apt.time > current_time])
    
    completion_rate = (completed_appointments / total_appointments * 100) if total_appointments > 0 else 0
    cancellation_rate = (cancelled_appointments / total_appointments * 100) if total_appointments > 0 else 0
    
    return {
        "client_id": client_id,
        "client_name": client.name,
        "total_appointments": total_appointments,
        "completed_appointments": completed_appointments,
        "cancelled_appointments": cancelled_appointments,
        "no_show_appointments": no_show_appointments,
        "upcoming_appointments": upcoming_appointments,
        "completion_rate": completion_rate,
        "cancellation_rate": cancellation_rate,
        "client_since": client.created_at.isoformat() if client.created_at is not None else None
    }