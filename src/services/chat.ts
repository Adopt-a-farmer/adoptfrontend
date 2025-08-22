import { apiCall } from './api';

export interface Message {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
  };
  recipient: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
  };
  content: string;
  type: 'text' | 'image' | 'file' | 'voice' | 'video';
  attachments?: Array<{
    url: string;
    type: string;
    name: string;
    size: number;
  }>;
  readAt?: string;
  editedAt?: string;
  isEdited: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
  }>;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export const chatService = {
  // Get user's conversations
  getConversations: async () => {
    return await apiCall<{ success: boolean; data: { conversations: Conversation[] } }>('GET', '/messages/conversations');
  },

  // Get conversation with specific user
  getConversation: async (userId: string, params?: { page?: number; limit?: number }) => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return await apiCall<{ success: boolean; data: { messages: Message[] } }>('GET', `/messages/conversations/${userId}${queryString}`);
  },

  // Send a message
  sendMessage: async (messageData: {
    recipientId: string;
    content: string;
    type?: string;
    attachments?: any[];
  }) => {
    return await apiCall<{ success: boolean; data: { message: Message } }>('POST', '/messages/send', messageData);
  },

  // Mark message as read
  markAsRead: async (messageId: string) => {
    return await apiCall('PUT', `/messages/${messageId}/read`);
  },

  // Mark all messages in conversation as read
  markConversationAsRead: async (userId: string) => {
    return await apiCall('PUT', `/messages/conversations/${userId}/read`);
  },

  // Delete message
  deleteMessage: async (messageId: string) => {
    return await apiCall('DELETE', `/messages/${messageId}`);
  },

  // Edit message
  editMessage: async (messageId: string, content: string) => {
    return await apiCall('PUT', `/messages/${messageId}`, { content });
  },

  // Search messages
  searchMessages: async (query: string, userId?: string) => {
    const params = new URLSearchParams({ q: query });
    if (userId) params.append('userId', userId);
    
    return await apiCall('GET', `/messages/search?${params.toString()}`);
  },

  // Get unread message count
  getUnreadCount: async () => {
    return await apiCall<{ success: boolean; data: { count: number } }>('GET', '/messages/unread-count');
  },

  // Send file message
  sendFileMessage: async (recipientId: string, file: File, message?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('recipientId', recipientId);
    if (message) formData.append('content', message);

    return await apiCall('POST', '/messages/send-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get message history with pagination
  getMessageHistory: async (userId: string, page: number = 1, limit: number = 20) => {
    return await apiCall('GET', `/messages/conversations/${userId}?page=${page}&limit=${limit}`);
  },

  // Block/Unblock user
  blockUser: async (userId: string) => {
    return await apiCall('POST', `/messages/block/${userId}`);
  },

  unblockUser: async (userId: string) => {
    return await apiCall('DELETE', `/messages/block/${userId}`);
  },

  // Get blocked users
  getBlockedUsers: async () => {
    return await apiCall('GET', '/messages/blocked');
  },

  // Report message
  reportMessage: async (messageId: string, reason: string) => {
    return await apiCall('POST', `/messages/${messageId}/report`, { reason });
  },

  // Archive conversation
  archiveConversation: async (userId: string) => {
    return await apiCall('POST', `/messages/conversations/${userId}/archive`);
  },

  // Unarchive conversation
  unarchiveConversation: async (userId: string) => {
    return await apiCall('DELETE', `/messages/conversations/${userId}/archive`);
  },

  // Get archived conversations
  getArchivedConversations: async () => {
    return await apiCall('GET', '/messages/archived');
  },
};