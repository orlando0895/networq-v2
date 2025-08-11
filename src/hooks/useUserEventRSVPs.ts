import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserEventRSVP {
  event_id: string;
  status: string;
}

export const useUserEventRSVPs = () => {
  const { user } = useAuth();
  const [rsvps, setRSVPs] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserRSVPs = async () => {
      if (!user) {
        setRSVPs(new Map());
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_user_event_rsvps');

        if (error) throw error;

        const rsvpMap = new Map<string, string>();
        data?.forEach((rsvp: UserEventRSVP) => {
          rsvpMap.set(rsvp.event_id, rsvp.status);
        });

        setRSVPs(rsvpMap);
      } catch (error) {
        console.error('Error fetching user RSVPs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRSVPs();
  }, [user]);

  const getRSVPStatus = (eventId: string): string | null => {
    return rsvps.get(eventId) || null;
  };

  const updateRSVPStatus = (eventId: string, status: string | null) => {
    setRSVPs(prev => {
      const newMap = new Map(prev);
      if (status === null) {
        newMap.delete(eventId);
      } else {
        newMap.set(eventId, status);
      }
      return newMap;
    });
  };

  return {
    rsvps,
    isLoading,
    getRSVPStatus,
    updateRSVPStatus
  };
};