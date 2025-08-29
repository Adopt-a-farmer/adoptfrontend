import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMessaging, SocketMessage, TypingIndicator } from '@/services/messaging';
import { useQueryClient } from '@tanstack/react-query';

export const useRealtimeMessaging = (conversationId?: string) => {
  const { user } = useAuth();
  const messaging = useMessaging();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());

  // Connect to messaging service
  useEffect(() => {
    if (user?.token) {
      messaging.connect(user.token);
    }

    return () => {
      messaging.disconnect();
    };
  }, [user?.token, messaging]);

  // Handle connection status
  useEffect(() => {
    const unsubscribe = messaging.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    return unsubscribe;
  }, [messaging]);

  // Join/leave conversation room
  useEffect(() => {
    if (conversationId && isConnected) {
      messaging.joinConversation(conversationId);
      
      return () => {
        messaging.leaveConversation(conversationId);
      };
    }
  }, [conversationId, isConnected, messaging]);

  // Handle real-time messages
  useEffect(() => {
    const unsubscribe = messaging.onMessage((message: SocketMessage) => {
      // Update messages cache
      if (message.conversationId === conversationId) {
        queryClient.setQueryData(['farmer-messages', conversationId], (old: SocketMessage[] = []) => {
          const exists = old.some(m => m._id === message._id);
          if (!exists) {
            return [...old, message];
          }
          return old;
        });

        queryClient.setQueryData(['expert-messages', conversationId], (old: SocketMessage[] = []) => {
          const exists = old.some(m => m._id === message._id);
          if (!exists) {
            return [...old, message];
          }
          return old;
        });
      }
      
      // Update conversations list
      queryClient.invalidateQueries({ queryKey: ['farmer-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['expert-conversations'] });
    });

    return unsubscribe;
  }, [messaging, queryClient, conversationId]);

  // Handle typing indicators
  useEffect(() => {
    const unsubscribe = messaging.onTyping((data: TypingIndicator) => {
      if (data.conversationId === conversationId) {
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
  }, [messaging, conversationId]);

  // Typing functions
  const startTyping = useCallback(() => {
    if (conversationId && isConnected) {
      messaging.startTyping(conversationId);
    }
  }, [conversationId, isConnected, messaging]);

  const stopTyping = useCallback(() => {
    if (conversationId && isConnected) {
      messaging.stopTyping(conversationId);
    }
  }, [conversationId, isConnected, messaging]);

  // Status functions
  const updateStatus = useCallback((status: 'online' | 'away' | 'busy' | 'offline') => {
    if (isConnected) {
      messaging.updateStatus(status);
    }
  }, [isConnected, messaging]);

  // Reaction functions
  const addReaction = useCallback((messageId: string, emoji: string) => {
    if (conversationId && isConnected) {
      messaging.addReaction(messageId, emoji, conversationId);
    }
  }, [conversationId, isConnected, messaging]);

  const removeReaction = useCallback((messageId: string, emoji: string) => {
    if (conversationId && isConnected) {
      messaging.removeReaction(messageId, emoji, conversationId);
    }
  }, [conversationId, isConnected, messaging]);

  return {
    isConnected,
    typingUsers,
    startTyping,
    stopTyping,
    updateStatus,
    addReaction,
    removeReaction
  };
};