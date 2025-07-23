import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdopterRelationshipCenter = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Adopters</h2>
        <p className="text-muted-foreground">Manage relationships with your adopters</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adopter Relationships</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Adopter relationship management functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdopterRelationshipCenter;