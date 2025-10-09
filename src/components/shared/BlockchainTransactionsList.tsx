import React, { useState, useEffect } from 'react';
import { History, ExternalLink, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import blockchainService, { BlockchainTransaction } from '@/services/blockchainService';
import { formatDistanceToNow } from 'date-fns';

const BlockchainTransactionsList: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const result = await blockchainService.getUserTransactions(20, page);
      setTransactions(result.transactions);
      setTotalPages(result.pagination.pages);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch blockchain transactions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const getEventBadgeColor = (eventType: string) => {
    const colors: Record<string, string> = {
      'FARMER_REGISTERED': 'bg-blue-100 text-blue-800',
      'FARMER_VERIFIED': 'bg-green-100 text-green-800',
      'FARMER_UNVERIFIED': 'bg-red-100 text-red-800',
      'PLANTING_REGISTERED': 'bg-purple-100 text-purple-800',
      'GERMINATION_RECORDED': 'bg-yellow-100 text-yellow-800',
      'MATURITY_DECLARED': 'bg-orange-100 text-orange-800',
      'HARVEST_RECORDED': 'bg-emerald-100 text-emerald-800',
      'PACKAGE_RECORDED': 'bg-indigo-100 text-indigo-800',
      'QA_ADDED': 'bg-pink-100 text-pink-800'
    };
    return colors[eventType] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      'confirmed': { color: 'bg-green-100 text-green-800', text: '✓ Confirmed' },
      'pending': { color: 'bg-yellow-100 text-yellow-800', text: '⏳ Pending' },
      'failed': { color: 'bg-red-100 text-red-800', text: '✗ Failed' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const filteredTransactions = filter === 'all'
    ? transactions
    : transactions.filter(tx => tx.eventType === filter);

  if (loading && transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Blockchain Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Blockchain Transactions
        </CardTitle>
        <CardDescription>
          Your complete transaction history on the blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="FARMER_REGISTERED">Farmer Registered</SelectItem>
              <SelectItem value="FARMER_VERIFIED">Farmer Verified</SelectItem>
              <SelectItem value="PLANTING_REGISTERED">Planting Registered</SelectItem>
              <SelectItem value="HARVEST_RECORDED">Harvest Recorded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => (
              <div
                key={tx._id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getEventBadgeColor(tx.eventType)}>
                        {tx.eventType.replace(/_/g, ' ')}
                      </Badge>
                      {getStatusBadge(tx.status)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Block #{tx.blockNumber} • {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Transaction:</span>
                    <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                      {tx.transactionHash.substring(0, 10)}...{tx.transactionHash.substring(tx.transactionHash.length - 8)}
                    </code>
                  </div>

                  {tx.productId && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Product ID:</span>
                      <span className="text-gray-600">{tx.productId}</span>
                    </div>
                  )}

                  {tx.gasUsed && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Gas Used:</span>
                      <span className="text-gray-600">{tx.gasUsed}</span>
                    </div>
                  )}
                </div>

                {tx.explorerUrl && (
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-2 h-auto p-0 text-blue-600"
                    onClick={() => window.open(tx.explorerUrl, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View on Explorer
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Next
            </Button>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchTransactions}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Refreshing...' : 'Refresh Transactions'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BlockchainTransactionsList;
