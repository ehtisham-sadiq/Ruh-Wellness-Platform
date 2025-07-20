import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import apiService from '../services/apiService';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
      setError('Failed to load appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const getStatusBadge = (status) => {
    const variants = {
      scheduled: 'scheduled',
      completed: 'completed',
      cancelled: 'cancelled',
      'no-show': 'destructive'
    };
    return <Badge variant={variants[status] || 'secondary'}>{String(status)}</Badge>;
  };

  const formatDateTime = (dateTime) => {
    try {
      return new Date(dateTime).toLocaleString();
    } catch {
      return String(dateTime);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Button onClick={loadAppointments} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Appointment Management</h2>
          <p className="text-gray-600">Manage your wellness appointments</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointments ({appointments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No appointments found
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment, index) => (
                <div key={appointment.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{String(appointment.client?.name || 'Unknown Client')}</h3>
                    <p className="text-sm text-gray-600">{formatDateTime(appointment.time)}</p>
                    <p className="text-sm text-gray-500">{String(appointment.notes || 'No notes')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(appointment.status)}
                    {appointment.is_recurring && (
                      <Badge variant="outline">Recurring</Badge>
                    )}
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentManagement; 