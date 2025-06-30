
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const WalletPayments = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wallet & Payments</h1>
        <p className="text-gray-600 mt-1">Manage your payments and transaction history</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Wallet & Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500">Wallet functionality coming soon!</p>
            <p className="text-gray-400 mt-2">This will include payment methods, transaction history, and recurring payments.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletPayments;
