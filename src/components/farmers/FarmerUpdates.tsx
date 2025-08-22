import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface FarmerUpdatesProps {
  farmerId: number;
}

const FarmerUpdates = ({ farmerId }: FarmerUpdatesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-farmer-primary" />
          Farm Updates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Updates will be available soon.</p>
      </CardContent>
    </Card>
  );
};

export default FarmerUpdates;
