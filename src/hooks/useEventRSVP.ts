import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export type RSVPStatus = 'going' | 'interested' | 'not_going' | null;

interface EventRSVP {
  eventId: string;
  status: RSVPStatus;
  isLoading: boolean;
  currentAttendees: number;
  handleRSVP: (status: RSVPStatus) => Promise<void>;
}

export const useEventRSVP = (eventId: string, initialAttendees: number = 0): EventRSVP => {
  const { user } = useAuth();
  const [status, setStatus] = useState<RSVPStatus>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAttendees, setCurrentAttendees] = useState(initialAttendees);

  // Fetch current RSVP status
  useEffect(() => {
    const fetchRSVPStatus = async () => {
      if (!user || !eventId) return;

      try {
        const { data, error } = await supabase
          .from('event_attendees')
          .select('status')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching RSVP status:', error);
          return;
        }

        setStatus(data?.status as RSVPStatus || null);
      } catch (error) {
        console.error('Error fetching RSVP status:', error);
      }
    };

    fetchRSVPStatus();
  }, [user, eventId]);

  // Handle RSVP changes
  const handleRSVP = async (newStatus: RSVPStatus) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to RSVP to events.",
        variant: "destructive"
      });
      return;
    }

    if (newStatus === status) return;

    setIsLoading(true);

    try {
      // Handle removing RSVP (set to null)
      if (newStatus === null) {
        const { error } = await supabase
          .from('event_attendees')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);

        if (error) throw error;

        setStatus(null);
        toast({
          title: "RSVP Removed",
          description: "You've removed your RSVP for this event."
        });
      } else {
        // Use the database function for RSVP operations
        const { data, error } = await supabase.rpc('handle_event_rsvp', {
          event_uuid: eventId,
          rsvp_status: newStatus
        });

        if (error) throw error;

        const result = data as { success: boolean; current_attendees?: number; error?: string };
        
        if (result.success) {
          setStatus(newStatus);
          if (result.current_attendees !== undefined) {
            setCurrentAttendees(result.current_attendees);
          }
          
          const statusLabels = {
            going: 'Going',
            interested: 'Interested', 
            not_going: 'Can\'t Go'
          };

          toast({
            title: "RSVP Updated",
            description: `You're marked as "${statusLabels[newStatus]}" for this event.`
          });
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      }
    } catch (error: any) {
      console.error('Error updating RSVP:', error);
      toast({
        title: "RSVP Failed",
        description: error.message || "Failed to update RSVP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    eventId,
    status,
    isLoading,
    currentAttendees,
    handleRSVP
  };
};