import React from 'react';
import { User, Mail, Phone, Calendar, MapPin, Clock, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

const ClientDetailsModal = ({ client, open, onOpenChange }) => {
  if (!client) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAge = (birthDate) => {
    if (!birthDate) return 'Not specified';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return `${age} years old`;
  };

  const hasEmergencyContact = client.emergency_contact_name || client.emergency_contact_phone;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-health-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-health-600" />
            </div>
            <div>
              <div className="text-xl font-semibold text-calm-900">{client.name}</div>
              <div className="text-sm text-calm-600">Client ID: {client.id}</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Complete client information and medical history
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge variant={getStatusColor(client.status || 'active')}>
              {client.status || 'Active'} Client
            </Badge>
            <div className="text-sm text-calm-500">
              Last updated: {formatDate(client.updated_at)}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-calm-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-health-600" />
              Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-calm-600">
                  <Mail className="w-4 h-4" />
                  Email Address
                </div>
                <div className="font-medium text-calm-900">{client.email}</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-calm-600">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </div>
                <div className="font-medium text-calm-900">
                  {client.phone || 'Not provided'}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-calm-900 flex items-center gap-2">
              <User className="w-4 h-4 text-wellness-600" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-calm-600">
                  <Calendar className="w-4 h-4" />
                  Date of Birth
                </div>
                <div className="font-medium text-calm-900">
                  {formatDate(client.date_of_birth)}
                </div>
                {client.date_of_birth && (
                  <div className="text-sm text-calm-500">
                    {getAge(client.date_of_birth)}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-calm-600">
                  <User className="w-4 h-4" />
                  Gender
                </div>
                <div className="font-medium text-calm-900">
                  {client.gender || 'Not specified'}
                </div>
              </div>
            </div>

            {client.address && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-calm-600">
                  <MapPin className="w-4 h-4" />
                  Address
                </div>
                <div className="font-medium text-calm-900">{client.address}</div>
              </div>
            )}
          </div>

          <Separator />

          {/* Medical Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-calm-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-trust-600" />
              Medical Information
            </h3>
            
            <div className="space-y-4">
              {client.medical_history && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-calm-700">Medical History</div>
                  <div className="text-sm text-calm-600 bg-calm-50 p-3 rounded-lg">
                    {client.medical_history}
                  </div>
                </div>
              )}

              {client.allergies && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-calm-700">Allergies</div>
                  <div className="text-sm text-calm-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    {client.allergies}
                  </div>
                </div>
              )}

              {client.medications && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-calm-700">Current Medications</div>
                  <div className="text-sm text-calm-600 bg-health-50 p-3 rounded-lg border border-health-200">
                    {client.medications}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          {hasEmergencyContact && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-calm-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  Emergency Contact
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-calm-600">Contact Name</div>
                    <div className="font-medium text-calm-900">
                      {client.emergency_contact_name}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-calm-600">Contact Phone</div>
                    <div className="font-medium text-calm-900">
                      {client.emergency_contact_phone}
                    </div>
                  </div>
                </div>

                {client.emergency_contact_relationship && (
                  <div className="space-y-2">
                    <div className="text-sm text-calm-600">Relationship</div>
                    <div className="font-medium text-calm-900">
                      {client.emergency_contact_relationship}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Insurance Information */}
          {client.insurance_provider && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-calm-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-trust-600" />
                  Insurance Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-calm-600">Insurance Provider</div>
                    <div className="font-medium text-calm-900">
                      {client.insurance_provider}
                    </div>
                  </div>
                  
                  {client.insurance_policy_number && (
                    <div className="space-y-2">
                      <div className="text-sm text-calm-600">Policy Number</div>
                      <div className="font-medium text-calm-900">
                        {client.insurance_policy_number}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {client.notes && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-calm-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-calm-600" />
                  Additional Notes
                </h3>
                
                <div className="text-sm text-calm-600 bg-calm-50 p-3 rounded-lg">
                  {client.notes}
                </div>
              </div>
            </>
          )}

          {/* Missing Information Alert */}
          {!client.phone && !client.date_of_birth && !client.medical_history && (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This client profile is missing important information. Please update their details for better healthcare management.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t border-calm-200">
          <Button
            variant="outline"
            onClick={() => onOpenChange?.(false)}
          >
            Close
          </Button>
          <Button>
            Edit Client
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailsModal; 