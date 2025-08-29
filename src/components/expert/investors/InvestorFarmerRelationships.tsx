import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { expertService, InvestorFarmerRelationship } from '@/services/expert';
import { 
  Users, 
  Search, 
  DollarSign, 
  MessageCircle, 
  Eye,
  TrendingUp,
  MapPin,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const InvestorFarmerRelationships = () => {
  const [relationships, setRelationships] = useState<InvestorFarmerRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const fetchRelationships = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await expertService.getInvestorFarmerRelationships();
      setRelationships(data.relationships);
    } catch (error: unknown) {
      console.error('Error fetching relationships:', error);
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 
          'status' in error.response && error.response.status === 403) {
        toast({
          title: 'Access Denied',
          description: 'You need expert permissions to access investor-farmer relationships',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load investor-farmer relationships',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRelationships();
  }, [fetchRelationships]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAdoptionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRelationships = relationships.filter(relationship =>
    relationship.farmer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    relationship.farmer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    relationship.farmer.farmerProfile.farmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    relationship.investors.some(inv => 
      inv.adopter.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.adopter.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const getOverviewStats = () => {
    const totalFarmers = relationships.length;
    const totalInvestors = relationships.reduce((sum, rel) => sum + rel.investors.length, 0);
    const totalInvestment = relationships.reduce((sum, rel) => sum + rel.totalInvestment, 0);
    const avgInvestmentPerFarmer = totalFarmers > 0 ? totalInvestment / totalFarmers : 0;
    
    return { totalFarmers, totalInvestors, totalInvestment, avgInvestmentPerFarmer };
  };

  const stats = getOverviewStats();

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
        <h2 className="text-2xl font-bold text-foreground">Investor-Farmer Relationships</h2>
        <p className="text-muted-foreground">Overview of active investment relationships on the platform</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Farmers</p>
                <p className="text-2xl font-bold">{stats.totalFarmers}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Investors</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalInvestors}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Investment</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalInvestment)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg per Farmer</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.avgInvestmentPerFarmer)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search farmers or investors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Relationships List */}
      <div className="space-y-4">
        {filteredRelationships.length === 0 ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? 'No relationships found matching your search.' 
                    : 'No active investor-farmer relationships found.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredRelationships.map((relationship) => (
            <Card key={relationship.farmer._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={relationship.farmer.avatar} />
                      <AvatarFallback>
                        {relationship.farmer.firstName[0]}{relationship.farmer.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">
                          {relationship.farmer.firstName} {relationship.farmer.lastName}
                        </h3>
                        <Badge variant="outline">
                          {relationship.farmer.farmerProfile.verificationStatus}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{relationship.farmer.farmerProfile.farmName}</span>
                        </div>
                        <div>
                          {relationship.farmer.farmerProfile.location.county}, {relationship.farmer.farmerProfile.location.subCounty}
                        </div>
                        <div>
                          {relationship.farmer.farmerProfile.farmingType.join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Investment</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(relationship.totalInvestment)}</p>
                    <p className="text-sm text-muted-foreground">{relationship.investors.length} investor(s)</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Investors:</h4>
                  <div className="grid gap-3">
                    {relationship.investors.map((investor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={investor.adopter.avatar} />
                            <AvatarFallback className="text-xs">
                              {investor.adopter.firstName[0]}{investor.adopter.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <p className="font-medium text-sm">
                              {investor.adopter.firstName} {investor.adopter.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {investor.adopter.email}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <Badge className={getAdoptionStatusColor(investor.adoption.status)}>
                              {investor.adoption.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(investor.adoption.startDate)}
                            </p>
                          </div>
                          
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <MessageCircle className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default InvestorFarmerRelationships;