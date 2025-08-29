import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, Send, MessageCircle, Phone, Video, MoreVertical, Paperclip, 
  Smile, Check, CheckCheck, Clock, Image as ImageIcon, FileText,
  X, Download, Play, Pause 
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useMessaging, SocketMessage, TypingIndicator } from '@/services/messaging';
import { Progress } from '@/components/ui/progress';

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
      fileSize?: number;
    };
  };
  messageType: 'text' | 'image' | 'file';
  isRead: boolean;
  readAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  reactions?: Array<{
    user: string;
    emoji: string;
    reactedAt: string;
  }>;
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
  participant_details?: {
    email?: string;
    location?: string;
    joinDate?: string;
  };
}

interface FileUploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

const FarmerMessagingCenter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messaging = useMessaging();
  
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Connect to messaging service
  useEffect(() => {
    if (user?.token) {
      messaging.connect(user.token);
    }

    return () => {
      messaging.disconnect();
    };
  }, [user?.token, messaging]);

  // Join/leave conversation room when selection changes
  useEffect(() => {
    if (selectedConversation) {
      messaging.joinConversation(selectedConversation.id);
      
      return () => {
        messaging.leaveConversation(selectedConversation.id);
      };
    }
  }, [selectedConversation, messaging]);

  // Handle real-time messages
  useEffect(() => {
    const unsubscribe = messaging.onMessage((message: SocketMessage) => {
      queryClient.setQueryData(['farmer-messages', selectedConversation?.id], (old: Message[] = []) => {
        const exists = old.some(m => m._id === message._id);
        if (!exists) {
          return [...old, message as Message];
        }
        return old;
      });
      
      // Update conversations list
      queryClient.invalidateQueries({ queryKey: ['farmer-conversations'] });
      
      // Scroll to bottom for new messages
      scrollToBottom();
    });

    return unsubscribe;
  }, [messaging, queryClient, selectedConversation, scrollToBottom]);

  // Handle typing indicators
  useEffect(() => {
    const unsubscribe = messaging.onTyping((data: TypingIndicator) => {
      if (data.conversationId === selectedConversation?.id) {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.set(data.userId, data.userName);
          return newMap;
        });

        // Clear typing indicator after 3 seconds
        setTimeout(() => {
          setTypingUsers(prev => {
            const newMap = new Map(prev);
            newMap.delete(data.userId);
            return newMap;
          });
        }, 3000);
      }
    });

    return unsubscribe;
  }, [messaging, selectedConversation]);

  // Fetch conversations
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['farmer-conversations', user?.id],
    queryFn: async (): Promise<Conversation[]> => {
      try {
        const response = await apiCall<{ conversations: Conversation[] }>('GET', '/messages/conversations');
        return response.conversations || [];
      } catch (error) {
        console.error('Error fetching conversations:', error);
        return [];
      }
    },
    enabled: !!user
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['farmer-messages', selectedConversation?.id],
    queryFn: async (): Promise<Message[]> => {
      if (!selectedConversation) return [];
      try {
        const response = await apiCall<{ messages: Message[] }>('GET', `/messages/${selectedConversation.id}`);
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
      content: string | File;
      messageType?: string;
    }) => {
      if (messageType === 'text') {
        return await apiCall('POST', '/messages/send', {
          recipient,
          content: { text: content as string },
          messageType
        });
      } else {
        // Handle file upload
        const formData = new FormData();
        formData.append('file', content as File);
        formData.append('recipient', recipient);
        formData.append('messageType', messageType);
        
        return await apiCall('POST', '/messages/send-file', formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer-messages'] });
      queryClient.invalidateQueries({ queryKey: ['farmer-conversations'] });
      setNewMessage('');
      setUploadProgress(null);
      scrollToBottom();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
      setUploadProgress(null);
    }
  });

  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      return await apiCall('PUT', `/messages/${conversationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer-conversations'] });
    }
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (selectedConversation) {
      markAsReadMutation.mutate(selectedConversation.id);
    }
  }, [selectedConversation, markAsReadMutation]);

  const handleSendMessage = useCallback(() => {
    if (!selectedConversation || !newMessage.trim()) return;
    
    // Stop typing indicator
    if (isTyping) {
      messaging.stopTyping(selectedConversation.id);
      setIsTyping(false);
    }
    
    sendMessageMutation.mutate({
      recipient: selectedConversation.participant_id.toString(),
      content: newMessage.trim()
    });
  }, [selectedConversation, newMessage, isTyping, messaging, sendMessageMutation]);

  const handleTyping = useCallback((value: string) => {
    setNewMessage(value);
    
    if (!selectedConversation) return;
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Start typing indicator if not already typing
    if (!isTyping && value.trim()) {
      messaging.startTyping(selectedConversation.id);
      setIsTyping(true);
    }
    
    // Set timeout to stop typing indicator
    const timeout = setTimeout(() => {
      messaging.stopTyping(selectedConversation.id);
      setIsTyping(false);
    }, 2000);
    
    setTypingTimeout(timeout);
  }, [selectedConversation, typingTimeout, isTyping, messaging]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedConversation) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Set upload progress
    setUploadProgress({
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    });

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (!prev || prev.progress >= 90) return prev;
        return { ...prev, progress: prev.progress + 10 };
      });
    }, 200);

    try {
      const messageType = file.type.startsWith('image/') ? 'image' : 'file';
      
      await sendMessageMutation.mutateAsync({
        recipient: selectedConversation.participant_id.toString(),
        content: file,
        messageType
      });

      clearInterval(progressInterval);
      setUploadProgress(prev => prev ? { ...prev, progress: 100, status: 'completed' } : null);
      
      // Clear upload progress after 2 seconds
      setTimeout(() => setUploadProgress(null), 2000);
      
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(prev => prev ? { ...prev, status: 'error' } : null);
    }

    // Reset file input
    event.target.value = '';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    if (!selectedConversation) return;
    messaging.addReaction(messageId, emoji, selectedConversation.id);
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

  const renderMessageContent = (message: Message) => {
    if (message.messageType === 'image' && message.content.media) {
      return (
        <div className="space-y-2">
          <img 
            src={message.content.media.url} 
            alt={message.content.media.fileName}
            className="max-w-xs rounded-lg cursor-pointer hover:opacity-80"
            onClick={() => window.open(message.content.media?.url, '_blank')}
          />
          {message.content.text && <p className="text-sm">{message.content.text}</p>}
        </div>
      );
    } else if (message.messageType === 'file' && message.content.media) {
      return (
        <div className="flex items-center space-x-2 p-2 border rounded-lg bg-white/10">
          <FileText className="h-6 w-6" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{message.content.media.fileName}</p>
            <p className="text-xs opacity-70">
              {message.content.media.fileSize ? 
                `${(message.content.media.fileSize / 1024 / 1024).toFixed(1)} MB` : 
                'File'
              }
            </p>
          </div>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => window.open(message.content.media?.url, '_blank')}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      );
    } else {
      return <p className="text-sm">{message.content.text}</p>;
    }
  };

  const commonEmojis = ['👍', '❤️', '😊', '😂', '😮', '😢', '👏', '🔥'];

  return (
    <div className="h-full bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Connect with adopters, experts, and admins</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                Conversations
                <Badge variant="secondary" className="bg-farmer-primary text-white">
                  {conversations.filter(c => c.unread_count > 0).length}
                </Badge>
              </CardTitle>
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
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-farmer-primary"></div>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations</h3>
                    <p className="text-gray-500">Your messages will appear here</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
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
                        <AvatarImage src={selectedConversation.participant_image} />
                        <AvatarFallback>{selectedConversation.participant_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedConversation.participant_name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{selectedConversation.participant_role}</p>
                        {messaging.connected && (
                          <p className="text-xs text-green-600">● Online</p>
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
                          <DropdownMenuItem>Mute Conversation</DropdownMenuItem>
                          <DropdownMenuItem>Block User</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-0">
                  <div ref={chatContainerRef} className="h-[400px] overflow-y-auto p-4 space-y-4">
                    {isLoadingMessages ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-farmer-primary"></div>
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
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
                            message.sender._id === user?.id
                              ? 'bg-farmer-primary text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            {renderMessageContent(message)}
                            <div className={`flex items-center justify-between mt-1 ${
                              message.sender._id === user?.id ? 'text-farmer-secondary/70' : 'text-gray-500'
                            }`}>
                              <p className="text-xs">
                                {formatTime(message.createdAt)}
                              </p>
                              {getMessageStatus(message)}
                            </div>
                            
                            {/* Reaction button - appears on hover */}
                            <div className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 bg-white shadow-sm">
                                    <Smile className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <div className="flex space-x-1 p-2">
                                    {commonEmojis.map((emoji) => (
                                      <button
                                        key={emoji}
                                        onClick={() => handleReaction(message._id, emoji)}
                                        className="hover:bg-gray-100 p-1 rounded"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {/* Show reactions */}
                            {message.reactions && message.reactions.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {message.reactions.map((reaction, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {reaction.emoji}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Upload Progress */}
                  {uploadProgress && (
                    <div className="px-4 py-2 border-t bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{uploadProgress.fileName}</p>
                          <Progress value={uploadProgress.progress} className="h-2" />
                        </div>
                        {uploadProgress.status === 'error' && (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Typing Indicator */}
                  {typingUsers.size > 0 && (
                    <div className="px-4 py-2 border-t">
                      <p className="text-sm text-gray-500">
                        {Array.from(typingUsers.values()).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
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
                        onChange={(e) => handleTyping(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                        onKeyPress={handleKeyPress}
                        disabled={uploadProgress?.status === 'uploading'}
                      />
                      <Button size="sm" variant="outline">
                        <Smile className="h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending || uploadProgress?.status === 'uploading'}
                        className="bg-farmer-primary hover:bg-farmer-primary/90"
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
                  accept="image/*,application/pdf,.doc,.docx,.txt,.xlsx,.xls"
                />
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
    </div>
  );
};

export default FarmerMessagingCenter;