import ContactCardPixelPerfect from './ContactCardPixelPerfect';
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];

interface ContactCardProps {
  contact: Contact;
  onUpdateContact: (id: string, updates: Partial<Contact>) => Promise<any>;
  onDeleteContact: (id: string) => Promise<any>;
}

const ContactCard = ({ contact, onUpdateContact, onDeleteContact }: ContactCardProps) => {
  return (
    <ContactCardPixelPerfect 
      contact={contact}
      onUpdateContact={onUpdateContact}
      onDeleteContact={onDeleteContact}
    />
  );
};

export default ContactCard;