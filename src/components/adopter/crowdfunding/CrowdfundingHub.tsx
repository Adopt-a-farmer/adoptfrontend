
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CrowdfundingHub = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Crowdfunding Hub</h1>
        <p className="text-gray-600 mt-1">Discover and fund agricultural startup projects</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Crowdfunding Hub</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500">Crowdfunding Hub coming soon!</p>
            <p className="text-gray-400 mt-2">This will include startup projects and funding opportunities.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrowdfundingHub;
