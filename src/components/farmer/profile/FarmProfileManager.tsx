import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FarmProfileManager = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Farm Profile Manager</h2>
        <p className="text-muted-foreground">Manage your public farm profile</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Farm Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Farm profile management functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmProfileManager;