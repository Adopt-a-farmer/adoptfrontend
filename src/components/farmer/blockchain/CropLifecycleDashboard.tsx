import React, { useEffect, useState } from 'react';
import { Sprout, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import blockchainService from '@/services/blockchainService';
import GerminationObservationForm from './GerminationObservationForm';
import MaturityDeclarationForm from './MaturityDeclarationForm';
import HarvestRecordingForm from './HarvestRecordingForm';
import PackagingRecordForm from './PackagingRecordForm';
import QualityAssuranceForm from './QualityAssuranceForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Product {
  productId: number;
  cropType: string;
  plantingDate: string;
  stages: {
    planted: boolean;
    germinated: boolean;
    mature: boolean;
    harvested: boolean;
    packaged: boolean;
    qaCompleted: boolean;
  };
  completionPercentage: number;
  currentStage: string;
  nextAction: string;
  events: Array<{
    type: string;
    date: string;
    txHash: string;
  }>;
}

const CropLifecycleDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [actionModal, setActionModal] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    inProgress: 0,
    completed: 0
  });
  const { toast } = useToast();

  const fetchLifecycleData = async () => {
    try {
      setLoading(true);
      const result = await blockchainService.getCropLifecycleStatus();
      
      setProducts(result.products);
      setSummary(result.summary);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load lifecycle data';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLifecycleData();
  }, []);

  const handleAction = (product: Product) => {
    setSelectedProduct(product);
    // Determine which form to show based on next action
    if (product.nextAction === 'Record Germination') {
      setActionModal('germination');
    } else if (product.nextAction === 'Declare Maturity') {
      setActionModal('maturity');
    } else if (product.nextAction === 'Record Harvest') {
      setActionModal('harvest');
    } else if (product.nextAction === 'Record Packaging') {
      setActionModal('packaging');
    } else if (product.nextAction === 'Add Quality Assurance') {
      setActionModal('qa');
    }
  };

  const closeModal = () => {
    setActionModal(null);
    setSelectedProduct(null);
    fetchLifecycleData(); // Refresh data after action
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Quality Assured': return 'bg-green-500';
      case 'Packaged': return 'bg-purple-500';
      case 'Harvested': return 'bg-amber-500';
      case 'Mature': return 'bg-blue-500';
      case 'Germinated': return 'bg-teal-500';
      case 'Planted': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading crop lifecycle data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Sprout className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Crop Lifecycle Dashboard</h1>
          <p className="text-gray-600">
            Track your crops through every stage on the blockchain
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.totalProducts}</div>
            <p className="text-xs text-gray-500 mt-1">Registered on blockchain</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{summary.inProgress}</div>
            <p className="text-xs text-gray-500 mt-1">Pending completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{summary.completed}</div>
            <p className="text-xs text-gray-500 mt-1">All stages finished</p>
          </CardContent>
        </Card>
      </div>

      {/* Products List */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Products Registered</h3>
            <p className="text-gray-600">
              Register a planting to start tracking your crop lifecycle on the blockchain
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {products.map((product) => (
            <Card key={product.productId} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      Product #{product.productId}
                      <Badge className={getStageColor(product.currentStage)}>
                        {product.currentStage}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {product.cropType} • Planted: {new Date(product.plantingDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {product.completionPercentage < 100 && (
                    <Button
                      onClick={() => handleAction(product)}
                      size="sm"
                      className="ml-4"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      {product.nextAction}
                    </Button>
                  )}
                  {product.completionPercentage === 100 && (
                    <Badge variant="outline" className="ml-4 text-green-600 border-green-600">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Complete
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Progress</span>
                    <span className="text-gray-600">{product.completionPercentage}%</span>
                  </div>
                  <Progress value={product.completionPercentage} className="h-2" />
                </div>

                {/* Stages Checklist */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {Object.entries(product.stages).map(([stage, completed]) => (
                    <div
                      key={stage}
                      className={`flex items-center gap-2 p-2 rounded ${
                        completed ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      {completed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-current"></div>
                      )}
                      <span className="capitalize text-xs">
                        {stage.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Events Timeline */}
                {product.events.length > 0 && (
                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">Recent Events</p>
                    <div className="space-y-1">
                      {product.events.slice(-3).map((event, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">
                            {event.type.replace(/_/g, ' ').toLowerCase()}
                          </span>
                          <span className="text-gray-400">
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Action Modals */}
      <Dialog open={!!actionModal} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {actionModal === 'germination' && 'Record Germination'}
              {actionModal === 'maturity' && 'Declare Maturity'}
              {actionModal === 'harvest' && 'Record Harvest'}
              {actionModal === 'packaging' && 'Record Packaging'}
              {actionModal === 'qa' && 'Quality Assurance'}
            </DialogTitle>
          </DialogHeader>
          
          {actionModal === 'germination' && selectedProduct && (
            <GerminationObservationForm
              productId={selectedProduct.productId}
              onSuccess={closeModal}
            />
          )}
          {actionModal === 'maturity' && selectedProduct && (
            <MaturityDeclarationForm
              productId={selectedProduct.productId}
              onSuccess={closeModal}
            />
          )}
          {actionModal === 'harvest' && selectedProduct && (
            <HarvestRecordingForm
              productId={selectedProduct.productId}
              onSuccess={closeModal}
            />
          )}
          {actionModal === 'packaging' && selectedProduct && (
            <PackagingRecordForm
              onSuccess={closeModal}
            />
          )}
          {actionModal === 'qa' && selectedProduct && (
            <QualityAssuranceForm
              onSuccess={closeModal}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CropLifecycleDashboard;
