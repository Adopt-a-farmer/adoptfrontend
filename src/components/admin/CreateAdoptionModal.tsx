import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import adminService from '@/services/admin';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Farmer {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
  };
  farmName: string;
  location: {
    village: string;
    subCounty: string;
  };
}

interface Adopter {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  adopterType: string;
}

interface CreateAdoptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateAdoptionModal({
  isOpen,
  onClose,
  onSuccess
}: CreateAdoptionModalProps) {
  const [loading, setLoading] = useState(false);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [adopters, setAdopters] = useState<Adopter[]>([]);
  const [searchFarmer, setSearchFarmer] = useState('');
  const [searchAdopter, setSearchAdopter] = useState('');
  
  const [formData, setFormData] = useState({
    farmerId: '',
    adopterId: '',
    adoptionType: 'standard',
    paymentType: 'monthly',
    paymentAmount: '',
    paymentFrequency: 'monthly',
    notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const response = await adminService.getUnassignedFarmers();
        setFarmers(response.data || []);
      } catch (error) {
        console.error('Failed to fetch farmers:', error);
        toast({
          title: 'Error',
          description: 'Failed to load available farmers',
          variant: 'destructive'
        });
      }
    };

    const fetchAdopters = async () => {
      try {
        const response = await adminService.getAvailableAdopters();
        setAdopters(response.data || []);
      } catch (error) {
        console.error('Failed to fetch adopters:', error);
        toast({
          title: 'Error',
          description: 'Failed to load available adopters',
          variant: 'destructive'
        });
      }
    };

    if (isOpen) {
      fetchFarmers();
      fetchAdopters();
    }
  }, [isOpen, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.farmerId || !formData.adopterId) {
      toast({
        title: 'Error',
        description: 'Please select both farmer and adopter',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.paymentAmount || parseFloat(formData.paymentAmount) <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid payment amount',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await adminService.createAdoption({
        farmerId: formData.farmerId,
        adopterId: formData.adopterId,
        adoptionType: formData.adoptionType,
        paymentPlan: {
          type: formData.paymentType,
          amount: parseFloat(formData.paymentAmount),
          frequency: formData.paymentFrequency
        },
        notes: formData.notes
      });

      toast({
        title: 'Success',
        description: 'Adoption created successfully!'
      });
      onSuccess?.();
      handleClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error && error.message ? error.message : 'Failed to create adoption',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      farmerId: '',
      adopterId: '',
      adoptionType: 'standard',
      paymentType: 'monthly',
      paymentAmount: '',
      paymentFrequency: 'monthly',
      notes: ''
    });
    setSearchFarmer('');
    setSearchAdopter('');
    onClose();
  };

  const filteredFarmers = farmers.filter(farmer => {
    const name = `${farmer.user?.firstName || ''} ${farmer.user?.lastName || ''}`.toLowerCase();
    const farmName = (farmer.farmName || '').toLowerCase();
    const search = searchFarmer.toLowerCase();
    return name.includes(search) || farmName.includes(search);
  });

  const filteredAdopters = adopters.filter(adopter => {
    const name = `${adopter.user?.firstName || ''} ${adopter.user?.lastName || ''}`.toLowerCase();
    const search = searchAdopter.toLowerCase();
    return name.includes(search);
  });

  const selectedFarmer = farmers.find(f => f._id === formData.farmerId);
  const selectedAdopter = adopters.find(a => a._id === formData.adopterId);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Adoption</DialogTitle>
          <p className="text-sm text-gray-500">Link a farmer with an adopter to create an adoption relationship</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Farmer Selection */}
          <div className="space-y-2">
            <Label htmlFor="farmer">Select Farmer *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search farmers..."
                value={searchFarmer}
                onChange={(e) => setSearchFarmer(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="border rounded-lg max-h-48 overflow-y-auto">
              {filteredFarmers.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  {searchFarmer ? 'No farmers match your search' : 'No available farmers'}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredFarmers.map((farmer) => (
                    <div
                      key={farmer._id}
                      onClick={() => setFormData({ ...formData, farmerId: farmer._id })}
                      className={cn(
                        "p-3 cursor-pointer hover:bg-gray-50 transition-colors",
                        formData.farmerId === farmer._id && "bg-blue-50 border-l-4 border-blue-500"
                      )}
                    >
                      <p className="font-medium">
                        {farmer.user?.firstName} {farmer.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{farmer.farmName}</p>
                      <p className="text-xs text-gray-500">
                        {farmer.location?.village}, {farmer.location?.subCounty}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedFarmer && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-900">
                  Selected: {selectedFarmer.user?.firstName} {selectedFarmer.user?.lastName} - {selectedFarmer.farmName}
                </p>
              </div>
            )}
          </div>

          {/* Adopter Selection */}
          <div className="space-y-2">
            <Label htmlFor="adopter">Select Adopter *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search adopters..."
                value={searchAdopter}
                onChange={(e) => setSearchAdopter(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="border rounded-lg max-h-48 overflow-y-auto">
              {filteredAdopters.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  {searchAdopter ? 'No adopters match your search' : 'No available adopters'}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredAdopters.map((adopter) => (
                    <div
                      key={adopter._id}
                      onClick={() => setFormData({ ...formData, adopterId: adopter._id })}
                      className={cn(
                        "p-3 cursor-pointer hover:bg-gray-50 transition-colors",
                        formData.adopterId === adopter._id && "bg-blue-50 border-l-4 border-blue-500"
                      )}
                    >
                      <p className="font-medium">
                        {adopter.user?.firstName} {adopter.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{adopter.user?.email}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        Type: {adopter.adopterType || 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedAdopter && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-900">
                  Selected: {selectedAdopter.user?.firstName} {selectedAdopter.user?.lastName}
                </p>
              </div>
            )}
          </div>

          {/* Adoption Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adoptionType">Adoption Type</Label>
              <Select
                value={formData.adoptionType}
                onValueChange={(value) => setFormData({ ...formData, adoptionType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="shared">Shared</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentType">Payment Type</Label>
              <Select
                value={formData.paymentType}
                onValueChange={(value) => setFormData({ ...formData, paymentType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="one-time">One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Payment Amount ($) *</Label>
              <Input
                id="paymentAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter amount"
                value={formData.paymentAmount}
                onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentFrequency">Payment Frequency</Label>
              <Select
                value={formData.paymentFrequency}
                onValueChange={(value) => setFormData({ ...formData, paymentFrequency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional information or special terms..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.farmerId || !formData.adopterId}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Creating...' : 'Create Adoption'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
