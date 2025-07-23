import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const UpdatesMediaManager = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Updates & Media</h2>
        <p className="text-muted-foreground">Share updates with your adopters</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Updates Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Updates and media management functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdatesMediaManager;