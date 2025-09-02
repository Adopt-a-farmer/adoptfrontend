import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Search, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { apiCall } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'farmer' | 'adopter';
}

interface Message {
  _id: string;
  content: {
    text?: string;
    media?: {
      url: string;
      fileName?: string;
    };
  };
  sender: User;
  recipient: User;
  conversationId: string;
  isRead: boolean;
  messageType: 'text' | 'image' | 'file';
  fileUrl?: string;
  createdAt: string;
}

interface Conversation {
  conversationId: string;
  participant: User;
  lastMessage: Message;
  unreadCount: number;
  updatedAt: string;
}

interface ChatSystemProps {
  userType: 'farmer' | 'adopter';
}

const ChatSystem: React.FC<ChatSystemProps> = ({ userType }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchConversations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const endpoint = userType === 'farmer' 
        ? '/farmers/conversations' 
        : '/adopters/conversations';
      
      const response = await apiCall('GET', endpoint) as { success: boolean; data: { conversations?: Conversation[] } | Conversation[] };
      
      if (response.success) {
        // Handle different response formats
        let conversationsData: Conversation[] = [];
        
        if (Array.isArray(response.data)) {
          conversationsData = response.data;
        } else if (response.data && Array.isArray(response.data.conversations)) {
          conversationsData = response.data.conversations;
        } else if (response.data && response.data.conversations) {
          conversationsData = Array.isArray(response.data.conversations) ? response.data.conversations : [];
        }
        
        console.log('Fetched conversations:', conversationsData);
        setConversations(conversationsData);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setConversations([]); // Ensure it's always an array
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await apiCall('GET', `/messages/conversation/${conversationId}`) as { success: boolean; data: Message[] };
      
      if (response.success) {
        setMessages(response.data || []);
        
        // Mark messages as read
        await apiCall('PUT', `/messages/conversation/${conversationId}/mark-read`);
        
        // Update conversation unread count
        setConversations(prev => prev.map(conv => 
          conv.conversationId === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        ));
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !user) return;

    const activeConv = conversations.find(c => c.conversationId === activeConversation);
    if (!activeConv) return;

    try {
      setIsSending(true);
      
      const messageData = {
        recipient: activeConv.participant._id,
        content: { text: newMessage.trim() },
        messageType: 'text',
      };

      const response = await apiCall('POST', '/messages/send', messageData) as { success: boolean; data: Message };
      
      if (response.success) {
        const newMsg = response.data;
        
        // Ensure the message has proper structure before adding to array
        if (newMsg && newMsg._id && newMsg.sender && newMsg.sender._id) {
          setMessages(prev => [...prev, newMsg]);
          setNewMessage('');
          
          // Update conversation last message
          setConversations(prev => prev.map(conv => 
            conv.conversationId === activeConversation
              ? { ...conv, lastMessage: newMsg, updatedAt: newMsg.createdAt }
              : conv
          ));
        } else {
          console.error('Received invalid message structure:', newMsg);
          // Refresh messages to get the properly structured data
          if (activeConversation) {
            await fetchMessages(activeConversation);
          }
          setNewMessage('');
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessageTime = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return ''; // Invalid date
      
      if (isToday(date)) {
        return format(date, 'HH:mm');
      } else if (isYesterday(date)) {
        return 'Yesterday';
      } else {
        return format(date, 'MMM dd');
      }
    } catch (error) {
      console.error('Date formatting error:', error, 'for dateString:', dateString);
      return '';
    }
  };

  const filteredConversations = Array.isArray(conversations) ? conversations.filter(conv =>
    `${conv.participant.firstName} ${conv.participant.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  ) : [];

  const activeConv = conversations.find(c => c.conversationId === activeConversation);

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-farmer-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-96 bg-white rounded-lg shadow-sm border">
      {/* Conversations List */}
      <div className="w-1/3 border-r">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <ScrollArea className="h-80">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">
                {userType === 'farmer' 
                  ? 'Your adopters will appear here when they message you' 
                  : 'Your adopted farmers will appear here when you message them'}
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.conversationId}
                  onClick={() => {
                    setActiveConversation(conversation.conversationId);
                    fetchMessages(conversation.conversationId);
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    activeConversation === conversation.conversationId
                      ? 'bg-farmer-primary text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.participant.avatar} />
                      <AvatarFallback>
                        {conversation.participant.firstName[0]}
                        {conversation.participant.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">
                          {conversation.participant.firstName} {conversation.participant.lastName}
                        </p>
                        <span className="text-xs opacity-75">
                          {formatMessageTime(conversation.updatedAt)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs truncate opacity-75">
                          {conversation.lastMessage?.content?.text || 'No messages yet'}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation && activeConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={activeConv.participant.avatar} />
                  <AvatarFallback>
                    {activeConv.participant.firstName[0]}
                    {activeConv.participant.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">
                    {activeConv.participant.firstName} {activeConv.participant.lastName}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {activeConv.participant.role}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {Array.isArray(messages) ? messages.filter(message => 
                  message && 
                  message._id && 
                  message.sender && 
                  message.sender._id &&
                  message.content
                ).map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      message.sender?._id === user?._id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender?._id === user?._id
                          ? 'bg-farmer-primary text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content?.text || ''}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender?._id === user?._id
                            ? 'text-white/70'
                            : 'text-gray-500'
                        }`}
                      >
                        {formatMessageTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                )) : null}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                  size="sm"
                  className="bg-farmer-primary hover:bg-farmer-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <h3 className="text-lg font-medium">Select a conversation</h3>
              <p className="text-sm mt-1">
                Choose a conversation from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSystem;