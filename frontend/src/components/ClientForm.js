import React, { useState } from 'react';
import { X, Save, User, Mail, Phone, Calendar, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { useToast } from './ui/use-toast';
import { LoadingButton } from './LoadingStates';
import { 
  useFormValidation, 
  validationRules, 
  FormErrorSummary,
  ValidatedField 
} from './FormValidation';

const ClientForm = ({ client = null, onSave, onCancel, loading = false }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form validation schema
  const validationSchema = {
    name: [
      validationRules.required,
      validationRules.minLength(2),
      validationRules.maxLength(100)
    ],
    email: [
      validationRules.required,
      validationRules.email
    ],
    phone: [
      validationRules.phone
    ],
    date_of_birth: [
      validationRules.date,
      validationRules.pastDate
    ],
    address: [
      validationRules.maxLength(500)
    ],
    emergency_contact: [
      validationRules.maxLength(100)
    ],
    emergency_phone: [
      validationRules.phone
    ],
    notes: [
      validationRules.maxLength(1000)
    ]
  };

  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateForm,
    resetForm
  } = useFormValidation(
    {
      name: client?.name || '',
      email: client?.email || '',
      phone: client?.phone || '',
      date_of_birth: client?.date_of_birth || '',
      address: client?.address || '',
      emergency_contact: client?.emergency_contact || '',
      emergency_phone: client?.emergency_phone || '',
      notes: client?.notes || '',
      status: client?.status || 'active'
    },
    validationSchema
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(values);
      toast({
        title: "Success",
        description: client ? "Client updated successfully" : "Client created successfully",
        variant: "default",
      });
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save client",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (Object.keys(touched).length > 0) {
      if (window.confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
        resetForm();
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold">
          {client ? 'Edit Client' : 'Add New Client'}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormErrorSummary errors={errors} touched={touched} />
          
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <ValidatedField
              name="name"
              value={values.name}
              error={errors.name}
              touched={touched.name}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              {({ onChange, onBlur, hasError }) => (
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Full Name *</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={values.name}
                    onChange={onChange}
                    onBlur={onBlur}
                    className={hasError ? 'border-red-500' : ''}
                    placeholder="Enter full name"
                    disabled={loading || isSubmitting}
                  />
                </div>
              )}
            </ValidatedField>

            <ValidatedField
              name="email"
              value={values.email}
              error={errors.email}
              touched={touched.email}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              {({ onChange, onBlur, hasError }) => (
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email Address *</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={values.email}
                    onChange={onChange}
                    onBlur={onBlur}
                    className={hasError ? 'border-red-500' : ''}
                    placeholder="Enter email address"
                    disabled={loading || isSubmitting}
                  />
                </div>
              )}
            </ValidatedField>

            <ValidatedField
              name="phone"
              value={values.phone}
              error={errors.phone}
              touched={touched.phone}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              {({ onChange, onBlur, hasError }) => (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Phone Number</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={values.phone}
                    onChange={onChange}
                    onBlur={onBlur}
                    className={hasError ? 'border-red-500' : ''}
                    placeholder="Enter phone number"
                    disabled={loading || isSubmitting}
                  />
                </div>
              )}
            </ValidatedField>

            <ValidatedField
              name="date_of_birth"
              value={values.date_of_birth}
              error={errors.date_of_birth}
              touched={touched.date_of_birth}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              {({ onChange, onBlur, hasError }) => (
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth" className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Date of Birth</span>
                  </Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={values.date_of_birth}
                    onChange={onChange}
                    onBlur={onBlur}
                    className={hasError ? 'border-red-500' : ''}
                    disabled={loading || isSubmitting}
                  />
                </div>
              )}
            </ValidatedField>
          </div>

          <Separator />

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
            
            <ValidatedField
              name="address"
              value={values.address}
              error={errors.address}
              touched={touched.address}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              {({ onChange, onBlur, hasError }) => (
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Address</span>
                  </Label>
                  <Textarea
                    id="address"
                    value={values.address}
                    onChange={onChange}
                    onBlur={onBlur}
                    className={hasError ? 'border-red-500' : ''}
                    placeholder="Enter full address"
                    rows={3}
                    disabled={loading || isSubmitting}
                  />
                </div>
              )}
            </ValidatedField>
          </div>

          <Separator />

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Emergency Contact</h3>
            
            <ValidatedField
              name="emergency_contact"
              value={values.emergency_contact}
              error={errors.emergency_contact}
              touched={touched.emergency_contact}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              {({ onChange, onBlur, hasError }) => (
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact">Emergency Contact Name</Label>
                  <Input
                    id="emergency_contact"
                    type="text"
                    value={values.emergency_contact}
                    onChange={onChange}
                    onBlur={onBlur}
                    className={hasError ? 'border-red-500' : ''}
                    placeholder="Enter emergency contact name"
                    disabled={loading || isSubmitting}
                  />
                </div>
              )}
            </ValidatedField>

            <ValidatedField
              name="emergency_phone"
              value={values.emergency_phone}
              error={errors.emergency_phone}
              touched={touched.emergency_phone}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              {({ onChange, onBlur, hasError }) => (
                <div className="space-y-2">
                  <Label htmlFor="emergency_phone">Emergency Contact Phone</Label>
                  <Input
                    id="emergency_phone"
                    type="tel"
                    value={values.emergency_phone}
                    onChange={onChange}
                    onBlur={onBlur}
                    className={hasError ? 'border-red-500' : ''}
                    placeholder="Enter emergency contact phone"
                    disabled={loading || isSubmitting}
                  />
                </div>
              )}
            </ValidatedField>
          </div>

          <Separator />

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={values.status}
                onValueChange={(value) => handleChange('status', value)}
                disabled={loading || isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ValidatedField
              name="notes"
              value={values.notes}
              error={errors.notes}
              touched={touched.notes}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              {({ onChange, onBlur, hasError }) => (
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={values.notes}
                    onChange={onChange}
                    onBlur={onBlur}
                    className={hasError ? 'border-red-500' : ''}
                    placeholder="Enter any additional notes"
                    rows={4}
                    disabled={loading || isSubmitting}
                  />
                </div>
              )}
            </ValidatedField>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading || isSubmitting}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              loading={loading || isSubmitting}
              disabled={!isValid}
            >
              <Save className="w-4 h-4 mr-2" />
              {client ? 'Update Client' : 'Create Client'}
            </LoadingButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClientForm; 