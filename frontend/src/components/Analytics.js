import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Download,
  RefreshCw
} from 'lucide-react';
import apiService from '../services/apiService';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';

const Analytics = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [clientActivityReport, setClientActivityReport] = useState(null);
  const [appointmentPerformanceReport, setAppointmentPerformanceReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load dashboard analytics
      const dashboard = await apiService.getDashboardAnalytics();
      setDashboardData(dashboard);
      
      // Load trends
      const trends = await apiService.getSystemTrends(parseInt(dateRange));
      setTrendsData(trends);
      
      // Load reports
      const clientActivity = await apiService.getClientActivityReport({
        date_from: customDateFrom || undefined,
        date_to: customDateTo || undefined
      });
      setClientActivityReport(clientActivity);
      
      const appointmentPerformance = await apiService.getAppointmentPerformanceReport({
        date_from: customDateFrom || undefined,
        date_to: customDateTo || undefined
      });
      setAppointmentPerformanceReport(appointmentPerformance);
      
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, customDateFrom, customDateTo]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const exportReport = async (reportType) => {
    try {
      let data;
      let filename;
      
      switch (reportType) {
        case 'client-activity':
          data = clientActivityReport;
          filename = 'client_activity_report.json';
          break;
        case 'appointment-performance':
          data = appointmentPerformanceReport;
          filename = 'appointment_performance_report.json';
          break;
        default:
          return;
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  const renderMetricCard = (title, value, icon, subtitle = '', trend = null) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{String(title)}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{String(value)}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{String(subtitle)}</p>}
        {trend && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            {String(trend)}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderTrendChart = (data, title) => {
    if (!data || !data.daily_stats) return null;
    
    const dates = Object.keys(data.daily_stats).slice(-7); // Last 7 days
    const maxValue = Math.max(...dates.map(date => data.daily_stats[date].appointments));
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>{String(title)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dates.map(date => {
              const dayData = data.daily_stats[date];
              const percentage = maxValue > 0 ? (dayData.appointments / maxValue) * 100 : 0;
              
              return (
                <div key={date} className="flex items-center space-x-2">
                  <div className="w-16 text-xs text-muted-foreground">
                    {new Date(date).toLocaleDateString()}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-8 text-xs text-right">{String(dayData.appointments)}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Track your wellness practice performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportReport('client-activity')}>
            <Download className="h-4 w-4 mr-2" />
            Export Client Report
          </Button>
          <Button variant="outline" onClick={() => exportReport('appointment-performance')}>
            <Download className="h-4 w-4 mr-2" />
            Export Appointment Report
          </Button>
          <Button onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Date Range Controls */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Label htmlFor="dateRange">Time Range</Label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label htmlFor="customFrom">Custom From</Label>
          <Input
            id="customFrom"
            type="date"
            value={customDateFrom}
            onChange={(e) => setCustomDateFrom(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="customTo">Custom To</Label>
          <Input
            id="customTo"
            type="date"
            value={customDateTo}
            onChange={(e) => setCustomDateTo(e.target.value)}
          />
        </div>
      </div>

      {/* Dashboard Metrics */}
      {dashboardData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {renderMetricCard(
              "Total Clients",
              String(dashboardData.clients?.total_clients || 0),
              <Users className="h-4 w-4 text-muted-foreground" />
            )}
            {renderMetricCard(
              "Active Clients",
              String(dashboardData.clients?.active_clients || 0),
              <Users className="h-4 w-4 text-muted-foreground" />
            )}
            {renderMetricCard(
              "Total Appointments",
              String(dashboardData.appointments?.total_appointments || 0),
              <Calendar className="h-4 w-4 text-muted-foreground" />
            )}
            {renderMetricCard(
              "Completion Rate",
              `${String((dashboardData.appointments?.completion_rate || 0).toFixed(1))}%`,
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderMetricCard(
              "Client Growth",
              `${String((dashboardData.clients?.client_growth_rate || 0).toFixed(1))}%`,
              <TrendingUp className="h-4 w-4 text-muted-foreground" />,
              "vs last month"
            )}
            {renderMetricCard(
              "Cancellation Rate",
              `${String((dashboardData.appointments?.cancellation_rate || 0).toFixed(1))}%`,
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </>
      )}

      {/* Trends */}
      {trendsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderTrendChart(trendsData, "Appointment Trends")}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Appointments</span>
                  <span className="font-medium">{String(trendsData.total_appointments || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">New Clients</span>
                  <span className="font-medium">{String(trendsData.new_clients || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completed Sessions</span>
                  <span className="font-medium">{String(trendsData.completed_appointments || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clientActivityReport && (
          <Card>
            <CardHeader>
              <CardTitle>Client Activity Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Most Active Client:</span>
                  <span className="text-sm font-medium">
                    {String(clientActivityReport.most_active_client?.name || 'N/A')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Average Sessions per Client:</span>
                  <span className="text-sm font-medium">
                    {String((clientActivityReport.avg_sessions_per_client || 0).toFixed(1))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Client Retention Rate:</span>
                  <span className="text-sm font-medium">
                    {String((clientActivityReport.retention_rate || 0).toFixed(1))}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {appointmentPerformanceReport && (
          <Card>
            <CardHeader>
              <CardTitle>Appointment Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">On-time Rate:</span>
                  <span className="text-sm font-medium">
                    {String((appointmentPerformanceReport.on_time_rate || 0).toFixed(1))}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Average Duration:</span>
                  <span className="text-sm font-medium">
                    {String(appointmentPerformanceReport.avg_duration || 0)} minutes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Peak Hours:</span>
                  <span className="text-sm font-medium">
                    {String(appointmentPerformanceReport.peak_hour || 'N/A')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Analytics; 