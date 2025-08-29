import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { expertService, ExpertFarmVisit } from '@/services/expert';
import { 
  Calendar, 
  Search, 
  MapPin, 
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ExpertFarmVisits = () => {
  const [visits, setVisits] = useState<ExpertFarmVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const { toast } = useToast();

  const fetchVisits = React.useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (selectedDate) params.date = selectedDate;
      
      const data = await expertService.getFarmVisits(params);
      setVisits(data.visits);
    } catch (error: unknown) {
      console.error('Error fetching visits:', error);
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 
          'status' in error.response && error.response.status === 403) {
        toast({
          title: 'Access Denied',
          description: 'You need expert permissions to access farm visits',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load farm visits',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [filterStatus, selectedDate, toast]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'requested': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'requested': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredVisits = visits.filter(visit =>
    visit.farmer.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    visit.farmer.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    visit.farmer.farmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    visit.adopter.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    visit.adopter.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getVisitStats = () => {
    const total = visits.length;
    const upcoming = visits.filter(v => new Date(v.scheduledDate) > new Date() && v.status !== 'cancelled').length;
    const completed = visits.filter(v => v.status === 'completed').length;
    const pending = visits.filter(v => v.status === 'requested').length;
    
    return { total, upcoming, completed, pending };
  };

  const stats = getVisitStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Farm Visits</h2>
        <p className="text-muted-foreground">Monitor farm visits in your mentorship network</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Visits</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold text-green-600">{stats.upcoming}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search visits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full md:w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Visits List */}
      <Card>
        <CardHeader>
          <CardTitle>Farm Visits</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVisits.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || filterStatus !== 'all' || selectedDate
                  ? 'No visits found matching your criteria.' 
                  : 'No farm visits scheduled yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVisits.map((visit) => (
                <div key={visit._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(visit.status)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">
                            Visit to {visit.farmer.farmName}
                          </h3>
                          <Badge className={getStatusColor(visit.status)}>
                            {visit.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Farmer</p>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={visit.farmer.user.avatar} />
                                <AvatarFallback className="text-xs">
                                  {visit.farmer.user.firstName[0]}{visit.farmer.user.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <p className="font-medium">
                                {visit.farmer.user.firstName} {visit.farmer.user.lastName}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Visitor</p>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={visit.adopter.avatar} />
                                <AvatarFallback className="text-xs">
                                  {visit.adopter.firstName[0]}{visit.adopter.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <p className="font-medium">
                                {visit.adopter.firstName} {visit.adopter.lastName}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Location</p>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <p className="font-medium">
                                {visit.farmer.location.county}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Date & Time</p>
                            <p className="font-medium">
                              {formatDate(visit.scheduledDate)} at {formatTime(visit.scheduledDate)}
                            </p>
                          </div>
                        </div>

                        {visit.purpose && (
                          <div className="mt-3">
                            <p className="text-muted-foreground text-sm">Purpose</p>
                            <p className="text-sm">{visit.purpose}</p>
                          </div>
                        )}

                        {visit.feedback && (
                          <div className="mt-3 p-2 bg-muted/50 rounded">
                            <p className="text-muted-foreground text-sm">Feedback</p>
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-500">
                                {'★'.repeat(visit.feedback.rating)}{'☆'.repeat(5 - visit.feedback.rating)}
                              </span>
                              <span className="text-sm">{visit.feedback.comment}</span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-3">
                          <Button size="sm" variant="outline" className="h-8">
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                          {visit.status === 'requested' && (
                            <Button size="sm" variant="outline" className="h-8">
                              Monitor Request
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpertFarmVisits;