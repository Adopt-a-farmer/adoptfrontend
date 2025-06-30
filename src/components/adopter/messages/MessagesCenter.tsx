
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MessagesCenter = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">Communicate with your farmers and support team</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Messages Center</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500">Messages functionality coming soon!</p>
            <p className="text-gray-400 mt-2">This will include direct messaging with farmers and support tickets.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagesCenter;
