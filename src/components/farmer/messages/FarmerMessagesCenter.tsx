import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle, User, Heart, Phone, Video } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { farmerMessagingService, FarmerAdopterConversation } from '@/services/adopterMessaging';
import { messagingService } from '@/services/messaging';
import { format } from 'date-fns';

interface Message {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  recipient: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  content: {
    text?: string;
    media?: {
      url: string;
      fileName?: string;
    };
  };
  messageType: 'text' | 'image' | 'video' | 'file';
  adoption?: string;
  isRead: boolean;
  createdAt: string;
}

const FarmerMessagesCenter = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [selectedConversation, setSelectedConversation] = useState<FarmerAdopterConversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Get farmer-adopter conversations
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery({
    queryKey: ['farmer-adopter-conversations'],
    queryFn: () => farmerMessagingService.getFarmerAdopterConversations(),
  });

  const conversations = conversationsData?.data || [];

  // Get messages for selected conversation
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['conversation-messages', selectedConversation?.conversationId],
    queryFn: async () => {
      if (!selectedConversation) return { success: false, data: [] };
      return await messagingService.getConversationMessages(selectedConversation.conversationId) as { success: boolean; data: Message[] };
    },
    enabled: !!selectedConversation,
  });

  const messages: Message[] = useMemo(() => {
    return Array.isArray(messagesData?.data) ? messagesData.data : [];
  }, [messagesData]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { text: string }) => {
      if (!selectedConversation) throw new Error('No conversation selected');
      
      return farmerMessagingService.sendMessageToAdopter({
        recipient: selectedConversation.adopter._id,
        messageType: 'text',
        content: { text: messageData.text },
        adoption: selectedConversation.adoption._id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-messages', selectedConversation?.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['farmer-adopter-conversations'] });
      setMessageText('');
      setIsSending(false);
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setIsSending(false);
    }
  });

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || isSending) return;
    
    setIsSending(true);
    sendMessageMutation.mutate({ text: messageText.trim() });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  if (conversationsLoading) {
    return (
      <div className="flex h-[600px]">
        <div className="w-1/3 border-r bg-gray-50 p-4">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Loading conversations...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">Chat with your adopters</p>
      </div>

      <Card className="h-[600px]">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-r bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">My Adopters</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2 p-4 pt-0">
                {conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">No adopters yet</p>
                    <p className="text-gray-400 text-xs mt-1">Share your profile to get adopted</p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.conversationId}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation?.conversationId === conversation.conversationId
                          ? 'bg-blue-100 border-blue-200'
                          : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.adopter.avatar} />
                          <AvatarFallback>
                            {conversation.adopter.firstName[0]}{conversation.adopter.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">
                              {conversation.adopter.firstName} {conversation.adopter.lastName}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <Badge variant="outline" className="text-xs">
                              KES {conversation.adoption.monthlyContribution}/month
                            </Badge>
                            <Badge 
                              className={`text-xs ${
                                conversation.adoption.status === 'active' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {conversation.adoption.status}
                            </Badge>
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
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedConversation.adopter.avatar} />
                        <AvatarFallback>
                          {selectedConversation.adopter.firstName[0]}{selectedConversation.adopter.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">
                          {selectedConversation.adopter.firstName} {selectedConversation.adopter.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Monthly Support: KES {selectedConversation.adoption.monthlyContribution}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Video className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No messages yet</p>
                        <p className="text-gray-400 text-sm mt-1">Start a conversation!</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.filter(message => message && message._id && message.sender && message.sender._id).map((message) => (
                        <div
                          key={message._id}
                          className={`flex ${
                            message.sender?._id === user?._id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender?._id === user?._id
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content.text}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender?._id === user?._id ? 'text-green-100' : 'text-gray-500'
                            }`}>
                              {message.createdAt ? (() => {
                                try {
                                  const date = new Date(message.createdAt);
                                  return isNaN(date.getTime()) ? '' : format(date, 'HH:mm');
                                } catch (error) {
                                  return '';
                                }
                              })() : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isSending}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || isSending}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select an adopter to chat</h3>
                  <p className="text-gray-500">Choose an adopter from your list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FarmerMessagesCenter;
