
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ConversationList } from '@/components/ConversationList';
import { ChatWindow } from '@/components/ChatWindow';
import { NewMessageDialog } from '@/components/NewMessageDialog';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { useToast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  updated_at: string;
  last_message_at: string;
  participant: {
    id: string;
    name: string;
    email: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    message_type: string;
  };
}

export default function Messages() {
  const { user } = useAuth();
  const { contacts } = useContacts();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch conversations function
  const fetchConversations = async () => {
    if (!user) return;
    
    try {
        // Get conversations for the current user (excluding deleted ones)
        const { data: conversationData, error: convError } = await supabase
          .from('conversation_participants')
          .select(`
            conversation_id,
            conversations (
              id,
              updated_at,
              last_message_at
            )
          `)
          .eq('user_id', user.id)
          .is('deleted_at', null);

      if (convError) throw convError;

      if (!conversationData || conversationData.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Get unique conversation IDs to avoid duplicates
      const uniqueConversationIds = [...new Set(conversationData.map(cp => cp.conversation_id))];

      // Get other participants for each conversation
      const { data: participantsData, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('conversation_id, user_id')
        .in('conversation_id', uniqueConversationIds)
        .neq('user_id', user.id);

      if (participantsError) throw participantsError;

      // Get profiles for other participants
      const otherUserIds = [...new Set(participantsData?.map(p => p.user_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', otherUserIds);

      if (profilesError) throw profilesError;

      // Get last messages for each conversation
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('conversation_id, content, created_at, message_type')
        .in('conversation_id', uniqueConversationIds)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Process conversations and remove duplicates
      const conversationMap = new Map();
      
      uniqueConversationIds.forEach(convId => {
        const convData = conversationData.find(cp => cp.conversation_id === convId);
        if (!convData?.conversations) return;

        const conversation = convData.conversations;
        
        // Find other participant
        const otherParticipant = participantsData?.find(
          p => p.conversation_id === convId
        );

        // Skip conversations without other participants
        if (!otherParticipant) return;

        // Find profile for other participant
        const profile = profilesData?.find(
          p => p.id === otherParticipant.user_id
        );

        // Find last message for this specific conversation
        const lastMessage = messagesData?.find(
          m => m.conversation_id === convId
        );

        // Get participant info - start with profile data
        let participantName = profile?.full_name || '';
        let participantEmail = profile?.email || '';

        // If no profile found, try to get info from contacts
        if (!profile && otherParticipant) {
          // Since contacts don't store user_id references, we can't directly match
          // We'll rely on the profile data being present for proper messaging
          participantName = 'Contact User';
          participantEmail = '';
        }

        // Skip conversations where we can't identify the participant at all
        if (!participantName && !participantEmail && !profile) {
          return;
        }

        // Use email as fallback name if no name is available but email exists
        if (!participantName && participantEmail) {
          participantName = participantEmail.split('@')[0]; // Use email username part
        }

        // Final fallback for completely unknown users
        if (!participantName) {
          participantName = 'Unknown User';
        }

        conversationMap.set(convId, {
          id: conversation.id,
          updated_at: conversation.updated_at,
          last_message_at: conversation.last_message_at,
          participant: {
            id: otherParticipant.user_id,
            name: participantName || 'Unknown User',
            email: participantEmail
          },
          last_message: lastMessage
        });
      });

      // Convert map to array and sort by last message time
      const processedConversations = Array.from(conversationMap.values())
        .sort((a, b) => {
          const timeA = a.last_message?.created_at || a.updated_at;
          const timeB = b.last_message?.created_at || b.updated_at;
          return new Date(timeB).getTime() - new Date(timeA).getTime();
        });

      setConversations(processedConversations);
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

  // Fetch conversations on mount and set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    fetchConversations();

    // Set up real-time subscription for conversations
    const conversationChannel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationChannel);
    };
  }, [user, toast]);

  const handleNewConversation = async (contactId: string) => {
    try {
      // First, get the contact details
      const contact = contacts?.find(c => c.id === contactId);
      if (!contact) {
        throw new Error('Contact not found');
      }

      // Find the user_id by matching email with profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', contact.email)
        .maybeSingle();

      if (profileError) throw profileError;
      
      if (!profile) {
        toast({
          title: "Error",
          description: "This contact is not registered as a user yet",
          variant: "destructive"
        });
        return;
      }

      // Now create or get the conversation using the actual user_id
      const { data, error } = await supabase.rpc('get_or_create_direct_conversation', {
        other_user_id: profile.id
      });

      if (error) throw error;

      setSelectedConversationId(data);
      setIsNewMessageOpen(false);
      
      // Refresh conversations to include the new one
      await fetchConversations();
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to start conversation",
        variant: "destructive"
      });
    }
  };

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
        // Delete in reverse order to avoid foreign key conflicts
        // First delete messages
        const { error: messagesError } = await supabase
          .from('messages')
          .delete()
          .eq('conversation_id', conversationId);

        if (messagesError) throw messagesError;

        // Then delete all participants (not just current user)
        const { error: participantsError } = await supabase
          .from('conversation_participants')
          .delete()
          .eq('conversation_id', conversationId);

        if (participantsError) throw participantsError;

        // Finally delete the conversation itself
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

      // Add a small delay to ensure database operations are committed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh conversations list to ensure consistency
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
    <div className="space-y-4">
      {/* Messages header */}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Messages</h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Connect and communicate with your network
          </p>
        </div>
        <Button
          onClick={() => setIsNewMessageOpen(true)}
          className="flex items-center gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Message</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* Messages content area - constrained height for tab context */}
      <div className="rounded-lg border bg-card h-[500px] flex flex-col">
        <div className="flex flex-1 min-h-0">
          {selectedConversationId ? (
            /* Chat view - full width */
            <ChatWindow
              conversationId={selectedConversationId}
              currentUserId={user.id}
              onBack={handleBackToConversations}
            />
          ) : (
            /* Conversations list - full width */
            <div className="flex w-full flex-col min-h-0">
              <div className="p-3 md:p-4 border-b flex-shrink-0">
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

      {/* New message dialog */}
      <NewMessageDialog
        open={isNewMessageOpen}
        onOpenChange={setIsNewMessageOpen}
        contacts={contacts || []}
        onSelectContact={handleNewConversation}
      />
    </div>
  );
}
