import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FarmVisitScheduler = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Farm Visits</h2>
        <p className="text-muted-foreground">Schedule and manage farm visits</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visit Scheduler</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Farm visit scheduling functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmVisitScheduler;