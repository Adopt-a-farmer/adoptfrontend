import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { farmerService } from '@/services/farmer';
import { 
  Users, 
  Search, 
  MessageCircle, 
  Phone, 
  Mail, 
  Calendar,
  DollarSign,
  Star,
  Filter,
  MoreVertical
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Adoption {
  _id: string;
  adopter: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    email: string;
    phone?: string;
  };
  adoption: {
    packageType: string;
    monthlyAmount: number;
    status: string;
    startDate: string;
    endDate?: string;
  };
  status: 'active' | 'completed' | 'pending' | 'cancelled';
  totalPaid: number;
  lastPayment?: string;
  nextPayment?: string;
  createdAt: string;
}

const AdopterRelationshipCenter = () => {
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchAdopters();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAdopters = async () => {
    try {
      setLoading(true);
      const response = await farmerService.getFarmerAdopters() as {
        success: boolean;
        data: { adoptions: Adoption[] };
      };
      if (response.success) {
        setAdoptions(response.data.adoptions);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load adopters. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAdoptions = adoptions.filter(adoption => {
    const matchesSearch = 
      adoption.adopter.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adoption.adopter.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adoption.adopter.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || adoption.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'pending': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAdopterStats = () => {
    const total = adoptions.length;
    const active = adoptions.filter(a => a.status === 'active').length;
    const completed = adoptions.filter(a => a.status === 'completed').length;
    const totalEarnings = adoptions.reduce((sum, a) => sum + a.totalPaid, 0);
    
    return { total, active, completed, totalEarnings };
  };

  const stats = getAdopterStats();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Adopters</h2>
        <p className="text-muted-foreground">Manage relationships with your adopters</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Adopters</p>
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
                <p className="text-sm text-muted-foreground">Active Adoptions</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Badge variant="default" className="h-8 w-8 rounded-full p-0 flex items-center justify-center">
                <span className="text-xs">{stats.active}</span>
              </Badge>
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
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalEarnings)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search adopters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'completed', 'pending'].map(status => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adopters List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Adopters ({filteredAdoptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-20 h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredAdoptions.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || filterStatus !== 'all' 
                  ? 'No adopters found matching your criteria.' 
                  : 'You don\'t have any adopters yet.'}
              </p>
              {!searchQuery && filterStatus === 'all' && (
                <Button className="mt-4" onClick={() => window.location.href = '/farmer/profile'}>
                  Complete Your Profile
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAdoptions.map((adoption) => (
                <div key={adoption._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar>
                        <AvatarImage src={adoption.adopter.avatar} />
                        <AvatarFallback>
                          {adoption.adopter.firstName[0]}{adoption.adopter.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">
                            {adoption.adopter.firstName} {adoption.adopter.lastName}
                          </h3>
                          <Badge variant={getStatusColor(adoption.status)}>
                            {adoption.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Package</p>
                            <p className="font-medium">{adoption.adoption.packageType}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Monthly Amount</p>
                            <p className="font-medium text-green-600">
                              {formatCurrency(adoption.adoption.monthlyAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Paid</p>
                            <p className="font-medium">{formatCurrency(adoption.totalPaid)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Start Date</p>
                            <p className="font-medium">{formatDate(adoption.adoption.startDate)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <Button size="sm" variant="outline" className="h-8">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Message
                          </Button>
                          {adoption.adopter.phone && (
                            <Button size="sm" variant="outline" className="h-8">
                              <Phone className="h-3 w-3 mr-1" />
                              Call
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="h-8">
                            <Mail className="h-3 w-3 mr-1" />
                            Email
                          </Button>
                          <Button size="sm" variant="outline" className="h-8">
                            <Calendar className="h-3 w-3 mr-1" />
                            Schedule Visit
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {adoptions.slice(0, 5).map((adoption) => (
              <div key={adoption._id} className="flex items-center gap-3 text-sm">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={adoption.adopter.avatar} />
                  <AvatarFallback className="text-xs">
                    {adoption.adopter.firstName[0]}{adoption.adopter.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p>
                    <span className="font-medium">
                      {adoption.adopter.firstName} {adoption.adopter.lastName}
                    </span>
                    {' '}adopted your {adoption.adoption.packageType} package
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatDate(adoption.createdAt)}
                  </p>
                </div>
                <Badge variant={getStatusColor(adoption.status)} className="text-xs">
                  {adoption.status}
                </Badge>
              </div>
            ))}
            {adoptions.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdopterRelationshipCenter;