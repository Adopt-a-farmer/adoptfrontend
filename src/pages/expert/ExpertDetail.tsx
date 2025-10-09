import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Star, Briefcase, DollarSign, MapPin, Mail, Phone, 
  Award, FileText, MessageCircle, Calendar, ExternalLink, Download 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiCall } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Expert {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio: string;
  specializations: string[];
  experience: number;
  hourlyRate: number;
  profilePicture?: string;
  rating?: number;
  totalReviews?: number;
  availability?: 'available' | 'busy' | 'unavailable';
  location?: string;
  education?: string[];
  certifications?: Array<{
    name: string;
    url: string;
    issuedBy?: string;
    issuedDate?: string;
  }>;
  languages?: string[];
  achievements?: string[];
  servicesOffered?: string[];
  createdAt: string;
}

interface Review {
  _id: string;
  farmer: {
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ExpertDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [expert, setExpert] = useState<Expert | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpertDetails = async () => {
      try {
        setLoading(true);
        const response = await apiCall<{ success: boolean; data: { expert: Expert; reviews: Review[] } }>('GET', `/experts/${id}`) as { success: boolean; data: { expert: Expert; reviews: Review[] } };
        
        if (response.success && response.data) {
          setExpert(response.data.expert);
          setReviews(response.data.reviews || []);
        }
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast({
          variant: 'destructive',
          title: 'Error',
          description: err.response?.data?.message || 'Failed to load expert details',
        });
        navigate('/experts');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchExpertDetails();
    }
  }, [id, navigate, toast]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getAvailabilityColor = (status?: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'unavailable':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getAvailabilityText = (status?: string) => {
    switch (status) {
      case 'available':
        return 'Available Now';
      case 'busy':
        return 'Currently Busy';
      case 'unavailable':
        return 'Unavailable';
      default:
        return 'Status Unknown';
    }
  };

  const handleMessage = () => {
    navigate(`/messages?expert=${expert?._id}`);
  };

  const handleBookConsultation = () => {
    // Navigate to booking page or open booking modal
    navigate(`/consultations/book?expert=${expert?._id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!expert) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/experts')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Experts
      </Button>

      {/* Header Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and Status */}
            <div className="flex flex-col items-center md:items-start">
              <div className="relative mb-3">
                <Avatar className="w-32 h-32 border-4 border-primary">
                  <AvatarImage src={expert.profilePicture} alt={`${expert.firstName} ${expert.lastName}`} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                    {getInitials(expert.firstName, expert.lastName)}
                  </AvatarFallback>
                </Avatar>
                {expert.availability && (
                  <div 
                    className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white ${getAvailabilityColor(expert.availability)}`}
                  />
                )}
              </div>
              <Badge variant="secondary" className="text-sm">
                {getAvailabilityText(expert.availability)}
              </Badge>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {expert.firstName} {expert.lastName}
              </h1>

              {/* Rating */}
              {expert.rating && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(expert.rating!)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{expert.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">
                    ({expert.totalReviews} {expert.totalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}

              {/* Specializations */}
              <div className="flex flex-wrap gap-2 mb-4">
                {expert.specializations.map((spec, index) => (
                  <Badge key={index} variant="default">
                    {spec}
                  </Badge>
                ))}
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span>{expert.experience} years of experience</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">${expert.hourlyRate}/hour</span>
                </div>
                {expert.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{expert.location}</span>
                  </div>
                )}
                {expert.languages && expert.languages.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span>{expert.languages.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleBookConsultation} size="lg">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Consultation
                </Button>
                <Button onClick={handleMessage} variant="outline" size="lg">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="about" className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>

        {/* About Tab */}
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About {expert.firstName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {expert.bio}
              </p>

              {expert.education && expert.education.length > 0 && (
                <>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Education
                  </h3>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    {expert.education.map((edu, index) => (
                      <li key={index} className="text-muted-foreground">{edu}</li>
                    ))}
                  </ul>
                </>
              )}

              {expert.achievements && expert.achievements.length > 0 && (
                <>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Achievements
                  </h3>
                  <ul className="list-disc list-inside space-y-2">
                    {expert.achievements.map((achievement, index) => (
                      <li key={index} className="text-muted-foreground">{achievement}</li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Services Offered</CardTitle>
            </CardHeader>
            <CardContent>
              {expert.servicesOffered && expert.servicesOffered.length > 0 ? (
                <ul className="space-y-3">
                  {expert.servicesOffered.map((service, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-1 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{service}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No specific services listed yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credentials Tab */}
        <TabsContent value="credentials">
          <Card>
            <CardHeader>
              <CardTitle>Certifications & Credentials</CardTitle>
            </CardHeader>
            <CardContent>
              {expert.certifications && expert.certifications.length > 0 ? (
                <div className="space-y-4">
                  {expert.certifications.map((cert, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:border-primary transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{cert.name}</h4>
                          {cert.issuedBy && (
                            <p className="text-sm text-muted-foreground mb-1">
                              Issued by: {cert.issuedBy}
                            </p>
                          )}
                          {cert.issuedDate && (
                            <p className="text-sm text-muted-foreground">
                              Date: {formatDate(cert.issuedDate)}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCertificate(cert.url)}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(cert.url, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No certifications uploaded yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Reviews & Ratings</CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review._id}>
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={review.farmer.profilePicture} />
                          <AvatarFallback>
                            {getInitials(review.farmer.firstName, review.farmer.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">
                                {review.farmer.firstName} {review.farmer.lastName}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(review.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-muted-foreground">{review.comment}</p>
                        </div>
                      </div>
                      <Separator className="mt-6" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No reviews yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Certificate Viewer Modal */}
      <Dialog open={!!selectedCertificate} onOpenChange={() => setSelectedCertificate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Certificate</DialogTitle>
          </DialogHeader>
          {selectedCertificate && (
            <div className="overflow-auto">
              <img
                src={selectedCertificate}
                alt="Certificate"
                className="w-full h-auto"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
