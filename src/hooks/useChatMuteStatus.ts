import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useChatMuteStatus(conversationId: string) {
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!conversationId) return;

    const fetchMuteStatus = async () => {
      try {
        const { data: currentUser } = await supabase.auth.getUser();
        if (!currentUser.user) return;

        const { data, error } = await supabase
          .from('conversation_participants')
          .select('muted_until, notifications_enabled')
          .eq('conversation_id', conversationId)
          .eq('user_id', currentUser.user.id)
          .single();

        if (error) throw error;

        // Check if muted_until is in the future or notifications are disabled
        const mutedUntil = data?.muted_until ? new Date(data.muted_until) : null;
        const isCurrentlyMuted = data?.notifications_enabled === false || 
          (mutedUntil && mutedUntil > new Date());

        setIsMuted(isCurrentlyMuted);
      } catch (error) {
        console.error('Error fetching mute status:', error);
        setIsMuted(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMuteStatus();

    // Clean up any existing channel first
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Set up real-time subscription for mute status changes with unique channel name
    const subscription = supabase
      .channel(`mute-status-${conversationId}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation_participants',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          // Check if this update affects the current user
          supabase.auth.getUser().then(({ data: currentUser }) => {
            if (currentUser.user && payload.new.user_id === currentUser.user.id) {
              const mutedUntil = payload.new.muted_until ? new Date(payload.new.muted_until) : null;
              const isCurrentlyMuted = payload.new.notifications_enabled === false || 
                (mutedUntil && mutedUntil > new Date());
              setIsMuted(isCurrentlyMuted);
            }
          });
        }
      )
      .subscribe();

    // Store the channel reference
    channelRef.current = subscription;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId]);

  return { isMuted, isLoading };
}