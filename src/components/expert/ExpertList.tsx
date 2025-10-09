import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ExpertCard from './ExpertCard';
import { apiCall } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Expert {
  _id: string;
  firstName: string;
  lastName: string;
  bio: string;
  specializations: string[];
  experience: number;
  hourlyRate: number;
  profilePicture?: string;
  rating?: number;
  totalReviews?: number;
  availability?: 'available' | 'busy' | 'unavailable';
}

interface Filters {
  specialization: string;
  minExperience: number;
  maxRate: number;
  availability: string;
  sortBy: 'rating' | 'experience' | 'rate-low' | 'rate-high' | 'name';
}

export default function ExpertList() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableSpecializations, setAvailableSpecializations] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<Filters>({
    specialization: 'all',
    minExperience: 0,
    maxRate: 500,
    availability: 'all',
    sortBy: 'rating',
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch experts
  const fetchExperts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiCall<{ success: boolean; data: Expert[] }>('GET', '/experts/verified') as { success: boolean; data: Expert[] };
      
      if (response.success && response.data) {
        setExperts(response.data);
        
        // Extract unique specializations
        const specs = new Set<string>();
        response.data.forEach((expert: Expert) => {
          expert.specializations.forEach(spec => specs.add(spec));
        });
        setAvailableSpecializations(Array.from(specs).sort());
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load experts',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchExperts();
  }, [fetchExperts]);

  // Apply filters and search
  useEffect(() => {
    let result = [...experts];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(expert => 
        `${expert.firstName} ${expert.lastName}`.toLowerCase().includes(query) ||
        expert.bio.toLowerCase().includes(query) ||
        expert.specializations.some(spec => spec.toLowerCase().includes(query))
      );
    }

    // Specialization filter
    if (filters.specialization !== 'all') {
      result = result.filter(expert => 
        expert.specializations.includes(filters.specialization)
      );
    }

    // Experience filter
    result = result.filter(expert => expert.experience >= filters.minExperience);

    // Rate filter
    result = result.filter(expert => expert.hourlyRate <= filters.maxRate);

    // Availability filter
    if (filters.availability !== 'all') {
      result = result.filter(expert => expert.availability === filters.availability);
    }

    // Sort
    switch (filters.sortBy) {
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'experience':
        result.sort((a, b) => b.experience - a.experience);
        break;
      case 'rate-low':
        result.sort((a, b) => a.hourlyRate - b.hourlyRate);
        break;
      case 'rate-high':
        result.sort((a, b) => b.hourlyRate - a.hourlyRate);
        break;
      case 'name':
        result.sort((a, b) => 
          `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        );
        break;
    }

    setFilteredExperts(result);
  }, [experts, searchQuery, filters]);

  const handleViewProfile = (expertId: string) => {
    navigate(`/experts/${expertId}`);
  };

  const handleMessage = (expertId: string) => {
    // Navigate to messaging page or open message modal
    navigate(`/messages?expert=${expertId}`);
  };

  const resetFilters = () => {
    setFilters({
      specialization: 'all',
      minExperience: 0,
      maxRate: 500,
      availability: 'all',
      sortBy: 'rating',
    });
    setSearchQuery('');
  };

  const activeFilterCount = () => {
    let count = 0;
    if (filters.specialization !== 'all') count++;
    if (filters.minExperience > 0) count++;
    if (filters.maxRate < 500) count++;
    if (filters.availability !== 'all') count++;
    return count;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Agricultural Experts</h1>
        <p className="text-muted-foreground">
          Connect with verified agricultural experts for guidance and support
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by name, specialization, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sort */}
        <Select
          value={filters.sortBy}
          onValueChange={(value: 'rating' | 'experience' | 'rate-low' | 'rate-high' | 'name') =>
            setFilters({ ...filters, sortBy: value })
          }
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="experience">Most Experienced</SelectItem>
            <SelectItem value="rate-low">Lowest Rate</SelectItem>
            <SelectItem value="rate-high">Highest Rate</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount() > 0 && (
                <Badge className="ml-2 px-1.5 py-0.5 text-xs" variant="default">
                  {activeFilterCount()}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between">
                Filter Experts
                {activeFilterCount() > 0 && (
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </SheetTitle>
            </SheetHeader>

            <div className="py-6 space-y-6">
              {/* Specialization Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Specialization</label>
                <Select
                  value={filters.specialization}
                  onValueChange={(value) => setFilters({ ...filters, specialization: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All specializations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specializations</SelectItem>
                    {availableSpecializations.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Experience Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Minimum Experience: {filters.minExperience} years
                </label>
                <Slider
                  value={[filters.minExperience]}
                  onValueChange={(value) => setFilters({ ...filters, minExperience: value[0] })}
                  max={30}
                  step={1}
                  className="mt-2"
                />
              </div>

              <Separator />

              {/* Rate Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Maximum Rate: ${filters.maxRate}/hr
                </label>
                <Slider
                  value={[filters.maxRate]}
                  onValueChange={(value) => setFilters({ ...filters, maxRate: value[0] })}
                  max={500}
                  step={10}
                  className="mt-2"
                />
              </div>

              <Separator />

              {/* Availability Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Availability</label>
                <Select
                  value={filters.availability}
                  onValueChange={(value) => setFilters({ ...filters, availability: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-muted-foreground">
        {loading ? (
          'Loading experts...'
        ) : (
          `Showing ${filteredExperts.length} of ${experts.length} expert${experts.length === 1 ? '' : 's'}`
        )}
      </div>

      {/* Expert Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredExperts.length === 0 ? (
        <div className="text-center py-20">
          <Filter className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No experts found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || activeFilterCount() > 0
              ? 'Try adjusting your search or filters'
              : 'No verified experts available at the moment'}
          </p>
          {(searchQuery || activeFilterCount() > 0) && (
            <Button onClick={resetFilters} variant="outline">
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperts.map((expert) => (
            <ExpertCard
              key={expert._id}
              expert={expert}
              onViewProfile={handleViewProfile}
              onMessage={handleMessage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
