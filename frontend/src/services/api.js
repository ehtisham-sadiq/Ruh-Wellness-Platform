const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
    this.timeout = 30000; // 30 seconds
  }

  // Retry logic with exponential backoff
  async retryRequest(fn, attempts = this.retryAttempts) {
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === attempts - 1) throw error;
        
        // Don't retry on client errors (4xx)
        if (error.status >= 400 && error.status < 500) {
          throw error;
        }
        
        // Wait with exponential backoff
        const delay = this.retryDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Enhanced fetch with timeout and error handling
  async fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error?.message || `HTTP ${response.status}`);
        error.status = response.status;
        error.code = errorData.error?.code;
        error.details = errorData.error?.details;
        throw error;
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        const timeoutError = new Error('Request timeout');
        timeoutError.status = 408;
        timeoutError.code = 'TIMEOUT_ERROR';
        throw timeoutError;
      }
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const networkError = new Error('Network error - please check your connection');
        networkError.status = 0;
        networkError.code = 'NETWORK_ERROR';
        throw networkError;
      }
      
      throw error;
    }
  }

  // Client Management
  async getClients(params = {}) {
    return this.retryRequest(async () => {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.created_after) queryParams.append('created_after', params.created_after);
      if (params.created_before) queryParams.append('created_before', params.created_before);
      
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/clients/?${queryParams}`);
      return response.json();
    });
  }

  async getClient(id) {
    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/clients/${id}`);
      return response.json();
    });
  }

  async createClient(clientData) {
    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/clients/`, {
        method: 'POST',
        body: JSON.stringify(clientData)
      });
      return response.json();
    });
  }

  async updateClient(id, clientData) {
    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/clients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(clientData)
      });
      return response.json();
    });
  }

  async deleteClient(id) {
    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/clients/${id}`, {
        method: 'DELETE'
      });
      return response.json();
    });
  }

  async exportClientsCSV(status = null) {
    return this.retryRequest(async () => {
      const queryParams = new URLSearchParams();
      if (status) queryParams.append('status', status);
      
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/clients/export/csv?${queryParams}`);
      return response.blob();
    });
  }

  async getClientAnalytics() {
    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/clients/analytics`);
      return response.json();
    });
  }

  async getClientAppointments(clientId) {
    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/clients/${clientId}/appointments`);
      return response.json();
    });
  }

  async getClientAnalyticsById(clientId) {
    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/clients/${clientId}/analytics`);
      return response.json();
    });
  }

  // Appointment Management
  async getAppointments(params = {}) {
    return this.retryRequest(async () => {
      const queryParams = new URLSearchParams();
      if (params.client_id) queryParams.append('client_id', params.client_id);
      if (params.status) queryParams.append('status', params.status);
      if (params.date_from) queryParams.append('date_from', params.date_from);
      if (params.date_to) queryParams.append('date_to', params.date_to);
      if (params.is_recurring !== undefined) queryParams.append('is_recurring', params.is_recurring);
      
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/appointments/?${queryParams}`);
      return response.json();
    });
  }

  async getAppointment(id) {
    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/appointments/${id}`);
      return response.json();
    });
  }

  async createAppointment(appointmentData) {
    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/appointments/`, {
        method: 'POST',
        body: JSON.stringify(appointmentData)
      });
      return response.json();
    });
  }

  async updateAppointment(id, appointmentData) {
    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(appointmentData)
      });
      return response.json();
    });
  }

  async deleteAppointment(id) {
    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/appointments/${id}`, {
        method: 'DELETE'
      });
      return response.json();
    });
  }

  async checkAppointmentConflicts(clientId, appointmentTime, duration = 60, excludeId = null) {
    return this.retryRequest(async () => {
      const queryParams = new URLSearchParams({
        client_id: clientId,
        appointment_time: appointmentTime,
        appointment_duration: duration
      });
      if (excludeId) queryParams.append('exclude_appointment_id', excludeId);
      
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/appointments/conflicts?${queryParams}`);
      return response.json();
    });
  }

  async createRecurringAppointments(baseAppointment, recurringPattern) {
    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/appointments/recurring`, {
        method: 'POST',
        body: JSON.stringify({
          base_appointment: baseAppointment,
          recurring_pattern: recurringPattern
        })
      });
      return response.json();
    });
  }

  async getAppointmentAnalytics(params = {}) {
    return this.retryRequest(async () => {
      const queryParams = new URLSearchParams();
      if (params.date_from) queryParams.append('date_from', params.date_from);
      if (params.date_to) queryParams.append('date_to', params.date_to);
      
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/appointments/analytics?${queryParams}`);
      return response.json();
    });
  }

  async getAppointmentTrends(days = 30) {
    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/appointments/trends?days=${days}`);
      return response.json();
    });
  }

  async getPendingReminders() {
    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/appointments/reminders/pending`);
      return response.json();
    });
  }

  async sendAppointmentReminder(appointmentId) {
    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/appointments/${appointmentId}/send-reminder`, {
        method: 'POST'
      });
      return response.json();
    });
  }

  // Analytics
  async getDashboardAnalytics() {
    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/analytics/dashboard`);
      return response.json();
    });
  }

  async getSystemTrends(days = 30) {
    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/analytics/trends?days=${days}`);
      return response.json();
    });
  }

  async getClientActivityReport(params = {}) {
    return this.retryRequest(async () => {
      const queryParams = new URLSearchParams();
      if (params.client_id) queryParams.append('client_id', params.client_id);
      if (params.date_from) queryParams.append('date_from', params.date_from);
      if (params.date_to) queryParams.append('date_to', params.date_to);
      
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/analytics/reports/client-activity?${queryParams}`);
      return response.json();
    });
  }

  async getAppointmentPerformanceReport(params = {}) {
    return this.retryRequest(async () => {
      const queryParams = new URLSearchParams();
      if (params.date_from) queryParams.append('date_from', params.date_from);
      if (params.date_to) queryParams.append('date_to', params.date_to);
      
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/analytics/reports/appointment-performance?${queryParams}`);
      return response.json();
    });
  }

  // Health check
  async checkHealth() {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL.replace('/api', '')}/health`);
      return response.json();
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async checkDetailedHealth() {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL.replace('/api', '')}/health/detailed`);
      return response.json();
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

export default new ApiService(); 