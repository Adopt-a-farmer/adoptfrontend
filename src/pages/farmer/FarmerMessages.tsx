import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Send, Clock, CheckCircle2, User, BookOpen, Users } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { farmerMessagingService, FarmerAdopterConversation } from '@/services/adopterMessaging';
import { farmerService, FarmerExpert } from '@/services/farmer';
import { apiCall } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  _id: string;
  content: {
    text: string;
  };
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

const FarmerMessages = () => {
  const [selectedConversation, setSelectedConversation] = useState<FarmerAdopterConversation | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<FarmerExpert | null>(null);
  const [messageText, setMessageText] = useState('');
  const [expertMessages, setExpertMessages] = useState<Message[]>([]);
  const [expertMessagesLoading, setExpertMessagesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('adopters');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch adopter conversations
  const { data: conversationsResponse, isLoading } = useQuery({
    queryKey: ['farmer-adopter-conversations'],
    queryFn: () => farmerMessagingService.getFarmerAdopterConversations(),
  });

  // Fetch assigned experts
  const { data: expertsResponse, isLoading: expertsLoading } = useQuery({
    queryKey: ['farmer-assigned-experts'],
    queryFn: () => farmerService.getAssignedExperts(),
  });

  const conversations = conversationsResponse?.data || [];
  const experts = expertsResponse?.data?.experts || [];

  // Fetch messages for expert conversation
  const fetchExpertMessages = async (expertId: string) => {
    try {
      setExpertMessagesLoading(true);
      const convId = [user?._id, expertId].sort().join('_');
      const response = await apiCall<{ success: boolean; data: { messages: Message[] } }>('GET', `/messages/${convId}`);
      setExpertMessages(response.data?.messages || []);
    } catch (error) {
      console.error('Error fetching expert messages:', error);
      setExpertMessages([]);
    } finally {
      setExpertMessagesLoading(false);
    }
  };

  // Handle selecting an expert to chat with
  const handleSelectExpert = (expert: FarmerExpert) => {
    setSelectedExpert(expert);
    setSelectedConversation(null);
    fetchExpertMessages(expert._id);
  };

  // Send message mutation for adopters
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

  // Send message to expert
  const handleSendExpertMessage = async () => {
    if (!messageText.trim() || !selectedExpert) return;

    try {
      await apiCall('POST', '/messages/send', {
        recipient: selectedExpert._id,
        content: { text: messageText.trim() },
        messageType: 'text'
      });
      
      setMessageText('');
      fetchExpertMessages(selectedExpert._id);
      toast({
        title: 'Message sent',
        description: 'Your message has been sent to the expert.',
      });
    } catch (error) {
      console.error('Error sending message to expert:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    if (selectedExpert) {
      handleSendExpertMessage();
      return;
    }
    
    if (!selectedConversation) return;

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
        <p className="text-gray-600">Communicate with your adopters and experts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List with Tabs */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="adopters" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Adopters ({conversations.length})
                </TabsTrigger>
                <TabsTrigger value="experts" className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  Experts ({experts.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-0">
            {activeTab === 'adopters' ? (
              <div className="divide-y max-h-[500px] overflow-y-auto">
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
                      onClick={() => {
                        setSelectedConversation(conversation);
                        setSelectedExpert(null);
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.adopter?.avatar} />
                          <AvatarFallback>
                            {conversation.adopter?.firstName?.[0] || 'A'}
                            {conversation.adopter?.lastName?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {conversation.adopter?.firstName || 'Unknown'} {conversation.adopter?.lastName || ''}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge className="bg-green-500 text-white text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <Badge className={getStatusColor(conversation.adoption?.status || 'pending')}>
                              {conversation.adoption?.status || 'pending'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatCurrency(conversation.adoption?.monthlyContribution || 0)}
                            </span>
                          </div>
                          {conversation.latestMessage && (
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {conversation.latestMessage?.content?.text || ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // Experts Tab
              <div className="divide-y max-h-[500px] overflow-y-auto">
                {expertsLoading ? (
                  <div className="flex items-center justify-center p-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  </div>
                ) : experts.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No experts assigned</p>
                    <p className="text-sm">Experts mentoring you will appear here</p>
                  </div>
                ) : (
                  experts.map((expert) => (
                    <div
                      key={expert._id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedExpert?._id === expert._id
                          ? 'bg-blue-50 border-r-4 border-blue-500'
                          : ''
                      }`}
                      onClick={() => handleSelectExpert(expert)}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={expert.avatar} />
                          <AvatarFallback>
                            {expert.firstName?.[0] || 'E'}
                            {expert.lastName?.[0] || 'X'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {expert.firstName || 'Unknown'} {expert.lastName || ''}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {expert.specialization || 'Agricultural Expert'}
                          </p>
                          <Badge className="mt-1 bg-blue-100 text-blue-800 text-xs">
                            {expert.status || 'active'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header for Adopter */}
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedConversation.adopter?.avatar} />
                    <AvatarFallback>
                      {selectedConversation.adopter?.firstName?.[0] || 'A'}
                      {selectedConversation.adopter?.lastName?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedConversation.adopter?.firstName || 'Unknown'} {selectedConversation.adopter?.lastName || ''}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(selectedConversation.adoption?.status || 'pending')}>
                        {selectedConversation.adoption?.status || 'pending'}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Monthly: {formatCurrency(selectedConversation.adoption?.monthlyContribution || 0)}
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
                      {selectedConversation.adopter?.firstName || 'This adopter'} adopted your farm on{' '}
                      {selectedConversation.adoption?.startDate ? format(new Date(selectedConversation.adoption.startDate), 'PPP') : 'N/A'}
                    </p>
                  </div>

                  {/* Message indicating this is where messages would appear */}
                  <div className="text-center p-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Your conversation with {selectedConversation.adopter?.firstName || 'the adopter'} will appear here</p>
                    <p className="text-sm mt-1">Send a message below to get started!</p>
                  </div>
                </div>
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Textarea
                    placeholder={`Send a message to ${selectedConversation.adopter?.firstName || 'adopter'}...`}
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
          ) : selectedExpert ? (
            <>
              {/* Chat Header for Expert */}
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedExpert.avatar} />
                    <AvatarFallback>
                      {selectedExpert.firstName?.[0] || 'E'}
                      {selectedExpert.lastName?.[0] || 'X'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedExpert.firstName || 'Expert'} {selectedExpert.lastName || ''}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        {selectedExpert.specialization || 'Agricultural Expert'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <Separator />

              {/* Messages Area for Expert */}
              <CardContent className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {expertMessagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : expertMessages.length === 0 ? (
                    <div className="text-center p-8 text-gray-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Start a conversation with {selectedExpert.firstName || 'this expert'}</p>
                      <p className="text-sm mt-1">Ask questions about farming, get advice, and more!</p>
                    </div>
                  ) : (
                    expertMessages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${message.sender?._id === user?._id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${
                          message.sender?._id === user?._id 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-100'
                        } rounded-lg p-3`}>
                          <p className="text-sm">{message.content?.text || ''}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 opacity-60" />
                            <span className="text-xs opacity-60">
                              {message.createdAt ? format(new Date(message.createdAt), 'HH:mm') : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>

              {/* Message Input for Expert */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Textarea
                    placeholder={`Send a message to ${selectedExpert.firstName || 'expert'}...`}
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
                    disabled={!messageText.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p>Choose an adopter or expert from the list to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default FarmerMessages;