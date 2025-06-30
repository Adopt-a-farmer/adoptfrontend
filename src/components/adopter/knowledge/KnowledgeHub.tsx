
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const KnowledgeHub = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Hub</h1>
        <p className="text-gray-600 mt-1">Learn about farming practices and industry insights</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Hub</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500">Knowledge Hub coming soon!</p>
            <p className="text-gray-400 mt-2">This will include articles, videos, and expert content about agriculture.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeHub;
