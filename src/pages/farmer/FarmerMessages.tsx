import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Send, Clock, CheckCircle2, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { farmerMessagingService, FarmerAdopterConversation } from '@/services/adopterMessaging';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const FarmerMessages = () => {
  const [selectedConversation, setSelectedConversation] = useState<FarmerAdopterConversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch conversations
  const { data: conversationsResponse, isLoading } = useQuery({
    queryKey: ['farmer-adopter-conversations'],
    queryFn: () => farmerMessagingService.getFarmerAdopterConversations(),
  });

  const conversations = conversationsResponse?.data || [];

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (messageData: { recipient: string; content: { text: string }; adoption: string }) =>
      farmerMessagingService.sendMessageToAdopter({
        recipient: messageData.recipient,
        messageType: 'text',
        content: messageData.content,
        adoption: messageData.adoption,
      }),
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['farmer-adopter-conversations'] });
      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      recipient: selectedConversation.adopter._id,
      content: { text: messageText },
      adoption: selectedConversation.adoption._id,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Messages</h1>
        <p className="text-gray-600">Communicate with your adopters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Adopters ({conversations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No adopters yet</p>
                  <p className="text-sm">When someone adopts your farm, you can message them here</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.conversationId}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.conversationId === conversation.conversationId
                        ? 'bg-green-50 border-r-4 border-green-500'
                        : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.adopter.avatar} />
                        <AvatarFallback>
                          {conversation.adopter.firstName[0]}
                          {conversation.adopter.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conversation.adopter.firstName} {conversation.adopter.lastName}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-green-500 text-white text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <Badge className={getStatusColor(conversation.adoption.status)}>
                            {conversation.adoption.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatCurrency(conversation.adoption.monthlyContribution)}
                          </span>
                        </div>
                        {conversation.latestMessage && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {conversation.latestMessage.content.text}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedConversation.adopter.avatar} />
                    <AvatarFallback>
                      {selectedConversation.adopter.firstName[0]}
                      {selectedConversation.adopter.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedConversation.adopter.firstName} {selectedConversation.adopter.lastName}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(selectedConversation.adoption.status)}>
                        {selectedConversation.adoption.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Monthly: {formatCurrency(selectedConversation.adoption.monthlyContribution)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <Separator />

              {/* Messages Area */}
              <CardContent className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {/* Welcome message */}
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm font-medium text-green-700">
                        Adoption Active
                      </span>
                    </div>
                    <p className="text-sm text-green-600">
                      {selectedConversation.adopter.firstName} adopted your farm on{' '}
                      {format(new Date(selectedConversation.adoption.startDate), 'PPP')}
                    </p>
                  </div>

                  {/* Message indicating this is where messages would appear */}
                  <div className="text-center p-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Your conversation with {selectedConversation.adopter.firstName} will appear here</p>
                    <p className="text-sm mt-1">Send a message below to get started!</p>
                  </div>
                </div>
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Textarea
                    placeholder={`Send a message to ${selectedConversation.adopter.firstName}...`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 resize-none"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {sendMessageMutation.isPending ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p>Choose an adopter from the list to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default FarmerMessages;
