import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ConversationList } from '@/components/ConversationList';
import { ChatWindow } from '@/components/ChatWindow';
import { NewMessageDialog } from '@/components/NewMessageDialog';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { useToast } from '@/hooks/use-toast';
import { MobileLayout, PageHeader } from '@/components/MobileLayout';

interface Conversation {
  id: string;
  updated_at: string;
  last_message_at: string;
  participants: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  participant_count: number;
  is_group_chat: boolean;
  last_message?: {
    content: string;
    created_at: string;
    message_type: string;
    sender_name?: string;
  };
}

interface MessagesProps {
  targetConversationId?: string | null;
}

const Messages = ({ targetConversationId }: MessagesProps) => {
  const { user } = useAuth();
  const { contacts } = useContacts();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);

  // Fetch conversations function
  const fetchConversations = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations!inner (
            id,
            updated_at,
            last_message_at
          )
        `)
        .eq('user_id', user.id)
        .order('conversations(last_message_at)', { ascending: false });

      if (error) throw error;

      // Get unique conversations
      const uniqueConversations = data?.reduce((acc: any[], item) => {
        const existingConv = acc.find(conv => conv.id === item.conversations.id);
        if (!existingConv) {
          acc.push(item.conversations);
        }
        return acc;
      }, []) || [];

      // Fetch additional details for each conversation
      const conversationsWithDetails = await Promise.all(
        uniqueConversations.map(async (conv: any) => {
          // Get participant IDs
          const { data: participantData } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conv.id)
            .neq('user_id', user.id);

          // Get participant profiles
          const participantIds = participantData?.map(p => p.user_id) || [];
          const { data: participantProfiles } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', participantIds);

          // Get total participant count
          const { count: participantCount } = await supabase
            .from('conversation_participants')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id);

          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at, message_type, sender_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get sender name for last message
          let senderName = '';
          if (lastMessage?.sender_id) {
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', lastMessage.sender_id)
              .single();
            senderName = senderProfile?.full_name || '';
          }

          const isGroupChat = (participantCount || 0) > 2;

          return {
            ...conv,
            participants: participantProfiles?.map(p => ({
              id: p.id,
              name: p.full_name || '',
              email: p.email || ''
            })) || [],
            participant_count: participantCount || 0,
            is_group_chat: isGroupChat,
            last_message: lastMessage ? {
              ...lastMessage,
              sender_name: senderName
            } : null
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle selecting a contact to message
  const handleSelectContact = async (contactId: string) => {
    try {
      if (!user) return;

      // Get the user ID from the contact
      const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .select('email')
        .eq('id', contactId)
        .eq('user_id', user.id)
        .single();

      if (contactError) throw contactError;

      // Get the profile ID for this email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', contact.email)
        .single();

      if (profileError) throw profileError;

      // Create or get conversation using the function
      const { data: conversationData, error: conversationError } = await supabase
        .rpc('get_or_create_direct_conversation', {
          other_user_id: profile.id
        });

      if (conversationError) throw conversationError;

      setSelectedConversationId(conversationData);
      setIsNewMessageOpen(false);
      
      // Refresh conversations to show the new one
      await fetchConversations();
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive"
      });
    }
  };

  // Handle creating a group chat
  const handleCreateGroupChat = async (contactIds: string[]) => {
    try {
      if (!user || contactIds.length === 0) return;

      // Create a new conversation
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();

      if (conversationError) throw conversationError;

      // Get profile IDs for the selected contacts
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('email')
        .in('id', contactIds)
        .eq('user_id', user.id);

      if (contactsError) throw contactsError;

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .in('email', contacts.map(c => c.email));

      if (profilesError) throw profilesError;

      // Add current user and selected contacts as participants
      const participantData = [
        { conversation_id: conversation.id, user_id: user.id },
        ...profiles.map(profile => ({
          conversation_id: conversation.id,
          user_id: profile.id
        }))
      ];

      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participantData);

      if (participantsError) throw participantsError;

      setSelectedConversationId(conversation.id);
      setIsNewMessageOpen(false);
      
      // Refresh conversations to show the new group chat
      await fetchConversations();
    } catch (error: any) {
      console.error('Error creating group chat:', error);
      toast({
        title: "Error",
        description: "Failed to create group chat",
        variant: "destructive"
      });
    }
  };

  // Smart conversation list update function
  const updateConversationWithNewMessage = (conversationId: string, message: any) => {
    setConversations(prev => {
      const updatedConversations = prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            last_message: {
              content: message.content,
              created_at: message.created_at,
              message_type: message.message_type
            },
            last_message_at: message.created_at,
            updated_at: message.created_at
          };
        }
        return conv;
      });
      
      // Sort conversations by last message time
      return updatedConversations.sort((a, b) => {
        const timeA = a.last_message?.created_at || a.updated_at;
        const timeB = b.last_message?.created_at || b.updated_at;
        return new Date(timeB).getTime() - new Date(timeA).getTime();
      });
    });
  };

  // Fetch conversations on mount and set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    fetchConversations();

    // Clean up any existing channel first
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    // Set up optimized real-time subscription for messages with unique channel name
    const messagesChannel = supabase
      .channel(`messages-${user.id}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new;
          console.log('New message received:', newMessage);
          
          // Update conversation state immediately
          setConversations(prev => {
            const isUserInConversation = prev.some(conv => conv.id === newMessage.conversation_id);
            
            if (isUserInConversation) {
              return prev.map(conv => {
                if (conv.id === newMessage.conversation_id) {
                  return {
                    ...conv,
                    last_message: {
                      content: newMessage.content,
                      created_at: newMessage.created_at,
                      message_type: newMessage.message_type
                    },
                    last_message_at: newMessage.created_at,
                    updated_at: newMessage.created_at
                  };
                }
                return conv;
              }).sort((a, b) => {
                const timeA = a.last_message?.created_at || a.updated_at;
                const timeB = b.last_message?.created_at || b.updated_at;
                return new Date(timeB).getTime() - new Date(timeA).getTime();
              });
            } else {
              setTimeout(() => fetchConversations(), 100);
              return prev;
            }
          });
        }
      )
      .subscribe();

    // Store the channel reference
    channelRef.current = messagesChannel;

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [user]);

  const handleDeleteConversation = async (conversationId: string, deleteType: 'hide' | 'delete') => {
    try {
      if (deleteType === 'hide') {
        // Soft delete - mark as deleted for this user only
        const { error } = await supabase
          .from('conversation_participants')
          .update({ deleted_at: new Date().toISOString() })
          .eq('conversation_id', conversationId)
          .eq('user_id', user!.id);

        if (error) throw error;

        toast({
          title: "Conversation hidden",
          description: "The conversation has been hidden from your view",
        });
      } else {
        // Hard delete - remove entire conversation and all messages
        const { error: messagesError } = await supabase
          .from('messages')
          .delete()
          .eq('conversation_id', conversationId);

        if (messagesError) throw messagesError;

        const { error: participantsError } = await supabase
          .from('conversation_participants')
          .delete()
          .eq('conversation_id', conversationId);

        if (participantsError) throw participantsError;

        const { error: conversationError } = await supabase
          .from('conversations')
          .delete()
          .eq('id', conversationId);

        if (conversationError) throw conversationError;

        toast({
          title: "Conversation deleted",
          description: "The conversation has been completely deleted for all participants",
        });
      }

      // Clear selection if we deleted the selected conversation
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
      }
      
      // Refresh conversations list
      await fetchConversations();
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive"
      });
    }
  };

  const handleBackToConversations = () => {
    setSelectedConversationId(null);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Please log in to access messages</h2>
          <p className="text-muted-foreground">You need to be authenticated to view your conversations.</p>
        </div>
      </div>
    );
  }

  return (
    <MobileLayout
      header={
        <PageHeader
          title="Messages"
          subtitle="Connect and communicate with your network"
          action={
            <Button
              onClick={() => setIsNewMessageOpen(true)}
              size="sm"
              className="touch-target"
            >
              <Plus className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">New</span>
            </Button>
          }
        />
      }
      noPadding
    >
      <div className="h-[calc(100vh-140px)] flex flex-col">
        <div className="flex flex-1 min-h-0">
          {selectedConversationId ? (
            <ChatWindow
              conversationId={selectedConversationId}
              currentUserId={user.id}
              onBack={handleBackToConversations}
              onMessageSent={updateConversationWithNewMessage}
            />
          ) : (
            <div className="flex w-full flex-col min-h-0">
              <div className="p-4 border-b flex-shrink-0">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Conversations
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0">
                <ConversationList
                  conversations={conversations}
                  selectedConversationId={selectedConversationId}
                  onSelectConversation={setSelectedConversationId}
                  onDeleteConversation={handleDeleteConversation}
                  loading={loading}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <NewMessageDialog
        open={isNewMessageOpen}
        onOpenChange={setIsNewMessageOpen}
        contacts={contacts}
        onSelectContact={handleSelectContact}
        onCreateGroupChat={handleCreateGroupChat}
      />
    </MobileLayout>
  );
};

export default Messages;