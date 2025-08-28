import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subscriptionManager } from '@/lib/supabase-subscriptions';
import { useAuth } from '@/contexts/AuthContext';

interface EventAttendee {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  joined_at: string;
  profiles?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    bio?: string;
    job_title?: string;
    company?: string;
  };
  privacy?: {
    show_profile: boolean;
    show_contact_info: boolean;
    allow_messages: boolean;
  };
}

export const useEventAttendees = (eventId: string) => {
  const { user } = useAuth();
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAttendees = async () => {
    if (!eventId) return;

    try {
      const { data: attendeeData, error } = await supabase
        .from('event_attendees')
        .select('*')
        .eq('event_id', eventId)
        .eq('status', 'going');

      if (error) throw error;

      // Get profiles for attendees
      const attendeesWithProfiles = await Promise.all(
        (attendeeData || []).map(async (attendee) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, bio, job_title, company')
            .eq('id', attendee.user_id)
            .single();

          return {
            ...attendee,
            profiles: profile,
          };
        })
      );

      // Fetch privacy settings for each attendee
      const attendeesWithPrivacy = await Promise.all(
        attendeesWithProfiles.map(async (attendee) => {
          const { data: privacy } = await supabase
            .from('event_attendee_privacy')
            .select('show_profile, show_contact_info, allow_messages')
            .eq('event_id', eventId)
            .eq('user_id', attendee.user_id)
            .maybeSingle();

          return {
            ...attendee,
            privacy: privacy || {
              show_profile: true,
              show_contact_info: false,
              allow_messages: true,
            },
          };
        })
      );

      setAttendees(attendeesWithPrivacy);
    } catch (error) {
      console.error('Error fetching attendees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendees();

    // Set up real-time subscription for attendee changes
    const channelName = `event-attendees-${eventId}`;
    const channel = subscriptionManager.getOrCreateChannel(channelName, () =>
      supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'event_attendees',
            filter: `event_id=eq.${eventId}`,
          },
          () => {
            fetchAttendees();
          }
        )
        .subscribe()
    );

    return () => {
      // Don't remove the channel here - let the manager handle it
    };
  }, [eventId]);

  return {
    attendees,
    isLoading,
    refetch: fetchAttendees,
  };
};