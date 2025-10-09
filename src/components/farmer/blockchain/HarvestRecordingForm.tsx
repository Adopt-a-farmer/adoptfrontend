import React, { useState } from 'react';
import { Wheat, Scale } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import blockchainService from '@/services/blockchainService';

interface HarvestRecordingFormProps {
  productId?: number;
  onSuccess?: (harvestBatchId: number) => void;
}

const HarvestRecordingForm: React.FC<HarvestRecordingFormProps> = ({
  productId: initialProductId,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productId: initialProductId || '',
    quantityKg: '',
    qualityGrade: 'A',
    harvestNotes: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productId || !formData.quantityKg) {
      toast({
        title: 'Missing Fields',
        description: 'Please enter Product ID and quantity',
        variant: 'destructive'
      });
      return;
    }

    const quantity = parseFloat(formData.quantityKg);
    if (quantity <= 0) {
      toast({
        title: 'Invalid Quantity',
        description: 'Quantity must be greater than 0',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      const result = await blockchainService.recordHarvest({
        productId: parseInt(formData.productId.toString()),
        quantityKg: quantity,
        qualityGrade: formData.qualityGrade,
        harvestNotes: formData.harvestNotes
      });

      toast({
        title: 'Success!',
        description: `Harvest recorded: ${quantity} kg. Batch ID: ${result.harvestBatchId}`,
      });

      // Show transaction details
      if (result.transaction) {
        toast({
          title: 'Blockchain Transaction',
          description: `Transaction Hash: ${result.transaction.hash.substring(0, 10)}...`,
        });
      }

      // Reset form
      if (!initialProductId) {
        setFormData({
          productId: '',
          quantityKg: '',
          qualityGrade: 'A',
          harvestNotes: ''
        });
      } else {
        setFormData({
          ...formData,
          quantityKg: '',
          qualityGrade: 'A',
          harvestNotes: ''
        });
      }

      if (onSuccess) {
        onSuccess(result.harvestBatchId);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to record harvest';
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
          <Wheat className="w-5 h-5" />
          Record Harvest
        </CardTitle>
        <CardDescription>
          Document harvest quantity and quality on the blockchain
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productId">
              Product ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="productId"
              type="number"
              placeholder="Enter product ID"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              disabled={!!initialProductId || loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantityKg" className="flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Quantity (kg) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="quantityKg"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 500.5"
              value={formData.quantityKg}
              onChange={(e) => setFormData({ ...formData, quantityKg: e.target.value })}
              disabled={loading}
              required
            />
            <p className="text-xs text-gray-500">
              Total weight harvested in kilograms
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualityGrade">Quality Grade</Label>
            <Select
              value={formData.qualityGrade}
              onValueChange={(value) => setFormData({ ...formData, qualityGrade: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A+">A+ (Premium)</SelectItem>
                <SelectItem value="A">A (Excellent)</SelectItem>
                <SelectItem value="B">B (Good)</SelectItem>
                <SelectItem value="C">C (Average)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Overall quality of harvested crop
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="harvestNotes">Harvest Notes (Optional)</Label>
            <Textarea
              id="harvestNotes"
              placeholder="Conditions during harvest, any issues encountered..."
              value={formData.harvestNotes}
              onChange={(e) => setFormData({ ...formData, harvestNotes: e.target.value })}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
            <p className="font-semibold text-amber-900 mb-1">
              <Wheat className="w-4 h-4 inline mr-1" />
              Step 4 of 6: Harvest
            </p>
            <p className="text-amber-800 text-xs">
              Recording harvest creates a Harvest Batch ID that tracks this specific batch 
              through packaging and quality assurance. This ensures complete traceability.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Recording on Blockchain...' : 'Record Harvest'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default HarvestRecordingForm;
