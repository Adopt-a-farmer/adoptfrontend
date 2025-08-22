import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  // Connect to socket server
  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      autoConnect: true,
    });

    this.setupEventListeners();
  }

  // Disconnect from socket server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventListeners.clear();
  }

  // Setup basic event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Authentication events
    this.socket.on('authenticated', (data) => {
      console.log('Socket authenticated:', data);
    });

    this.socket.on('unauthorized', (error) => {
      console.error('Socket authentication failed:', error);
      this.disconnect();
    });
  }

  // Join user room
  joinRoom(userId: string, role: string): void {
    if (this.socket) {
      this.socket.emit('join_room', { userId, role });
    }
  }

  // Leave user room
  leaveRoom(userId: string): void {
    if (this.socket) {
      this.socket.emit('leave_room', { userId });
    }
  }

  // Send message
  sendMessage(recipientId: string, content: string, type: string = 'text'): void {
    if (this.socket) {
      this.socket.emit('send_message', {
        recipientId,
        content,
        type,
      });
    }
  }

  // Mark message as read
  markMessageAsRead(messageId: string): void {
    if (this.socket) {
      this.socket.emit('message_read', { messageId });
    }
  }

  // Typing indicators
  startTyping(recipientId: string): void {
    if (this.socket) {
      this.socket.emit('typing_start', { recipientId });
    }
  }

  stopTyping(recipientId: string): void {
    if (this.socket) {
      this.socket.emit('typing_stop', { recipientId });
    }
  }

  // Video call events
  startCall(recipientId: string, callType: 'video' | 'audio'): void {
    if (this.socket) {
      this.socket.emit('start_call', { recipientId, callType });
    }
  }

  acceptCall(callId: string): void {
    if (this.socket) {
      this.socket.emit('accept_call', { callId });
    }
  }

  rejectCall(callId: string): void {
    if (this.socket) {
      this.socket.emit('reject_call', { callId });
    }
  }

  endCall(callId: string): void {
    if (this.socket) {
      this.socket.emit('end_call', { callId });
    }
  }

  // Generic event listener
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    this.eventListeners.get(event)!.push(callback);

    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  // Remove event listener
  off(event: string, callback?: Function): void {
    if (callback) {
      const listeners = this.eventListeners.get(event) || [];
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.eventListeners.delete(event);
    }

    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback as any);
      } else {
        this.socket.off(event);
      }
    }
  }

  // Emit custom event
  emit(event: string, data?: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // Check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket ID
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  // Reconnect
  reconnect(): void {
    if (this.socket) {
      this.socket.connect();
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;