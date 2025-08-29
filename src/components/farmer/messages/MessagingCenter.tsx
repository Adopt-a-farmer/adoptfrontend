import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Send, MessageCircle, Phone, Video, MoreVertical, Paperclip, Smile } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: number;
  sender_name: string;
  sender_image: string;
  content: string;
  type: 'text' | 'image' | 'file';
  file_url?: string;
  created_at: string;
  read_at?: string;
}

interface Conversation {
  id: string;
  participant_id: number;
  participant_name: string;
  participant_image: string;
  participant_role: 'adopter' | 'admin' | 'expert';
  last_message: string;
  last_message_at: string;
  unread_count: number;
  status: 'active' | 'archived';
}

const MessagingCenter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch conversations
  const { data: conversationsData, isLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async (): Promise<Conversation[]> => {
      try {
        const response = await apiCall<{ data: Conversation[] } | Conversation[]>('GET', '/messages/conversations');
        // Handle both response formats: { data: [...] } or [...]
        const conversations = Array.isArray(response) ? response : (response as { data: Conversation[] })?.data || [];
        return Array.isArray(conversations) ? conversations : [];
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
        // Return mock data for demonstration
        return mockConversations;
      }
    },
    enabled: !!user
  });

  // Ensure conversations is always an array
  const conversations = Array.isArray(conversationsData) ? conversationsData : [];

  // Fetch messages for selected conversation
  const { data: messagesData } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: async (): Promise<Message[]> => {
      if (!selectedConversation) return [];
      try {
        const response = await apiCall<{ data: Message[] } | Message[]>('GET', `/messages/conversations/${selectedConversation.id}/messages`);
        // Handle both response formats: { data: [...] } or [...]
        const messages = Array.isArray(response) ? response : (response as { data: Message[] })?.data || [];
        return Array.isArray(messages) ? messages : [];
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        // Return mock data for demonstration
        return mockMessages.filter(m => m.conversation_id === selectedConversation.id);
      }
    },
    enabled: !!selectedConversation
  });

  // Ensure messages is always an array
  const messages = Array.isArray(messagesData) ? messagesData : [];

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content, type = 'text' }: {
      conversationId: string;
      content: string;
      type?: string;
    }) => {
      return await apiCall('POST', '/messages', {
        conversation_id: conversationId,
        content,
        type
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setNewMessage('');
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: (error as Error)?.message || "Failed to send message",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = () => {
    if (!selectedConversation || !newMessage.trim()) return;
    
    sendMessageMutation.mutate({
      conversationId: selectedConversation.id,
      content: newMessage.trim()
    });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant_name.toLowerCase().includes(searchTerm.toLowerCase())
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'adopter': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Messages</h2>
        <p className="text-muted-foreground">Communicate with adopters and officers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <Badge variant="outline">{conversations.length}</Badge>
            </div>
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
            <div className="space-y-1 max-h-[480px] overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-farmer-secondary/10 border-l-4 border-l-farmer-primary' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={conversation.participant_image} />
                        <AvatarFallback>{conversation.participant_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1">
                        <Badge className={`text-xs px-1 ${getRoleColor(conversation.participant_role)}`}>
                          {conversation.participant_role}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.participant_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTime(conversation.last_message_at)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.last_message}
                        </p>
                        {conversation.unread_count > 0 && (
                          <Badge className="bg-farmer-primary text-white ml-2 text-xs">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredConversations.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations</h3>
                  <p className="text-gray-500">Your messages will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={selectedConversation.participant_image} />
                      <AvatarFallback>{selectedConversation.participant_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedConversation.participant_name}</h3>
                      <Badge className={`text-xs ${getRoleColor(selectedConversation.participant_role)}`}>
                        {selectedConversation.participant_role}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-0">
                <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === user?.id
                          ? 'bg-farmer-primary text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_id === user?.id ? 'text-farmer-secondary/70' : 'text-gray-500'
                        }`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button size="sm" variant="outline">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      className="bg-farmer-primary hover:bg-farmer-primary/90"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

// Mock data for demonstration
const mockConversations: Conversation[] = [
  {
    id: '1',
    participant_id: 101,
    participant_name: 'John Doe',
    participant_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    participant_role: 'adopter',
    last_message: 'Thank you for the farm update!',
    last_message_at: '2024-01-16T14:30:00Z',
    unread_count: 2,
    status: 'active'
  },
  {
    id: '2',
    participant_id: 102,
    participant_name: 'Mary Smith',
    participant_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    participant_role: 'adopter',
    last_message: 'Looking forward to visiting next week',
    last_message_at: '2024-01-16T10:15:00Z',
    unread_count: 0,
    status: 'active'
  },
  {
    id: '3',
    participant_id: 103,
    participant_name: 'Admin Support',
    participant_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    participant_role: 'admin',
    last_message: 'Your payment has been processed',
    last_message_at: '2024-01-15T16:45:00Z',
    unread_count: 1,
    status: 'active'
  }
];

const mockMessages: Message[] = [
  {
    id: '1',
    conversation_id: '1',
    sender_id: 101,
    sender_name: 'John Doe',
    sender_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    content: 'Hello! How are the crops doing this season?',
    type: 'text',
    created_at: '2024-01-16T13:00:00Z'
  },
  {
    id: '2',
    conversation_id: '1',
    sender_id: 1, // Farmer (current user)
    sender_name: 'Current User',
    sender_image: '',
    content: 'Hello John! The crops are doing well. We had good rains last week.',
    type: 'text',
    created_at: '2024-01-16T13:15:00Z'
  },
  {
    id: '3',
    conversation_id: '1',
    sender_id: 101,
    sender_name: 'John Doe',
    sender_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    content: 'That\'s great to hear! Can you send me some photos?',
    type: 'text',
    created_at: '2024-01-16T14:00:00Z'
  },
  {
    id: '4',
    conversation_id: '1',
    sender_id: 1, // Farmer (current user)
    sender_name: 'Current User',
    sender_image: '',
    content: 'Sure! I\'ll take some photos this afternoon and send them over.',
    type: 'text',
    created_at: '2024-01-16T14:05:00Z'
  },
  {
    id: '5',
    conversation_id: '1',
    sender_id: 101,
    sender_name: 'John Doe',
    sender_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    content: 'Thank you for the farm update!',
    type: 'text',
    created_at: '2024-01-16T14:30:00Z'
  }
];

export default MessagingCenter;