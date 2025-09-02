import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Users, TrendingUp } from 'lucide-react';
import ChatSystem from '@/components/chat/ChatSystem';
import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/services/api';

const MessagingCenter = () => {
  // Fetch messaging stats
  const { data: statsData } = useQuery({
    queryKey: ['messaging-stats'],
    queryFn: async () => {
      try {
        const response = await apiCall('GET', '/farmers/messaging-stats') as { 
          success: boolean; 
          data: { 
            totalConversations: number; 
            unreadMessages: number; 
            activeAdopters: number; 
          } 
        };
        return response.data;
      } catch (error) {
        console.error('Failed to fetch messaging stats:', error);
        return {
          totalConversations: 0,
          unreadMessages: 0,
          activeAdopters: 0,
        };
      }
    },
  });

  const stats = statsData || {
    totalConversations: 0,
    unreadMessages: 0,
    activeAdopters: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Messages</h2>
        <p className="text-muted-foreground">Communicate with your adopters and stay connected</p>
      </div>

      {/* Messaging Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-farmer-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalConversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Badge className="h-8 w-8 bg-red-100 text-red-600 flex items-center justify-center">
                <MessageCircle className="h-4 w-4" />
              </Badge>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-farmer-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Adopters</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeAdopters}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Chat with Adopters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChatSystem userType="farmer" />
        </CardContent>
      </Card>

      {/* Communication Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Communication Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-farmer-primary rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Keep adopters updated regularly</h4>
                <p className="text-sm text-gray-600">Share weekly updates about your farm progress and any challenges you're facing.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-farmer-primary rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Share photos and videos</h4>
                <p className="text-sm text-gray-600">Visual updates help adopters feel more connected to your farming journey.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-farmer-primary rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Be responsive</h4>
                <p className="text-sm text-gray-600">Try to respond to messages within 24 hours to maintain good relationships.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-farmer-primary rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Share your farming knowledge</h4>
                <p className="text-sm text-gray-600">Adopters love learning about farming practices and seasonal changes.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagingCenter;