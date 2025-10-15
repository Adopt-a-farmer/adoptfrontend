import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Calendar as CalendarIcon, Clock, Users, MapPin, Eye, CheckCircle, 
  XCircle, MessageSquare, Phone, Mail, Edit, Trash2, Plus, Filter,
  Download, Search, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '@/services/api';
import { visitService } from '@/services/visit';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Utility functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

interface FarmVisit {
  _id: string;
  adopter: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  farmer: {
    _id: string;
    farmName: string;
    user: {
      firstName: string;
      lastName: string;
    }
    location: {
      address: string;
      city: string;
      state: string;
      coordinates?: { lat: number; lng: number };
    }
  };
  adoption: string; // Reference ID to adoption
  visitType: 'scheduled' | 'inspection' | 'harvest' | 'general' | 'educational';
  requestedDate: string;
  confirmedDate?: string;
  duration: 'half_day' | 'full_day' | 'weekend' | 'custom';
  customDuration?: {
    hours: number;
    description: string;
  };
  groupSize: {
    adults: number;
    children: number;
  };
  purpose: string;
  activities?: Array<{
    name: string;
    description: string;
    estimatedDuration: string;
  }>;
  requirements?: {
    transportation: {
      needed: boolean;
      details?: string;
    };
    accommodation: {
      needed: boolean;
      type?: 'homestay' | 'hotel' | 'camping';
      nights?: number;
    };
    meals: {
      breakfast: boolean;
      lunch: boolean;
      dinner: boolean;
      specialDiet?: string;
    };
    specialNeeds?: string;
  };
  costs?: {
    visitFee: number;
    transportationCost: number;
    accommodationCost: number;
    mealsCost: number;
    totalCost: number;
    currency: string;
  };
  status: 'requested' | 'confirmed' | 'cancelled' | 'completed' | 'rescheduled';
  farmerResponse?: {
    approved: boolean;
    message?: string;
    respondedAt: string;
    suggestedAlternatives?: Array<{
      date: string;
      reason?: string;
    }>;
  };
  visitReport?: {
    summary?: string;
    highlights?: string[];
    media?: Array<{
      url: string;
      publicId: string;
      caption?: string;
      type: 'image' | 'video';
    }>;
    adopterFeedback?: {
      rating: number;
      review?: string;
      wouldRecommend: boolean;
    };
    farmerFeedback?: {
      rating: number;
      review?: string;
    };
    completedAt?: string;
  };
  weather?: {
    forecast?: string;
    suitableConditions: boolean;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  cancellationReason?: string;
  cancelledAt?: string;
  rescheduledFrom?: string;
  rescheduledReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface VisitStats {
  total_visits: number;
  pending_requests: number;
  completed_visits: number;
  average_rating: number;
  total_revenue: number;
  this_month_visits: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
  booked_by?: string;
}

const FarmVisitScheduler = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('requests');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<FarmVisit | null>(null);

  // Fetch visit requests
  const { data: visits, isLoading } = useQuery({
    queryKey: ['farm-visits', filterStatus, searchTerm],
    queryFn: async (): Promise<FarmVisit[]> => {
      let url = '/visits';
      const params = new URLSearchParams();
      if (filterStatus && filterStatus !== 'all') params.append('status', filterStatus);
      if (searchTerm) params.append('search', searchTerm);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await apiCall<{ success: boolean; data: { visits: FarmVisit[] } }>('GET', url);
      return response.data.visits;
    },
    enabled: !!user
  });

  // Fetch visit statistics
  const { data: stats } = useQuery({
    queryKey: ['visit-stats', user?.id],
    queryFn: async (): Promise<VisitStats> => {
      const response = await apiCall<{ data: VisitStats }>('GET', '/visits/stats');
      return response.data;
    },
    enabled: !!user
  });

  // Update visit status mutation
  const updateVisitMutation = useMutation({
    mutationFn: async ({ visitId, status, notes }: { visitId: string; status: string; notes?: string }) => {
      return await apiCall('PUT', `/visits/${visitId}/status`, { status, notes });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Visit status updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['farm-visits'] });
      queryClient.invalidateQueries({ queryKey: ['visit-stats'] });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: (error as Error)?.message || "Failed to update visit status",
        variant: "destructive",
      });
    }
  });

  // Add available time slots mutation
  const addTimeSlotMutation = useMutation({
    mutationFn: async ({ date, timeSlots }: { date: string; timeSlots: string[] }) => {
      return await apiCall('POST', '/visits/availability', { date, time_slots: timeSlots });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Time slots added successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['visit-availability'] });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: (error as Error)?.message || "Failed to add time slots",
        variant: "destructive",
      });
    }
  });

  const handleStatusUpdate = (visitId: string, status: string, notes?: string) => {
    updateVisitMutation.mutate({ visitId, status, notes });
  };

  const filteredVisits = visits?.filter(visit => {
    const matchesStatus = filterStatus === 'all' || visit.status === filterStatus;
    const adopterName = `${visit.adopter.firstName} ${visit.adopter.lastName}`.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      adopterName.includes(searchTerm.toLowerCase()) ||
      visit.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  if (isLoading) {
    return <div>Loading visit requests...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Farm Visit Scheduler</h2>
          <p className="text-muted-foreground">Manage farm visit requests and availability</p>
        </div>
        <Button 
          className="mt-4 md:mt-0 bg-farmer-primary hover:bg-farmer-primary/90"
          onClick={() => setActiveTab('availability')}
        >
          <Plus className="mr-2 h-4 w-4" />
          Set Availability
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-farmer-primary" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Visits</p>
                  <p className="text-2xl font-bold">{stats.total_visits}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending_requests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed_visits}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="text-farmer-primary text-2xl">★</div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Rating</p>
                  <p className="text-2xl font-bold">{stats.average_rating}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="text-farmer-primary text-2xl">KES</div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Revenue</p>
                  <p className="text-lg font-bold">{formatCurrency(stats.total_revenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CalendarIcon className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">This Month</p>
                  <p className="text-2xl font-bold">{stats.this_month_visits}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="requests">Visit Requests</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="availability">Set Availability</TabsTrigger>
          <TabsTrigger value="my-availability">My Schedule</TabsTrigger>
          <TabsTrigger value="history">Visit History</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          <VisitRequestsTab 
            visits={filteredVisits}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onStatusUpdate={handleStatusUpdate}
            onViewDetails={(visit) => {
              setSelectedVisit(visit);
              setShowDetailsDialog(true);
            }}
            isUpdating={updateVisitMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <CalendarViewTab visits={visits || []} />
        </TabsContent>

        <TabsContent value="availability" className="space-y-6">
          <AvailabilityTab 
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onAddTimeSlots={(date, timeSlots) => addTimeSlotMutation.mutate({ date, timeSlots })}
            isAdding={addTimeSlotMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="my-availability" className="space-y-6">
          <MyAvailabilityScheduleTab />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <VisitHistoryTab visits={visits?.filter(v => v.status === 'completed') || []} />
        </TabsContent>
      </Tabs>

      {/* Visit Details Dialog */}
      <VisitDetailsDialog 
        visit={selectedVisit}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

// Visit Requests Tab Component
const VisitRequestsTab = ({ 
  visits, 
  filterStatus, 
  setFilterStatus, 
  searchTerm, 
  setSearchTerm, 
  onStatusUpdate,
  onViewDetails,
  isUpdating 
}: {
  visits: FarmVisit[];
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onStatusUpdate: (visitId: string, status: string, notes?: string) => void;
  onViewDetails: (visit: FarmVisit) => void;
  isUpdating: boolean;
}) => {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by adopter name or purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Visit Requests List */}
      <div className="space-y-4">
        {visits.map((visit) => (
          <Card key={visit._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={visit.adopter.avatar} />
                      <AvatarFallback>
                        {visit.adopter.firstName[0]}{visit.adopter.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg">{visit.adopter.firstName} {visit.adopter.lastName}</h3>
                        <Badge className={getStatusColor(visit.status)}>
                          {visit.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {format(new Date(visit.requestedDate), 'PPP')}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {visit.duration === 'custom' && visit.customDuration ? 
                            `Custom (${visit.customDuration.hours}h)` : 
                            visit.duration.replace('_', ' ')}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {visit.groupSize.adults + visit.groupSize.children} {visit.groupSize.adults + visit.groupSize.children === 1 ? 'person' : 'people'}
                        </div>
                        <div className="flex items-center">
                          <span className="text-farmer-primary font-medium">
                            {visit.costs ? formatCurrency(visit.costs.totalCost) : 'Price TBD'}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 mt-2">{visit.purpose}</p>
                      {visit.requirements?.specialNeeds && (
                        <div className="mt-2">
                          <span className="text-sm font-medium text-gray-500">Special Needs:</span>
                          <p className="text-sm text-gray-600">{visit.requirements.specialNeeds}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 mt-4 md:mt-0 md:ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(visit)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  
                  {visit.status === 'requested' && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => onStatusUpdate(visit._id, 'confirmed')}
                        disabled={isUpdating}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onStatusUpdate(visit._id, 'cancelled')}
                        disabled={isUpdating}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  )}

                  {visit.status === 'confirmed' && (
                    <Button
                      size="sm"
                      onClick={() => onStatusUpdate(visit._id, 'completed')}
                      disabled={isUpdating}
                      className="bg-farmer-primary hover:bg-farmer-primary/90"
                    >
                      Mark Complete
                    </Button>
                  )}

                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {visits.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No visit requests found</h3>
              <p className="text-gray-500">Visit requests will appear here when adopters book farm visits.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Calendar View Tab Component
const CalendarViewTab = ({ visits }: { visits: FarmVisit[] }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const visitsForSelectedDate = visits.filter(visit => {
    if (!selectedDate) return false;
    const visitDate = new Date(visit.requestedDate);
    return visitDate.toDateString() === selectedDate.toDateString();
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Visits for {selectedDate ? format(selectedDate, 'PPP') : 'Selected Date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {visitsForSelectedDate.length > 0 ? (
              <div className="space-y-4">
                {visitsForSelectedDate.map((visit) => (
                  <div key={visit._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{visit.adopter.firstName} {visit.adopter.lastName}</h4>
                      <Badge className={getStatusColor(visit.status)}>
                        {visit.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><Clock className="inline h-4 w-4 mr-1" />{visit.duration}</p>
                      <p><Users className="inline h-4 w-4 mr-1" />{visit.groupSize.adults + visit.groupSize.children} people</p>
                      <p className="mt-1">{visit.purpose}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No visits scheduled for this date</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Availability Tab Component
const AvailabilityTab = ({ 
  selectedDate, 
  setSelectedDate, 
  onAddTimeSlots,
  isAdding 
}: {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  onAddTimeSlots: (date: string, timeSlots: string[]) => void;
  isAdding: boolean;
}) => {
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const selectedIso = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined;

  // Fetch saved availability for the selected date (current farmer)
  const { data: myAvailability } = useQuery({
    queryKey: ['visit-availability', selectedIso],
    queryFn: async () => {
      const res = await visitService.getMyAvailability({ start: selectedIso!, end: selectedIso! });
      return res.data.availability as Array<{ date: string; timeSlots: string[] }>;
    },
    enabled: !!selectedIso,
  });

  const savedSlotsForDay = myAvailability?.find((a) => a.date === selectedIso)?.timeSlots ?? [];
  
  const availableTimeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleAddTimeSlots = () => {
    if (selectedDate && timeSlots.length > 0) {
      onAddTimeSlots(format(selectedDate, 'yyyy-MM-dd'), timeSlots);
      setTimeSlots([]);
  queryClient.invalidateQueries({ queryKey: ['visit-availability'] });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Set Available Dates</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            disabled={(date) => date < new Date()}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Time Slots</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select available times for {selectedDate ? format(selectedDate, 'PPP') : 'selected date'}</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {availableTimeSlots.map((time) => (
                <Button
                  key={time}
                  variant={timeSlots.includes(time) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setTimeSlots(prev => 
                      prev.includes(time) 
                        ? prev.filter(t => t !== time)
                        : [...prev, time]
                    );
                  }}
                  className={timeSlots.includes(time) ? 'bg-farmer-primary' : savedSlotsForDay.includes(time) ? 'border-green-500' : ''}
                >
                  {time}
                </Button>
              ))}
            </div>
            {selectedIso && (
              <p className="text-xs text-muted-foreground mt-2">Saved slots: {savedSlotsForDay.length > 0 ? savedSlotsForDay.join(', ') : 'None yet'}</p>
            )}
          </div>

          <Button 
            onClick={handleAddTimeSlots}
            disabled={!selectedDate || timeSlots.length === 0 || isAdding}
            className="w-full bg-farmer-primary hover:bg-farmer-primary/90"
          >
            {isAdding ? "Adding..." : "Add Time Slots"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// My Availability Schedule Tab Component
const MyAvailabilityScheduleTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  // Calculate date range for current month
  const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
  const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
  
  const startIso = format(startOfMonth, 'yyyy-MM-dd');
  const endIso = format(endOfMonth, 'yyyy-MM-dd');

  // Fetch all availability for the month
  const { data: allAvailability, isLoading } = useQuery({
    queryKey: ['all-availability', startIso, endIso],
    queryFn: async () => {
      const res = await visitService.getMyAvailability({ start: startIso, end: endIso });
      return res.data.availability as Array<{ _id: string; date: string; timeSlots: string[]; farmer: string }>;
    },
  });

  // Delete availability mutation
  const deleteAvailabilityMutation = useMutation({
    mutationFn: async (date: string) => {
      return await apiCall('POST', '/visits/availability', { date, time_slots: [] });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Availability removed successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['all-availability'] });
      queryClient.invalidateQueries({ queryKey: ['visit-availability'] });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: (error as Error)?.message || "Failed to remove availability",
        variant: "destructive",
      });
    }
  });

  const handlePreviousMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1));
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading your availability...</div>;
  }

  const sortedAvailability = allAvailability?.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  ) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>My Availability Schedule</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                Previous
              </Button>
              <span className="text-sm font-medium px-4">
                {format(selectedMonth, 'MMMM yyyy')}
              </span>
              <Button variant="outline" size="sm" onClick={handleNextMonth}>
                Next
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedAvailability.length > 0 ? (
            <div className="space-y-4">
              {sortedAvailability.map((availability) => (
                <Card key={availability._id} className="border border-green-200 bg-green-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CalendarIcon className="h-5 w-5 text-farmer-primary" />
                          <h4 className="font-semibold text-lg">
                            {format(new Date(availability.date), 'EEEE, MMMM d, yyyy')}
                          </h4>
                        </div>
                        <div className="flex items-center space-x-2 mb-3">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {availability.timeSlots.length} time slot{availability.timeSlots.length !== 1 ? 's' : ''} available
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {availability.timeSlots.map((slot, index) => (
                            <Badge key={index} className="bg-farmer-primary text-white">
                              {slot}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAvailabilityMutation.mutate(availability.date)}
                        disabled={deleteAvailabilityMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No availability set</h3>
              <p className="text-gray-500 mb-4">
                You haven't set any available time slots for {format(selectedMonth, 'MMMM yyyy')} yet.
              </p>
              <Button 
                onClick={() => {
                  const tabsList = document.querySelector('[role="tablist"]');
                  const availabilityTab = tabsList?.querySelector('[value="availability"]') as HTMLElement;
                  availabilityTab?.click();
                }}
                className="bg-farmer-primary hover:bg-farmer-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Set Your Availability
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {sortedAvailability.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CalendarIcon className="h-8 w-8 text-farmer-primary" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Days</p>
                  <p className="text-2xl font-bold">{sortedAvailability.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Slots</p>
                  <p className="text-2xl font-bold">
                    {sortedAvailability.reduce((sum, a) => sum + a.timeSlots.length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Next Available</p>
                  <p className="text-sm font-bold">
                    {sortedAvailability[0] ? format(new Date(sortedAvailability[0].date), 'MMM d') : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Visit History Tab Component
const VisitHistoryTab = ({ visits }: { visits: FarmVisit[] }) => {
  return (
    <div className="space-y-4">
      {visits.map((visit) => (
        <Card key={visit._id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={visit.adopter.avatar} />
                  <AvatarFallback>
                    {visit.adopter.firstName[0]}{visit.adopter.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{visit.adopter.firstName} {visit.adopter.lastName}</h3>
                  <p className="text-sm text-gray-600">{format(new Date(visit.requestedDate), 'PPP')}</p>
                  <p className="text-sm text-gray-600">{visit.purpose}</p>
                  {visit.visitReport?.adopterFeedback?.rating && (
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm ml-1">{visit.visitReport.adopterFeedback.rating}/5</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-farmer-primary">{visit.costs ? formatCurrency(visit.costs.totalCost) : 'Price TBD'}</p>
                <Badge className="bg-green-100 text-green-800">Completed</Badge>
              </div>
            </div>
            {visit.visitReport?.adopterFeedback?.review && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">"{visit.visitReport.adopterFeedback.review}"</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {visits.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No completed visits yet</h3>
            <p className="text-gray-500">Completed visits will appear here after they're marked as finished.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Visit Details Dialog Component
const VisitDetailsDialog = ({ 
  visit, 
  open, 
  onOpenChange, 
  onStatusUpdate 
}: {
  visit: FarmVisit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: (visitId: string, status: string, notes?: string) => void;
}) => {
  if (!visit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Visit Request Details</DialogTitle>
          <DialogDescription>
            Complete information about this farm visit request
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Adopter Info */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={visit.adopter.avatar} />
              <AvatarFallback>
                {visit.adopter.firstName[0]}{visit.adopter.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{visit.adopter.firstName} {visit.adopter.lastName}</h3>
              <p className="text-gray-600">{visit.adopter.email}</p>
              <p className="text-gray-600">{visit.adopter.phone}</p>
            </div>
          </div>

          {/* Visit Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Visit Date</Label>
              <p className="font-medium">{format(new Date(visit.requestedDate), 'PPP')}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Duration</Label>
              <p className="font-medium">
                {visit.duration === 'custom' && visit.customDuration ? 
                  `${visit.customDuration.hours} hours` : 
                  visit.duration.replace('_', ' ')}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Group Size</Label>
              <p className="font-medium">
                {visit.groupSize.adults + visit.groupSize.children} 
                {visit.groupSize.adults + visit.groupSize.children === 1 ? ' person' : ' people'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Visit Type</Label>
              <p className="font-medium capitalize">{visit.visitType}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Estimated Cost</Label>
              <p className="font-medium text-farmer-primary">
                {visit.costs ? formatCurrency(visit.costs.totalCost) : 'Price TBD'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Status</Label>
              <Badge className={getStatusColor(visit.status)}>
                {visit.status}
              </Badge>
            </div>
          </div>

          {/* Purpose & Special Requests */}
          <div>
            <Label className="text-sm font-medium text-gray-500">Purpose of Visit</Label>
            <p className="mt-1">{visit.purpose}</p>
          </div>

          {visit.requirements?.specialNeeds && (
            <div>
              <Label className="text-sm font-medium text-gray-500">Special Needs</Label>
              <p className="mt-1">{visit.requirements.specialNeeds}</p>
            </div>
          )}

          {/* Action Buttons */}
          {visit.status === 'requested' && (
            <div className="flex space-x-2">
              <Button 
                onClick={() => {
                  onStatusUpdate(visit._id, 'confirmed');
                  onOpenChange(false);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Visit
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  onStatusUpdate(visit._id, 'cancelled');
                  onOpenChange(false);
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Decline Visit
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FarmVisitScheduler;