import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { createApiUrl, API_ENDPOINTS } from './config/api';

// Dashboard with modern UI
const ProfessionalDashboard = () => {
  console.log('ProfessionalDashboard component is rendering...');
  
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Modal states
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [showDeleteClientModal, setShowDeleteClientModal] = useState(false);
  const [showClientDetailsModal, setShowClientDetailsModal] = useState(false);
  const [showClientAnalyticsModal, setShowClientAnalyticsModal] = useState(false);
  
  // Appointment modal states
  const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false);
  const [showDeleteAppointmentModal, setShowDeleteAppointmentModal] = useState(false);
  const [showAppointmentDetailsModal, setShowAppointmentDetailsModal] = useState(false);
  const [showAppointmentAnalyticsModal, setShowAppointmentAnalyticsModal] = useState(false);
  const [showRecurringAppointmentModal, setShowRecurringAppointmentModal] = useState(false);
  const [showConflictCheckModal, setShowConflictCheckModal] = useState(false);
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  
  // Loading states
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [isUpdatingAppointment, setIsUpdatingAppointment] = useState(false);
  const [isDeletingAppointment, setIsDeletingAppointment] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  
  // Backend status (legacy - kept for compatibility but not used)
  // const [backendStatus, setBackendStatus] = useState('checking');
  
  // System status state
  const [systemStatus, setSystemStatus] = useState({
    apiServer: { status: 'checking', message: 'Checking...', lastChecked: null },
    database: { status: 'checking', message: 'Checking...', lastChecked: null }
  });
  const [isCheckingSystemStatus, setIsCheckingSystemStatus] = useState(false);
  
  // Client management states
  const [clientSearch, setClientSearch] = useState('');
  const [clientStatusFilter, setClientStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [clientsPerPage, setClientsPerPage] = useState(5);
  
  // Appointment management states
  const [appointmentSearch, setAppointmentSearch] = useState('');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('all');
  const [appointmentDateFilter, setAppointmentDateFilter] = useState('');
  const [currentAppointmentPage, setCurrentAppointmentPage] = useState(1);
  const [appointmentsPerPage, setAppointmentsPerPage] = useState(5);
  
  // Selected client state
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientAnalytics, setClientAnalytics] = useState(null);
  const [clientAppointments, setClientAppointments] = useState([]);
  
  // Selected appointment state
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentAnalytics, setAppointmentAnalytics] = useState(null);
  const [appointmentConflicts, setAppointmentConflicts] = useState([]);
  const [pendingReminders, setPendingReminders] = useState([]);
  
  // Analytics state
  const [dashboardAnalytics, setDashboardAnalytics] = useState(null);
  const [systemTrends, setSystemTrends] = useState(null);
  const [clientActivityReport, setClientActivityReport] = useState(null);
  const [appointmentPerformanceReport, setAppointmentPerformanceReport] = useState(null);
  
  // Analytics modal states
  const [showDashboardAnalyticsModal, setShowDashboardAnalyticsModal] = useState(false);
  const [showSystemTrendsModal, setShowSystemTrendsModal] = useState(false);
  const [showClientActivityReportModal, setShowClientActivityReportModal] = useState(false);
  const [showAppointmentPerformanceReportModal, setShowAppointmentPerformanceReportModal] = useState(false);
  
  // Analytics loading states
  const [isLoadingDashboardAnalytics, setIsLoadingDashboardAnalytics] = useState(false);
  const [isLoadingSystemTrends, setIsLoadingSystemTrends] = useState(false);
  const [isLoadingClientActivityReport, setIsLoadingClientActivityReport] = useState(false);
  const [isLoadingAppointmentPerformanceReport, setIsLoadingAppointmentPerformanceReport] = useState(false);
  
  // Form states
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active'
  });
  
  const [editClientForm, setEditClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active'
  });

  const [appointmentForm, setAppointmentForm] = useState({
    client_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: ''
  });

  const [editAppointmentForm, setEditAppointmentForm] = useState({
    client_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: '',
    status: 'scheduled'
  });

  const [recurringAppointmentForm, setRecurringAppointmentForm] = useState({
    client_id: '',
    start_date: '',
    end_date: '',
    appointment_time: '',
    frequency: 'weekly', // weekly, biweekly, monthly
    notes: ''
  });

  const [conflictCheckForm, setConflictCheckForm] = useState({
    client_id: '',
    appointment_date: '',
    appointment_time: '',
    duration: 60 // minutes
  });

  // System status modal
  const [showSystemStatusModal, setShowSystemStatusModal] = useState(false);

  // Check API Server status
  const checkApiServerStatus = async () => {
    try {
      const startTime = Date.now();
      const response = await fetch(createApiUrl(API_ENDPOINTS.health), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const healthData = await response.json().catch(() => ({}));
        setSystemStatus(prev => ({
          ...prev,
          apiServer: {
            status: 'online',
            message: `Online (${responseTime}ms)`,
            lastChecked: new Date().toISOString(),
            details: healthData
          }
        }));
        return true;
      } else {
        setSystemStatus(prev => ({
          ...prev,
          apiServer: {
            status: 'error',
            message: `HTTP ${response.status}`,
            lastChecked: new Date().toISOString(),
            details: null
          }
        }));
        return false;
      }
    } catch (error) {
      setSystemStatus(prev => ({
        ...prev,
        apiServer: {
          status: 'offline',
          message: error.name === 'TimeoutError' ? 'Timeout' : 'Connection Failed',
          lastChecked: new Date().toISOString(),
          details: { error: error.message }
        }
      }));
      return false;
    }
  };

  // Check Database status
  const checkDatabaseStatus = async () => {
    try {
      const startTime = Date.now();
      const response = await fetch(createApiUrl(API_ENDPOINTS.healthDetailed), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const dbData = await response.json().catch(() => ({}));
        setSystemStatus(prev => ({
          ...prev,
          database: {
            status: 'connected',
            message: `Connected (${responseTime}ms)`,
            lastChecked: new Date().toISOString(),
            details: dbData
          }
        }));
        return true;
      } else {
        setSystemStatus(prev => ({
          ...prev,
          database: {
            status: 'error',
            message: `Database Error`,
            lastChecked: new Date().toISOString(),
            details: null
          }
        }));
        return false;
      }
    } catch (error) {
      setSystemStatus(prev => ({
        ...prev,
        database: {
          status: 'disconnected',
          message: 'Connection Failed',
          lastChecked: new Date().toISOString(),
          details: { error: error.message }
        }
      }));
      return false;
    }
  };

  // Comprehensive system status check
  const checkSystemStatus = useCallback(async () => {
    setIsCheckingSystemStatus(true);
    
    try {
      console.log('Checking system status...');
      
      // Check all components in parallel
      const [apiStatus, dbStatus] = await Promise.allSettled([
        checkApiServerStatus(),
        checkDatabaseStatus(),
      ]);
      
      console.log('System status check completed');
      
      // Return overall system health
      const allHealthy = apiStatus.status === 'fulfilled' && apiStatus.value &&
                        dbStatus.status === 'fulfilled' && dbStatus.value;
      
      return allHealthy;
    } catch (error) {
      console.error('System status check failed:', error);
      return false;
    } finally {
      setIsCheckingSystemStatus(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Test backend connection first
        console.log('Testing backend connection...');
        const healthResponse = await fetch(createApiUrl(API_ENDPOINTS.health));
        if (healthResponse.ok) {
          console.log('Backend is running and healthy');
        } else {
          console.error('Backend health check failed');
        }
        
        // Fetch clients
        const clientsResponse = await fetch(createApiUrl(API_ENDPOINTS.clients));
        const clientsData = await clientsResponse.json();
        
        // Fetch appointments
        const appointmentsResponse = await fetch(createApiUrl(API_ENDPOINTS.appointments));
        const appointmentsData = await appointmentsResponse.json();
        
        setClients(Array.isArray(clientsData) ? clientsData : []);
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      } catch (error) {
        console.error('Failed to load data:', error);
        setClients([]);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Initialize system status monitoring
  useEffect(() => {
    // Auto-refresh system status
    const startSystemStatusMonitoring = () => {
      // Initial check
      checkSystemStatus();
      
      // Set up periodic monitoring (every 30 seconds)
      const interval = setInterval(checkSystemStatus, 30000);
      
      // Cleanup function
      return () => clearInterval(interval);
    };

    const cleanup = startSystemStatusMonitoring();
    return cleanup;
  }, [checkSystemStatus]);

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      const response = await fetch('createApiUrl(API_ENDPOINTS.health)');
      if (response.ok) {
        console.log('Backend is running and healthy');
        return true;
      } else {
        console.error('Backend health check failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Backend connection failed:', error.message);
      return false;
    }
  };

  // Clear client form
  const clearClientForm = () => {
    setClientForm({ name: '', email: '', phone: '', status: 'active' });
  };

  // Filter and search clients
  const getFilteredClients = () => {
    let filtered = clients;

    // Apply search filter
    if (clientSearch.trim()) {
      const searchTerm = clientSearch.toLowerCase().trim();
      filtered = filtered.filter(client => 
        (client.name && client.name.toLowerCase().includes(searchTerm)) ||
        (client.email && client.email.toLowerCase().includes(searchTerm)) ||
        (client.phone && client.phone.toLowerCase().includes(searchTerm))
      );
    }

    // Apply status filter
    if (clientStatusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === clientStatusFilter);
    }

    return filtered;
  };

  // Get paginated clients
  const getPaginatedClients = () => {
    const filtered = getFilteredClients();
    const startIndex = (currentPage - 1) * clientsPerPage;
    const endIndex = startIndex + clientsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  // Get total pages
  const getTotalPages = () => {
    const filtered = getFilteredClients();
    return Math.ceil(filtered.length / clientsPerPage);
  };

  // Handle search and filter changes
  const handleSearchChange = (value) => {
    setClientSearch(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilterChange = (value) => {
    setClientStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle clients per page change
  const handleClientsPerPageChange = (value) => {
    setClientsPerPage(parseInt(value));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Handle form submissions
  const handleAddClient = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!clientForm.name || !clientForm.email || !clientForm.phone) {
      alert('Please fill in all required fields (Name, Email, Phone)');
      return;
    }
    
    // Test backend connection first
    const isBackendRunning = await testBackendConnection();
    if (!isBackendRunning) {
      alert('Backend server is not running. Please start the backend server first.\n\nTo start the backend:\n1. Open terminal\n2. Navigate to the backend folder\n3. Run: python run_dev.py');
      return;
    }
    
    setIsAddingClient(true);
    
    try {
      console.log('Submitting client data:', clientForm);
      
      const response = await fetch('createApiUrl(API_ENDPOINTS.clients)', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientForm),
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const newClient = await response.json();
        console.log('New client created:', newClient);
        
        // Update the clients list
        setClients(prevClients => [...prevClients, newClient]);
        
        // Reset form
        clearClientForm();
        
        // Close modal
        setShowAddClientModal(false);
        
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
          setClientForm(prev => ({ ...prev, email: '' }));
        }
      }
    } catch (error) {
      console.error('Error adding client:', error);
      alert(`Error adding client: ${error.message || 'Network error'}`);
    } finally {
      setIsAddingClient(false);
    }
  };

  // Get specific client details
  const handleGetClientDetails = async (clientId) => {
    try {
      const response = await fetch(`createApiUrl(API_ENDPOINTS.clients)${clientId}`);
      if (response.ok) {
        const clientData = await response.json();
        setSelectedClient(clientData);
        setShowClientDetailsModal(true);
      } else {
        console.error('Failed to get client details');
      }
    } catch (error) {
      console.error('Error getting client details:', error);
    }
  };

  // Update client
  const handleUpdateClient = async (e) => {
    e.preventDefault();
    
    if (!selectedClient) {
      alert('No client selected for update');
      return;
    }
    
    try {
      const response = await fetch(`createApiUrl(API_ENDPOINTS.clients)${selectedClient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editClientForm),
      });
      
      if (response.ok) {
        const updatedClient = await response.json();
        setClients(clients.map(client => 
          client.id === updatedClient.id ? updatedClient : client
        ));
        setShowEditClientModal(false);
        setSelectedClient(null);
        alert('Client updated successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to update client: ${errorData.detail || errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating client:', error);
      alert(`Error updating client: ${error.message || 'Network error'}`);
    }
  };

  // Delete client
  const handleDeleteClient = async () => {
    try {
      const response = await fetch(`createApiUrl(API_ENDPOINTS.clients)${selectedClient.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setClients(clients.filter(client => client.id !== selectedClient.id));
        setShowDeleteClientModal(false);
        setSelectedClient(null);
      } else {
        console.error('Failed to delete client');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  // Get client appointments
  const handleGetClientAppointments = async (clientId) => {
    try {
      const response = await fetch(`${createApiUrl(API_ENDPOINTS.clients)}${clientId}/appointments`);
      if (response.ok) {
        const appointmentsData = await response.json();
        setClientAppointments(appointmentsData);
      } else {
        console.error('Failed to get client appointments');
      }
    } catch (error) {
      console.error('Error getting client appointments:', error);
    }
  };

  // Get client analytics
  const handleGetClientAnalytics = async (clientId) => {
    try {
      const response = await fetch(`${createApiUrl(API_ENDPOINTS.clients)}${clientId}/analytics`);
      if (response.ok) {
        const analyticsData = await response.json();
        setClientAnalytics(analyticsData);
        setShowClientAnalyticsModal(true);
      } else {
        console.error('Failed to get client analytics');
      }
    } catch (error) {
      console.error('Error getting client analytics:', error);
    }
  };

  // Export clients to CSV
  const handleExportClientsCSV = async () => {
    try {
      const response = await fetch('createApiUrl(API_ENDPOINTS.clients)export/csv');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'clients_export.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to export clients');
      }
    } catch (error) {
      console.error('Error exporting clients:', error);
    }
  };

  // Open edit client modal
  const openEditClientModal = (client) => {
    setSelectedClient(client);
    setEditClientForm({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      status: client.status || 'active'
    });
    setShowEditClientModal(true);
  };

  // Open delete client modal
  const openDeleteClientModal = (client) => {
    setSelectedClient(client);
    setShowDeleteClientModal(true);
  };

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    
    if (!appointmentForm.client_id || !appointmentForm.appointment_date || !appointmentForm.appointment_time) {
      alert('Please fill in all required fields (Client, Date, Time)');
      return;
    }
    
    setIsAddingAppointment(true);
    
    try {
      const appointmentData = {
        client_id: parseInt(appointmentForm.client_id),
        time: `${appointmentForm.appointment_date}T${appointmentForm.appointment_time}:00`,
        notes: appointmentForm.notes || ''
      };
      
      console.log('Submitting appointment data:', appointmentData);
      
      const response = await fetch('createApiUrl(API_ENDPOINTS.appointments)', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });
      
      if (response.ok) {
        const newAppointment = await response.json();
        console.log('New appointment created:', newAppointment);
        
        setAppointments(prev => [...prev, newAppointment]);
        setAppointmentForm({ client_id: '', appointment_date: '', appointment_time: '', notes: '' });
        setShowAddAppointmentModal(false);
        alert('Appointment scheduled successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to schedule appointment: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      alert(`Error scheduling appointment: ${error.message || 'Network error'}`);
    } finally {
      setIsAddingAppointment(false);
    }
  };

  // Check appointment conflicts
  const handleCheckConflicts = async (e) => {
    e.preventDefault();
    
    if (!conflictCheckForm.client_id || !conflictCheckForm.appointment_date || !conflictCheckForm.appointment_time) {
      alert('Please fill in all required fields (Client, Date, Time)');
      return;
    }
    
    try {
      const conflictData = {
        client_id: parseInt(conflictCheckForm.client_id),
        appointment_date: conflictCheckForm.appointment_date,
        appointment_time: conflictCheckForm.appointment_time,
        duration: conflictCheckForm.duration
      };
      
      console.log('Checking conflicts for:', conflictData);
      
      const response = await fetch('createApiUrl(API_ENDPOINTS.appointments)conflicts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conflictData),
      });
      
      if (response.ok) {
        const conflicts = await response.json();
        setAppointmentConflicts(conflicts);
        setShowConflictCheckModal(true);
        console.log('Conflicts found:', conflicts);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to check conflicts: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error checking conflicts:', error);
      alert(`Error checking conflicts: ${error.message || 'Network error'}`);
    }
  };

  // Get appointment analytics
  const handleGetAppointmentAnalytics = async () => {
    try {
      console.log('Fetching appointment analytics...');
      
      const response = await fetch('createApiUrl(API_ENDPOINTS.appointments)analytics');
      
      if (response.ok) {
        const analytics = await response.json();
        setAppointmentAnalytics(analytics);
        setShowAppointmentAnalyticsModal(true);
        console.log('Appointment analytics:', analytics);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to fetch analytics: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching appointment analytics:', error);
      alert(`Error fetching analytics: ${error.message || 'Network error'}`);
    }
  };

  // Create recurring appointments
  const handleCreateRecurringAppointments = async (e) => {
    e.preventDefault();
    
    if (!recurringAppointmentForm.client_id || !recurringAppointmentForm.start_date || 
        !recurringAppointmentForm.end_date || !recurringAppointmentForm.appointment_time) {
      alert('Please fill in all required fields (Client, Start Date, End Date, Time)');
      return;
    }
    
    setIsAddingAppointment(true);
    
    try {
      const recurringData = {
        client_id: parseInt(recurringAppointmentForm.client_id),
        start_date: recurringAppointmentForm.start_date,
        end_date: recurringAppointmentForm.end_date,
        appointment_time: recurringAppointmentForm.appointment_time,
        frequency: recurringAppointmentForm.frequency,
        notes: recurringAppointmentForm.notes || ''
      };
      
      console.log('Creating recurring appointments:', recurringData);
      
      const response = await fetch('createApiUrl(API_ENDPOINTS.appointments)recurring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recurringData),
      });
      
      if (response.ok) {
        const newAppointments = await response.json();
        console.log('Recurring appointments created:', newAppointments);
        
        setAppointments(prev => [...prev, ...newAppointments]);
        setRecurringAppointmentForm({
          client_id: '', start_date: '', end_date: '', appointment_time: '', frequency: 'weekly', notes: ''
        });
        setShowRecurringAppointmentModal(false);
        alert(`Successfully created ${newAppointments.length} recurring appointments!`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to create recurring appointments: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating recurring appointments:', error);
      alert(`Error creating recurring appointments: ${error.message || 'Network error'}`);
    } finally {
      setIsAddingAppointment(false);
    }
  };

  // Get specific appointment details
  const handleGetAppointmentDetails = async (appointmentId) => {
    try {
      console.log('Fetching appointment details for ID:', appointmentId);
      
      const response = await fetch(`createApiUrl(API_ENDPOINTS.appointments)${appointmentId}`);
      
      if (response.ok) {
        const appointment = await response.json();
        setSelectedAppointment(appointment);
        setShowAppointmentDetailsModal(true);
        console.log('Appointment details:', appointment);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to fetch appointment details: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      alert(`Error fetching appointment details: ${error.message || 'Network error'}`);
    }
  };

  // Update appointment
  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    
    if (!selectedAppointment || !editAppointmentForm.client_id || 
        !editAppointmentForm.appointment_date || !editAppointmentForm.appointment_time) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsUpdatingAppointment(true);
    
    try {
      const updateData = {
        client_id: parseInt(editAppointmentForm.client_id),
        time: `${editAppointmentForm.appointment_date}T${editAppointmentForm.appointment_time}:00`,
        notes: editAppointmentForm.notes || '',
        status: editAppointmentForm.status
      };
      
      console.log('Updating appointment:', selectedAppointment.id, updateData);
      
      const response = await fetch(`createApiUrl(API_ENDPOINTS.appointments)${selectedAppointment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (response.ok) {
        const updatedAppointment = await response.json();
        console.log('Appointment updated:', updatedAppointment);
        
        setAppointments(prev => prev.map(apt => 
          apt.id === selectedAppointment.id ? { ...updatedAppointment, client: apt.client } : apt
        ));
        setShowEditAppointmentModal(false);
        setSelectedAppointment(null);
        alert('Appointment updated successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to update appointment: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert(`Error updating appointment: ${error.message || 'Network error'}`);
    } finally {
      setIsUpdatingAppointment(false);
    }
  };

  // Delete appointment
  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) {
      alert('No appointment selected for deletion');
      return;
    }
    
    setIsDeletingAppointment(true);
    
    try {
      console.log('Deleting appointment:', selectedAppointment.id);
      
      const response = await fetch(`createApiUrl(API_ENDPOINTS.appointments)${selectedAppointment.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        console.log('Appointment deleted successfully');
        
        setAppointments(prev => prev.filter(apt => apt.id !== selectedAppointment.id));
        setShowDeleteAppointmentModal(false);
        setSelectedAppointment(null);
        alert('Appointment deleted successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to delete appointment: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert(`Error deleting appointment: ${error.message || 'Network error'}`);
    } finally {
      setIsDeletingAppointment(false);
    }
  };

  // Get pending reminders
  const handleGetPendingReminders = async () => {
    try {
      console.log('Fetching pending reminders...');
      
      const response = await fetch('createApiUrl(API_ENDPOINTS.appointments)reminders/pending');
      
      if (response.ok) {
        const reminders = await response.json();
        setPendingReminders(reminders);
        setShowRemindersModal(true);
        console.log('Pending reminders:', reminders);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to fetch reminders: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching pending reminders:', error);
      alert(`Error fetching reminders: ${error.message || 'Network error'}`);
    }
  };

  // Send reminder
  const handleSendReminder = async (appointmentId) => {
    setIsSendingReminder(true);
    
    try {
      console.log('Sending reminder for appointment:', appointmentId);
      
      const response = await fetch(`${createApiUrl(API_ENDPOINTS.appointments)}${appointmentId}/send-reminder`, {
        method: 'POST',
      });
      
      if (response.ok) {
        console.log('Reminder sent successfully');
        alert('Reminder sent successfully!');
        
        // Refresh pending reminders
        handleGetPendingReminders();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to send reminder: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert(`Error sending reminder: ${error.message || 'Network error'}`);
    } finally {
      setIsSendingReminder(false);
    }
  };

  // Open edit appointment modal
  const openEditAppointmentModal = (appointment) => {
    setSelectedAppointment(appointment);
    setEditAppointmentForm({
      client_id: appointment.client?.id?.toString() || '',
      appointment_date: new Date(appointment.time).toISOString().split('T')[0],
      appointment_time: new Date(appointment.time).toTimeString().slice(0, 5),
      notes: appointment.notes || '',
      status: appointment.status || 'scheduled'
    });
    setShowEditAppointmentModal(true);
  };

  // Open delete appointment modal
  const openDeleteAppointmentModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDeleteAppointmentModal(true);
  };

  // Dashboard Icons (SVG)
  const DashboardIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 1v2m8-2v2" />
    </svg>
  );

  const UsersIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );

  const CalendarIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  const TrendUpIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your wellness platform...</p>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-400 via-blue-400 to-blue-400 rounded-2xl p-8 text-gray-900 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to Ruh Wellness Platform</h1>
            <p className="text-blue-100 font-bold text-lg">Manage your virtual wellness practice with comprehensive tools and insights</p>
          </div>
          {/* <div className="hidden md:block">
            <ActivityIcon />
          </div> */}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{clients.length.toString()}</p>
              <p className="text-xs text-blue-600 mt-1">
                <TrendUpIcon className="w-3 h-3 inline mr-1" />
                Active practice
              </p>
            </div>
            {/* <div className="bg-blue-100 p-2 rounded-lg">
              <UsersIcon className="text-blue-600" />
            </div> */}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{appointments.length.toString()}</p>
              <p className="text-xs text-blue-600 mt-1">
                <CalendarIcon className="w-3 h-3 inline mr-1" />
                Scheduled sessions
              </p>
            </div>
            {/* <div className="bg-green-100 p-2 rounded-lg">
              <CalendarIcon className="text-green-600" />
            </div> */}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900">{clients.filter(c => c.status === 'active').length.toString()}</p>
              <p className="text-xs text-blue-600 mt-1">
                <TrendUpIcon className="w-3 h-3 inline mr-1" />
                Engaged users
              </p>
            </div>
            {/* <div className="bg-emerald-100 p-2 rounded-lg">
              <UsersIcon className="text-emerald-600" />
            </div> */}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{appointments.filter(a => a.status === 'scheduled').length.toString()}</p>
              <p className="text-xs text-blue-600 mt-1">
                <CalendarIcon className="w-3 h-3 inline mr-1" />
                Upcoming sessions
              </p>
            </div>
            {/* <div className="bg-orange-100 p-2 rounded-lg">
              <CalendarIcon className="text-orange-600" />
            </div> */}
          </div>
        </div>
      </div>

      {/* Quick Actions & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="space-y-4">
            <button 
              onClick={() => setShowAddClientModal(true)}
              className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 border border-green-200"
            >
              <div className="flex items-center">
                <UsersIcon className="text-green-600 mr-3" />
                <span className="font-medium text-gray-900">Add New Client</span>
              </div>
              <span className="text-green-600">→</span>
            </button>
            <button 
              onClick={() => setShowAddAppointmentModal(true)}
              className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 border border-green-200"
            >
              <div className="flex items-center">
                <CalendarIcon className="text-green-600 mr-3" />
                <span className="font-medium text-gray-900">Schedule Appointment</span>
              </div>
              <span className="text-green-600">→</span>
            </button>
            <button 
              onClick={handleGetDashboardAnalytics}
              disabled={isLoadingDashboardAnalytics}
              className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center">
                <TrendUpIcon className="text-green-600 mr-3" />
                <span className="font-medium text-gray-900">
                  {isLoadingDashboardAnalytics ? 'Loading Analytics...' : 'Dashboard Analytics'}
                </span>
              </div>
              <span className="text-green-600">
                {isLoadingDashboardAnalytics ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : '→'}
              </span>
            </button>
            <button 
              onClick={handleGetSystemTrends}
              disabled={isLoadingSystemTrends}
              className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-medium text-gray-900">
                  {isLoadingSystemTrends ? 'Loading Trends...' : 'System Trends'}
                </span>
              </div>
              <span className="text-green-600">
                {isLoadingSystemTrends ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : '→'}
              </span>
            </button>
            <button 
              onClick={handleGetClientActivityReport}
              disabled={isLoadingClientActivityReport}
              className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center">
                <UsersIcon className="text-green-600 mr-3" />
                <span className="font-medium text-gray-900">
                  {isLoadingClientActivityReport ? 'Loading Report...' : 'Client Activity Report'}
                </span>
              </div>
              <span className="text-green-600">
                {isLoadingClientActivityReport ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : '→'}
              </span>
            </button>
            <button 
              onClick={handleGetAppointmentPerformanceReport}
              disabled={isLoadingAppointmentPerformanceReport}
              className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center">
                <CalendarIcon className="text-green-600 mr-3" />
                <span className="font-medium text-gray-900">
                  {isLoadingAppointmentPerformanceReport ? 'Loading Report...' : 'Appointment Performance Report'}
                </span>
              </div>
              <span className="text-green-600">
                {isLoadingAppointmentPerformanceReport ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : '→'}
              </span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">System Status</h3>
            <button
              onClick={checkSystemStatus}
              disabled={isCheckingSystemStatus}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isCheckingSystemStatus ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </>
              )}
            </button>
          </div>
          <div className="space-y-4">
            {/* API Server Status */}
            <div 
              onClick={() => setShowSystemStatusModal(true)}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 ${
                systemStatus.apiServer.status === 'online' ? 'bg-green-50 hover:bg-green-100' :
                systemStatus.apiServer.status === 'checking' ? 'bg-yellow-50 hover:bg-yellow-100' :
                'bg-red-50 hover:bg-red-100'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  systemStatus.apiServer.status === 'online' ? 'bg-green-500' :
                  systemStatus.apiServer.status === 'checking' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <span className="text-gray-900 font-medium">API Server</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${
                  systemStatus.apiServer.status === 'online' ? 'text-green-600' :
                  systemStatus.apiServer.status === 'checking' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {systemStatus.apiServer.message}
                </span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            
            {/* Database Status */}
            <div 
              onClick={() => setShowSystemStatusModal(true)}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 ${
                systemStatus.database.status === 'connected' ? 'bg-green-50 hover:bg-green-100' :
                systemStatus.database.status === 'checking' ? 'bg-yellow-50 hover:bg-yellow-100' :
                'bg-red-50 hover:bg-red-100'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  systemStatus.database.status === 'connected' ? 'bg-green-500' :
                  systemStatus.database.status === 'checking' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <span className="text-gray-900 font-medium">Database</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${
                  systemStatus.database.status === 'connected' ? 'text-green-600' :
                  systemStatus.database.status === 'checking' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {systemStatus.database.message}
                </span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            
            {/* Last Updated */}
            {systemStatus.apiServer.lastChecked && (
              <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
                Last updated: {new Date(systemStatus.apiServer.lastChecked).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderClients = () => {
    const filteredClients = getFilteredClients();
    const paginatedClients = getPaginatedClients();
    const totalPages = getTotalPages();
    const totalFilteredClients = filteredClients.length;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
            <p className="text-gray-600 mt-1">Manage your wellness clients and their information</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={handleExportClientsCSV}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium shadow-lg transition-colors duration-200 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            <button 
              onClick={() => setShowAddClientModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-colors duration-200 flex items-center"
            >
              <UsersIcon className="mr-2" />
              Add New Client
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search Bar */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Clients</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search by name, email, or phone number..."
                />
                {clientSearch && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={clientStatusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {paginatedClients.length} of {totalFilteredClients} clients
              {clientSearch && ` matching "${clientSearch}"`}
              {clientStatusFilter !== 'all' && ` with status "${clientStatusFilter}"`}
            </span>
            {totalFilteredClients !== clients.length && (
              <button
                onClick={() => {
                  handleSearchChange('');
                  handleStatusFilterChange('all');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
        
        {/* Client List */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900">
              All Clients ({totalFilteredClients.toString()})
            </h3>
          </div>
          
          <div className="p-5">
            {paginatedClients.length === 0 ? (
              <div className="text-center py-11">
                <UsersIcon className="mx-auto h-11 w-11 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filteredClients.length === 0 ? 'No clients found' : 'No clients match your search'}
                </h3>
                <p className="text-gray-500">
                  {filteredClients.length === 0 
                    ? 'Get started by adding your first client to the platform.'
                    : 'Try adjusting your search terms or filters.'
                  }
                </p>
                {filteredClients.length === 0 && (
                  <button
                    onClick={() => setShowAddClientModal(true)}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-medium"
                  >
                    Add First Client
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedClients.map((client, index) => (
                  <div key={client.id || index} className="flex items-center justify-between p-5 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {(client.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 truncate">{(client.name || 'Unknown').toString()}</h4>
                        <p className="text-gray-600 truncate">{(client.email || 'No email').toString()}</p>
                        <p className="text-gray-500 text-sm truncate">{(client.phone || 'No phone').toString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        client.status === 'active' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {(client.status || 'unknown').toString()}
                      </span>
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => handleGetClientDetails(client.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="View Details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => openEditClientModal(client)}
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Edit Client"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => openDeleteClientModal(client)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Delete Client"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-blue-50 px-6 py-4 border-t border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-blue-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-blue-700">Show:</span>
                    <select
                      value={clientsPerPage}
                      onChange={(e) => handleClientsPerPageChange(e.target.value)}
                      className="text-sm border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-blue-700">per page</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-blue-500 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAppointments = () => {
    const filteredAppointments = getFilteredAppointments();
    const paginatedAppointments = getPaginatedAppointments();
    const totalPages = getTotalAppointmentPages();
    const totalFilteredAppointments = filteredAppointments.length;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointment Management</h1>
            <p className="text-gray-600 mt-1">Schedule and manage wellness appointments</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={handleGetAppointmentAnalytics}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium shadow-lg transition-colors duration-200 flex items-center"
            >
              <TrendUpIcon className="mr-2" />
              Analytics
            </button>
            <button 
              onClick={() => setShowRecurringAppointmentModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium shadow-lg transition-colors duration-200 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Recurring
            </button>
            <button 
              onClick={handleGetPendingReminders}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium shadow-lg transition-colors duration-200 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.19 4.19A2 2 0 006 3h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" />
              </svg>
              Reminders
            </button>
            <button 
              onClick={() => setShowAddAppointmentModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-colors duration-200 flex items-center"
            >
              <CalendarIcon className="mr-2" />
              New Appointment
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Bar */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Appointments</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={appointmentSearch}
                  onChange={(e) => handleAppointmentSearchChange(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search by client name, email, or notes..."
                />
                {appointmentSearch && (
                  <button
                    onClick={() => handleAppointmentSearchChange('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={appointmentStatusFilter}
                onChange={(e) => handleAppointmentStatusFilterChange(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
              <input
                type="date"
                value={appointmentDateFilter}
                onChange={(e) => handleAppointmentDateFilterChange(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {paginatedAppointments.length} of {totalFilteredAppointments} appointments
              {appointmentSearch && ` matching "${appointmentSearch}"`}
              {appointmentStatusFilter !== 'all' && ` with status "${appointmentStatusFilter}"`}
              {appointmentDateFilter && ` on ${new Date(appointmentDateFilter).toLocaleDateString()}`}
            </span>
            {totalFilteredAppointments !== appointments.length && (
              <button
                onClick={() => {
                  handleAppointmentSearchChange('');
                  handleAppointmentStatusFilterChange('all');
                  handleAppointmentDateFilterChange('');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
        
        {/* Appointment List */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900">
              All Appointments ({totalFilteredAppointments.toString()})
            </h3>
          </div>
          
          <div className="p-5">
            {paginatedAppointments.length === 0 ? (
              <div className="text-center py-11">
                <CalendarIcon className="mx-auto h-11 w-11 text-blue-400 mb-4" />
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  {filteredAppointments.length === 0 ? 'No appointments found' : 'No appointments match your search'}
                </h3>
                <p className="text-blue-500">
                  {filteredAppointments.length === 0 
                    ? 'Schedule your first appointment to get started.'
                    : 'Try adjusting your search terms or filters.'
                  }
                </p>
                {filteredAppointments.length === 0 && (
                  <button
                    onClick={() => setShowAddAppointmentModal(true)}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Schedule First Appointment
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedAppointments.map((appointment, index) => (
                  <div key={appointment.id || index} className="flex items-center justify-between p-5 bg-white rounded-lg border border-blue-200 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white shadow-md">
                        <CalendarIcon />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 truncate">
                          {(appointment.client?.name || 'Unknown Client').toString()}
                        </h4>
                        <p className="text-gray-600 truncate">
                          {new Date(appointment.time).toLocaleString()}
                        </p>
                        <p className="text-gray-500 text-sm truncate">
                          {(appointment.notes || 'No notes').toString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        appointment.status === 'scheduled' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : appointment.status === 'completed'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : appointment.status === 'cancelled'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {(appointment.status || 'unknown').toString()}
                      </span>
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => handleGetAppointmentDetails(appointment.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="View Details"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => openEditAppointmentModal(appointment)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Edit Appointment"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => openDeleteAppointmentModal(appointment)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Delete Appointment"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-blue-50 px-6 py-4 border-t border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-blue-700">
                    Page {currentAppointmentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-blue-700">Show:</span>
                    <select
                      value={appointmentsPerPage}
                      onChange={(e) => handleAppointmentsPerPageChange(e.target.value)}
                      className="text-sm border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-blue-700">per page</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAppointmentPageChange(currentAppointmentPage - 1)}
                    disabled={currentAppointmentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-blue-500 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentAppointmentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentAppointmentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentAppointmentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handleAppointmentPageChange(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          currentAppointmentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-blue-700 bg-white border border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handleAppointmentPageChange(currentAppointmentPage + 1)}
                    disabled={currentAppointmentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-blue-500 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Modal Components
  const AddClientModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New Client</h2>
          <button
            onClick={() => setShowAddClientModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleAddClient} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={clientForm.name}
              onChange={(e) => setClientForm({...clientForm, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={clientForm.email}
              onChange={(e) => setClientForm({...clientForm, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={clientForm.phone}
              onChange={(e) => setClientForm({...clientForm, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={clientForm.status}
              onChange={(e) => setClientForm({...clientForm, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddClientModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAddingClient}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAddingClient ? 'Adding...' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const EditClientModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Client</h2>
          <button
            onClick={() => setShowEditClientModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleUpdateClient} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={editClientForm.name}
              onChange={(e) => setEditClientForm({...editClientForm, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={editClientForm.email}
              onChange={(e) => setEditClientForm({...editClientForm, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={editClientForm.phone}
              onChange={(e) => setEditClientForm({...editClientForm, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={editClientForm.status}
              onChange={(e) => setEditClientForm({...editClientForm, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowEditClientModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const DeleteClientModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Delete Client</h2>
          <button
            onClick={() => setShowDeleteClientModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete <strong>{selectedClient?.name}</strong>? This action cannot be undone.
          </p>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-800 text-sm">
              <strong>Warning:</strong> This will also delete all associated appointments and data.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteClientModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteClient}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Client
          </button>
        </div>
      </div>
    </div>
  );

  const ClientDetailsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Client Details</h2>
          <button
            onClick={() => setShowClientDetailsModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {selectedClient && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Name</label>
                    <p className="text-gray-900">{selectedClient.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{selectedClient.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-gray-900">{selectedClient.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedClient.status === 'active' ? 'bg-green-100 text-green-800' :
                      selectedClient.status === 'inactive' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedClient.status}
                    </span>
                  </div>
                </div>
              </div>
              
                              <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Appointments</h3>
                    <button
                      onClick={() => handleGetClientAppointments(selectedClient.id)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Refresh
                    </button>
                  </div>
                  <div className="space-y-3">
                    {clientAppointments.length > 0 ? (
                      clientAppointments.map((appointment, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium text-gray-900">
                            {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}
                          </p>
                          <p className="text-sm text-gray-600">{appointment.status}</p>
                          {appointment.notes && (
                            <p className="text-sm text-gray-500 mt-1">{appointment.notes}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No appointments found</p>
                    )}
                  </div>
                </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => {
                  setShowClientDetailsModal(false);
                  openEditClientModal(selectedClient);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Client
              </button>
                              <button
                  onClick={() => {
                    setShowClientDetailsModal(false);
                    openDeleteClientModal(selectedClient);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Client
                </button>
                <button
                  onClick={() => {
                    setShowClientDetailsModal(false);
                    handleGetClientAnalytics(selectedClient.id);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  View Analytics
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const ClientAnalyticsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Client Analytics</h2>
          <button
            onClick={() => setShowClientAnalyticsModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {clientAnalytics ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Total Appointments</h3>
                <p className="text-3xl font-bold text-blue-600">{clientAnalytics.total_appointments || 0}</p>
              </div>
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Completed</h3>
                <p className="text-3xl font-bold text-green-600">{clientAnalytics.completed_appointments || 0}</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Total Spent</h3>
                <p className="text-3xl font-bold text-purple-600">${clientAnalytics.total_spent || 0}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Analytics Data</h3>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap bg-white p-4 rounded-lg overflow-x-auto">
                {JSON.stringify(clientAnalytics, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500">Loading client analytics...</p>
          </div>
        )}
      </div>
    </div>
  );

  const AddAppointmentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Schedule Appointment</h2>
          <button
            onClick={() => setShowAddAppointmentModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleAddAppointment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
            <select
              value={appointmentForm.client_id}
              onChange={(e) => setAppointmentForm({...appointmentForm, client_id: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input
              type="date"
              value={appointmentForm.appointment_date}
              onChange={(e) => setAppointmentForm({...appointmentForm, appointment_date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
            <input
              type="time"
              value={appointmentForm.appointment_time}
              onChange={(e) => setAppointmentForm({...appointmentForm, appointment_time: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={appointmentForm.notes}
              onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional notes about the appointment..."
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddAppointmentModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAddingAppointment}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAddingAppointment ? 'Scheduling...' : 'Schedule Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const EditAppointmentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Appointment</h2>
          <button
            onClick={() => setShowEditAppointmentModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleUpdateAppointment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
            <select
              value={editAppointmentForm.client_id}
              onChange={(e) => setEditAppointmentForm({...editAppointmentForm, client_id: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input
              type="date"
              value={editAppointmentForm.appointment_date}
              onChange={(e) => setEditAppointmentForm({...editAppointmentForm, appointment_date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
            <input
              type="time"
              value={editAppointmentForm.appointment_time}
              onChange={(e) => setEditAppointmentForm({...editAppointmentForm, appointment_time: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={editAppointmentForm.status}
              onChange={(e) => setEditAppointmentForm({...editAppointmentForm, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={editAppointmentForm.notes}
              onChange={(e) => setEditAppointmentForm({...editAppointmentForm, notes: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional notes about the appointment..."
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowEditAppointmentModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdatingAppointment}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUpdatingAppointment ? 'Updating...' : 'Update Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const DeleteAppointmentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Delete Appointment</h2>
          <button
            onClick={() => setShowDeleteAppointmentModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this appointment?
          </p>
          {selectedAppointment && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-gray-900">
                {new Date(selectedAppointment.appointment_date).toLocaleDateString()} at {selectedAppointment.appointment_time}
              </p>
              <p className="text-sm text-gray-600">
                Client: {clients.find(c => c.id === selectedAppointment.client_id)?.name}
              </p>
              <p className="text-sm text-gray-600">
                Status: {selectedAppointment.status}
              </p>
            </div>
          )}
          <div className="bg-red-50 p-4 rounded-lg mt-4">
            <p className="text-red-800 text-sm">
              <strong>Warning:</strong> This action cannot be undone.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteAppointmentModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteAppointment}
            disabled={isDeletingAppointment}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDeletingAppointment ? 'Deleting...' : 'Delete Appointment'}
          </button>
        </div>
      </div>
    </div>
  );

  const AppointmentDetailsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Appointment Details</h2>
          <button
            onClick={() => setShowAppointmentDetailsModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {selectedAppointment && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Date</label>
                    <p className="text-gray-900">
                      {new Date(selectedAppointment.appointment_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Time</label>
                    <p className="text-gray-900">{selectedAppointment.appointment_time}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedAppointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      selectedAppointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      selectedAppointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedAppointment.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Client</label>
                    <p className="text-gray-900">
                      {clients.find(c => c.id === selectedAppointment.client_id)?.name}
                    </p>
                  </div>
                  {selectedAppointment.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Notes</label>
                      <p className="text-gray-900">{selectedAppointment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
                <div className="space-y-3">
                  {(() => {
                    const client = clients.find(c => c.id === selectedAppointment.client_id);
                    return client ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Name</label>
                          <p className="text-gray-900">{client.name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Email</label>
                          <p className="text-gray-900">{client.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Phone</label>
                          <p className="text-gray-900">{client.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Status</label>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            client.status === 'active' ? 'bg-green-100 text-green-800' :
                            client.status === 'inactive' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {client.status}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500">Client information not available</p>
                    );
                  })()}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => {
                  setShowAppointmentDetailsModal(false);
                  openEditAppointmentModal(selectedAppointment);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Appointment
              </button>
              <button
                onClick={() => {
                  setShowAppointmentDetailsModal(false);
                  openDeleteAppointmentModal(selectedAppointment);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Appointment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const AppointmentAnalyticsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Appointment Analytics</h2>
          <button
            onClick={() => setShowAppointmentAnalyticsModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {appointmentAnalytics ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Total Appointments</h3>
                <p className="text-3xl font-bold text-blue-600">{appointmentAnalytics.total_appointments || 0}</p>
              </div>
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Completion Rate</h3>
                <p className="text-3xl font-bold text-blue-600">{appointmentAnalytics.completion_rate || 0}%</p>
              </div>
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Average Duration</h3>
                <p className="text-3xl font-bold text-blue-600">{appointmentAnalytics.avg_duration || 0} min</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-5 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Analytics Data</h3>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap bg-white p-3 rounded-md overflow-x-auto">
                {JSON.stringify(appointmentAnalytics, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500">Loading appointment analytics...</p>
          </div>
        )}
      </div>
    </div>
  );

  const RecurringAppointmentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create Recurring Appointments</h2>
          <button
            onClick={() => setShowRecurringAppointmentModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleCreateRecurringAppointments} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
            <select
              value={recurringAppointmentForm.client_id}
              onChange={(e) => setRecurringAppointmentForm({...recurringAppointmentForm, client_id: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
            <input
              type="date"
              value={recurringAppointmentForm.start_date}
              onChange={(e) => setRecurringAppointmentForm({...recurringAppointmentForm, start_date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
            <input
              type="date"
              value={recurringAppointmentForm.end_date}
              onChange={(e) => setRecurringAppointmentForm({...recurringAppointmentForm, end_date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
            <input
              type="time"
              value={recurringAppointmentForm.appointment_time}
              onChange={(e) => setRecurringAppointmentForm({...recurringAppointmentForm, appointment_time: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
            <select
              value={recurringAppointmentForm.frequency}
              onChange={(e) => setRecurringAppointmentForm({...recurringAppointmentForm, frequency: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={recurringAppointmentForm.notes}
              onChange={(e) => setRecurringAppointmentForm({...recurringAppointmentForm, notes: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional notes for recurring appointments..."
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowRecurringAppointmentModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAddingAppointment}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAddingAppointment ? 'Creating...' : 'Create Recurring Appointments'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const ConflictCheckModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Check Appointment Conflicts</h2>
          <button
            onClick={() => setShowConflictCheckModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleCheckConflicts} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
            <select
              value={conflictCheckForm.client_id}
              onChange={(e) => setConflictCheckForm({...conflictCheckForm, client_id: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input
              type="date"
              value={conflictCheckForm.appointment_date}
              onChange={(e) => setConflictCheckForm({...conflictCheckForm, appointment_date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
            <input
              type="time"
              value={conflictCheckForm.appointment_time}
              onChange={(e) => setConflictCheckForm({...conflictCheckForm, appointment_time: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
            <input
              type="number"
              value={conflictCheckForm.duration}
              onChange={(e) => setConflictCheckForm({...conflictCheckForm, duration: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="15"
              max="480"
              step="15"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowConflictCheckModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Check Conflicts
            </button>
          </div>
        </form>
        
        {appointmentConflicts.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conflicts Found</h3>
            <div className="space-y-3">
              {appointmentConflicts.map((conflict, index) => (
                <div key={index} className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="font-medium text-red-900">
                    {new Date(conflict.appointment_date).toLocaleDateString()} at {conflict.appointment_time}
                  </p>
                  <p className="text-sm text-red-700">
                    Client: {clients.find(c => c.id === conflict.client_id)?.name}
                  </p>
                  <p className="text-sm text-red-700">
                    Status: {conflict.status}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const RemindersModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Pending Reminders</h2>
          <button
            onClick={() => setShowRemindersModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          {pendingReminders.length > 0 ? (
            pendingReminders.map((reminder, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(reminder.appointment_date).toLocaleDateString()} at {reminder.appointment_time}
                    </p>
                    <p className="text-sm text-gray-600">
                      Client: {clients.find(c => c.id === reminder.client_id)?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Status: {reminder.status}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSendReminder(reminder.id)}
                    disabled={isSendingReminder}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSendingReminder ? 'Sending...' : 'Send Reminder'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM20 4v6h-2V4h2zM4 4v6h2V4H4z" />
              </svg>
              <p className="text-gray-500">No pending reminders</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Analytics Modal Components
  const DashboardAnalyticsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h2>
          <button
            onClick={() => setShowDashboardAnalyticsModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {dashboardAnalytics ? (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold text-blue-600">
                  ${dashboardAnalytics.total_revenue || 0}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {dashboardAnalytics.revenue_growth || 0}% from last month
                </p>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Active Clients</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {dashboardAnalytics.active_clients || 0}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {dashboardAnalytics.client_growth || 0}% from last month
                </p>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Appointments</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {dashboardAnalytics.total_appointments || 0}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {dashboardAnalytics.appointment_growth || 0}% from last month
                </p>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Completion Rate</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {dashboardAnalytics.completion_rate || 0}%
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {dashboardAnalytics.completion_growth || 0}% from last month
                </p>
              </div>
            </div>

            {/* Charts and Detailed Data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
                <div className="space-y-3">
                  {dashboardAnalytics.monthly_trends ? (
                    Object.entries(dashboardAnalytics.monthly_trends).map(([month, data]) => (
                      <div key={month} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="font-medium text-gray-700">{month}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">${data.revenue}</span>
                          <span className="text-sm text-gray-600">{data.appointments} apts</span>
                          <span className="text-sm text-gray-600">{data.clients} clients</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No trend data available</p>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Average Session Duration</span>
                    <span className="font-semibold text-gray-900">
                      {dashboardAnalytics.avg_session_duration || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Client Retention Rate</span>
                    <span className="font-semibold text-gray-900">
                      {dashboardAnalytics.client_retention_rate || 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">No-Show Rate</span>
                    <span className="font-semibold text-gray-900">
                      {dashboardAnalytics.no_show_rate || 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Average Revenue per Client</span>
                    <span className="font-semibold text-gray-900">
                      ${dashboardAnalytics.avg_revenue_per_client || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Raw Data */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Analytics Data</h3>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap bg-white p-4 rounded-lg overflow-x-auto">
                {JSON.stringify(dashboardAnalytics, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500">Loading dashboard analytics...</p>
          </div>
        )}
      </div>
    </div>
  );

  const SystemTrendsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">System Trends</h2>
          <button
            onClick={() => setShowSystemTrendsModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>


        {systemTrends ? (
          <div className="space-y-8">
            {/* Trend Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Client Growth</h3>
                <p className="text-3xl font-bold">{systemTrends.client_growth_rate || 0}%</p>
                <p className="text-sm text-blue-700 mt-1">Monthly growth rate</p>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Revenue Trend</h3>
                <p className="text-3xl font-bold">{systemTrends.revenue_trend || 0}%</p>
                <p className="text-sm text-blue-700 mt-1">Monthly revenue change</p>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Engagement</h3>
                <p className="text-3xl font-bold">{systemTrends.engagement_rate || 0}%</p>
                <p className="text-sm text-blue-700 mt-1">Client engagement</p>
              </div>
            </div>

            {/* Detailed Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Acquisition Trends</h3>
                <div className="space-y-3">
                  {systemTrends.client_acquisition_trends ? (
                    systemTrends.client_acquisition_trends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="font-medium text-gray-700">{trend.period}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">{trend.new_clients} new</span>
                          <span className={`text-sm font-medium ${
                            trend.growth >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {trend.growth >= 0 ? '+' : ''}{trend.growth}%
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No acquisition data available</p>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
                <div className="space-y-3">
                  {systemTrends.revenue_trends ? (
                    systemTrends.revenue_trends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="font-medium text-gray-700">{trend.period}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">${trend.revenue}</span>
                          <span className={`text-sm font-medium ${
                            trend.growth >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {trend.growth >= 0 ? '+' : ''}{trend.growth}%
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No revenue data available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Indicators</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Client Retention</h4>
                  <p className="text-2xl font-bold text-blue-600">{systemTrends.client_retention || 0}%</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Session Completion</h4>
                  <p className="text-2xl font-bold text-blue-600">{systemTrends.session_completion || 0}%</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Average Rating</h4>
                  <p className="text-2xl font-bold text-blue-600">{systemTrends.average_rating || 0}/5</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Response Time</h4>
                  <p className="text-2xl font-bold text-blue-600">{systemTrends.avg_response_time || 0}h</p>
                </div>
              </div>
            </div>

            {/* Raw Data */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Trends Data</h3>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap bg-white p-4 rounded-lg overflow-x-auto">
                {JSON.stringify(systemTrends, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500">Loading system trends...</p>
          </div>
        )}
      </div>
    </div>
  );

  const ClientActivityReportModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Client Activity Report</h2>
          <button
            onClick={() => setShowClientActivityReportModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {clientActivityReport ? (
          <div className="space-y-8">
            {/* Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Total Clients</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {clientActivityReport.total_clients || 0}
                </p>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Active Clients</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {clientActivityReport.active_clients || 0}
                </p>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">New This Month</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {clientActivityReport.new_clients_this_month || 0}
                </p>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Engagement Rate</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {clientActivityReport.engagement_rate || 0}%
                </p>
              </div>
            </div>

            {/* Client Activity Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Clients</h3>
                <div className="space-y-3">
                  {clientActivityReport.most_active_clients ? (
                    clientActivityReport.most_active_clients.map((client, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{client.name}</p>
                          <p className="text-sm text-gray-600">{client.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{client.appointment_count} sessions</p>
                          <p className="text-sm text-gray-600">${client.total_spent}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No active client data available</p>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Engagement by Status</h3>
                <div className="space-y-3">
                  {clientActivityReport.engagement_by_status ? (
                    Object.entries(clientActivityReport.engagement_by_status).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="font-medium text-gray-700 capitalize">{status}</span>
                        <span className="font-semibold text-gray-900">{count} clients</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No status data available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Client Activity</h3>
              <div className="space-y-3">
                {clientActivityReport.recent_activity ? (
                  clientActivityReport.recent_activity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{activity.client_name}</p>
                        <p className="text-sm text-gray-600">{activity.action}</p>
                      </div>
                      <span className="text-sm text-gray-500">{activity.timestamp}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent activity data available</p>
                )}
              </div>
            </div>

            {/* Raw Data */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Activity Data</h3>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap bg-white p-4 rounded-lg overflow-x-auto">
                {JSON.stringify(clientActivityReport, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-gray-500">Loading client activity report...</p>
          </div>
        )}
      </div>
    </div>
  );

  const AppointmentPerformanceReportModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Appointment Performance Report</h2>
          <button
            onClick={() => setShowAppointmentPerformanceReportModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
    {/* <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold text-blue-600">
                  ${dashboardAnalytics.total_revenue || 0}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {dashboardAnalytics.revenue_growth || 0}% from last month
                </p>
              </div> */}

        {appointmentPerformanceReport ? (
          <div className="space-y-8">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Total Appointments</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {appointmentPerformanceReport.total_appointments || 0}
                </p>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Completion Rate</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {appointmentPerformanceReport.completion_rate || 0}%
                </p>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">No-Show Rate</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {appointmentPerformanceReport.no_show_rate || 0}%
                </p>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Average Rating</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {appointmentPerformanceReport.average_rating || 0}/5
                </p>
              </div>
            </div>

            {/* Performance Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointments by Status</h3>
                <div className="space-y-3">
                  {appointmentPerformanceReport.appointments_by_status ? (
                    Object.entries(appointmentPerformanceReport.appointments_by_status).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="font-medium text-gray-700 capitalize">{status}</span>
                        <span className="font-semibold text-gray-900">{count} appointments</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No status data available</p>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
                <div className="space-y-3">
                  {appointmentPerformanceReport.monthly_performance ? (
                    appointmentPerformanceReport.monthly_performance.map((month, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="font-medium text-gray-700">{month.month}</span>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{month.appointments} apts</p>
                          <p className="text-sm text-gray-600">{month.completion_rate}% completion</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No monthly data available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Top Performing Time Slots */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Time Slots</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {appointmentPerformanceReport.top_time_slots ? (
                  appointmentPerformanceReport.top_time_slots.map((slot, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">{slot.time_slot}</h4>
                      <p className="text-2xl font-bold text-blue-600">{slot.appointment_count}</p>
                      <p className="text-sm text-gray-600">{slot.completion_rate}% completion</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4 col-span-full">No time slot data available</p>
                )}
              </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
              <div className="space-y-4">
                {appointmentPerformanceReport.insights ? (
                  appointmentPerformanceReport.insights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        insight.type === 'positive' ? 'bg-green-500' :
                        insight.type === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{insight.title}</p>
                        <p className="text-sm text-gray-600">{insight.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No insights available</p>
                )}
              </div>
            </div>

            {/* Raw Data */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Performance Data</h3>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap bg-white p-4 rounded-lg overflow-x-auto">
                {JSON.stringify(appointmentPerformanceReport, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500">Loading appointment performance report...</p>
          </div>
        )}
      </div>
    </div>
  );

  // Filter and search appointments
  const getFilteredAppointments = () => {
    let filtered = appointments;

    // Apply search filter
    if (appointmentSearch.trim()) {
      const searchTerm = appointmentSearch.toLowerCase().trim();
      filtered = filtered.filter(appointment => 
        (appointment.client?.name && appointment.client.name.toLowerCase().includes(searchTerm)) ||
        (appointment.notes && appointment.notes.toLowerCase().includes(searchTerm)) ||
        (appointment.client?.email && appointment.client.email.toLowerCase().includes(searchTerm))
      );
    }

    // Apply status filter
    if (appointmentStatusFilter !== 'all') {
      filtered = filtered.filter(appointment => appointment.status === appointmentStatusFilter);
    }

    // Apply date filter
    if (appointmentDateFilter) {
      const filterDate = new Date(appointmentDateFilter);
      filtered = filtered.filter(appointment => {
        const appointmentDate = new Date(appointment.appointment_date);
        return appointmentDate.toDateString() === filterDate.toDateString();
      });
    }

    return filtered;
  };

  // Get paginated appointments
  const getPaginatedAppointments = () => {
    const filtered = getFilteredAppointments();
    const startIndex = (currentAppointmentPage - 1) * appointmentsPerPage;
    const endIndex = startIndex + appointmentsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  // Get total appointment pages
  const getTotalAppointmentPages = () => {
    const filtered = getFilteredAppointments();
    return Math.ceil(filtered.length / appointmentsPerPage);
  };

  // Handle appointment search and filter changes
  const handleAppointmentSearchChange = (value) => {
    setAppointmentSearch(value);
    setCurrentAppointmentPage(1); // Reset to first page when searching
  };

  const handleAppointmentStatusFilterChange = (value) => {
    setAppointmentStatusFilter(value);
    setCurrentAppointmentPage(1); // Reset to first page when filtering
  };

  const handleAppointmentDateFilterChange = (value) => {
    setAppointmentDateFilter(value);
    setCurrentAppointmentPage(1); // Reset to first page when filtering
  };

  // Handle appointment pagination
  const handleAppointmentPageChange = (page) => {
    setCurrentAppointmentPage(page);
  };

  // Handle appointments per page change
  const handleAppointmentsPerPageChange = (value) => {
    setAppointmentsPerPage(parseInt(value));
    setCurrentAppointmentPage(1); // Reset to first page when changing page size
  };

  // Get dashboard analytics
  const handleGetDashboardAnalytics = async () => {
    setIsLoadingDashboardAnalytics(true);
    
    try {
      console.log('Fetching dashboard analytics...');
      
      const response = await fetch(createApiUrl(API_ENDPOINTS.analytics.dashboard));
      
      if (response.ok) {
        const analytics = await response.json();
        setDashboardAnalytics(analytics);
        setShowDashboardAnalyticsModal(true);
        console.log('Dashboard analytics:', analytics);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to fetch dashboard analytics: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      alert(`Error fetching dashboard analytics: ${error.message || 'Network error'}`);
    } finally {
      setIsLoadingDashboardAnalytics(false);
    }
  };

  // Get system trends
  const handleGetSystemTrends = async () => {
    setIsLoadingSystemTrends(true);
    
    try {
      console.log('Fetching system trends...');
      
      const response = await fetch(createApiUrl(API_ENDPOINTS.analytics.trends));
      
      if (response.ok) {
        const trends = await response.json();
        setSystemTrends(trends);
        setShowSystemTrendsModal(true);
        console.log('System trends:', trends);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to fetch system trends: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching system trends:', error);
      alert(`Error fetching system trends: ${error.message || 'Network error'}`);
    } finally {
      setIsLoadingSystemTrends(false);
    }
  };

  // Get client activity report
  const handleGetClientActivityReport = async () => {
    setIsLoadingClientActivityReport(true);
    
    try {
      console.log('Fetching client activity report...');
      
      const response = await fetch(createApiUrl(API_ENDPOINTS.analytics.clientActivity));
      
      if (response.ok) {
        const report = await response.json();
        setClientActivityReport(report);
        setShowClientActivityReportModal(true);
        console.log('Client activity report:', report);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to fetch client activity report: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching client activity report:', error);
      alert(`Error fetching client activity report: ${error.message || 'Network error'}`);
    } finally {
      setIsLoadingClientActivityReport(false);
    }
  };

  // Get appointment performance report
  const handleGetAppointmentPerformanceReport = async () => {
    setIsLoadingAppointmentPerformanceReport(true);
    
    try {
      console.log('Fetching appointment performance report...');
      
      const response = await fetch(createApiUrl(API_ENDPOINTS.analytics.appointmentPerformance));
      
      if (response.ok) {
        const report = await response.json();
        setAppointmentPerformanceReport(report);
        setShowAppointmentPerformanceReportModal(true);
        console.log('Appointment performance report:', report);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to fetch appointment performance report: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching appointment performance report:', error);
      alert(`Error fetching appointment performance report: ${error.message || 'Network error'}`);
    } finally {
      setIsLoadingAppointmentPerformanceReport(false);
    }
  };

  // System Status Modal
  const SystemStatusModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Detailed System Status</h2>
          <button
            onClick={() => setShowSystemStatusModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-6">
          {/* API Server Details */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">API Server</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  systemStatus.apiServer.status === 'online' ? 'bg-green-500' :
                  systemStatus.apiServer.status === 'checking' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <span className={`text-sm font-medium ${
                  systemStatus.apiServer.status === 'online' ? 'text-green-600' :
                  systemStatus.apiServer.status === 'checking' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {systemStatus.apiServer.message}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                <p className="text-gray-900 font-medium">{systemStatus.apiServer.status}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Last Checked</label>
                <p className="text-gray-900">
                  {systemStatus.apiServer.lastChecked ? 
                    new Date(systemStatus.apiServer.lastChecked).toLocaleString() : 
                    'Never'
                  }
                </p>
              </div>
            </div>
            
            {systemStatus.apiServer.details && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">Response Details</label>
                <pre className="text-sm text-gray-600 whitespace-pre-wrap bg-white p-4 rounded-lg overflow-x-auto">
                  {JSON.stringify(systemStatus.apiServer.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
          
          {/* Database Details */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Database</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  systemStatus.database.status === 'connected' ? 'bg-green-500' :
                  systemStatus.database.status === 'checking' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <span className={`text-sm font-medium ${
                  systemStatus.database.status === 'connected' ? 'text-green-600' :
                  systemStatus.database.status === 'checking' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {systemStatus.database.message}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                <p className="text-gray-900 font-medium">{systemStatus.database.status}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Last Checked</label>
                <p className="text-gray-900">
                  {systemStatus.database.lastChecked ? 
                    new Date(systemStatus.database.lastChecked).toLocaleString() : 
                    'Never'
                  }
                </p>
              </div>
            </div>
            
            {systemStatus.database.details && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">Database Details</label>
                <pre className="text-sm text-gray-600 whitespace-pre-wrap bg-white p-4 rounded-lg overflow-x-auto">
                  {JSON.stringify(systemStatus.database.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
          
          {/* System Health Summary */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">System Health Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center ${
                  systemStatus.apiServer.status === 'online' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <svg className={`w-8 h-8 ${
                    systemStatus.apiServer.status === 'online' ? 'text-green-600' : 'text-red-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900">API Server</p>
                <p className={`text-xs ${
                  systemStatus.apiServer.status === 'online' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {systemStatus.apiServer.status === 'online' ? 'Healthy' : 'Unhealthy'}
                </p>
              </div>
              
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center ${
                  systemStatus.database.status === 'connected' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <svg className={`w-8 h-8 ${
                    systemStatus.database.status === 'connected' ? 'text-green-600' : 'text-red-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900">Database</p>
                <p className={`text-xs ${
                  systemStatus.database.status === 'connected' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {systemStatus.database.status === 'connected' ? 'Connected' : 'Disconnected'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={checkSystemStatus}
              disabled={isCheckingSystemStatus}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCheckingSystemStatus ? 'Checking...' : 'Refresh Status'}
            </button>
            <button
              onClick={() => setShowSystemStatusModal(false)}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {console.log('🎨 Rendering main UI...')}
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      ) : (
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow-lg min-h-screen">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-8">Wellness Platform</h1>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <DashboardIcon className="mr-3" />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('clients')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'clients' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <UsersIcon className="mr-3" />
                  Clients
                </button>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'appointments' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <CalendarIcon className="mr-3" />
                  Appointments
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'clients' && renderClients()}
            {activeTab === 'appointments' && renderAppointments()}
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddClientModal && <AddClientModal />}
      {showEditClientModal && <EditClientModal />}
      {showDeleteClientModal && <DeleteClientModal />}
      {showClientDetailsModal && <ClientDetailsModal />}
      {showClientAnalyticsModal && <ClientAnalyticsModal />}
      {showAddAppointmentModal && <AddAppointmentModal />}
      {showEditAppointmentModal && <EditAppointmentModal />}
      {showDeleteAppointmentModal && <DeleteAppointmentModal />}
      {showAppointmentDetailsModal && <AppointmentDetailsModal />}
      {showAppointmentAnalyticsModal && <AppointmentAnalyticsModal />}
      {showRecurringAppointmentModal && <RecurringAppointmentModal />}
      {showConflictCheckModal && <ConflictCheckModal />}
      {showRemindersModal && <RemindersModal />}
      {showDashboardAnalyticsModal && <DashboardAnalyticsModal />}
      {showSystemTrendsModal && <SystemTrendsModal />}
      {showClientActivityReportModal && <ClientActivityReportModal />}
      {showAppointmentPerformanceReportModal && <AppointmentPerformanceReportModal />}
      {showSystemStatusModal && <SystemStatusModal />}
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <ProfessionalDashboard />
    </div>
  );
}

export default App;
