import React, { useState } from 'react';
import { Package, Box, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import blockchainService from '@/services/blockchainService';

interface PackagingRecordFormProps {
  harvestBatchId?: number;
  onSuccess?: (packageId: number) => void;
}

const PackagingRecordForm: React.FC<PackagingRecordFormProps> = ({
  harvestBatchId: initialHarvestBatchId,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    harvestBatchId: initialHarvestBatchId || '',
    packageQuantity: '',
    packageType: 'Standard',
    batchNumber: '',
    expiryDate: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.harvestBatchId || !formData.packageQuantity) {
      toast({
        title: 'Missing Fields',
        description: 'Please enter Harvest Batch ID and package quantity',
        variant: 'destructive'
      });
      return;
    }

    const quantity = parseInt(formData.packageQuantity);
    if (quantity <= 0) {
      toast({
        title: 'Invalid Quantity',
        description: 'Package quantity must be greater than 0',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      const result = await blockchainService.recordPackaging({
        harvestBatchId: parseInt(formData.harvestBatchId.toString()),
        packageQuantity: quantity,
        packageType: formData.packageType,
        batchNumber: formData.batchNumber,
        expiryDate: formData.expiryDate
      });

      toast({
        title: 'Success!',
        description: `Packaging recorded: ${quantity} packages. Package ID: ${result.packageId}`,
      });

      // Show transaction details
      if (result.transaction) {
        toast({
          title: 'Blockchain Transaction',
          description: `Transaction Hash: ${result.transaction.hash.substring(0, 10)}...`,
        });
      }

      // Reset form
      if (!initialHarvestBatchId) {
        setFormData({
          harvestBatchId: '',
          packageQuantity: '',
          packageType: 'Standard',
          batchNumber: '',
          expiryDate: ''
        });
      } else {
        setFormData({
          ...formData,
          packageQuantity: '',
          packageType: 'Standard',
          batchNumber: '',
          expiryDate: ''
        });
      }

      if (onSuccess) {
        onSuccess(result.packageId);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to record packaging';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Record Packaging
        </CardTitle>
        <CardDescription>
          Document packaging details on the blockchain
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="harvestBatchId">
              Harvest Batch ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="harvestBatchId"
              type="number"
              placeholder="Enter harvest batch ID"
              value={formData.harvestBatchId}
              onChange={(e) => setFormData({ ...formData, harvestBatchId: e.target.value })}
              disabled={!!initialHarvestBatchId || loading}
              required
            />
            <p className="text-xs text-gray-500">
              The batch ID from harvest recording
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="packageQuantity" className="flex items-center gap-2">
              <Box className="w-4 h-4" />
              Package Quantity <span className="text-red-500">*</span>
            </Label>
            <Input
              id="packageQuantity"
              type="number"
              min="1"
              placeholder="Number of packages"
              value={formData.packageQuantity}
              onChange={(e) => setFormData({ ...formData, packageQuantity: e.target.value })}
              disabled={loading}
              required
            />
            <p className="text-xs text-gray-500">
              Total number of packages created
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="packageType">Package Type</Label>
            <Select
              value={formData.packageType}
              onValueChange={(value) => setFormData({ ...formData, packageType: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard">Standard Box</SelectItem>
                <SelectItem value="Premium">Premium Box</SelectItem>
                <SelectItem value="Bulk">Bulk Bag</SelectItem>
                <SelectItem value="Crate">Crate</SelectItem>
                <SelectItem value="Sack">Sack</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchNumber">Batch Number (Optional)</Label>
            <Input
              id="batchNumber"
              placeholder="e.g., BATCH-2025-001"
              value={formData.batchNumber}
              onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Internal batch tracking number
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Expiry Date (Optional)
            </Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Best before or expiry date
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm">
            <p className="font-semibold text-purple-900 mb-1">
              <Package className="w-4 h-4 inline mr-1" />
              Step 5 of 6: Packaging
            </p>
            <p className="text-purple-800 text-xs">
              Recording packaging creates a unique Package ID for quality assurance testing. 
              This ensures each package can be individually tracked and verified.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Recording on Blockchain...' : 'Record Packaging'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PackagingRecordForm;
