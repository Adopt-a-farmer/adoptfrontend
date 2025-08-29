import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { expertService, ExpertMentorship } from '@/services/expert';
import { 
  Users, 
  Search, 
  Plus, 
  MessageCircle, 
  Calendar,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const ExpertMentorships = () => {
  const [mentorships, setMentorships] = useState<ExpertMentorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSpecialization, setFilterSpecialization] = useState<string>('all');
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchMentorships = React.useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterSpecialization !== 'all') params.specialization = filterSpecialization;
      
      const data = await expertService.getMentorships(params);
      setMentorships(data.mentorships);
    } catch (error: unknown) {
      console.error('Error fetching mentorships:', error);
      
      // Handle 403 Forbidden specifically
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number } };
        if (axiosError.response?.status === 403) {
          toast({
            title: 'Access Denied',
            description: 'You need expert permissions to view mentorships',
            variant: 'destructive',
          });
          return;
        }
      }
      
      toast({
        title: 'Error',
        description: 'Failed to load mentorships',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterSpecialization, toast]);

  useEffect(() => {
    fetchMentorships();
  }, [fetchMentorships]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSpecializationIcon = (specialization: string) => {
    switch (specialization) {
      case 'crop_management': return '🌱';
      case 'livestock_care': return '🐄';
      case 'soil_health': return '🌍';
      case 'pest_control': return '🐛';
      case 'irrigation': return '💧';
      case 'organic_farming': return '🌿';
      case 'sustainable_practices': return '♻️';
      case 'marketing': return '📈';
      case 'financial_planning': return '💰';
      case 'technology_adoption': return '📱';
      case 'climate_adaptation': return '🌡️';
      default: return '📋';
    }
  };

  const formatSpecializationName = (specialization: string) => {
    return specialization.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredMentorships = mentorships.filter(mentorship =>
    mentorship.farmer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentorship.farmer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (mentorship.farmer.farmerProfile?.farmName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getMentorshipStats = () => {
    const total = mentorships.length;
    const active = mentorships.filter(m => m.status === 'active').length;
    const completed = mentorships.filter(m => m.status === 'completed').length;
    const averageRating = mentorships.reduce((sum, m) => sum + m.progress.overallRating, 0) / total || 0;
    
    return { total, active, completed, averageRating };
  };

  const stats = getMentorshipStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mentorship Programs</h2>
          <p className="text-muted-foreground">Manage your farmer mentoring relationships</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Mentorship
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Mentorships</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Programs</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
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
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}⭐</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-600" />
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
                  placeholder="Search farmers..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSpecialization} onValueChange={setFilterSpecialization}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                <SelectItem value="crop_management">Crop Management</SelectItem>
                <SelectItem value="livestock_care">Livestock Care</SelectItem>
                <SelectItem value="soil_health">Soil Health</SelectItem>
                <SelectItem value="pest_control">Pest Control</SelectItem>
                <SelectItem value="irrigation">Irrigation</SelectItem>
                <SelectItem value="organic_farming">Organic Farming</SelectItem>
                <SelectItem value="sustainable_practices">Sustainable Practices</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="financial_planning">Financial Planning</SelectItem>
                <SelectItem value="technology_adoption">Technology Adoption</SelectItem>
                <SelectItem value="climate_adaptation">Climate Adaptation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Mentorships List */}
      <Card>
        <CardHeader>
          <CardTitle>Mentorship Relationships</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMentorships.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || filterStatus !== 'all' || filterSpecialization !== 'all'
                  ? 'No mentorships found matching your criteria.' 
                  : 'You don\'t have any mentorships yet.'}
              </p>
              {!searchQuery && filterStatus === 'all' && filterSpecialization === 'all' && (
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Start First Mentorship
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMentorships.map((mentorship) => (
                <div key={mentorship._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={mentorship.farmer.avatar} />
                        <AvatarFallback>
                          {mentorship.farmer.firstName[0]}{mentorship.farmer.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">
                            {mentorship.farmer.firstName} {mentorship.farmer.lastName}
                          </h3>
                          <Badge className={getStatusColor(mentorship.status)}>
                            {mentorship.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Farm</p>
                            <p className="font-medium">{mentorship.farmer.farmerProfile?.farmName || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Specialization</p>
                            <div className="flex items-center gap-1">
                              <span>{getSpecializationIcon(mentorship.specialization)}</span>
                              <p className="font-medium">{formatSpecializationName(mentorship.specialization)}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Sessions</p>
                            <p className="font-medium">{mentorship.progress.totalSessions}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Goals Completed</p>
                            <p className="font-medium text-green-600">
                              {mentorship.progress.completedGoals}/{mentorship.goals.length}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <Button size="sm" variant="outline" className="h-8">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Message
                          </Button>
                          <Button size="sm" variant="outline" className="h-8">
                            <Calendar className="h-3 w-3 mr-1" />
                            Schedule Session
                          </Button>
                          <Button size="sm" variant="outline" className="h-8">
                            <Target className="h-3 w-3 mr-1" />
                            View Goals
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Started</p>
                      <p className="text-sm font-medium">{formatDate(mentorship.startDate)}</p>
                      {mentorship.progress.overallRating > 0 && (
                        <div className="mt-1">
                          <p className="text-sm text-muted-foreground">Rating</p>
                          <p className="text-sm font-medium">{mentorship.progress.overallRating.toFixed(1)}⭐</p>
                        </div>
                      )}
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

export default ExpertMentorships;