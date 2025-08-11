
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalendarEventData {
  title: string;
  description: string;
  startDate: string; // ISO format
  endDate?: string; // ISO format
  location: string;
  organizerName: string;
  organizerEmail?: string;
}

const formatDateForICS = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

const generateICSContent = (eventData: CalendarEventData): string => {
  const startDate = formatDateForICS(eventData.startDate);
  const endDate = eventData.endDate 
    ? formatDateForICS(eventData.endDate)
    : formatDateForICS(new Date(new Date(eventData.startDate).getTime() + 2 * 60 * 60 * 1000).toISOString()); // Default 2 hours
  
  const uid = `${Date.now()}@networq.app`;
  const timestamp = formatDateForICS(new Date().toISOString());
  
  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Networq//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${timestamp}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${eventData.title}`,
    `DESCRIPTION:${eventData.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${eventData.location}`,
    `ORGANIZER;CN=${eventData.organizerName}${eventData.organizerEmail ? `:MAILTO:${eventData.organizerEmail}` : ''}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ];
  
  return icsLines.join('\r\n');
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating calendar file...');
    const eventData: CalendarEventData = await req.json();
    
    const icsContent = generateICSContent(eventData);
    console.log('Calendar file generated successfully');
    
    return new Response(icsContent, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${eventData.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics"`,
      },
    });

  } catch (error: any) {
    console.error('Error generating calendar file:', error);
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
