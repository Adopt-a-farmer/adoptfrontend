import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const WalletWithdrawals = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Wallet & Withdrawals</h2>
        <p className="text-muted-foreground">Manage your earnings and withdrawals</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Wallet and withdrawal functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletWithdrawals;