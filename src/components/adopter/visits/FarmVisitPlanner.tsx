
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FarmVisitPlanner = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Farm Visit Planner</h1>
        <p className="text-gray-600 mt-1">Schedule and manage visits to your adopted farms</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Farm Visit Planner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500">Visit planner coming soon!</p>
            <p className="text-gray-400 mt-2">This will include calendar integration and visit scheduling.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmVisitPlanner;
