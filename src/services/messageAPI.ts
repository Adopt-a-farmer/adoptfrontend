import { apiCall } from './api';
import { BaseMessage, BaseConversation, MessageFilters, ConversationFilters } from '@/types/messaging';

export interface SendMessageRequest {
  recipient: string;
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
  replyTo?: string;
}

export interface SendFileMessageRequest {
  recipient: string;
  file: File;
  messageType: 'image' | 'file';
  caption?: string;
}

export interface MessagePagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface MessagesResponse {
  messages: BaseMessage[];
  pagination: MessagePagination;
}

export interface ConversationsResponse {
  conversations: BaseConversation[];
  totalUnread: number;
}

class MessageAPIService {
  // Get conversations for current user
  async getConversations(filters?: ConversationFilters): Promise<ConversationsResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters?.role) queryParams.append('role', filters.role);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.hasUnread !== undefined) queryParams.append('hasUnread', filters.hasUnread.toString());
    if (filters?.search) queryParams.append('search', filters.search);

    const query = queryParams.toString();
    const url = query ? `/messages/conversations?${query}` : '/messages/conversations';
    
    const response = await apiCall<{ conversations: BaseConversation[]; totalUnread: number }>('GET', url);
    return response;
  }

  // Get messages for a conversation
  async getMessages(
    conversationId: string, 
    page = 1, 
    limit = 50, 
    filters?: MessageFilters
  ): Promise<MessagesResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    if (filters?.messageType) queryParams.append('messageType', filters.messageType);
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
    if (filters?.search) queryParams.append('search', filters.search);

    const query = queryParams.toString();
    const url = `/messages/${conversationId}?${query}`;
    
    const response = await apiCall<{ data: MessagesResponse }>('GET', url);
    return response.data;
  }

  // Send a text message
  async sendMessage(request: SendMessageRequest): Promise<BaseMessage> {
    const response = await apiCall<{ data: { message: BaseMessage } }>('POST', '/messages/send', request);
    return response.data.message;
  }

  // Send a file message
  async sendFileMessage(request: SendFileMessageRequest): Promise<BaseMessage> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('recipient', request.recipient);
    formData.append('messageType', request.messageType);
    if (request.caption) {
      formData.append('caption', request.caption);
    }

    const response = await apiCall<{ data: { message: BaseMessage } }>('POST', '/messages/send-file', formData);
    return response.data.message;
  }

  // Mark messages as read
  async markAsRead(conversationId: string): Promise<void> {
    await apiCall('PUT', `/messages/${conversationId}/read`);
  }

  // Delete a message
  async deleteMessage(messageId: string): Promise<void> {
    await apiCall('DELETE', `/messages/${messageId}`);
  }

  // Get unread message count
  async getUnreadCount(): Promise<number> {
    const response = await apiCall<{ data: { unreadCount: number } }>('GET', '/messages/unread-count');
    return response.data.unreadCount;
  }

  // Edit a message
  async editMessage(messageId: string, content: string): Promise<BaseMessage> {
    const response = await apiCall<{ data: { message: BaseMessage } }>('PUT', `/messages/${messageId}`, {
      content: { text: content }
    });
    return response.data.message;
  }

  // Add reaction to message
  async addReaction(messageId: string, emoji: string): Promise<void> {
    await apiCall('POST', `/messages/${messageId}/reactions`, { emoji });
  }

  // Remove reaction from message
  async removeReaction(messageId: string, emoji: string): Promise<void> {
    await apiCall('DELETE', `/messages/${messageId}/reactions`, { emoji });
  }

  // Search messages across all conversations
  async searchMessages(query: string, limit = 20): Promise<BaseMessage[]> {
    const response = await apiCall<{ data: { messages: BaseMessage[] } }>('GET', `/messages/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data.messages;
  }

  // Block/Unblock conversation
  async blockConversation(conversationId: string, block = true): Promise<void> {
    await apiCall('PUT', `/messages/conversations/${conversationId}/block`, { blocked: block });
  }

  // Archive/Unarchive conversation
  async archiveConversation(conversationId: string, archive = true): Promise<void> {
    await apiCall('PUT', `/messages/conversations/${conversationId}/archive`, { archived: archive });
  }

  // Get conversation info
  async getConversationInfo(conversationId: string): Promise<BaseConversation> {
    const response = await apiCall<{ data: { conversation: BaseConversation } }>('GET', `/messages/conversations/${conversationId}`);
    return response.data.conversation;
  }

  // Report message
  async reportMessage(messageId: string, reason: string, details?: string): Promise<void> {
    await apiCall('POST', `/messages/${messageId}/report`, { reason, details });
  }
}

export const messageAPI = new MessageAPIService();
export default messageAPI;