import React from 'react';
import { Calendar, Clock, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const AppointmentCard = ({ appointment, onEdit, onCancel }) => {
    const appointmentDate = new Date(appointment.time);
    const isUpcoming = appointmentDate > new Date();
    
    const getStatusVariant = (status) => {
      switch (status) {
        case 'cancelled': return 'cancelled';
        case 'completed': return 'completed';
        case 'scheduled': return 'scheduled';
        default: return 'pending';
      }
    };
    
    const getBorderColor = () => {
      if (appointment.status === 'cancelled') return 'border-l-red-500';
      if (isUpcoming) return 'border-l-wellness-500';
      return 'border-l-calm-400';
    };
    
    return (
      <Card className={`hover:shadow-medium transition-all duration-200 border-l-4 ${getBorderColor()}`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-wellness-100 rounded-full flex items-center justify-center mr-3">
                <Calendar className="w-5 h-5 text-wellness-600" />
              </div>
              <div>
                <h3 className="font-semibold text-calm-900">
                  {appointment.client?.name || 'Unknown Client'}
                </h3>
                <p className="text-sm text-calm-600">
                  {appointmentDate.toLocaleDateString()} at {appointmentDate.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex space-x-1">
              {appointment.status !== 'cancelled' && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(appointment)}
                    className="text-health-600 hover:text-health-700 hover:bg-health-50"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCancel(appointment.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-calm-600">
              <Clock className="w-4 h-4 mr-2 text-calm-400" />
              Status: <Badge variant={getStatusVariant(appointment.status)} className="ml-2">
                {appointment.status}
              </Badge>
            </div>
            <div className="text-sm text-calm-500">
              {appointment.client?.email}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

export default AppointmentCard;