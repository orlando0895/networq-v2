
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RSVPConfirmationData {
  attendeeName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  locationName: string;
  address?: string;
  organizerName: string;
}

interface EventReminderData {
  attendeeName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  locationName: string;
  address?: string;
  timeUntilEvent: string;
}

interface EventUpdateData {
  attendeeName: string;
  eventTitle: string;
  organizerName: string;
  updateTitle: string;
  updateContent: string;
  eventDate: string;
}

export const useEventNotifications = () => {
  const { toast } = useToast();

  const sendRSVPConfirmation = async (to: string, data: RSVPConfirmationData) => {
    try {
      console.log('Sending RSVP confirmation email to:', to);
      const { error } = await supabase.functions.invoke('send-event-notifications', {
        body: {
          type: 'rsvp_confirmation',
          to,
          ...data
        }
      });

      if (error) throw error;
      console.log('RSVP confirmation email sent successfully');
    } catch (error) {
      console.error('Error sending RSVP confirmation:', error);
      toast({
        title: "Email Error",
        description: "Failed to send confirmation email",
        variant: "destructive"
      });
    }
  };

  const sendEventReminder = async (to: string, data: EventReminderData) => {
    try {
      console.log('Sending event reminder email to:', to);
      const { error } = await supabase.functions.invoke('send-event-notifications', {
        body: {
          type: 'event_reminder',
          to,
          ...data
        }
      });

      if (error) throw error;
      console.log('Event reminder email sent successfully');
    } catch (error) {
      console.error('Error sending event reminder:', error);
      toast({
        title: "Email Error",
        description: "Failed to send reminder email",
        variant: "destructive"
      });
    }
  };

  const sendEventUpdate = async (to: string, data: EventUpdateData) => {
    try {
      console.log('Sending event update email to:', to);
      const { error } = await supabase.functions.invoke('send-event-notifications', {
        body: {
          type: 'event_update',
          to,
          ...data
        }
      });

      if (error) throw error;
      console.log('Event update email sent successfully');
    } catch (error) {
      console.error('Error sending event update:', error);
      toast({
        title: "Email Error",
        description: "Failed to send update email",
        variant: "destructive"
      });
    }
  };

  const generateCalendarFile = async (eventData: {
    title: string;
    description: string;
    startDate: string;
    endDate?: string;
    location: string;
    organizerName: string;
    organizerEmail?: string;
  }) => {
    try {
      console.log('Generating calendar file for event:', eventData.title);
      const response = await supabase.functions.invoke('generate-calendar-file', {
        body: eventData
      });

      if (response.error) throw response.error;
      
      // Create download link
      const blob = new Blob([response.data], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${eventData.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Calendar file downloaded successfully');
    } catch (error) {
      console.error('Error generating calendar file:', error);
      toast({
        title: "Calendar Error",
        description: "Failed to generate calendar file",
        variant: "destructive"
      });
    }
  };

  return {
    sendRSVPConfirmation,
    sendEventReminder,
    sendEventUpdate,
    generateCalendarFile
  };
};
