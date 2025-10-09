import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  QrCode, 
  Shield, 
  Sprout, 
  Eye, 
  CheckCircle, 
  Wheat, 
  Package, 
  ShieldCheck,
  ExternalLink,
  Calendar,
  User
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import blockchainService, { ProductHistory } from '@/services/blockchainService';

interface Transaction {
  eventType: string;
  transactionHash: string;
  blockNumber: number;
  createdAt: string;
  metadata?: {
    cropType?: string;
    germinationPercent?: number;
    qualityGrade?: string;
    quantityKg?: number;
    packageQuantity?: number;
    passed?: boolean;
    notes?: string;
    plantedAt?: string;
    [key: string]: unknown;
  };
  explorerUrl?: string;
}

const ProductTraceabilityPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [productId, setProductId] = useState(searchParams.get('id') || '');
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ProductHistory | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState('');

  const fetchProduct = async (id: string) => {
    if (!id || isNaN(Number(id))) {
      setError('Please enter a valid product ID');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const result = await blockchainService.getProductHistory(parseInt(id));
      
      setProduct(result.product);
      setTransactions(result.transactions || []);
      
      // Update URL
      setSearchParams({ id });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load product';
      setError(errorMessage);
      setProduct(null);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = searchParams.get('id');
    if (id && id !== productId) {
      setProductId(id);
      fetchProduct(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'PLANTING_REGISTERED': return <Sprout className="w-5 h-5 text-green-600" />;
      case 'GERMINATION_OBSERVED': return <Eye className="w-5 h-5 text-teal-600" />;
      case 'MATURITY_DECLARED': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'HARVEST_RECORDED': return <Wheat className="w-5 h-5 text-amber-600" />;
      case 'PACKAGING_RECORDED': return <Package className="w-5 h-5 text-purple-600" />;
      case 'QUALITY_ASSURANCE_ADDED': return <ShieldCheck className="w-5 h-5 text-indigo-600" />;
      default: return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  const getEventTitle = (eventType: string) => {
    return eventType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <QrCode className="w-10 h-10 text-primary" />
            <h1 className="text-3xl font-bold">Product Traceability</h1>
          </div>
          <p className="text-gray-600">
            Track your product's journey from farm to table on the blockchain
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enter Product ID</CardTitle>
            <CardDescription>
              Search for any product registered on our blockchain system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="e.g., 123"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchProduct(productId)}
              />
              <Button 
                onClick={() => fetchProduct(productId)}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {product && (
          <div className="space-y-6">
            {/* Product Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Product #{productId}
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Shield className="w-3 h-3 mr-1" />
                        Blockchain Verified
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Registered on blockchain with complete traceability
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {transactions.length > 0 && transactions[0].metadata?.plantedAt && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Planted Date</p>
                        <p className="font-semibold">
                          {new Date(transactions[0].metadata.plantedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Farmer Address</p>
                      <p className="font-mono text-xs">
                        {product.farmer.substring(0, 10)}...{product.farmer.substring(product.farmer.length - 8)}
                      </p>
                    </div>
                  </div>
                </div>

                {transactions.length > 0 && transactions[0].metadata?.cropType && (
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Sprout className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Crop Type</p>
                      <p className="font-semibold">{transactions[0].metadata.cropType as string}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Journey Timeline</CardTitle>
                <CardDescription>
                  Complete lifecycle recorded on blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    No lifecycle events recorded yet
                  </p>
                ) : (
                  <div className="space-y-6">
                    {transactions.map((tx, index) => (
                      <div key={index} className="relative">
                        {index < transactions.length - 1 && (
                          <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"></div>
                        )}
                        
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                            {getEventIcon(tx.eventType)}
                          </div>
                          
                          <div className="flex-1 pt-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-lg">
                                  {getEventTitle(tx.eventType)}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {new Date(tx.createdAt).toLocaleDateString()} at{' '}
                                  {new Date(tx.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                              <Badge variant="outline">
                                Block #{tx.blockNumber}
                              </Badge>
                            </div>

                            {/* Event Details */}
                            {tx.metadata && Object.keys(tx.metadata).length > 0 && (
                              <div className="bg-gray-50 rounded-lg p-3 mb-2 text-sm">
                                {tx.metadata.germinationPercent && (
                                  <p><span className="font-medium">Germination:</span> {tx.metadata.germinationPercent}%</p>
                                )}
                                {tx.metadata.qualityGrade && (
                                  <p><span className="font-medium">Quality Grade:</span> {tx.metadata.qualityGrade as string}</p>
                                )}
                                {tx.metadata.quantityKg && (
                                  <p><span className="font-medium">Quantity:</span> {tx.metadata.quantityKg} kg</p>
                                )}
                                {tx.metadata.packageQuantity && (
                                  <p><span className="font-medium">Packages:</span> {tx.metadata.packageQuantity}</p>
                                )}
                                {tx.metadata.passed !== undefined && (
                                  <p>
                                    <span className="font-medium">QA Status:</span>{' '}
                                    <Badge variant={tx.metadata.passed ? 'default' : 'destructive'}>
                                      {tx.metadata.passed ? 'PASSED' : 'FAILED'}
                                    </Badge>
                                  </p>
                                )}
                                {tx.metadata.notes && (
                                  <p className="mt-1 text-gray-600">{tx.metadata.notes as string}</p>
                                )}
                              </div>
                            )}

                            {/* Transaction Link */}
                            {tx.explorerUrl && (
                              <a
                                href={tx.explorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                              >
                                View on Blockchain
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {!tx.explorerUrl && (
                              <p className="text-xs text-gray-500 font-mono">
                                {tx.transactionHash.substring(0, 20)}...
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trust Badge */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-full">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Blockchain Verified</h3>
                    <p className="text-sm text-gray-700">
                      This product's journey is immutably recorded on the blockchain, 
                      ensuring complete transparency and traceability from farm to table.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTraceabilityPage;
