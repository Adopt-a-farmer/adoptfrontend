import { apiCall } from './api';

export interface AdopterFarmerConversation {
  conversationId: string;
  adoption: {
    _id: string;
    status: string;
    monthlyContribution: number;
    startDate: string;
  };
  farmer: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    email: string;
  };
  latestMessage?: {
    content: {
      text?: string;
    };
    createdAt: string;
    sender: {
      firstName: string;
      lastName: string;
    };
  };
  unreadCount: number;
}

export interface FarmerAdopterConversation {
  conversationId: string;
  adoption: {
    _id: string;
    status: string;
    monthlyContribution: number;
    startDate: string;
  };
  adopter: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    email: string;
  };
  latestMessage?: {
    content: {
      text?: string;
    };
    createdAt: string;
    sender: {
      firstName: string;
      lastName: string;
    };
  };
  unreadCount: number;
}

export interface SendMessageRequest {
  recipient: string;
  messageType: 'text' | 'image' | 'video' | 'file';
  content: {
    text?: string;
    media?: {
      url: string;
      fileName?: string;
    };
  };
  adoption?: string;
}

interface MessageResponse {
  message: {
    _id: string;
    content: {
      text?: string;
    };
    createdAt: string;
    sender: {
      firstName: string;
      lastName: string;
    };
  };
}

export const adopterMessagingService = {
  // Get conversations between adopter and their adopted farmers
  async getAdopterFarmerConversations(): Promise<{ success: boolean; data: AdopterFarmerConversation[] }> {
    try {
      return await apiCall('GET', '/adopters/conversations/farmers');
    } catch (error) {
      console.error('Failed to fetch adopter-farmer conversations:', error);
      return { success: false, data: [] };
    }
  },

  // Send message to adopted farmer
  async sendMessageToFarmer(messageData: SendMessageRequest): Promise<{ success: boolean; data?: MessageResponse }> {
    try {
      return await apiCall('POST', '/messages/send', messageData);
    } catch (error) {
      console.error('Failed to send message to farmer:', error);
      throw error;
    }
  }
};

export const farmerMessagingService = {
  // Get conversations between farmer and their adopters
  async getFarmerAdopterConversations(): Promise<{ success: boolean; data: FarmerAdopterConversation[] }> {
    try {
      return await apiCall('GET', '/farmers/conversations/adopters');
    } catch (error) {
      console.error('Failed to fetch farmer-adopter conversations:', error);
      return { success: false, data: [] };
    }
  },

  // Send message to adopter
  async sendMessageToAdopter(messageData: SendMessageRequest): Promise<{ success: boolean; data?: MessageResponse }> {
    try {
      return await apiCall('POST', '/messages/send', messageData);
    } catch (error) {
      console.error('Failed to send message to adopter:', error);
      throw error;
    }
  }
};
