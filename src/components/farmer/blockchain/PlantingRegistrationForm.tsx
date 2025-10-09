import React, { useState } from 'react';
import { Sprout, MapPin, Calendar, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import blockchainService from '@/services/blockchainService';

interface PlantingRegistrationFormProps {
  farmId: string;
  onSuccess?: (productId: number) => void;
}

const PlantingRegistrationForm: React.FC<PlantingRegistrationFormProps> = ({
  farmId,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cropType: '',
    areaSize: '',
    plantingDate: new Date().toISOString().split('T')[0],
    latitude: '',
    longitude: '',
    notes: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cropType || !formData.areaSize || !formData.latitude || !formData.longitude) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      const result = await blockchainService.registerPlanting({
        cropType: formData.cropType,
        areaSize: formData.areaSize,
        plantingDate: formData.plantingDate,
        farmId,
        location: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        }
      });

      toast({
        title: 'Success!',
        description: `Planting registered on blockchain. Product ID: ${result.productId}`,
      });

      // Reset form
      setFormData({
        cropType: '',
        areaSize: '',
        plantingDate: new Date().toISOString().split('T')[0],
        latitude: '',
        longitude: '',
        notes: ''
      });

      if (onSuccess) {
        onSuccess(result.productId);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to register planting';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sprout className="w-5 h-5" />
          Register New Planting on Blockchain
        </CardTitle>
        <CardDescription>
          Record your planting on the blockchain for complete traceability
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cropType">
                Crop Type <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cropType"
                placeholder="e.g., Tomatoes, Maize, Beans"
                value={formData.cropType}
                onChange={(e) => handleChange('cropType', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="areaSize">
                Area Size <span className="text-red-500">*</span>
              </Label>
              <Input
                id="areaSize"
                placeholder="e.g., 2.5 hectares, 1 acre"
                value={formData.areaSize}
                onChange={(e) => handleChange('areaSize', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plantingDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Planting Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="plantingDate"
                type="date"
                value={formData.plantingDate}
                onChange={(e) => handleChange('plantingDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => handleChange('latitude', e.target.value)}
                  required
                />
                <Input
                  placeholder="Longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => handleChange('longitude', e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                GPS coordinates of the farm plot
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information about this planting..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <p className="font-semibold text-blue-900 mb-1">ℹ️ About Blockchain Registration</p>
            <p className="text-blue-800 text-xs">
              This will create an immutable record of your planting on the blockchain. You'll receive a unique Product ID
              that can be used to track this crop through its entire lifecycle - from planting to harvest. This builds
              trust with buyers and enables complete farm-to-table traceability.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Registering on Blockchain...' : 'Register Planting on Blockchain'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PlantingRegistrationForm;
