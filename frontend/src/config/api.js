// API Configuration
const getApiBaseUrl = () => {
  // Check if we're in production (Vercel)
  if (process.env.NODE_ENV === 'production') {
    // Use Railway backend URL in production
    return process.env.REACT_APP_API_URL || 'https://ruh-wellness-platform-production.up.railway.app';
  }
  
  // Use localhost for development
  return 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function to create full API URLs
// Helper function to create full API URLs
const createApiUrl = (endpoint) => {
  return `${getApiBaseUrl()}${endpoint}`;
};

export { createApiUrl };

// API Endpoints
export const API_ENDPOINTS = {
  health: '/health',
  healthDetailed: '/health/detailed',
  clients: '/api/clients/',
  appointments: '/api/appointments/',
  analytics: {
    dashboard: '/api/analytics/dashboard',
    trends: '/api/analytics/trends',
    clientActivity: '/api/analytics/reports/client-activity',
    appointmentPerformance: '/api/analytics/reports/appointment-performance'
  }
};

const apiConfig = {
  API_BASE_URL,
  createApiUrl,
  API_ENDPOINTS
};

export default apiConfig;
