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

  // Fetch conversations
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        // First get conversations for the current user
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
          .eq('user_id', user.id);

        if (convError) throw convError;

        if (!conversationData || conversationData.length === 0) {
          setConversations([]);
          return;
        }

        // Get all conversation IDs
        const conversationIds = conversationData.map(cp => cp.conversation_id);

        // Get other participants for each conversation
        const { data: participantsData, error: participantsError } = await supabase
          .from('conversation_participants')
          .select(`
            conversation_id,
            user_id
          `)
          .in('conversation_id', conversationIds)
          .neq('user_id', user.id);

        if (participantsError) throw participantsError;

        // Get profiles for other participants
        const otherUserIds = participantsData?.map(p => p.user_id) || [];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', otherUserIds);

        if (profilesError) throw profilesError;

        // Get last messages for each conversation
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('conversation_id, content, created_at, message_type')
          .in('conversation_id', conversationIds)
          .order('created_at', { ascending: false });

        if (messagesError) throw messagesError;

        // Process conversations
        const processedConversations = conversationData.map(cp => {
          const conversation = cp.conversations;
          if (!conversation) return null;

          // Find other participant
          const otherParticipant = participantsData?.find(
            p => p.conversation_id === conversation.id
          );

          // Find profile for other participant
          const profile = profilesData?.find(
            p => p.id === otherParticipant?.user_id
          );

          // Find last message
          const lastMessage = messagesData?.find(
            m => m.conversation_id === conversation.id
          );

          return {
            id: conversation.id,
            updated_at: conversation.updated_at,
            last_message_at: conversation.last_message_at,
            participant: {
              id: otherParticipant?.user_id || '',
              name: profile?.full_name || 'Unknown',
              email: profile?.email || ''
            },
            last_message: lastMessage
          };
        }).filter(Boolean) as Conversation[];

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
      const { data, error } = await supabase.rpc('get_or_create_direct_conversation', {
        other_user_id: contactId
      });

      if (error) throw error;

      setSelectedConversationId(data);
      setIsNewMessageOpen(false);
      
      // Refresh conversations to include the new one
      const fetchConversations = async () => {
        try {
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
            .eq('user_id', user.id);

          if (convError) throw convError;

          if (!conversationData || conversationData.length === 0) {
            setConversations([]);
            return;
          }

          const conversationIds = conversationData.map(cp => cp.conversation_id);

          const { data: participantsData, error: participantsError } = await supabase
            .from('conversation_participants')
            .select(`
              conversation_id,
              user_id
            `)
            .in('conversation_id', conversationIds)
            .neq('user_id', user.id);

          if (participantsError) throw participantsError;

          const otherUserIds = participantsData?.map(p => p.user_id) || [];
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', otherUserIds);

          if (profilesError) throw profilesError;

          const { data: messagesData, error: messagesError } = await supabase
            .from('messages')
            .select('conversation_id, content, created_at, message_type')
            .in('conversation_id', conversationIds)
            .order('created_at', { ascending: false });

          if (messagesError) throw messagesError;

          const processedConversations = conversationData.map(cp => {
            const conversation = cp.conversations;
            if (!conversation) return null;

            const otherParticipant = participantsData?.find(
              p => p.conversation_id === conversation.id
            );

            const profile = profilesData?.find(
              p => p.id === otherParticipant?.user_id
            );

            const lastMessage = messagesData?.find(
              m => m.conversation_id === conversation.id
            );

            return {
              id: conversation.id,
              updated_at: conversation.updated_at,
              last_message_at: conversation.last_message_at,
              participant: {
                id: otherParticipant?.user_id || '',
                name: profile?.full_name || 'Unknown',
                email: profile?.email || ''
              },
              last_message: lastMessage
            };
          }).filter(Boolean) as Conversation[];

          setConversations(processedConversations);
        } catch (error: any) {
          console.error('Error fetching conversations:', error);
        }
      };
      
      fetchConversations();
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Please log in to access messages</h2>
          <p className="text-muted-foreground">You need to be authenticated to view your conversations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Messages header - mobile optimized */}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Messages</h2>
          <p className="text-muted-foreground text-sm md:text-base hidden sm:block">
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

      {/* Messages content area - mobile responsive */}
      <div className="rounded-lg border bg-card h-[calc(100vh-200px)] md:h-[600px] flex flex-col">
        <div className="flex flex-1 min-h-0">
          {/* Conversations sidebar - mobile responsive */}
          <div className={`${selectedConversationId ? 'hidden lg:flex' : 'flex'} w-full lg:w-80 border-r flex-col min-h-0`}>
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
                loading={loading}
              />
            </div>
          </div>

          {/* Main chat area - mobile responsive */}
          <div className={`${selectedConversationId ? 'flex' : 'hidden lg:flex'} flex-1 flex-col min-h-0`}>
            {selectedConversationId ? (
              <ChatWindow
                conversationId={selectedConversationId}
                currentUserId={user.id}
                onBack={() => setSelectedConversationId(null)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-muted/20">
                <div className="text-center space-y-4 p-4 md:p-8 max-w-sm">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Select a conversation</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose a conversation from the list to start messaging, or create a new conversation with one of your contacts.
                    </p>
                  </div>
                  <Button onClick={() => setIsNewMessageOpen(true)} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Conversation
                  </Button>
                </div>
              </div>
            )}
          </div>
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