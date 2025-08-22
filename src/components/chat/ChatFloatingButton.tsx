import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/mock/client';
import NotificationChat from './NotificationChat';

interface ChatContact {
  id: string;
  name: string;
  role: string;
  lastMessage?: string;
  unreadCount: number;
}

const ChatFloatingButton: React.FC = () => {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [activeChat, setActiveChat] = useState<ChatContact | null>(null);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (user) {
      fetchContacts();
      subscribeToNewMessages();
    }
  }, [user]);

  const fetchContacts = async () => {
    if (!user) return;

    try {
      // Get recent conversations
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          sender_id,
          recipient_id,
          content,
          created_at,
          read_at,
          sender:profiles!messages_sender_id_fkey(id, full_name, role),
          recipient:profiles!messages_recipient_id_fkey(id, full_name, role)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process contacts from messages
      const contactMap = new Map<string, ChatContact>();
      let unreadTotal = 0;

      messages?.forEach(msg => {
        const isFromUser = msg.sender_id === user.id;
        const otherUserId = isFromUser ? msg.recipient_id : msg.sender_id;
        const otherUser = isFromUser ? msg.recipient : msg.sender;

        if (!contactMap.has(otherUserId)) {
          contactMap.set(otherUserId, {
            id: otherUserId,
            name: (otherUser as any)?.full_name || 'Unknown',
            role: (otherUser as any)?.role || 'user',
            lastMessage: msg.content,
            unreadCount: 0
          });
        }

        // Count unread messages
        if (!isFromUser && !msg.read_at) {
          const contact = contactMap.get(otherUserId)!;
          contact.unreadCount++;
          unreadTotal++;
        }
      });

      setContacts(Array.from(contactMap.values()));
      setTotalUnread(unreadTotal);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const subscribeToNewMessages = () => {
    if (!user) return;

    const channel = supabase
      .channel(`user-messages-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id.eq.${user.id}`
        },
        () => {
          fetchContacts(); // Refresh contacts when new message arrives
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const openChat = (contact: ChatContact) => {
    setActiveChat(contact);
    setIsOpen(false);
  };

  const closeChat = () => {
    setActiveChat(null);
    fetchContacts(); // Refresh to update unread counts
  };

  if (!user || !profile) return null;

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="relative rounded-full w-12 h-12 shadow-lg"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
          {totalUnread > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 min-w-[1.5rem] h-6 flex items-center justify-center text-xs"
            >
              {totalUnread > 99 ? '99+' : totalUnread}
            </Badge>
          )}
        </Button>

        {/* Contacts List */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 w-72 bg-background border rounded-lg shadow-lg max-h-80 overflow-y-auto">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Messages</h3>
            </div>
            <div className="divide-y">
              {contacts.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No conversations yet
                </div>
              ) : (
                contacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => openChat(contact)}
                    className="p-3 hover:bg-muted cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{contact.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {contact.role}
                        </Badge>
                      </div>
                      {contact.lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">
                          {contact.lastMessage}
                        </p>
                      )}
                    </div>
                    {contact.unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-2 min-w-[1.5rem] h-5 flex items-center justify-center text-xs">
                        {contact.unreadCount > 99 ? '99+' : contact.unreadCount}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Active Chat Window */}
      {activeChat && (
        <NotificationChat
          recipientId={activeChat.id}
          recipientName={activeChat.name}
          recipientRole={activeChat.role}
          isOpen={!!activeChat}
          onClose={closeChat}
        />
      )}
    </>
  );
};

export default ChatFloatingButton;