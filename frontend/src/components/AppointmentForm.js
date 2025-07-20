import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

const AppointmentForm = ({ 
  clients, 
  onSubmit, 
  onCancel, 
  initialData = null,
  open = false,
  onOpenChange 
}) => {
  const [formData, setFormData] = useState({
    client_id: initialData?.client_id || '',
    time: initialData?.time ? new Date(initialData.time).toISOString().slice(0, 16) : '',
    status: initialData?.status || 'scheduled',
    notes: initialData?.notes || '',
    appointment_type: initialData?.appointment_type || 'consultation'
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        client_id: initialData.client_id || '',
        time: initialData.time ? new Date(initialData.time).toISOString().slice(0, 16) : '',
        status: initialData.status || 'scheduled',
        notes: initialData.notes || '',
        appointment_type: initialData.appointment_type || 'consultation'
      });
    } else {
      setFormData({
        client_id: '',
        time: '',
        status: 'scheduled',
        notes: '',
        appointment_type: 'consultation'
      });
    }
    setErrors({});
  }, [initialData]);

  // Simulate progress during submission
  useEffect(() => {
    if (isSubmitting) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [isSubmitting]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.client_id) {
      newErrors.client_id = 'Please select a client';
    }

    if (!formData.time) {
      newErrors.time = 'Please select appointment date and time';
    } else {
      const selectedTime = new Date(formData.time);
      const now = new Date();
      
      if (selectedTime <= now) {
        newErrors.time = 'Appointment time must be in the future';
      }
    }

    if (!formData.appointment_type) {
      newErrors.appointment_type = 'Please select appointment type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const appointmentData = {
        client_id: formData.client_id,
        time: new Date(formData.time).toISOString(),
        appointment_type: formData.appointment_type,
        notes: formData.notes,
        ...(initialData && { status: formData.status })
      };
      
      await onSubmit(appointmentData);
      setProgress(100);
      
      // Small delay to show completion
      setTimeout(() => {
        onOpenChange?.(false);
      }, 500);
      
    } catch (error) {
      console.error('Error submitting appointment:', error);
      setErrors({ submit: error.message || 'Failed to save appointment' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const appointmentTypes = [
    { value: 'consultation', label: 'Initial Consultation', color: 'text-health-600' },
    { value: 'follow_up', label: 'Follow-up Visit', color: 'text-wellness-600' },
    { value: 'emergency', label: 'Emergency Visit', color: 'text-red-600' },
    { value: 'routine', label: 'Routine Check-up', color: 'text-trust-600' },
    { value: 'therapy', label: 'Therapy Session', color: 'text-purple-600' }
  ];

  const getAppointmentTypeColor = (type) => {
    const appointmentType = appointmentTypes.find(t => t.value === type);
    return appointmentType?.color || 'text-calm-600';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-health-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-health-600" />
            </div>
            {initialData ? 'Edit Appointment' : 'Schedule New Appointment'}
          </DialogTitle>
          <DialogDescription>
            {initialData 
              ? 'Update appointment details and status'
              : 'Schedule a new appointment for a client'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Bar */}
          {isSubmitting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-calm-600">Saving appointment...</span>
                <span className="text-calm-600">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Error Alert */}
          {errors.submit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          {/* Client Selection */}
          <div className="space-y-2">
            <Label variant="required" htmlFor="client">
              Client
            </Label>
            <Select
              value={formData.client_id}
              onValueChange={(value) => setFormData({...formData, client_id: value})}
              disabled={initialData !== null}
            >
              <SelectTrigger className={errors.client_id ? "border-red-300 focus:border-red-500" : ""}>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-2"
                  />
                </div>
                {filteredClients.map(client => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-calm-400" />
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-xs text-calm-500">{client.email}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.client_id && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.client_id}
              </p>
            )}
          </div>

          {/* Appointment Type */}
          <div className="space-y-2">
            <Label variant="required" htmlFor="appointment_type">
              Appointment Type
            </Label>
            <Select
              value={formData.appointment_type}
              onValueChange={(value) => setFormData({...formData, appointment_type: value})}
            >
              <SelectTrigger className={errors.appointment_type ? "border-red-300 focus:border-red-500" : ""}>
                <SelectValue placeholder="Select appointment type" />
              </SelectTrigger>
              <SelectContent>
                {appointmentTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <span className={type.color}>{type.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.appointment_type && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.appointment_type}
              </p>
            )}
          </div>

          {/* Date & Time */}
          <div className="space-y-2">
            <Label variant="required" htmlFor="time">
              Date & Time
            </Label>
            <div className="relative">
              <Input
                type="datetime-local"
                id="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className={errors.time ? "border-red-300 focus:border-red-500" : ""}
                min={new Date().toISOString().slice(0, 16)}
              />
              <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-calm-400" />
            </div>
            {errors.time && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.time}
              </p>
            )}
          </div>

          {/* Status (only for editing) */}
          {initialData && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">
                    <span className="text-health-600">Scheduled</span>
                  </SelectItem>
                  <SelectItem value="completed">
                    <span className="text-wellness-600">Completed</span>
                  </SelectItem>
                  <SelectItem value="cancelled">
                    <span className="text-red-600">Cancelled</span>
                  </SelectItem>
                  <SelectItem value="no-show">
                    <span className="text-trust-600">No Show</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes or comments about this appointment..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
            />
            <p className="text-xs text-calm-500">
              Optional: Include any relevant information for healthcare staff
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="min-w-[100px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {initialData ? 'Update' : 'Schedule'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentForm;