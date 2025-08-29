import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  MessageCircle, 
  Phone, 
  Video, 
  UserCheck,
  Target,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Star
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import FarmerMessagingCenter from './messages/FarmerMessagingCenter';
import { Progress } from '@/components/ui/progress';

interface Expert {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  email: string;
  specialization: string;
  mentorshipId: string;
  startDate: string;
  status: string;
  goals: Array<{
    title: string;
    description: string;
    status: string;
    targetDate: string;
    completedDate?: string;
  }>;
  completedGoals: number;
  totalGoals: number;
  conversationId: string;
}

const FarmerExpertChat = () => {
  const { user } = useAuth();
  const [showMessaging, setShowMessaging] = useState(false);
  const [selectedExpertConversation, setSelectedExpertConversation] = useState<string | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);

  // Fetch farmer's assigned experts
  const { data: expertsData, isLoading: isLoadingExperts } = useQuery({
    queryKey: ['farmer-experts', user?._id],
    queryFn: async () => {
      try {
        const response = await apiCall<{ data: { experts: Expert[] } }>('GET', '/farmers/experts');
        return response.data;
      } catch (error) {
        console.error('Error fetching experts:', error);
        return { experts: [] };
      }
    },
    enabled: !!user?._id
  });

  const experts = expertsData?.experts || [];

  const handleMessageExpert = (expert: Expert) => {
    setSelectedExpert(expert);
    setSelectedExpertConversation(expert.conversationId);
    setShowMessaging(true);
  };

  const getSpecializationColor = (specialization: string) => {
    const colors = {
      'crop_management': 'bg-green-100 text-green-800',
      'livestock_care': 'bg-blue-100 text-blue-800',
      'soil_health': 'bg-amber-100 text-amber-800',
      'pest_control': 'bg-red-100 text-red-800',
      'irrigation': 'bg-cyan-100 text-cyan-800',
      'organic_farming': 'bg-emerald-100 text-emerald-800',
      'sustainable_practices': 'bg-teal-100 text-teal-800',
      'marketing': 'bg-purple-100 text-purple-800',
      'financial_planning': 'bg-indigo-100 text-indigo-800',
      'technology_adoption': 'bg-pink-100 text-pink-800',
      'climate_adaptation': 'bg-orange-100 text-orange-800'
    };
    return colors[specialization as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatSpecialization = (specialization: string) => {
    return specialization.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in_progress':
        return 'text-blue-600';
      case 'overdue':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatGoalStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoadingExperts) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (experts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <UserCheck className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Expert Assigned</h3>
          <p className="text-gray-500 text-center max-w-md">
            You don't have any expert mentors assigned yet. Contact our support team to get connected with an expert.
          </p>
          <Button className="mt-4" variant="outline">
            Contact Support
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Expert Mentors</h2>
          <p className="text-gray-600">Connect with your assigned agricultural experts</p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {experts.length} Expert{experts.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {experts.map((expert) => (
          <Card key={expert._id} className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={expert.avatar} />
                    <AvatarFallback className="text-lg">
                      {expert.firstName.charAt(0)}{expert.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl mb-1">
                      {expert.firstName} {expert.lastName}
                    </CardTitle>
                    <Badge className={`${getSpecializationColor(expert.specialization)}`}>
                      {formatSpecialization(expert.specialization)}
                    </Badge>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>Started {new Date(expert.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {expert.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Goals Progress */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Goals Progress
                  </h4>
                  <span className="text-sm font-medium">
                    {expert.completedGoals}/{expert.totalGoals} completed
                  </span>
                </div>
                <Progress 
                  value={expert.totalGoals > 0 ? (expert.completedGoals / expert.totalGoals) * 100 : 0} 
                  className="h-3" 
                />
              </div>

              {/* Recent Goals */}
              {expert.goals.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Recent Goals</h4>
                  <div className="space-y-2">
                    {expert.goals.slice(0, 3).map((goal, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{goal.title}</p>
                          <p className="text-xs text-gray-500">{goal.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {goal.status === 'completed' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : goal.status === 'overdue' ? (
                            <Clock className="h-4 w-4 text-red-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-400" />
                          )}
                          <span className={`text-xs font-medium ${getGoalStatusColor(goal.status)}`}>
                            {formatGoalStatus(goal.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={() => handleMessageExpert(expert)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button variant="outline" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Video className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-lg font-bold text-green-600">{expert.completedGoals}</p>
                  <p className="text-xs text-gray-500">Goals Achieved</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-600">
                    {Math.round(((new Date().getTime() - new Date(expert.startDate).getTime()) / (1000 * 60 * 60 * 24)))}
                  </p>
                  <p className="text-xs text-gray-500">Days Mentored</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <p className="text-lg font-bold text-yellow-600">4.8</p>
                  </div>
                  <p className="text-xs text-gray-500">Expert Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Messaging Dialog */}
      <Dialog open={showMessaging} onOpenChange={setShowMessaging}>
        <DialogContent className="max-w-7xl h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5" />
              Chat with {selectedExpert?.firstName} {selectedExpert?.lastName}
              {selectedExpert && (
                <Badge className={`${getSpecializationColor(selectedExpert.specialization)}`}>
                  {formatSpecialization(selectedExpert.specialization)}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 p-6 pt-0">
            <FarmerMessagingCenter />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FarmerExpertChat;