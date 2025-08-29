
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle, User } from 'lucide-react';
import { supabase } from '@/integrations/mock/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  farmer_id: number | null;
  content: string;
  message_type: string;
  read_at: string | null;
  created_at: string;
  sender?: {
    full_name: string;
    avatar_url: string | null;
  };
  farmer?: {
    name: string;
    image_url: string | null;
  };
}

interface Conversation {
  farmer_id: number;
  farmer_name: string;
  farmer_image: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

const MessagesCenter = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      
      // Subscribe to new messages for this conversation
      const channel = supabase
        .channel(`messages-${selectedConversation}`)
        .on('postgres_changes', 
          'messages-channel', 
          (payload) => {
            fetchMessages(selectedConversation);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation]); // Removed fetchMessages to avoid hoisting issue

  const fetchConversations = async () => {
    try {
      // Get adopter's farmers first
      const { data: adoptions } = await supabase
        .from('farmer_adoptions')
        .select(`
          farmer_id,
          farmers (
            id,
            name,
            image_url
          )
        `)
        .eq('adopter_id', user?.id)
        .eq('status', 'active');

      if (adoptions) {
        const conversationPromises = adoptions.map(async (adoption) => {
          // Get last message for each farmer
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('farmer_id', (adoption as { farmer_id: string }).farmer_id)
            .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const result = await supabase
            .from('messages')
            .select('*')
            .eq('farmer_id', (adoption as { farmer_id: string }).farmer_id)
            .eq('recipient_id', user?.id)
            // .is('read_at', null); // Commented out - mock doesn't support .is()

          const unreadCount = (result.data as unknown[])?.length || 0;

          return {
            farmer_id: (adoption as { farmer_id: string }).farmer_id,
            farmer_name: (adoption as { farmers: { name: string } }).farmers.name,
            farmer_image: (adoption as { farmers: { image_url: string } }).farmers.image_url,
            last_message: lastMessage?.content || 'No messages yet',
            last_message_time: lastMessage?.created_at || new Date().toISOString(),
            unread_count: unreadCount || 0
          };
        });

        const conversationData = await Promise.all(conversationPromises);
        setConversations(conversationData.sort((a, b) => 
          new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
        ) as unknown as Conversation[]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (farmerId: number) => {
    try {
      const { data } = await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          recipient_id,
          farmer_id,
          content,
          message_type,
          read_at,
          created_at
        `)
        .eq('farmer_id', farmerId)
        .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data as Message[]);
        
        // Mark messages as read
        const result = await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() });
        // Mock doesn't support chaining after update
        console.log('Updated read status:', result);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      // Get farmer's user_id to send message to
      const { data: farmer } = await supabase
        .from('farmers')
        .select('user_id')
        .eq('id', selectedConversation)
        .single();

      if (!farmer?.user_id) {
        toast({
          title: "Error",
          description: "Cannot send message to this farmer",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: farmer.user_id,
          farmer_id: selectedConversation,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      setNewMessage('');
      fetchMessages(selectedConversation);
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <MessageCircle className="h-8 w-8 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">Communicate with your farmers</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[480px]">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>No conversations yet.</p>
                  <p className="text-sm mt-1">Adopt a farmer to start messaging!</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.farmer_id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation === conversation.farmer_id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation.farmer_id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={conversation.farmer_image || ''} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">{conversation.farmer_name}</p>
                          {conversation.unread_count > 0 && (
                            <Badge variant="default" className="ml-2">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{conversation.last_message}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(conversation.last_message_time).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedConversation 
                ? conversations.find(c => c.farmer_id === selectedConversation)?.farmer_name || 'Chat'
                : 'Select a conversation'
              }
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {selectedConversation ? (
              <div className="flex flex-col h-[480px]">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            message.sender_id === user?.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[480px] text-gray-500">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MessagesCenter;
