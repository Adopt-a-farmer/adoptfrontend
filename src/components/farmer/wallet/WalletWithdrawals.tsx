import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, ArrowDownLeft, ArrowUpRight, Clock, CheckCircle, XCircle, CreditCard, Phone } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WalletBalance {
  total_earnings: number;
  available_balance: number;
  pending_balance: number;
  total_withdrawn: number;
  currency: string;
}

interface Transaction {
  id: string;
  type: 'earning' | 'withdrawal' | 'support';
  amount: number;
  currency: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
  reference?: string;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  currency: string;
  method: 'bank' | 'mobile_money';
  account_details: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  processed_at?: string;
}

const WalletWithdrawals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);

  // Fetch wallet balance
  const { data: balance } = useQuery({
    queryKey: ['wallet-balance', user?.id],
    queryFn: async (): Promise<WalletBalance> => {
      const response = await apiCall<{ data: WalletBalance }>('/api/wallet/balance', 'GET');
      return response.data;
    },
    enabled: !!user
  });

  // Fetch transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ['wallet-transactions', user?.id],
    queryFn: async (): Promise<Transaction[]> => {
      const response = await apiCall<{ data: Transaction[] }>('/api/wallet/transactions', 'GET');
      return response.data;
    },
    enabled: !!user
  });

  // Fetch withdrawal requests
  const { data: withdrawalRequests = [] } = useQuery({
    queryKey: ['withdrawal-requests', user?.id],
    queryFn: async (): Promise<WithdrawalRequest[]> => {
      const response = await apiCall<{ data: WithdrawalRequest[] }>('/api/wallet/withdrawals', 'GET');
      return response.data;
    },
    enabled: !!user
  });

  // Request withdrawal mutation
  const requestWithdrawalMutation = useMutation({
    mutationFn: async (withdrawalData: {
      amount: number;
      method: string;
      account_details: any;
    }) => {
      return await apiCall('/api/wallet/withdraw', 'POST', withdrawalData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Withdrawal request submitted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawal-requests'] });
      setShowWithdrawDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process withdrawal request",
        variant: "destructive",
      });
    }
  });

  const formatCurrency = (amount: number, currency: string = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earning': return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'withdrawal': return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'support': return <ArrowDownLeft className="h-4 w-4 text-blue-600" />;
      default: return <Wallet className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Wallet & Withdrawals</h2>
          <p className="text-muted-foreground">Manage your earnings and withdrawals</p>
        </div>
        <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
          <DialogTrigger asChild>
            <Button 
              className="mt-4 md:mt-0 bg-farmer-primary hover:bg-farmer-primary/90"
              disabled={!balance || balance.available_balance < 100}
            >
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Request Withdrawal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Withdrawal</DialogTitle>
            </DialogHeader>
            <WithdrawalForm 
              availableBalance={balance?.available_balance || 0}
              currency={balance?.currency || 'KES'}
              onSubmit={(data) => requestWithdrawalMutation.mutate(data)}
              isLoading={requestWithdrawalMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-farmer-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {balance ? formatCurrency(balance.total_earnings, balance.currency) : '...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <ArrowDownLeft className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {balance ? formatCurrency(balance.available_balance, balance.currency) : '...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {balance ? formatCurrency(balance.pending_balance, balance.currency) : '...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <ArrowUpRight className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Withdrawn</p>
                <p className="text-2xl font-bold text-gray-900">
                  {balance ? formatCurrency(balance.total_withdrawn, balance.currency) : '...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'earning' || transaction.type === 'support' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.type === 'earning' || transaction.type === 'support' ? '+' : '-'}
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </p>
                      <Badge className={getStatusColor(transaction.status)}>
                        <span className="flex items-center">
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1 capitalize">{transaction.status}</span>
                        </span>
                      </Badge>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <div className="text-center py-8">
                    <Wallet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                    <p className="text-gray-500">Your transaction history will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {withdrawalRequests.map((withdrawal) => (
                  <div key={withdrawal.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <ArrowUpRight className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium">
                          Withdrawal via {withdrawal.method === 'bank' ? 'Bank Transfer' : 'Mobile Money'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(withdrawal.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">
                        -{formatCurrency(withdrawal.amount, withdrawal.currency)}
                      </p>
                      <Badge className={getStatusColor(withdrawal.status)}>
                        <span className="flex items-center">
                          {getStatusIcon(withdrawal.status)}
                          <span className="ml-1 capitalize">{withdrawal.status}</span>
                        </span>
                      </Badge>
                    </div>
                  </div>
                ))}
                {withdrawalRequests.length === 0 && (
                  <div className="text-center py-8">
                    <ArrowUpRight className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No withdrawal requests</h3>
                    <p className="text-gray-500">Your withdrawal requests will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Withdrawal Form Component
const WithdrawalForm = ({ 
  availableBalance, 
  currency, 
  onSubmit, 
  isLoading 
}: {
  availableBalance: number;
  currency: string;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState({
    amount: 1000,
    method: 'mobile_money',
    phone_number: '',
    bank_name: '',
    account_number: '',
    account_name: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const account_details = formData.method === 'mobile_money' 
      ? { phone_number: formData.phone_number }
      : { 
          bank_name: formData.bank_name, 
          account_number: formData.account_number,
          account_name: formData.account_name 
        };

    onSubmit({
      amount: formData.amount,
      method: formData.method,
      account_details
    });
  };

  const formatCurrency = (amount: number, currency: string = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-farmer-secondary/10 p-4 rounded-lg">
        <p className="text-sm text-gray-600">Available Balance</p>
        <p className="text-2xl font-bold text-farmer-primary">
          {formatCurrency(availableBalance, currency)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Minimum withdrawal amount: {formatCurrency(100, currency)}
        </p>
      </div>

      <div>
        <Label htmlFor="amount">Withdrawal Amount</Label>
        <Input
          id="amount"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
          min={100}
          max={availableBalance}
          step={100}
          required
        />
      </div>

      <div>
        <Label htmlFor="method">Withdrawal Method</Label>
        <Select value={formData.method} onValueChange={(value) => setFormData({ ...formData, method: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select withdrawal method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mobile_money">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Mobile Money (M-Pesa)
              </div>
            </SelectItem>
            <SelectItem value="bank">
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Bank Transfer
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.method === 'mobile_money' && (
        <div>
          <Label htmlFor="phone_number">M-Pesa Phone Number</Label>
          <Input
            id="phone_number"
            type="tel"
            value={formData.phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            placeholder="254XXXXXXXXX"
            required
          />
        </div>
      )}

      {formData.method === 'bank' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="bank_name">Bank Name</Label>
            <Input
              id="bank_name"
              value={formData.bank_name}
              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              placeholder="e.g., Equity Bank"
              required
            />
          </div>
          <div>
            <Label htmlFor="account_number">Account Number</Label>
            <Input
              id="account_number"
              value={formData.account_number}
              onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
              placeholder="Account number"
              required
            />
          </div>
          <div>
            <Label htmlFor="account_name">Account Name</Label>
            <Input
              id="account_name"
              value={formData.account_name}
              onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
              placeholder="Account holder name"
              required
            />
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || formData.amount < 100 || formData.amount > availableBalance}
          className="bg-farmer-primary hover:bg-farmer-primary/90"
        >
          {isLoading ? "Processing..." : `Withdraw ${formatCurrency(formData.amount, currency)}`}
        </Button>
      </div>
    </form>
  );
};

export default WalletWithdrawals;