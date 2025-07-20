import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  BarChart3,
  Settings,
  Menu,
  Home,
  Users,
  Calendar,
  LogOut,
  X
} from 'lucide-react';
import apiService from '../services/apiService';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import ErrorBoundary from './ErrorBoundary';

// Import enhanced components
import ClientManagement from './ClientManagement';
import AppointmentManagement from './AppointmentManagement';
import Analytics from './Analytics';

const Dashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'clients', label: 'Client Management', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'clients':
        return <ClientManagement />;
      case 'appointments':
        return <AppointmentManagement />;
      case 'analytics':
        return <Analytics />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="h-screen flex bg-gray-50">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-60 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:inset-0`}>
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">Ruh</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="mt-6 px-3">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setCurrentView(item.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                {navigationItems.find(item => item.id === currentView)?.label || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                {new Date().toLocaleDateString()}
              </Badge>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-6">
            {renderView()}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
};

// Simplified Dashboard Overview Component
const DashboardOverview = () => {
  const [quickStats, setQuickStats] = useState({
    activeClients: 0,
    newClientsThisMonth: 0,
    scheduledAppointments: 0,
    completedAppointments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadQuickStats();
  }, []);

  const loadQuickStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [clientAnalytics, appointmentAnalytics] = await Promise.all([
        apiService.getClientAnalytics(),
        apiService.getAppointmentAnalytics()
      ]);
      
      setQuickStats({
        activeClients: Number(clientAnalytics?.active_clients || 0),
        newClientsThisMonth: Number(clientAnalytics?.new_clients_this_month || 0),
        scheduledAppointments: Number(appointmentAnalytics?.scheduled_appointments || 0),
        completedAppointments: Number(appointmentAnalytics?.completed_appointments || 0)
      });
    } catch (err) {
      console.error('Failed to load quick stats:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{String(error)}</p>
            <Button onClick={loadQuickStats} className="w-full">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome to Ruh Wellness Platform</h2>
        <p className="text-blue-100">Manage your virtual wellness practice with comprehensive tools and insights.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{String(quickStats.activeClients)}</div>
            <p className="text-xs text-muted-foreground">
              Active clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{String(quickStats.scheduledAppointments)}</div>
            <p className="text-xs text-muted-foreground">
              Upcoming appointments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Appointments</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{String(quickStats.completedAppointments)}</div>
            <p className="text-xs text-muted-foreground">
              Completed this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Clients</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{String(quickStats.newClientsThisMonth)}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Add New Client
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">API Server: Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Database: Connected</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Notifications: Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Virtual Wellness Platform Ready</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;