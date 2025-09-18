import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  ArrowUpRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { farmerService } from '@/services/farmer';
import { format } from 'date-fns';

interface RecentContribution {
  _id: string;
  amount: number;
  adopter: {
    firstName: string;
    lastName: string;
  };
  type: 'credit' | 'debit';
  description: string;
  createdAt: string;
}

const FarmerContributions = () => {
  // Fetch recent contributions
  const { data: contributionsResponse, isLoading } = useQuery({
    queryKey: ['farmer-recent-contributions'],
    queryFn: async () => {
      try {
        // This would be implemented in the backend
        return await farmerService.getWalletTransactions({ limit: '5' });
      } catch (error) {
        console.error('Error fetching contributions:', error);
        return { transactions: [] };
      }
    }
  });

  const contributions = (contributionsResponse?.transactions as RecentContribution[])?.filter(
    (t) => t.type === 'credit'
  ) || [];

  const totalThisMonth = contributions
    .filter((c) => {
      const contributionDate = new Date(c.createdAt);
      const now = new Date();
      return contributionDate.getMonth() === now.getMonth() && 
             contributionDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum: number, c) => sum + c.amount, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          Recent Contributions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">This Month</p>
                <p className="text-lg font-bold text-green-800">
                  KES {totalThisMonth.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Contributors</p>
                <p className="text-lg font-bold text-blue-800">
                  {new Set(contributions.map((c) => c.adopter?.firstName)).size}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Recent Contributions List */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Recent Activity
          </h4>
          
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : contributions.length > 0 ? (
            <div className="space-y-3">
              {contributions.slice(0, 5).map((contribution) => (
                <div key={contribution._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {contribution.adopter?.firstName} {contribution.adopter?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(contribution.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      +KES {contribution.amount.toLocaleString()}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {contribution.description?.includes('monthly') ? 'Monthly' : 'One-time'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No contributions yet</p>
              <p className="text-sm text-gray-400">Contributions from adopters will appear here</p>
            </div>
          )}
        </div>

        {contributions.length > 5 && (
          <div className="mt-4 pt-4 border-t">
            <button className="text-sm text-green-600 hover:text-green-800 font-medium">
              View all contributions →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FarmerContributions;
