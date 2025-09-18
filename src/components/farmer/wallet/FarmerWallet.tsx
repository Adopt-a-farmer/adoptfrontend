import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  Calendar,
  Download,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { farmerService } from '@/services/farmer';
import { format } from 'date-fns';

interface WalletTransaction {
  _id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  adopter?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface WalletStats {
  totalBalance: number;
  monthlyIncome: number;
  totalContributions: number;
  activeAdopters: number;
  pendingPayments: number;
}

const FarmerWallet = () => {
  // Fetch wallet balance
  const { data: walletBalance, isLoading: isLoadingBalance } = useQuery({
    queryKey: ['farmer-wallet-balance'],
    queryFn: () => farmerService.getWalletBalance(),
  });

  // Fetch wallet transactions
  const { data: transactionsResponse, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['farmer-wallet-transactions'],
    queryFn: () => farmerService.getWalletTransactions({ limit: '10' }),
  });

  // Fetch farmer analytics for additional stats
  const { data: analyticsResponse } = useQuery({
    queryKey: ['farmer-analytics'],
    queryFn: () => farmerService.getDashboardData(),
  });

  const transactions = transactionsResponse?.transactions || [];
  const analytics = analyticsResponse?.data;

  const walletStats: WalletStats = {
    totalBalance: walletBalance?.balance || 0,
    monthlyIncome: analytics?.monthlyEarnings || 0,
    totalContributions: analytics?.totalEarnings || 0,
    activeAdopters: analytics?.activeAdoptions || 0,
    pendingPayments: analytics?.pendingPayments || 0
  };

  const statsCards = [
    {
      title: 'Total Balance',
      value: `KES ${walletStats.totalBalance.toLocaleString()}`,
      icon: Wallet,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: 'up'
    },
    {
      title: 'Monthly Income',
      value: `KES ${walletStats.monthlyIncome.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: 'up'
    },
    {
      title: 'Active Adopters',
      value: walletStats.activeAdopters,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Total Earned',
      value: `KES ${walletStats.totalContributions.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: 'up'
    }
  ];

  const getTransactionIcon = (type: string) => {
    return type === 'credit' ? ArrowUpRight : ArrowDownRight;
  };

  const getTransactionColor = (type: string) => {
    return type === 'credit' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet & Earnings</h1>
          <p className="text-gray-600 mt-1">Track your contributions and manage withdrawals</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline" className="border-farmer-primary text-farmer-primary hover:bg-farmer-primary hover:text-white">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="bg-farmer-primary hover:bg-farmer-primary/90">
            <Wallet className="mr-2 h-4 w-4" />
            Request Withdrawal
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    {stat.trend && (
                      <div className="flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-xs text-green-600">+12% from last month</span>
                      </div>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-farmer-primary"></div>
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction: WalletTransaction) => {
                const IconComponent = getTransactionIcon(transaction.type);
                return (
                  <div key={transaction._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                        <IconComponent className={`h-4 w-4 ${getTransactionColor(transaction.type)}`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        {transaction.adopter && (
                          <p className="text-sm text-gray-600">
                            From: {transaction.adopter.firstName} {transaction.adopter.lastName}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {format(new Date(transaction.createdAt), 'PPp')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'credit' ? '+' : '-'}KES {transaction.amount.toLocaleString()}
                      </p>
                      <Badge className={getStatusBadge(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Wallet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-500">Your contribution transactions will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Download className="h-6 w-6" />
              <span>Download Statement</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span>Payment History</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <DollarSign className="h-6 w-6" />
              <span>Tax Documents</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmerWallet;
