import React from 'react';
import { User, Mail, Phone } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const ClientCard = ({ client, onSelectClient }) => (
    <Card 
      className="cursor-pointer hover:shadow-medium transition-all duration-200 border-l-4 border-l-health-500 hover:border-l-health-600"
      onClick={() => onSelectClient(client)}
    >
      <CardContent className="p-4">
        <div className="flex items-center mb-3">
          <div className="w-10 h-10 bg-health-100 rounded-full flex items-center justify-center mr-3">
            <User className="w-5 h-5 text-health-600" />
          </div>
          <div>
            <h3 className="font-semibold text-calm-900">{client.name}</h3>
            <p className="text-sm text-calm-500">ID: {client.id}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-calm-600">
            <Mail className="w-4 h-4 mr-2 text-calm-400" />
            {client.email}
          </div>
          <div className="flex items-center text-sm text-calm-600">
            <Phone className="w-4 h-4 mr-2 text-calm-400" />
            {client.phone}
          </div>
        </div>
      </CardContent>
    </Card>
  );

export default ClientCard;