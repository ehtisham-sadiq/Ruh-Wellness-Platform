import React, { useState, useEffect } from 'react';
import { createApiUrl, API_ENDPOINTS } from '../config/api';

const EditClientForm = ({ client, onClientUpdated, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when client changes
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        status: client.status || 'active'
      });
    }
  }, [client]);

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
    
    if (!client) {
      alert('No client selected for update');
      return;
    }
    
    // Validate form data
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all required fields (Name, Email, Phone)');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${createApiUrl(API_ENDPOINTS.clients)}${client.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const updatedClient = await response.json();
        
        // Notify parent component
        onClientUpdated(updatedClient);
        
        // Close modal
        onClose();
        
        alert('Client updated successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to update client: ${errorData.detail || errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating client:', error);
      alert(`Error updating client: ${error.message || 'Network error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!client) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No client selected</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="editClientName" className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          id="editClientName"
          type="text"
          value={formData.name}
          onChange={handleNameChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter client name"
          required
        />
      </div>

      <div>
        <label htmlFor="editClientEmail" className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          id="editClientEmail"
          type="email"
          value={formData.email}
          onChange={handleEmailChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter email address"
          required
        />
      </div>

      <div>
        <label htmlFor="editClientPhone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          id="editClientPhone"
          type="tel"
          value={formData.phone}
          onChange={handlePhoneChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter phone number"
        />
      </div>

      <div>
        <label htmlFor="editClientStatus" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="editClientStatus"
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
          {isSubmitting ? 'Updating...' : 'Update Client'}
        </button>
      </div>
    </form>
  );
};

export default EditClientForm;
