import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, BarChart3 } from 'lucide-react';
import apiService from '../services/apiService';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getClients();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load clients:', err);
      setError('Failed to load clients');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading clients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Button onClick={loadClients} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Client Management</h2>
          <p className="text-gray-600">Manage your wellness clients</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clients ({clients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No clients found
            </div>
          ) : (
            <div className="space-y-4">
              {clients.map((client, index) => (
                <div key={client.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{client.name || 'Unknown'}</h3>
                    <p className="text-sm text-gray-600">{client.email || 'No email'}</p>
                    <p className="text-sm text-gray-600">{client.phone || 'No phone'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                      {client.status || 'unknown'}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientManagement; 