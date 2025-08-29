export interface MessageUser {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role?: string;
}

export interface MessageContent {
  text?: string;
  media?: {
    url: string;
    fileName: string;
    mimeType: string;
    fileSize?: number;
    publicId?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface MessageReaction {
  user: string;
  emoji: string;
  reactedAt: string;
}

export interface BaseMessage {
  _id: string;
  conversationId: string;
  sender: MessageUser;
  recipient: MessageUser;
  content: MessageContent;
  messageType: 'text' | 'image' | 'video' | 'file' | 'location';
  isRead: boolean;
  readAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  reactions?: MessageReaction[];
  replyTo?: string;
  editHistory?: Array<{
    originalContent: string;
    editedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface BaseConversation {
  conversationId: string;
  participant: MessageUser & {
    role: 'farmer' | 'adopter' | 'expert' | 'admin';
    additionalInfo?: {
      farmName?: string;
      location?: {
        county: string;
        subCounty: string;
      };
      email?: string;
      joinDate?: string;
    };
  };
  lastMessage: {
    _id: string;
    content: MessageContent;
    sender: MessageUser;
    createdAt: string;
  };
  unreadCount: number;
  status: 'active' | 'archived' | 'blocked';
  lastActivity: string;
}

export interface TypingStatus {
  userId: string;
  userName: string;
  conversationId: string;
  isTyping: boolean;
}

export interface MessageStatus {
  messageId: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
}

export interface FileUploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  fileSize?: number;
}

export interface ConversationFilters {
  role?: 'farmer' | 'adopter' | 'expert' | 'admin';
  status?: 'active' | 'archived' | 'blocked';
  hasUnread?: boolean;
  search?: string;
}

export interface MessageFilters {
  messageType?: 'text' | 'image' | 'video' | 'file' | 'location';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}