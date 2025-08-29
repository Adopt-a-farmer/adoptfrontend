import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { expertService, ExpertConversation } from '@/services/expert';
import { apiCall } from '@/services/api';
import { 
  MessageCircle, 
  Search, 
  Send,
  Users,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
    avatar?: string;
  };
  recipient: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: string;
  isRead: boolean;
}

const ExpertMessaging = () => {
  const [conversations, setConversations] = useState<ExpertConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ExpertConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchConversations = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await expertService.getConversations();
      setConversations(data);
    } catch (error: unknown) {
      console.error('Error fetching conversations:', error);
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 
          'status' in error.response && error.response.status === 403) {
        toast({
          title: 'Access Denied',
          description: 'You need expert permissions to access conversations',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load conversations',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const fetchMessages = async (conversationId: string) => {
    try {
      setMessagesLoading(true);
      const data = await apiCall<{ success: boolean; data: { messages: Message[] } }>('GET', `/messages/${conversationId}`);
      setMessages(data.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleConversationSelect = (conversation: ExpertConversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.conversationId);
    
    // Mark messages as read
    if (conversation.unreadCount > 0) {
      apiCall('PUT', `/messages/${conversation.conversationId}/read`);
      // Update local state
      setConversations(prev => 
        prev.map(conv => 
          conv.conversationId === conversation.conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await apiCall('POST', '/messages/send', {
        recipient: selectedConversation.farmer._id,
        content: { text: newMessage.trim() },
        messageType: 'text'
      });

      setNewMessage('');
      // Refresh messages
      fetchMessages(selectedConversation.conversationId);
      // Refresh conversations to update last message
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.farmer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.farmer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conversation.farmer.farmerProfile?.farmName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Messages</h2>
        <p className="text-muted-foreground">Chat with farmers you're mentoring</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversations
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search farmers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.conversationId}
                      className={`p-4 cursor-pointer hover:bg-muted/50 border-b transition-colors ${
                        selectedConversation?.conversationId === conversation.conversationId 
                          ? 'bg-muted' 
                          : ''
                      }`}
                      onClick={() => handleConversationSelect(conversation)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.farmer.avatar} />
                          <AvatarFallback>
                            {conversation.farmer.firstName[0]}{conversation.farmer.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-sm truncate">
                              {conversation.farmer.firstName} {conversation.farmer.lastName}
                            </p>
                            <div className="flex items-center gap-1">
                              {conversation.unreadCount > 0 && (
                                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatTime(conversation.lastMessage.createdAt)}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground truncate mb-1">
                            {conversation.farmer.farmerProfile?.farmName}
                          </p>
                          
                          <p className="text-xs text-muted-foreground truncate">
                            {conversation.lastMessage.sender.firstName}: {conversation.lastMessage.content.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConversation.farmer.avatar} />
                    <AvatarFallback>
                      {selectedConversation.farmer.firstName[0]}{selectedConversation.farmer.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-semibold">
                      {selectedConversation.farmer.firstName} {selectedConversation.farmer.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation.farmer.farmerProfile?.farmName} • {selectedConversation.farmer.farmerProfile?.location.county}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {/* Messages */}
                <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No messages yet</p>
                        <p className="text-sm text-muted-foreground">Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${message.sender._id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${
                          message.sender._id === user?.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        } rounded-lg p-3`}>
                          <p className="text-sm">{message.content.text}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 opacity-60" />
                            <span className="text-xs opacity-60">
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!newMessage.trim()}
                      size="sm"
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
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">Choose a farmer to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ExpertMessaging;