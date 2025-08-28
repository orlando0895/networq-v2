import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subscriptionManager } from '@/lib/supabase-subscriptions';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface EventConnection {
  id: string;
  event_id: string;
  requester_id: string;
  recipient_id: string;
  status: string;
  message?: string;
  created_at: string;
}

export const useEventConnections = (eventId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<EventConnection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchConnections = async () => {
    if (!user || !eventId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_connections')
        .select('*')
        .eq('event_id', eventId)
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendConnectionRequest = async (recipientId: string, message?: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to connect with attendees",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('event_connections')
        .insert({
          event_id: eventId,
          requester_id: user.id,
          recipient_id: recipientId,
          message,
        });

      if (error) throw error;

      toast({
        title: "Connection request sent",
        description: "Your connection request has been sent",
      });

      await fetchConnections();
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      });
    }
  };

  const respondToConnection = async (connectionId: string, status: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('event_connections')
        .update({ status })
        .eq('id', connectionId)
        .eq('recipient_id', user?.id);

      if (error) throw error;

      toast({
        title: status === 'accepted' ? "Connection accepted" : "Connection declined",
        description: `You have ${status} the connection request`,
      });

      await fetchConnections();
    } catch (error) {
      console.error('Error responding to connection:', error);
      toast({
        title: "Error",
        description: "Failed to respond to connection request",
        variant: "destructive",
      });
    }
  };

  const getConnectionStatus = (userId: string): string | null => {
    const connection = connections.find(
      (conn) =>
        (conn.requester_id === user?.id && conn.recipient_id === userId) ||
        (conn.recipient_id === user?.id && conn.requester_id === userId)
    );
    return connection?.status || null;
  };

  useEffect(() => {
    fetchConnections();

    // Set up real-time subscription
    const channelName = `event-connections-${eventId}`;
    const channel = subscriptionManager.getOrCreateChannel(channelName, () =>
      supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'event_connections',
            filter: `event_id=eq.${eventId}`,
          },
          () => {
            fetchConnections();
          }
        )
        .subscribe()
    );

    return () => {
      // Don't remove the channel here - let the manager handle it
    };
  }, [eventId, user]);

  return {
    connections,
    isLoading,
    sendConnectionRequest,
    respondToConnection,
    getConnectionStatus,
  };
};