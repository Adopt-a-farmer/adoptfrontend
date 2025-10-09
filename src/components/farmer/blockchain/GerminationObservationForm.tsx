import React, { useState } from 'react';
import { Sprout, Eye, Percent } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import blockchainService from '@/services/blockchainService';

interface GerminationObservationFormProps {
  productId?: number;
  onSuccess?: () => void;
}

const GerminationObservationForm: React.FC<GerminationObservationFormProps> = ({
  productId: initialProductId,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productId: initialProductId || '',
    germinationPercent: '',
    notes: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productId || !formData.germinationPercent) {
      toast({
        title: 'Missing Fields',
        description: 'Please enter Product ID and germination percentage',
        variant: 'destructive'
      });
      return;
    }

    const percent = parseInt(formData.germinationPercent);
    if (percent < 0 || percent > 100) {
      toast({
        title: 'Invalid Percentage',
        description: 'Germination percentage must be between 0 and 100',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      const result = await blockchainService.recordGermination({
        productId: parseInt(formData.productId.toString()),
        germinationPercent: percent,
        notes: formData.notes
      });

      toast({
        title: 'Success!',
        description: `Germination recorded: ${percent}% for Product #${formData.productId}`,
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
          germinationPercent: '',
          notes: ''
        });
      } else {
        setFormData({
          ...formData,
          germinationPercent: '',
          notes: ''
        });
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to record germination';
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
          <Eye className="w-5 h-5" />
          Record Germination Observation
        </CardTitle>
        <CardDescription>
          Track germination progress on the blockchain
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
            <p className="text-xs text-gray-500">
              The product ID from planting registration
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="germinationPercent" className="flex items-center gap-2">
              <Percent className="w-4 h-4" />
              Germination Percentage <span className="text-red-500">*</span>
            </Label>
            <Input
              id="germinationPercent"
              type="number"
              min="0"
              max="100"
              placeholder="0-100"
              value={formData.germinationPercent}
              onChange={(e) => setFormData({ ...formData, germinationPercent: e.target.value })}
              disabled={loading}
              required
            />
            <p className="text-xs text-gray-500">
              Estimated percentage of seeds that germinated
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observation Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any observations about germination quality, uniformity, etc."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <p className="font-semibold text-blue-900 mb-1">
              <Sprout className="w-4 h-4 inline mr-1" />
              Step 2 of 6: Germination
            </p>
            <p className="text-blue-800 text-xs">
              Recording germination helps track crop development and identify issues early. 
              This data is permanently stored on the blockchain for complete traceability.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Recording on Blockchain...' : 'Record Germination'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GerminationObservationForm;
