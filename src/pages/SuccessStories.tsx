import React, { useEffect, useState } from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, DollarSign, Heart } from 'lucide-react';
import { farmerService } from '@/services/farmer';
import { toast } from 'sonner';

interface FarmerStory {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
    avatar?: { url: string };
  };
  farmName: string;
  description: string;
  location: {
    county: string;
    subCounty: string;
  };
  adoptionStats?: {
    totalAdopters: number;
    totalContributions: number;
  };
  farmSize?: {
    value: number;
    unit: string;
  };
}

const SuccessStories = () => {
  const [stories, setStories] = useState<FarmerStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuccessStories = async () => {
      try {
        // Fetch verified farmers with adoption stats
        const response = await farmerService.getFarmers({ 
          limit: 12,
          verified: true,
          sort: 'adoptionCount'
        });
        
        if (response.success && response.data.farmers) {
          // Map FarmerProfile to FarmerStory
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mappedStories: FarmerStory[] = response.data.farmers.map((farmer: Record<string, any>) => ({
            _id: farmer._id,
            user: {
              firstName: farmer.user?.firstName || '',
              lastName: farmer.user?.lastName || '',
              avatar: farmer.user?.avatar ? { url: farmer.user.avatar } : undefined
            },
            farmName: farmer.farmName,
            description: farmer.description,
            location: farmer.location,
            adoptionStats: farmer.adoptionStats,
            farmSize: farmer.farmSize
          }));
          setStories(mappedStories);
        }
      } catch (error) {
        console.error('Error fetching success stories:', error);
        toast.error('Failed to load success stories');
      } finally {
        setLoading(false);
      }
    };

    fetchSuccessStories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero */}
      <section className="relative bg-gradient-to-r from-fresh-green to-farmer-primary text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="/farmers2.jpg" alt="Success" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Success Stories</h1>
            <p className="text-xl text-white/90">
              Real stories of transformation from our farming community
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-fresh-green mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900">{stories.length}+</div>
              <div className="text-gray-600">Success Stories</div>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 text-fresh-green mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900">
                {stories.reduce((sum, s) => sum + (s.adoptionStats?.totalAdopters || 0), 0)}
              </div>
              <div className="text-gray-600">Total Adopters</div>
            </div>
            <div className="text-center">
              <DollarSign className="h-8 w-8 text-fresh-green mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900">KES {(stories.reduce((sum, s) => sum + (s.adoptionStats?.totalContributions || 0), 0)).toLocaleString()}</div>
              <div className="text-gray-600">Funds Raised</div>
            </div>
            <div className="text-center">
              <Heart className="h-8 w-8 text-fresh-green mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900">100%</div>
              <div className="text-gray-600">Community Impact</div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <Card key={story._id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-fresh-green/20 to-farmer-primary/20 flex items-center justify-center">
                    {story.user.avatar?.url ? (
                      <img 
                        src={story.user.avatar.url} 
                        alt={story.farmName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="h-20 w-20 text-fresh-green" />
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{story.farmName}</h3>
                        <p className="text-sm text-gray-600">
                          {story.user.firstName} {story.user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {story.location.county}, {story.location.subCounty}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-fresh-green/10 text-fresh-green border-fresh-green">
                        Verified
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4 line-clamp-3">{story.description}</p>
                    
                    <div className="flex items-center justify-between text-sm mb-4">
                      {story.farmSize && (
                        <div className="text-gray-600">
                          <span className="font-semibold">{story.farmSize.value}</span> {story.farmSize.unit}
                        </div>
                      )}
                      {story.adoptionStats && (
                        <div className="text-fresh-green font-semibold">
                          {story.adoptionStats.totalAdopters} Supporters
                        </div>
                      )}
                    </div>

                    <Link to={`/farmer/${story._id}`}>
                      <Button className="w-full bg-fresh-green hover:bg-farmer-secondary">
                        Read Full Story
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Building Our Success Stories</h2>
              <p className="text-lg text-gray-600 mb-8">
                We're gathering inspiring success stories from our farming community. Check back soon to read about 
                the amazing transformations happening across Kenya.
              </p>
              <Link to="/browse-farmers">
                <Button className="bg-fresh-green hover:bg-farmer-secondary">
                  Start Your Own Success Story
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-fresh-green to-farmer-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Create Your Success Story?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our community of successful farmers and supportive adopters making a real difference
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="bg-white text-fresh-green hover:bg-gray-100">
                Join as Farmer
              </Button>
            </Link>
            <Link to="/browse-farmers">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10">
                Support a Farmer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SuccessStories;
