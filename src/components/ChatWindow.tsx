import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Paperclip, ArrowLeft, MoreVertical, Users, UserPlus } from 'lucide-react';
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

interface Participant {
  id: string;
  full_name: string;
  email: string;
}

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  onBack?: () => void;
  onMessageSent?: (conversationId: string, message: any) => void;
}

export function ChatWindow({ conversationId, currentUserId, onBack, onMessageSent }: ChatWindowProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

        // Fetch sender profiles for messages
        const senderIds = [...new Set(messagesData?.map(m => m.sender_id) || [])];
        const { data: senderProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', senderIds);

        // Transform the data to match our expected format
        const transformedMessages = messagesData?.map(msg => {
          const senderProfile = senderProfiles?.find(p => p.id === msg.sender_id);
          return {
            ...msg,
            sender: {
              full_name: senderProfile?.full_name || '',
              email: senderProfile?.email || ''
            }
          };
        }) || [];

        // Fetch participant info (excluding current user)
        const { data: participantsData, error: participantsError } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conversationId)
          .neq('user_id', currentUserId);

        if (participantsError) throw participantsError;

        // Get participant profiles
        const participantIds = participantsData?.map(p => p.user_id) || [];
        const { data: participantProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', participantIds);

        // Transform participants data
        const transformedParticipants = participantProfiles?.map(p => ({
          id: p.id,
          full_name: p.full_name || '',
          email: p.email || ''
        })) || [];

        setParticipants(transformedParticipants);
        setIsGroupChat(transformedParticipants.length > 1);
        setMessages(transformedMessages);
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
        async (payload) => {
          const newMessage = payload.new as Message;
          // Only add if it's not from current user (to avoid duplicates)
          if (newMessage.sender_id !== currentUserId) {
            // Fetch sender info for the new message
            const { data: senderData } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', newMessage.sender_id)
              .single();

            setMessages(prev => [...prev, {
              ...newMessage,
              sender: senderData || { full_name: '', email: '' }
            }]);
          }
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

  // Auto focus the input when opening a conversation
  useEffect(() => {
    inputRef.current?.focus();
  }, [conversationId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const messageData = {
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: newMessage.trim(),
        message_type: 'text'
      };

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select(`
          id,
          content,
          sender_id,
          message_type,
          file_url,
          file_name,
          created_at
        `)
        .single();

      if (error) throw error;

      // Get current user info for the message
      const { data: currentUserData } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', currentUserId)
        .single();

      // Immediately update local state for instant feedback
      const messageWithSender = {
        ...data,
        sender: currentUserData || { full_name: '', email: '' }
      };
      
      setMessages(prev => [...prev, messageWithSender]);
      
      // Notify parent component about the new message
      if (onMessageSent && data) {
        onMessageSent(conversationId, data);
      }

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

  const getDisplayName = (participant: Participant) => {
    return participant.full_name || participant.email || 'Unknown User';
  };

  const getGroupChatTitle = () => {
    if (participants.length === 0) return 'Group Chat';
    if (participants.length === 1) return getDisplayName(participants[0]);
    if (participants.length === 2) return participants.map(p => getDisplayName(p).split(' ')[0]).join(', ');
    return `${getDisplayName(participants[0]).split(' ')[0]} and ${participants.length - 1} others`;
  };

  const getSenderDisplayName = (message: Message) => {
    if (message.sender_id === currentUserId) return 'You';
    return message.sender?.full_name?.split(' ')[0] || message.sender?.email || 'Unknown';
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
      {/* Enhanced mobile-optimized chat header */}
      <div className="p-4 border-b border-border flex-shrink-0 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onBack}
              className="h-10 w-10 flex-shrink-0 touch-target"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            {isGroupChat ? (
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="relative flex-shrink-0">
                  <Avatar className="h-11 w-11 border-2 border-primary/20">
                    <AvatarFallback className="text-sm bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                      <Users className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <Badge className="absolute -top-1 -right-1 h-6 w-6 p-0 text-xs font-semibold bg-accent text-accent-foreground">
                    {participants.length + 1}
                  </Badge>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-base truncate">
                    {getGroupChatTitle()}
                  </h2>
                  <div className="flex items-center space-x-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <p className="text-xs text-muted-foreground truncate">
                      {participants.length + 1} participants
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <Avatar className="h-11 w-11 flex-shrink-0 border-2 border-primary/20">
                  <AvatarFallback className="text-sm font-semibold">
                    {participants[0]?.full_name
                      ?.split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h2 className="font-bold text-base truncate">
                    {getDisplayName(participants[0] || { id: '', full_name: '', email: '' })}
                  </h2>
                  <div className="flex items-center space-x-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <p className="text-xs text-muted-foreground">Online now</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-10 w-10 flex-shrink-0 touch-target"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isFromCurrentUser = message.sender_id === currentUserId;
            const showSenderName = isGroupChat && !isFromCurrentUser;
            
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
                  {showSenderName && (
                    <p className="text-xs font-semibold mb-1.5 text-primary flex items-center space-x-1">
                      <span>{getSenderDisplayName(message)}</span>
                      <div className="h-1 w-1 bg-primary/60 rounded-full"></div>
                    </p>
                  )}
                  
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
      </ScrollArea>

      {/* Enhanced mobile-optimized message input */}
      <div className="p-4 border-t border-border flex-shrink-0 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="h-11 w-11 rounded-full flex-shrink-0 touch-target border-2"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isGroupChat ? "Message the group..." : "Say something..."}
              className="text-base h-11 rounded-full px-4 pr-12 border-2 focus:border-primary transition-colors"
              disabled={sending}
            />
            {newMessage.trim() && (
              <Button 
                onClick={sendMessage} 
                disabled={!newMessage.trim() || sending}
                size="icon"
                className="absolute right-1 top-1 h-9 w-9 rounded-full"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {!newMessage.trim() && (
            <Button 
              onClick={sendMessage} 
              disabled={!newMessage.trim() || sending}
              size="icon"
              className="h-11 w-11 rounded-full flex-shrink-0 touch-target"
            >
              <Send className="h-5 w-5" />
            </Button>
          )}
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