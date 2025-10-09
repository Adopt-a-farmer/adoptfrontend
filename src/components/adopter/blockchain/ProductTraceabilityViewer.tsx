import React, { useState } from 'react';
import { Search, Package, CheckCircle, Sprout, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import blockchainService, { ProductHistory, BlockchainTransaction } from '@/services/blockchainService';
import { formatDistanceToNow } from 'date-fns';

const ProductTraceabilityViewer: React.FC = () => {
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ProductHistory | null>(null);
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!productId || isNaN(Number(productId))) {
      toast({
        title: 'Invalid Product ID',
        description: 'Please enter a valid numeric product ID',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const result = await blockchainService.getProductHistory(Number(productId));
      setProduct(result.product);
      setTransactions(result.transactions);

      if (result.transactions.length === 0) {
        toast({
          title: 'Product Not Found',
          description: 'No product found with this ID on the blockchain',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch product information',
        variant: 'destructive'
      });
      setProduct(null);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    const icons: Record<string, React.ReactNode> = {
      'PLANTING_REGISTERED': <Sprout className="w-5 h-5" />,
      'GERMINATION_RECORDED': <Sprout className="w-5 h-5 text-green-500" />,
      'MATURITY_DECLARED': <Clock className="w-5 h-5 text-orange-500" />,
      'HARVEST_RECORDED': <Package className="w-5 h-5 text-emerald-500" />
    };
    return icons[eventType] || <Package className="w-5 h-5" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Product Traceability
        </CardTitle>
        <CardDescription>
          Search for any product by ID to view its complete blockchain-verified journey from farm to table
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Enter Product ID (e.g., 1, 2, 3...)"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="w-4 h-4 mr-2" />
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {/* Product Details */}
        {product && (
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                ✓ This product is verified on the blockchain. All information below is cryptographically secured and cannot be tampered with.
              </AlertDescription>
            </Alert>

            {/* Product Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Product ID</p>
                <p className="font-semibold">{product.productId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Farmer Address</p>
                <code className="text-xs bg-white px-2 py-1 rounded">
                  {product.farmer.substring(0, 10)}...{product.farmer.substring(product.farmer.length - 8)}
                </code>
              </div>
              <div>
                <p className="text-sm text-gray-600">Harvest Status</p>
                <Badge className={product.isHarvested ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {product.isHarvested ? '✓ Harvested' : '⏳ Growing'}
                </Badge>
              </div>
              {product.harvestQuantity && (
                <div>
                  <p className="text-sm text-gray-600">Harvest Quantity</p>
                  <p className="font-semibold">{product.harvestQuantity} kg</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Product Journey Timeline
              </h3>
              <div className="space-y-3">
                {transactions.map((tx, index) => (
                  <div
                    key={tx._id}
                    className="flex gap-3 items-start"
                  >
                    {/* Timeline Line */}
                    <div className="flex flex-col items-center">
                      <div className="bg-primary/10 p-2 rounded-full">
                        {getEventIcon(tx.eventType)}
                      </div>
                      {index < transactions.length - 1 && (
                        <div className="w-0.5 h-12 bg-gray-300 my-1" />
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-sm">
                          {tx.eventType.replace(/_/g, ' ')}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          Block #{tx.blockNumber}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">
                        {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                      </p>
                      {tx.metadata && Object.keys(tx.metadata).length > 0 && (
                        <div className="mt-2 text-xs bg-white p-2 rounded border">
                          {Object.entries(tx.metadata).slice(0, 3).map(([key, value]) => (
                            <div key={key} className="flex gap-2">
                              <span className="font-medium">{key}:</span>
                              <span className="text-gray-600">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <a
                        href={tx.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                      >
                        View transaction →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!product && !loading && (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Enter a Product ID to view its journey</p>
            <p className="text-sm mt-2">
              Every product registered on the blockchain has a unique ID that reveals its complete farm-to-table story
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductTraceabilityViewer;
