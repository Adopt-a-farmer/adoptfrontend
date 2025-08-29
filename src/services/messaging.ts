import { io, Socket } from 'socket.io-client';

export interface SocketMessage {
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

export interface TypingIndicator {
  userId: string;
  userName: string;
  conversationId: string;
}

export interface MessageStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'read';
  timestamp: string;
}

class MessagingService {
  private socket: Socket | null = null;
  private isConnected = false;
  private messageCallbacks: Set<(message: SocketMessage) => void> = new Set();
  private typingCallbacks: Set<(data: TypingIndicator) => void> = new Set();
  private statusCallbacks: Set<(data: MessageStatus) => void> = new Set();
  private connectionCallbacks: Set<(connected: boolean) => void> = new Set();

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('Connected to messaging service');
      this.isConnected = true;
      this.connectionCallbacks.forEach(callback => callback(true));
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from messaging service');
      this.isConnected = false;
      this.connectionCallbacks.forEach(callback => callback(false));
    });

    this.socket.on('new_message', (message: SocketMessage) => {
      this.messageCallbacks.forEach(callback => callback(message));
    });

    this.socket.on('message_sent', (message: SocketMessage) => {
      this.messageCallbacks.forEach(callback => callback(message));
    });

    this.socket.on('user_typing', (data: TypingIndicator) => {
      this.typingCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('user_stopped_typing', (data: TypingIndicator) => {
      this.typingCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('messages_read', (data: { conversationId: string; readBy: string }) => {
      this.statusCallbacks.forEach(callback => 
        callback({
          messageId: data.conversationId,
          status: 'read',
          timestamp: new Date().toISOString()
        })
      );
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
      this.connectionCallbacks.forEach(callback => callback(false));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.connectionCallbacks.forEach(callback => callback(false));
    }
  }

  // Join a conversation room
  joinConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join_conversation', conversationId);
    }
  }

  // Leave a conversation room
  leaveConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave_conversation', conversationId);
    }
  }

  // Send typing start indicator
  startTyping(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing_start', { conversationId });
    }
  }

  // Send typing stop indicator
  stopTyping(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing_stop', { conversationId });
    }
  }

  // Update user status
  updateStatus(status: 'online' | 'away' | 'busy' | 'offline') {
    if (this.socket?.connected) {
      this.socket.emit('update_status', status);
    }
  }

  // File upload progress
  sendFileUploadProgress(conversationId: string, progress: number, fileName: string) {
    if (this.socket?.connected) {
      this.socket.emit('file_upload_progress', { conversationId, progress, fileName });
    }
  }

  // Message reactions
  addReaction(messageId: string, emoji: string, conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('add_reaction', { messageId, emoji, conversationId });
    }
  }

  removeReaction(messageId: string, emoji: string, conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('remove_reaction', { messageId, emoji, conversationId });
    }
  }

  // Event listeners
  onMessage(callback: (message: SocketMessage) => void) {
    this.messageCallbacks.add(callback);
    return () => this.messageCallbacks.delete(callback);
  }

  onTyping(callback: (data: TypingIndicator) => void) {
    this.typingCallbacks.add(callback);
    return () => this.typingCallbacks.delete(callback);
  }

  onMessageStatus(callback: (data: MessageStatus) => void) {
    this.statusCallbacks.add(callback);
    return () => this.statusCallbacks.delete(callback);
  }

  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionCallbacks.add(callback);
    return () => this.connectionCallbacks.delete(callback);
  }

  // Getters
  get connected() {
    return this.isConnected;
  }

  get socketId() {
    return this.socket?.id;
  }
}

export const messagingService = new MessagingService();

// React hooks for messaging
export const useMessaging = () => {
  return {
    connect: messagingService.connect.bind(messagingService),
    disconnect: messagingService.disconnect.bind(messagingService),
    joinConversation: messagingService.joinConversation.bind(messagingService),
    leaveConversation: messagingService.leaveConversation.bind(messagingService),
    startTyping: messagingService.startTyping.bind(messagingService),
    stopTyping: messagingService.stopTyping.bind(messagingService),
    updateStatus: messagingService.updateStatus.bind(messagingService),
    sendFileUploadProgress: messagingService.sendFileUploadProgress.bind(messagingService),
    addReaction: messagingService.addReaction.bind(messagingService),
    removeReaction: messagingService.removeReaction.bind(messagingService),
    onMessage: messagingService.onMessage.bind(messagingService),
    onTyping: messagingService.onTyping.bind(messagingService),
    onMessageStatus: messagingService.onMessageStatus.bind(messagingService),
    onConnectionChange: messagingService.onConnectionChange.bind(messagingService),
    connected: messagingService.connected,
    socketId: messagingService.socketId
  };
};