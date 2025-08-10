import React, { useState } from 'react';
import { createApiUrl, API_ENDPOINTS } from '../config/api';

const AddClientForm = ({ onClientAdded, onClose, testBackendConnection }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes - each field has its own stable handler
  const handleNameChange = (e) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
  };

  const handleEmailChange = (e) => {
    setFormData(prev => ({ ...prev, email: e.target.value }));
  };

  const handlePhoneChange = (e) => {
    setFormData(prev => ({ ...prev, phone: e.target.value }));
  };

  const handleStatusChange = (e) => {
    setFormData(prev => ({ ...prev, status: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all required fields (Name, Email, Phone)');
      return;
    }
    
    // Test backend connection first
    const isBackendRunning = await testBackendConnection();
    if (!isBackendRunning) {
      alert('Backend server is not running. Please start the backend server first.\n\nTo start the backend:\n1. Open terminal\n2. Navigate to the backend folder\n3. Run: python run_dev.py');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Submitting client data:', formData);
      
      const response = await fetch(createApiUrl(API_ENDPOINTS.clients), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const newClient = await response.json();
        console.log('New client created:', newClient);
        
        // Notify parent component
        onClientAdded(newClient);
        
        // Reset form
        setFormData({ name: '', email: '', phone: '', status: 'active' });
        
        // Close modal
        onClose();
        
        // Show success message
        alert('Client added successfully!');
      } else {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          console.error('Backend error response:', errorData);
          
          // Handle different error formats
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        console.error('Failed to add client:', response.status, errorMessage);
        
        // Show error message
        alert(`Failed to add client: ${errorMessage}`);
        
        // If it's a duplicate email error, clear the email field to help user
        if (errorMessage.includes('email already exists')) {
          setFormData(prev => ({ ...prev, email: '' }));
        }
      }
    } catch (error) {
      console.error('Error adding client:', error);
      alert(`Error adding client: ${error.message || 'Network error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          id="clientName"
          type="text"
          value={formData.name}
          onChange={handleNameChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter client name"
          required
        />
      </div>

      <div>
        <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          id="clientEmail"
          type="email"
          value={formData.email}
          onChange={handleEmailChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter email address"
          required
        />
      </div>

      <div>
        <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          id="clientPhone"
          type="tel"
          value={formData.phone}
          onChange={handlePhoneChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter phone number"
        />
      </div>

      <div>
        <label htmlFor="clientStatus" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="clientStatus"
          value={formData.status}
          onChange={handleStatusChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Adding...' : 'Add Client'}
        </button>
      </div>
    </form>
  );
};

export default AddClientForm;
