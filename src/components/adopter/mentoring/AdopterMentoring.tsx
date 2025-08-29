import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MessageCircle, 
  Calendar, 
  Users, 
  Plus,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { adopterService, MentoringFarmer } from '@/services/adopter';
import { useToast } from '@/hooks/use-toast';

const AdopterMentoring = () => {
  const [mentorships, setMentorships] = useState<MentoringFarmer[]>([]);
  const [filteredMentorships, setFilteredMentorships] = useState<MentoringFarmer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const fetchMentorships = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await adopterService.getMentoringFarmers(page, 10);
      setMentorships(response.data || []);
      setTotalPages(response.pagination?.pages || 1);
      setCurrentPage(page);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch mentorships:', error);
      setError('Failed to load mentoring relationships');
      // Provide fallback empty data instead of crashing
      setMentorships([]);
      setTotalPages(1);
      toast({
        title: 'Error',
        description: 'Failed to load mentoring relationships',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const filterMentorships = useCallback(() => {
    let filtered = [...mentorships];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(mentorship =>
        `${mentorship.farmer.firstName} ${mentorship.farmer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentorship.farmer.farmerProfile?.farmName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentorship.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(mentorship => mentorship.status === statusFilter);
    }

    setFilteredMentorships(filtered);
  }, [mentorships, searchTerm, statusFilter]);

  useEffect(() => {
    fetchMentorships();
  }, [fetchMentorships]);

  useEffect(() => {
    filterMentorships();
  }, [filterMentorships]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'paused':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paused':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading && mentorships.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Mentoring</h2>
          <p className="text-gray-600">Farmers you are mentoring and supporting</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Start Mentoring
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Mentorships</p>
                <p className="text-2xl font-bold">{mentorships.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {mentorships.filter(m => m.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {mentorships.filter(m => m.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold text-purple-600">
                  {mentorships.reduce((sum, m) => sum + m.unreadCount, 0)}
                </p>
              </div>
              <MessageCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search farmers or specializations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
            <Button onClick={() => fetchMentorships(currentPage)} className="mt-2">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Mentorships List */}
      {filteredMentorships.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No mentoring relationships found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Start mentoring farmers to build meaningful relationships'}
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Start Mentoring
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMentorships.map((mentorship) => (
            <Card key={mentorship._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {mentorship.farmer.avatar && (
                      <img
                        src={mentorship.farmer.avatar}
                        alt={`${mentorship.farmer.firstName} ${mentorship.farmer.lastName}`}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <CardTitle className="text-lg">
                        {mentorship.farmer.firstName} {mentorship.farmer.lastName}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {mentorship.farmer.farmerProfile?.farmName || 'Farmer'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(mentorship.status)}
                    <Badge className={getStatusColor(mentorship.status)}>
                      {mentorship.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Specialization</p>
                    <p className="text-sm text-gray-600">{mentorship.specialization}</p>
                  </div>

                  {mentorship.farmer.farmerProfile && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Farm Details</p>
                      <div className="text-sm text-gray-600">
                        <p>{mentorship.farmer.farmerProfile.location}</p>
                        <p>{mentorship.farmer.farmerProfile.farmingType}</p>
                        {mentorship.farmer.farmerProfile.cropTypes.length > 0 && (
                          <p>Crops: {mentorship.farmer.farmerProfile.cropTypes.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {mentorship.totalSessions} sessions
                      </span>
                      {mentorship.unreadCount > 0 && (
                        <span className="flex items-center gap-1 text-purple-600">
                          <MessageCircle className="h-3 w-3" />
                          {mentorship.unreadCount} unread
                        </span>
                      )}
                    </div>
                    <span className="text-gray-500">
                      Started {formatDistanceToNow(new Date(mentorship.startDate), { addSuffix: true })}
                    </span>
                  </div>

                  {mentorship.lastMessage && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">
                        Last message from {mentorship.lastMessage.sender.firstName}:
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {mentorship.lastMessage.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(mentorship.lastMessage.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchMentorships(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 py-2 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => fetchMentorships(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdopterMentoring;