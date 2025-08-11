
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useEventRSVP } from '@/hooks/useEventRSVP';
import { useUserEventRSVPs } from '@/hooks/useUserEventRSVPs';
import { useEventNotifications } from '@/hooks/useEventNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Check, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventRSVPButtonProps {
  eventId: string;
  initialAttendees: number;
  className?: string;
  variant?: 'default' | 'compact';
}

export const EventRSVPButton: React.FC<EventRSVPButtonProps> = ({
  eventId,
  initialAttendees,
  className,
  variant = 'default'
}) => {
  const { user } = useAuth();
  const { getRSVPStatus, updateRSVPStatus } = useUserEventRSVPs();
  const { rsvpToEvent, isLoading } = useEventRSVP();
  const { sendRSVPConfirmation, generateCalendarFile } = useEventNotifications();
  const [attendeeCount, setAttendeeCount] = useState(initialAttendees);
  const [eventDetails, setEventDetails] = useState<any>(null);

  const currentStatus = getRSVPStatus(eventId);

  // Fetch event details for email notifications
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!user || !eventId) return;
      
      try {
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            profiles:created_by(full_name, email)
          `)
          .eq('id', eventId)
          .single();

        if (error) throw error;
        setEventDetails(data);
      } catch (error) {
        console.error('Error fetching event details:', error);
      }
    };

    fetchEventDetails();
  }, [eventId, user]);

  const handleRSVP = async (status: string) => {
    if (!user || !eventDetails) return;

    try {
      const result = await rsvpToEvent(eventId, status);
      
      if (result.success) {
        updateRSVPStatus(eventId, status);
        setAttendeeCount(result.current_attendees || attendeeCount);

        // Send confirmation email for "going" status
        if (status === 'going') {
          const eventDate = new Date(eventDetails.event_date);
          
          await sendRSVPConfirmation(user.email!, {
            attendeeName: user.user_metadata?.full_name || user.email!,
            eventTitle: eventDetails.title,
            eventDate: eventDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            eventTime: eventDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }),
            locationName: eventDetails.location_name,
            address: eventDetails.address,
            organizerName: eventDetails.profiles?.full_name || 'Event Organizer'
          });
        }
      }
    } catch (error) {
      console.error('Error updating RSVP:', error);
    }
  };

  const handleAddToCalendar = async () => {
    if (!eventDetails) return;

    const endDate = eventDetails.end_date 
      ? eventDetails.end_date 
      : new Date(new Date(eventDetails.event_date).getTime() + 2 * 60 * 60 * 1000).toISOString();

    await generateCalendarFile({
      title: eventDetails.title,
      description: eventDetails.description,
      startDate: eventDetails.event_date,
      endDate: endDate,
      location: `${eventDetails.location_name}${eventDetails.address ? `, ${eventDetails.address}` : ''}`,
      organizerName: eventDetails.profiles?.full_name || 'Event Organizer',
      organizerEmail: eventDetails.profiles?.email
    });
  };

  if (variant === 'compact') {
    const statusIcon = {
      going: <Check className="h-3 w-3" />,
      interested: <Clock className="h-3 w-3" />,
      not_going: <X className="h-3 w-3" />
    };

    const statusColors = {
      going: 'bg-green-100 text-green-700 border-green-200',
      interested: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      not_going: 'bg-red-100 text-red-700 border-red-200'
    };

    if (currentStatus) {
      return (
        <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full border text-xs', statusColors[currentStatus as keyof typeof statusColors])}>
          {statusIcon[currentStatus as keyof typeof statusIcon]}
          <span className="capitalize">{currentStatus.replace('_', ' ')}</span>
        </div>
      );
    }

    return null;
  }

  const getButtonVariant = (status: string) => {
    if (currentStatus === status) {
      return status === 'going' ? 'default' : 'secondary';
    }
    return 'outline';
  };

  const getButtonText = (status: string) => {
    if (currentStatus === status) {
      switch (status) {
        case 'going': return '✓ Going';
        case 'interested': return '★ Interested';
        case 'not_going': return '✗ Not Going';
      }
    }
    
    switch (status) {
      case 'going': return 'Going';
      case 'interested': return 'Interested';
      case 'not_going': return 'Not Going';
      default: return status;
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex gap-2">
        <Button
          onClick={() => handleRSVP('going')}
          disabled={isLoading}
          variant={getButtonVariant('going')}
          className="flex-1"
        >
          {getButtonText('going')}
        </Button>
        <Button
          onClick={() => handleRSVP('interested')}
          disabled={isLoading}
          variant={getButtonVariant('interested')}
          className="flex-1"
        >
          {getButtonText('interested')}
        </Button>
        <Button
          onClick={() => handleRSVP('not_going')}
          disabled={isLoading}
          variant={getButtonVariant('not_going')}
          className="flex-1"
        >
          {getButtonText('not_going')}
        </Button>
      </div>
      
      {currentStatus === 'going' && (
        <Button
          onClick={handleAddToCalendar}
          variant="outline"
          className="w-full"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Add to Calendar
        </Button>
      )}
      
      <p className="text-sm text-muted-foreground text-center">
        {attendeeCount} {attendeeCount === 1 ? 'person' : 'people'} attending
      </p>
    </div>
  );
};
