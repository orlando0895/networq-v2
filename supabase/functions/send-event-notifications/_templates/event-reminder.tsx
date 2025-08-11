
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Button,
  Section,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface EventReminderEmailProps {
  attendeeName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  locationName: string;
  address?: string;
  timeUntilEvent: string;
  calendarUrl?: string;
}

export const EventReminderEmail = ({
  attendeeName,
  eventTitle,
  eventDate,
  eventTime,
  locationName,
  address,
  timeUntilEvent,
  calendarUrl,
}: EventReminderEmailProps) => (
  <Html>
    <Head />
    <Preview>Reminder: {eventTitle} is {timeUntilEvent}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>⏰ Event Reminder</Heading>
        
        <Text style={text}>
          Hi {attendeeName},
        </Text>
        
        <Text style={text}>
          This is a friendly reminder that <strong>{eventTitle}</strong> is {timeUntilEvent}!
        </Text>
        
        <Section style={eventDetailsBox}>
          <Heading style={h2}>Event Details</Heading>
          <Text style={eventDetail}>
            <strong>📅 Date:</strong> {eventDate}
          </Text>
          <Text style={eventDetail}>
            <strong>🕐 Time:</strong> {eventTime}
          </Text>
          <Text style={eventDetail}>
            <strong>📍 Location:</strong> {locationName}
          </Text>
          {address && (
            <Text style={eventDetail}>
              <strong>🏢 Address:</strong> {address}
            </Text>
          )}
        </Section>
        
        {calendarUrl && (
          <Section style={buttonSection}>
            <Button href={calendarUrl} style={button}>
              📅 Add to Calendar
            </Button>
          </Section>
        )}
        
        <Text style={text}>
          Don't forget to bring your business cards for networking! See you there.
        </Text>
        
        <Text style={footer}>
          Best regards,<br />
          The Networq Team
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
};

const h2 = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '20px 0 10px 0',
};

const text = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
};

const eventDetailsBox = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
};

const eventDetail = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#007ee6',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '14px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const footer = {
  color: '#898989',
  fontSize: '12px',
  marginTop: '40px',
};
