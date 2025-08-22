
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Clock, User, Phone, Mail, Plus, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FarmVisit {
  id: string;
  farmer_id: number;
  farmer_name: string;
  farmer_phone: string;
  farmer_email: string;
  farmer_location: string;
  farmer_image: string;
  visit_date: string;
  visit_time: string;
  purpose: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  farmer_notes?: string;
}

interface AdoptedFarmer {
  id: number;
  name: string;
  phone: string;
  email: string;
  location: string;
  image: string;
  farm_type: string;
}

// Status helpers available to all components in this module
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'confirmed': return 'bg-green-100 text-green-800';
    case 'completed': return 'bg-blue-100 text-blue-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending': return <AlertCircle className="h-4 w-4" />;
    case 'confirmed': return <CheckCircle className="h-4 w-4" />;
    case 'completed': return <CheckCircle className="h-4 w-4" />;
    case 'cancelled': return <XCircle className="h-4 w-4" />;
    default: return <AlertCircle className="h-4 w-4" />;
  }
};

const FarmVisitPlanner = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  // Fetch farm visits
  const { data: visits = [], isLoading } = useQuery({
    queryKey: ['farm-visits', user?.id],
  queryFn: async (): Promise<FarmVisit[]> => {
      try {
    const response = await apiCall<FarmVisit[]>('GET', '/visits');
        return response;
      } catch (error) {
        return [];
      }
    },
    enabled: !!user
  });

  // Fetch adopted farmers
  const { data: adoptedFarmers = [] } = useQuery({
    queryKey: ['adopted-farmers', user?.id],
  queryFn: async (): Promise<AdoptedFarmer[]> => {
      try {
    const response = await apiCall<AdoptedFarmer[]>('GET', '/adopters/adopted-farmers');
        return response;
      } catch (error) {
        return [];
      }
    },
    enabled: !!user
  });

  // Schedule visit mutation
  const scheduleVisitMutation = useMutation({
    mutationFn: async (visitData: Omit<FarmVisit, 'id' | 'status' | 'created_at'>) => {
      return await apiCall('POST', '/visits', visitData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Visit scheduled successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['farm-visits'] });
      setShowScheduleDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule visit",
        variant: "destructive",
      });
    }
  });

  // Update visit status mutation
  const updateVisitMutation = useMutation({
    mutationFn: async ({ visitId, status }: { visitId: string; status: string }) => {
      return await apiCall('PUT', `/visits/${visitId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Visit status updated!",
      });
      queryClient.invalidateQueries({ queryKey: ['farm-visits'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update visit",
        variant: "destructive",
      });
    }
  });

  const filterVisitsByStatus = (status: string) => {
    switch (status) {
      case 'upcoming':
        return visits.filter(v => ['pending', 'confirmed'].includes(v.status) && new Date(v.visit_date) >= new Date());
      case 'past':
        return visits.filter(v => v.status === 'completed' || new Date(v.visit_date) < new Date());
      case 'pending':
        return visits.filter(v => v.status === 'pending');
      default:
        return visits;
    }
  };

  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Farm Visit Planner</h1>
          <p className="text-gray-600 mt-1">Schedule and manage visits to your adopted farms</p>
        </div>
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0 bg-farmer-primary hover:bg-farmer-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Schedule Visit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule Farm Visit</DialogTitle>
            </DialogHeader>
            <ScheduleVisitForm 
              farmers={adoptedFarmers}
              onSubmit={(data) => scheduleVisitMutation.mutate(data)}
              isLoading={scheduleVisitMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-farmer-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Visits</p>
                <p className="text-2xl font-bold text-gray-900">{visits.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {visits.filter(v => v.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {visits.filter(v => v.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {visits.filter(v => v.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visits Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming Visits</TabsTrigger>
          <TabsTrigger value="past">Past Visits</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="space-y-4">
            {filterVisitsByStatus('upcoming').map((visit) => (
              <VisitCard 
                key={visit.id} 
                visit={visit} 
                onUpdateStatus={(status) => updateVisitMutation.mutate({ visitId: visit.id, status })}
                isUpdating={updateVisitMutation.isPending}
              />
            ))}
            {filterVisitsByStatus('upcoming').length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming visits</h3>
                <p className="text-gray-500">Schedule your first farm visit to connect with your adopted farmers</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <div className="space-y-4">
            {filterVisitsByStatus('past').map((visit) => (
              <VisitCard 
                key={visit.id} 
                visit={visit} 
                onUpdateStatus={(status) => updateVisitMutation.mutate({ visitId: visit.id, status })}
                isUpdating={updateVisitMutation.isPending}
                isPast
              />
            ))}
            {filterVisitsByStatus('past').length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No past visits</h3>
                <p className="text-gray-500">Your completed visits will appear here</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="space-y-4">
            {filterVisitsByStatus('pending').map((visit) => (
              <VisitCard 
                key={visit.id} 
                visit={visit} 
                onUpdateStatus={(status) => updateVisitMutation.mutate({ visitId: visit.id, status })}
                isUpdating={updateVisitMutation.isPending}
              />
            ))}
            {filterVisitsByStatus('pending').length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending visits</h3>
                <p className="text-gray-500">Visits awaiting farmer approval will appear here</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Visit Card Component
const VisitCard = ({ 
  visit, 
  onUpdateStatus, 
  isUpdating, 
  isPast = false 
}: {
  visit: FarmVisit;
  onUpdateStatus: (status: string) => void;
  isUpdating: boolean;
  isPast?: boolean;
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-3">
              <img 
                src={visit.farmer_image} 
                alt={visit.farmer_name}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h3 className="text-lg font-semibold">{visit.farmer_name}</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {visit.farmer_location}
                </div>
              </div>
              <Badge className={`ml-4 ${getStatusColor(visit.status)}`}>
                <span className="flex items-center">
                  {getStatusIcon(visit.status)}
                  <span className="ml-1 capitalize">{visit.status}</span>
                </span>
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(visit.visit_date)}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {formatTime(visit.visit_time)}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {visit.farmer_phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {visit.farmer_email}
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-700">Purpose:</p>
                <p className="text-sm text-gray-600">{visit.purpose}</p>
              </div>
              {visit.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Notes:</p>
                  <p className="text-sm text-gray-600">{visit.notes}</p>
                </div>
              )}
              {visit.farmer_notes && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Farmer's Notes:</p>
                  <p className="text-sm text-gray-600">{visit.farmer_notes}</p>
                </div>
              )}
            </div>
          </div>

          {!isPast && visit.status === 'pending' && (
            <div className="flex flex-col space-y-2 mt-4 md:mt-0 md:ml-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateStatus('cancelled')}
                disabled={isUpdating}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Cancel Visit
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Schedule Visit Form Component
const ScheduleVisitForm = ({ 
  farmers, 
  onSubmit, 
  isLoading 
}: {
  farmers: AdoptedFarmer[];
  onSubmit: (data: Omit<FarmVisit, 'id' | 'status' | 'created_at'>) => void;
  isLoading: boolean;
}) => {
  const [selectedFarmer, setSelectedFarmer] = useState<AdoptedFarmer | null>(null);
  const [formData, setFormData] = useState({
    visit_date: '',
    visit_time: '10:00',
    purpose: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmer) return;

    onSubmit({
      farmer_id: selectedFarmer.id,
      farmer_name: selectedFarmer.name,
      farmer_phone: selectedFarmer.phone,
      farmer_email: selectedFarmer.email,
      farmer_location: selectedFarmer.location,
      farmer_image: selectedFarmer.image,
      ...formData
    });
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="farmer">Select Farmer</Label>
        <Select value={selectedFarmer?.id.toString() || ''} onValueChange={(value) => {
          const farmer = farmers.find(f => f.id.toString() === value);
          setSelectedFarmer(farmer || null);
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a farmer to visit" />
          </SelectTrigger>
          <SelectContent>
            {farmers.map((farmer) => (
              <SelectItem key={farmer.id} value={farmer.id.toString()}>
                <div className="flex items-center">
                  <img src={farmer.image} alt={farmer.name} className="w-6 h-6 rounded-full mr-2" />
                  <span>{farmer.name} - {farmer.location}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="visit_date">Visit Date</Label>
          <Input
            id="visit_date"
            type="date"
            value={formData.visit_date}
            onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
            min={minDate}
            required
          />
        </div>
        <div>
          <Label htmlFor="visit_time">Visit Time</Label>
          <Input
            id="visit_time"
            type="time"
            value={formData.visit_time}
            onChange={(e) => setFormData({ ...formData, visit_time: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="purpose">Purpose of Visit</Label>
        <Input
          id="purpose"
          value={formData.purpose}
          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
          placeholder="e.g., Farm inspection, harvest planning, consultation"
          required
        />
      </div>

      <div>
        <Label htmlFor="notes">Additional Notes (optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Any specific requirements or agenda items"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || !selectedFarmer}
          className="bg-farmer-primary hover:bg-farmer-primary/90"
        >
          {isLoading ? "Scheduling..." : "Schedule Visit"}
        </Button>
      </div>
    </form>
  );
};

export default FarmVisitPlanner;
