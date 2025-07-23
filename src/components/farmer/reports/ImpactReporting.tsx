import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ImpactReporting = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Impact & Reports</h2>
        <p className="text-muted-foreground">View your farm's impact and performance reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Impact Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Impact reporting functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImpactReporting;