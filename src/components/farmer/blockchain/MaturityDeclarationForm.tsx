import React, { useState } from 'react';
import { Award, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import blockchainService from '@/services/blockchainService';

interface MaturityDeclarationFormProps {
  productId?: number;
  onSuccess?: () => void;
}

const MaturityDeclarationForm: React.FC<MaturityDeclarationFormProps> = ({
  productId: initialProductId,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productId: initialProductId || '',
    qualityGrade: 'A',
    estimatedYield: '',
    maturityNotes: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productId) {
      toast({
        title: 'Missing Field',
        description: 'Please enter Product ID',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      const result = await blockchainService.declareMaturity({
        productId: parseInt(formData.productId.toString()),
        qualityGrade: formData.qualityGrade,
        estimatedYield: formData.estimatedYield,
        maturityNotes: formData.maturityNotes
      });

      toast({
        title: 'Success!',
        description: `Maturity declared for Product #${formData.productId}`,
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
          qualityGrade: 'A',
          estimatedYield: '',
          maturityNotes: ''
        });
      } else {
        setFormData({
          ...formData,
          qualityGrade: 'A',
          estimatedYield: '',
          maturityNotes: ''
        });
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to declare maturity';
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
          <CheckCircle className="w-5 h-5" />
          Declare Crop Maturity
        </CardTitle>
        <CardDescription>
          Mark your crop as ready for harvest on the blockchain
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
            <Label htmlFor="qualityGrade" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Quality Grade
            </Label>
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
              Expected quality of the mature crop
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedYield">
              Estimated Yield (Optional)
            </Label>
            <Input
              id="estimatedYield"
              placeholder="e.g., 500 kg, 10 tons"
              value={formData.estimatedYield}
              onChange={(e) => setFormData({ ...formData, estimatedYield: e.target.value })}
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Estimated harvest quantity
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maturityNotes">Maturity Notes (Optional)</Label>
            <Textarea
              id="maturityNotes"
              placeholder="Observations about crop maturity, readiness for harvest..."
              value={formData.maturityNotes}
              onChange={(e) => setFormData({ ...formData, maturityNotes: e.target.value })}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
            <p className="font-semibold text-green-900 mb-1">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Step 3 of 6: Maturity
            </p>
            <p className="text-green-800 text-xs">
              Declaring maturity signals that your crop is ready for harvest. This milestone 
              is recorded on the blockchain and helps coordinate with buyers and harvesters.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Declaring on Blockchain...' : 'Declare Maturity'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MaturityDeclarationForm;
