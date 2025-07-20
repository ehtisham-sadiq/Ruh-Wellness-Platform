from fastapi import APIRouter, Depends, Query # type: ignore
from sqlalchemy.orm import Session # type: ignore
from typing import Optional
from datetime import datetime, timedelta

from ..db.database import get_db
from ..models.models import Client, Appointment, Analytics
from ..models.schemas import SystemAnalytics, ClientAnalytics, AppointmentAnalytics

router = APIRouter()

@router.get("/dashboard", response_model=SystemAnalytics)
async def get_dashboard_analytics(db: Session = Depends(get_db)):
    """Get comprehensive dashboard analytics"""
    # Client analytics
    total_clients = db.query(Client).count()
    active_clients = db.query(Client).filter(Client.status == "active").count()
    inactive_clients = db.query(Client).filter(Client.status == "inactive").count()
    
    # New clients this month
    start_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    new_clients_this_month = db.query(Client).filter(Client.created_at >= start_of_month).count()
    
    # Client growth rate
    start_of_last_month = (start_of_month - timedelta(days=1)).replace(day=1)
    end_of_last_month = start_of_month - timedelta(seconds=1)
    new_clients_last_month = db.query(Client).filter(
        Client.created_at >= start_of_last_month,
        Client.created_at <= end_of_last_month
    ).count()
    
    growth_rate = 0.0
    if new_clients_last_month > 0:
        growth_rate = ((new_clients_this_month - new_clients_last_month) / new_clients_last_month) * 100
    
    client_analytics = ClientAnalytics(
        total_clients=total_clients,
        active_clients=active_clients,
        inactive_clients=inactive_clients,
        new_clients_this_month=new_clients_this_month,
        client_growth_rate=growth_rate
    )
    
    # Appointment analytics
    appointments = db.query(Appointment).all()
    total_appointments = len(appointments)
    scheduled_appointments = len([apt for apt in appointments if apt.status == "scheduled"])
    completed_appointments = len([apt for apt in appointments if apt.status == "completed"])
    cancelled_appointments = len([apt for apt in appointments if apt.status == "cancelled"])
    no_show_appointments = len([apt for apt in appointments if apt.status == "no-show"])
    
    current_time = datetime.now()
    upcoming_appointments = len([apt for apt in appointments if apt.status == "scheduled" and apt.time > current_time])
    
    completion_rate = (completed_appointments / total_appointments * 100) if total_appointments > 0 else 0
    cancellation_rate = (cancelled_appointments / total_appointments * 100) if total_appointments > 0 else 0
    
    appointment_analytics = AppointmentAnalytics(
        total_appointments=total_appointments,
        scheduled_appointments=scheduled_appointments,
        completed_appointments=completed_appointments,
        cancelled_appointments=cancelled_appointments,
        no_show_appointments=no_show_appointments,
        upcoming_appointments=upcoming_appointments,
        completion_rate=completion_rate,
        cancellation_rate=cancellation_rate
    )
    
    # Performance metrics
    performance_metrics = {
        "system_uptime": 99.9,  # Mock value
        "avg_response_time": 150,  # Mock value in ms
        "active_sessions": 25,  # Mock value
        "database_connections": 5,  # Mock value
        "last_backup": datetime.now().isoformat(),
        "storage_used": "2.5GB",  # Mock value
        "storage_total": "10GB"  # Mock value
    }
    
    return SystemAnalytics(
        clients=client_analytics,
        appointments=appointment_analytics,
        performance_metrics=performance_metrics
    )

