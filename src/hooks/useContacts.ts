import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];
type ContactInsert = Database['public']['Tables']['contacts']['Insert'];

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchContacts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load contacts.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addMutualContact = async (contactUserId: string, myContactCard: any) => {
    try {
      console.log('Starting mutual contact addition for user ID:', contactUserId);
      console.log('My contact card:', myContactCard);

      if (!contactUserId) {
        console.log('No user ID provided for mutual contact');
        return;
      }

      // Use the database function to add mutual contact (bypasses RLS)
      const { data: success, error } = await supabase.rpc('add_mutual_contact', {
        target_user_id: contactUserId,
        contact_name: myContactCard.name,
        contact_email: myContactCard.email,
        contact_phone: myContactCard.phone || null,
        contact_company: myContactCard.company || null,
        contact_industry: myContactCard.industry || null,
        contact_services: myContactCard.services || null,
        contact_tier: 'Acquaintance',
        contact_notes: 'Added through mutual contact',
        contact_linkedin: myContactCard.linkedin || null,
        contact_facebook: myContactCard.facebook || null,
        contact_whatsapp: myContactCard.whatsapp || null,
        contact_websites: myContactCard.websites || null,
      });

      if (error) {
        console.error('Error adding mutual contact:', error);
      } else if (success) {
        console.log('Mutual contact added successfully');
      } else {
        console.log('Mutual contact addition failed');
      }
    } catch (error: any) {
      console.error('Error in mutual contact addition:', error);
    }
  };

  const addContact = async (contactData: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    industry?: string;
    services: string[];
    tier: 'A-player' | 'Acquaintance';
    notes?: string;
    linkedin?: string;
    facebook?: string;
    whatsapp?: string;
    websites: string[];
    user_id?: string; // Optional for mutual contact addition
    added_via?: string; // Track how contact was added
  }) => {
    if (!user) return;

    try {
      const newContact: ContactInsert = {
        ...contactData,
        user_id: user.id,
        added_date: new Date().toISOString().split('T')[0],
        linkedin: contactData.linkedin || null,
        facebook: contactData.facebook || null,
        whatsapp: contactData.whatsapp || null,
        websites: contactData.websites.length > 0 ? contactData.websites : null,
        added_via: contactData.added_via || 'manual'
      };

      const { data, error } = await supabase
        .from('contacts')
        .insert([newContact])
        .select()
        .single();

      if (error) throw error;

      setContacts(prev => [data, ...prev]);

      // Try to add mutual contact - fetch my contact card first
      console.log('Attempting mutual contact addition for user_id:', contactData.user_id);
      try {
        const { data: myContactCard, error: cardError } = await supabase
          .from('user_contact_cards')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        console.log('My contact card:', myContactCard);
        console.log('Card fetch error:', cardError);

        if (!cardError && myContactCard && contactData.user_id) {
          console.log('Calling addMutualContact...');
          await addMutualContact(contactData.user_id, myContactCard);
        } else {
          console.log('Skipping mutual contact addition:', { 
            hasCard: !!myContactCard, 
            hasUserId: !!contactData.user_id,
            cardError 
          });
        }
      } catch (mutualError) {
        console.error('Error adding mutual contact:', mutualError);
        // Don't fail the main contact addition if mutual addition fails
      }

      toast({
        title: "Contact Added! 🎉",
        description: `${contactData.name} has been added to your network.`
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error adding contact:', error);
      toast({
        title: "Error",
        description: "Failed to add contact.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('contacts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setContacts(prev => prev.map(contact => 
        contact.id === id ? data : contact
      ));

      toast({
        title: "Contact Updated",
        description: "Contact information has been updated."
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error updating contact:', error);
      toast({
        title: "Error",
        description: "Failed to update contact.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const deleteContact = async (id: string) => {
    if (!user) return;

    try {
      // Use the mutual delete function instead of direct deletion
      const { data: success, error } = await supabase.rpc('delete_mutual_contact', {
        contact_id_to_delete: id,
        current_user_id: user.id
      });

      if (error) throw error;

      if (success) {
        setContacts(prev => prev.filter(contact => contact.id !== id));
        toast({
          title: "Contact Deleted",
          description: "Contact has been removed from both networks."
        });
        return { success: true };
      } else {
        throw new Error('Contact deletion failed');
      }
    } catch (error: any) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [user]);

  return {
    contacts,
    loading,
    addContact,
    updateContact,
    deleteContact,
    refetch: fetchContacts
  };
};
