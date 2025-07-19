
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Paperclip, ArrowLeft, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  message_type: string;
  file_url?: string;
  file_name?: string;
  created_at: string;
  sender?: {
    full_name: string;
    email: string;
  };
}

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  onBack?: () => void;
}

export function ChatWindow({ conversationId, currentUserId, onBack }: ChatWindowProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherParticipant, setOtherParticipant] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages and participant info
  useEffect(() => {
    if (!conversationId) return;

    const fetchData = async (retryCount = 0) => {
      try {
        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select(`
            id,
            content,
            sender_id,
            message_type,
            file_url,
            file_name,
            created_at
          `)
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

        // Fetch participant info
        const { data: participantsData, error: participantsError } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conversationId)
          .neq('user_id', currentUserId)
          .single();

        if (participantsError) throw participantsError;

        if (participantsData) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', participantsData.user_id)
            .single();

          setOtherParticipant(profileData);
        }

        setMessages(messagesData || []);
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching chat data:', error);
        
        // Retry up to 3 times for network errors
        if (retryCount < 3 && error.message?.includes('Failed to fetch')) {
          console.log(`Retrying fetch attempt ${retryCount + 1}`);
          setTimeout(() => fetchData(retryCount + 1), 1000 * (retryCount + 1));
          return;
        }
        
        setLoading(false);
        toast({
          title: "Error",
          description: "Failed to load conversation. Please refresh the page.",
          variant: "destructive"
        });
      }
    };

    fetchData();

    // Set up real-time subscription for new messages
    const messagesChannel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [conversationId, currentUserId, toast]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col z-50">
      {/* Chat header */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onBack}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarFallback className="text-sm">
                {otherParticipant?.full_name
                  ?.split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="font-semibold text-base truncate">
                {otherParticipant?.full_name || otherParticipant?.email || 'Unknown User'}
              </h2>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-9 w-9"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
            <div className="w-16 h-16 rounded-full border-4 border-primary mb-6 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-primary"></div>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {otherParticipant?.full_name || 'User'} + You
            </h3>
            <p className="text-muted-foreground mb-2">This is where things begin.</p>
            <p className="text-muted-foreground">Who will break the ice?</p>
          </div>
        ) : (
          <div className="space-y-4">
          {messages.map((message) => {
            const isFromCurrentUser = message.sender_id === currentUserId;
            
            return (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  isFromCurrentUser ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] md:max-w-[70%] rounded-lg px-3 py-2",
                    isFromCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.message_type === 'text' && (
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  )}
                  
                  {message.message_type === 'file' && (
                    <div className="flex items-center space-x-2">
                      <Paperclip className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm truncate">{message.file_name}</span>
                    </div>
                  )}
                  
                  {message.message_type === 'image' && (
                    <div className="space-y-2">
                      {message.file_url && (
                        <img 
                          src={message.file_url} 
                          alt={message.file_name} 
                          className="max-w-full rounded"
                        />
                      )}
                      {message.content && (
                        <p className="text-sm break-words">{message.content}</p>
                      )}
                    </div>
                  )}
                  
                  <p className={cn(
                    "text-xs mt-1",
                    isFromCurrentUser 
                      ? "text-primary-foreground/70" 
                      : "text-muted-foreground"
                  )}>
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message input */}
      <div className="p-4 border-t border-border flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="h-12 w-12 rounded-full flex-shrink-0"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Say something..."
            className="flex-1 min-w-0 text-base h-12 rounded-full px-4"
            disabled={sending}
          />
          
          <Button 
            onClick={sendMessage} 
            disabled={!newMessage.trim() || sending}
            size="icon"
            className="h-12 w-12 rounded-full flex-shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,*"
          onChange={() => {
            // File upload functionality can be implemented later
            toast({
              title: "Coming Soon",
              description: "File sharing will be available soon!"
            });
          }}
        />
      </div>
    </div>
  );
}