@router.get("/trends")
async def get_system_trends(
    days: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """Get system trends over time"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    # Client trends
    clients = db.query(Client).filter(
        Client.created_at >= start_date,
        Client.created_at <= end_date
    ).all()
    
    # Appointment trends
    appointments = db.query(Appointment).filter(
        Appointment.time >= start_date,
        Appointment.time <= end_date
    ).all()
    
    # Group by date
    daily_stats = {}
    for client in clients:
        date_key = client.created_at.date().isoformat()
        if date_key not in daily_stats:
            daily_stats[date_key] = {
                "new_clients": 0,
                "appointments": 0,
                "completed_appointments": 0
            }
        daily_stats[date_key]["new_clients"] += 1
    
    for apt in appointments:
        date_key = apt.time.date().isoformat()
        if date_key not in daily_stats:
            daily_stats[date_key] = {
                "new_clients": 0,
                "appointments": 0,
                "completed_appointments": 0
            }
        daily_stats[date_key]["appointments"] += 1
        if apt.status == "completed":
            daily_stats[date_key]["completed_appointments"] += 1
    
    return {
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "days": days
        },
        "daily_stats": daily_stats,
        "summary": {
            "total_new_clients": len(clients),
            "total_appointments": len(appointments),
            "avg_daily_clients": len(clients) / days if days > 0 else 0,
            "avg_daily_appointments": len(appointments) / days if days > 0 else 0
        }
    }

@router.get("/reports/client-activity")
async def get_client_activity_report(
    client_id: Optional[str] = Query(None, description="Specific client ID"),
    date_from: Optional[datetime] = Query(None, description="Start date"),
    date_to: Optional[datetime] = Query(None, description="End date"),
    db: Session = Depends(get_db)
):
    """Generate client activity report"""
    query = db.query(Appointment)
    
    if client_id:
        query = query.filter(Appointment.client_id == client_id)
    
    if date_from is not None:
        query = query.filter(Appointment.time >= date_from)
    
    if date_to is not None:
        query = query.filter(Appointment.time <= date_to)
    
    appointments = query.all()
    
    # Group by client
    client_activity = {}
    for apt in appointments:
        if apt.client_id not in client_activity:
            client_activity[apt.client_id] = {
                "total_appointments": 0,
                "completed": 0,
                "cancelled": 0,
                "no_show": 0,
                "last_appointment": None
            }
        
        client_activity[apt.client_id]["total_appointments"] += 1
        
        if apt.status == "completed":
            client_activity[apt.client_id]["completed"] += 1
        elif apt.status == "cancelled":
            client_activity[apt.client_id]["cancelled"] += 1
        elif apt.status == "no-show":
            client_activity[apt.client_id]["no_show"] += 1
        
        if (client_activity[apt.client_id]["last_appointment"] is None or 
            apt.time > client_activity[apt.client_id]["last_appointment"]):
            client_activity[apt.client_id]["last_appointment"] = apt.time
    
    # Add client details
    for client_id, activity in client_activity.items():
        client = db.query(Client).filter(Client.id == client_id).first()
        if client:
            activity["client_name"] = client.name
            activity["client_email"] = client.email
            activity["client_status"] = client.status
    
    return {
        "report_period": {
            "date_from": date_from.isoformat() if date_from else None,
            "date_to": date_to.isoformat() if date_to else None
        },
        "client_activity": list(client_activity.values())
    }

@router.get("/reports/appointment-performance")
async def get_appointment_performance_report(
    date_from: Optional[datetime] = Query(None, description="Start date"),
    date_to: Optional[datetime] = Query(None, description="End date"),
    db: Session = Depends(get_db)
):
    """Generate appointment performance report"""
    query = db.query(Appointment)
    
    if date_from is not None:
        query = query.filter(Appointment.time >= date_from)
    
    if date_to is not None:
        query = query.filter(Appointment.time <= date_to)
    
    appointments = query.all()
    
    # Calculate performance metrics
    total_appointments = len(appointments)
    completed = len([apt for apt in appointments if apt.status == "completed"])
    cancelled = len([apt for apt in appointments if apt.status == "cancelled"])
    no_show = len([apt for apt in appointments if apt.status == "no-show"])
    scheduled = len([apt for apt in appointments if apt.status == "scheduled"])
    
    completion_rate = (completed / total_appointments * 100) if total_appointments > 0 else 0
    cancellation_rate = (cancelled / total_appointments * 100) if total_appointments > 0 else 0
    no_show_rate = (no_show / total_appointments * 100) if total_appointments > 0 else 0
    
    # Time-based analysis
    morning_appointments = len([apt for apt in appointments if 6 <= apt.time.hour < 12])
    afternoon_appointments = len([apt for apt in appointments if 12 <= apt.time.hour < 18])
    evening_appointments = len([apt for apt in appointments if 18 <= apt.time.hour < 22])
    
    return {
        "report_period": {
            "date_from": date_from.isoformat() if date_from else None,
            "date_to": date_to.isoformat() if date_to else None
        },
        "performance_metrics": {
            "total_appointments": total_appointments,
            "completion_rate": completion_rate,
            "cancellation_rate": cancellation_rate,
            "no_show_rate": no_show_rate,
            "scheduled_appointments": scheduled
        },
        "time_distribution": {
            "morning": morning_appointments,
            "afternoon": afternoon_appointments,
            "evening": evening_appointments
        },
        "status_breakdown": {
            "completed": completed,
            "cancelled": cancelled,
            "no_show": no_show,
            "scheduled": scheduled
        }
    } 