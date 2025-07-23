import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MessagingCenter = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Messages</h2>
        <p className="text-muted-foreground">Communicate with adopters and officers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Messaging Center</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Messaging functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagingCenter;