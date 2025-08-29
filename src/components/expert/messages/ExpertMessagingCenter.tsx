import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Send, MessageCircle, Phone, Video, MoreVertical, Paperclip, Smile, Check, CheckCheck, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Message {
  _id: string;
  conversationId: string;
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
      fileName: string;
      mimeType: string;
    };
  };
  messageType: 'text' | 'image' | 'file';
  isRead: boolean;
  readAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
}

interface Conversation {
  conversationId: string;
  farmer: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
    farmerProfile?: {
      farmName: string;
      location: {
        county: string;
        subCounty: string;
      };
    };
  };
  lastMessage: {
    _id: string;
    content: {
      text: string;
    };
    sender: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  };
  unreadCount: number;
}

const ExpertMessagingCenter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Socket connection (will be implemented)
  const socket = useRef<WebSocket | null>(null);

  // Fetch conversations for expert
  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery({
    queryKey: ['expert-conversations', user?.id],
    queryFn: async (): Promise<Conversation[]> => {
      try {
        const response = await apiCall<Conversation[]>('GET', '/experts/conversations');
        return response;
      } catch (error) {
        console.error('Error fetching expert conversations:', error);
        return [];
      }
    },
    enabled: !!user
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['expert-messages', selectedConversation?.conversationId],
    queryFn: async (): Promise<Message[]> => {
      if (!selectedConversation) return [];
      try {
        const response = await apiCall<{ messages: Message[] }>('GET', `/messages/${selectedConversation.conversationId}`);
        return response.messages || [];
      } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
      }
    },
    enabled: !!selectedConversation
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ recipient, content, messageType = 'text' }: {
      recipient: string;
      content: string;
      messageType?: string;
    }) => {
      return await apiCall('POST', '/messages/send', {
        recipient,
        content: { text: content },
        messageType
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert-messages'] });
      queryClient.invalidateQueries({ queryKey: ['expert-conversations'] });
      setNewMessage('');
      scrollToBottom();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    }
  });

  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      return await apiCall('PUT', `/messages/${conversationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert-conversations'] });
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedConversation) {
      markAsReadMutation.mutate(selectedConversation.conversationId);
    }
  }, [selectedConversation, markAsReadMutation]);

  const handleSendMessage = () => {
    if (!selectedConversation || !newMessage.trim()) return;
    
    sendMessageMutation.mutate({
      recipient: selectedConversation.farmer._id,
      content: newMessage.trim()
    });
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedConversation) return;

    // Implementation for file upload will be added
    toast({
      title: "File Upload",
      description: "File upload functionality will be implemented soon",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.farmer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.farmer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.farmer.farmerProfile?.farmName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getMessageStatus = (message: Message) => {
    if (message.sender._id !== user?.id) return null;

    if (message.isRead) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    } else if (message.isDelivered) {
      return <CheckCheck className="h-3 w-3 text-gray-400" />;
    } else {
      return <Check className="h-3 w-3 text-gray-400" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'farmer':
        return 'bg-green-100 text-green-800';
      case 'adopter':
        return 'bg-blue-100 text-blue-800';
      case 'expert':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Communicate with farmers you're mentoring</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                {isLoadingConversations ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations</h3>
                    <p className="text-gray-500">Start mentoring farmers to begin conversations</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.conversationId}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?.conversationId === conversation.conversationId ? 'bg-purple-50 border-l-4 border-l-purple-600' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={conversation.farmer.avatar} />
                            <AvatarFallback>
                              {conversation.farmer.firstName.charAt(0)}{conversation.farmer.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1">
                            <Badge className={`text-xs px-1 ${getRoleColor(conversation.farmer.role)}`}>
                              farmer
                            </Badge>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {conversation.farmer.firstName} {conversation.farmer.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatTime(conversation.lastMessage.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500 truncate">
                              {conversation.farmer.farmerProfile?.farmName && (
                                <span className="text-green-600 font-medium">
                                  {conversation.farmer.farmerProfile.farmName} • 
                                </span>
                              )}
                              {conversation.lastMessage.content.text}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge className="bg-purple-600 text-white ml-2 text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          {conversation.farmer.farmerProfile?.location && (
                            <p className="text-xs text-gray-400 mt-1">
                              {conversation.farmer.farmerProfile.location.county}, {conversation.farmer.farmerProfile.location.subCounty}
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

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={selectedConversation.farmer.avatar} />
                        <AvatarFallback>
                          {selectedConversation.farmer.firstName.charAt(0)}{selectedConversation.farmer.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedConversation.farmer.firstName} {selectedConversation.farmer.lastName}
                        </h3>
                        {selectedConversation.farmer.farmerProfile?.farmName && (
                          <p className="text-sm text-green-600">
                            {selectedConversation.farmer.farmerProfile.farmName}
                          </p>
                        )}
                        {selectedConversation.farmer.farmerProfile?.location && (
                          <p className="text-xs text-gray-500">
                            {selectedConversation.farmer.farmerProfile.location.county}, {selectedConversation.farmer.farmerProfile.location.subCounty}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Video className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Schedule Visit</DropdownMenuItem>
                          <DropdownMenuItem>Block User</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-0">
                  <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                    {isLoadingMessages ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No messages yet. Start the conversation!</p>
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message._id}
                          className={`flex ${message.sender._id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender._id === user?.id
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{message.content.text}</p>
                            <div className={`flex items-center justify-between mt-1 ${
                              message.sender._id === user?.id ? 'text-purple-200' : 'text-gray-500'
                            }`}>
                              <p className="text-xs">
                                {formatTime(message.createdAt)}
                              </p>
                              {getMessageStatus(message)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Typing Indicator */}
                  {typingUsers.size > 0 && (
                    <div className="px-4 py-2 border-t">
                      <p className="text-sm text-gray-500">
                        {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                      </p>
                    </div>
                  )}

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={handleFileSelect}>
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                        onKeyPress={handleKeyPress}
                      />
                      <Button size="sm" variant="outline">
                        <Smile className="h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,application/pdf,.doc,.docx"
                />
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-500">Choose a farmer from the list to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExpertMessagingCenter;