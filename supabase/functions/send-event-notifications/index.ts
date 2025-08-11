
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { RSVPConfirmationEmail } from "./_templates/rsvp-confirmation.tsx";
import { EventReminderEmail } from "./_templates/event-reminder.tsx";
import { EventUpdateEmail } from "./_templates/event-update.tsx";

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RSVPConfirmationData {
  type: 'rsvp_confirmation';
  to: string;
  attendeeName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  locationName: string;
  address?: string;
  organizerName: string;
  calendarUrl?: string;
}

interface EventReminderData {
  type: 'event_reminder';
  to: string;
  attendeeName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  locationName: string;
  address?: string;
  timeUntilEvent: string;
  calendarUrl?: string;
}

interface EventUpdateData {
  type: 'event_update';
  to: string;
  attendeeName: string;
  eventTitle: string;
  organizerName: string;
  updateTitle: string;
  updateContent: string;
  eventDate: string;
}

type EmailData = RSVPConfirmationData | EventReminderData | EventUpdateData;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing email request...');
    const emailData: EmailData = await req.json();
    console.log('Email type:', emailData.type);

    let html: string;
    let subject: string;

    switch (emailData.type) {
      case 'rsvp_confirmation':
        html = await renderAsync(
          React.createElement(RSVPConfirmationEmail, {
            attendeeName: emailData.attendeeName,
            eventTitle: emailData.eventTitle,
            eventDate: emailData.eventDate,
            eventTime: emailData.eventTime,
            locationName: emailData.locationName,
            address: emailData.address,
            organizerName: emailData.organizerName,
            calendarUrl: emailData.calendarUrl,
          })
        );
        subject = `RSVP Confirmed: ${emailData.eventTitle}`;
        break;

      case 'event_reminder':
        html = await renderAsync(
          React.createElement(EventReminderEmail, {
            attendeeName: emailData.attendeeName,
            eventTitle: emailData.eventTitle,
            eventDate: emailData.eventDate,
            eventTime: emailData.eventTime,
            locationName: emailData.locationName,
            address: emailData.address,
            timeUntilEvent: emailData.timeUntilEvent,
            calendarUrl: emailData.calendarUrl,
          })
        );
        subject = `Reminder: ${emailData.eventTitle} is ${emailData.timeUntilEvent}`;
        break;

      case 'event_update':
        html = await renderAsync(
          React.createElement(EventUpdateEmail, {
            attendeeName: emailData.attendeeName,
            eventTitle: emailData.eventTitle,
            organizerName: emailData.organizerName,
            updateTitle: emailData.updateTitle,
            updateContent: emailData.updateContent,
            eventDate: emailData.eventDate,
          })
        );
        subject = `Update: ${emailData.eventTitle} - ${emailData.updateTitle}`;
        break;

      default:
        throw new Error('Invalid email type');
    }

    console.log('Sending email with subject:', subject);
    const { error } = await resend.emails.send({
      from: 'Networq Events <events@networq.app>',
      to: [emailData.to],
      subject,
      html,
    });

    if (error) {
      console.error('Email sending error:', error);
      throw error;
    }

    console.log('Email sent successfully');
    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in send-event-notifications function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);
