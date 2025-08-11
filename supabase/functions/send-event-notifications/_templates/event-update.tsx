
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface EventUpdateEmailProps {
  attendeeName: string;
  eventTitle: string;
  organizerName: string;
  updateTitle: string;
  updateContent: string;
  eventDate: string;
}

export const EventUpdateEmail = ({
  attendeeName,
  eventTitle,
  organizerName,
  updateTitle,
  updateContent,
  eventDate,
}: EventUpdateEmailProps) => (
  <Html>
    <Head />
    <Preview>Update for {eventTitle}: {updateTitle}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>📢 Event Update</Heading>
        
        <Text style={text}>
          Hi {attendeeName},
        </Text>
        
        <Text style={text}>
          {organizerName} has posted an update for <strong>{eventTitle}</strong> (scheduled for {eventDate}).
        </Text>
        
        <Section style={updateBox}>
          <Heading style={h2}>{updateTitle}</Heading>
          <Text style={updateContent}>{updateContent}</Text>
        </Section>
        
        <Text style={text}>
          If you have any questions about this update, please reach out to the event organizer.
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

const updateBox = {
  backgroundColor: '#f0f8ff',
  border: '1px solid #b3d9ff',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
};

const updateContent = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '12px 0',
  whiteSpace: 'pre-wrap' as const,
};

const footer = {
  color: '#898989',
  fontSize: '12px',
  marginTop: '40px',
};
