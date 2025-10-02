
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wallet, CreditCard, CheckCircle, Clock, XCircle, DollarSign, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/services/payment';
import { useToast } from '@/hooks/use-toast';

interface Payment {
  _id: string;
  amount: number;
  currency?: string;
  paymentType: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
  paidAt?: string;
  gatewayResponse?: {
    reference: string;
    channel?: string;
  };
  fees?: {
    gateway: number;
    platform: number;
  };
  metadata?: {
    farmerId?: string;
    farmerName?: string;
    adoptionId?: string;
  };
}

const WalletPayments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch payment history from backend API
  const { 
    data: paymentResponse, 
    isLoading,
    refetch 
  } = useQuery({
    queryKey: ['payment-history', statusFilter],
    queryFn: async () => {
      const params: Record<string, string> = {
        limit: '50'
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      return await paymentService.getPaymentHistory(params);
    },
    enabled: !!user,
  });

  const payments: Payment[] = React.useMemo(() => 
    paymentResponse?.data?.payments || [], 
    [paymentResponse]
  );

  // Calculate stats from actual payments
  const stats = React.useMemo(() => {
    // Only count successful payments (verified with status 200)
    const successfulPayments = payments.filter(p => p.status === 'success');
    
    const totalContributed = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalFees = successfulPayments.reduce((sum, p) => 
      sum + (p.fees?.gateway || 0) + (p.fees?.platform || 0), 0
    );
    const completedPayments = successfulPayments.length;
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    
    return {
      totalContributed,
      totalFees,
      completedPayments,
      pendingPayments
    };
  }, [payments]);

  // Verify payment mutation
  const verifyPaymentMutation = useMutation({
    mutationFn: async (reference: string) => {
      return await paymentService.verifyPayment(reference);
    },
    onSuccess: (data) => {
      if (data.success && data.data?.payment?.status === 'success') {
        toast({
          title: 'Payment Verified',
          description: 'Your payment has been successfully verified.',
        });
        queryClient.invalidateQueries({ queryKey: ['payment-history'] });
        refetch();
      } else {
        toast({
          title: 'Verification Failed',
          description: data.message || 'Payment could not be verified. Please try again.',
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Verification Error',
        description: error.message || 'Failed to verify payment.',
        variant: 'destructive',
      });
    },
  });

  const handleVerifyPayment = (reference: string) => {
    verifyPaymentMutation.mutate(reference);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'KES') => {
    const locale = currency === 'KES' ? 'en-KE' : currency === 'USD' ? 'en-US' : 'en-NG';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Wallet className="h-8 w-8 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet & Payments</h1>
          <p className="text-gray-600 mt-1">Manage your payments and transaction history</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards - Only showing verified payments (status 200) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contributed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalContributed, 'KES')}
                </p>
                <p className="text-xs text-green-600 mt-1">Verified payments only</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fees</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalFees, 'KES')}
                </p>
                <p className="text-xs text-gray-500 mt-1">Gateway + Platform</p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedPayments}</p>
                <p className="text-xs text-gray-500 mt-1">Successful transactions</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting verification</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Payment History
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'success' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('success')}
              >
                Completed
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
              >
                Pending
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No payments yet</p>
              <p className="text-gray-400 mt-2">Your payment history will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Fees</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(payment.createdAt).toLocaleDateString()}
                          <div className="text-xs text-gray-500">
                            {new Date(payment.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-xs">
                          {payment.gatewayResponse?.reference || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.paymentType}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(payment.amount, payment.currency || 'KES')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {formatCurrency(
                            (payment.fees?.gateway || 0) + (payment.fees?.platform || 0),
                            payment.currency || 'KES'
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell>
                        {payment.status === 'pending' && payment.gatewayResponse?.reference && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleVerifyPayment(payment.gatewayResponse!.reference)}
                            disabled={verifyPaymentMutation.isPending}
                          >
                            {verifyPaymentMutation.isPending ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              'Verify'
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Secure payments powered by Paystack</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <h4 className="font-medium text-blue-900 mb-2">Payment Verification</h4>
              <p className="text-sm text-blue-700">
                All payments are verified with Paystack before being reflected in your dashboard. 
                Only transactions with status code 200 (success) are counted in your total contributions.
              </p>
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
                <span>Visa</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
                <span>Mastercard</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-8 h-5 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">M</div>
                <span>M-Pesa</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletPayments;
