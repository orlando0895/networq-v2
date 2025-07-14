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

  const addMutualContact = async (contactEmail: string, myContactCard: any) => {
    try {
      console.log('Starting mutual contact addition for:', contactEmail);
      console.log('My contact card:', myContactCard);
      
      // Find the user by email
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', contactEmail)
        .maybeSingle();

      console.log('Profile lookup result:', { profiles, profileError });

      if (profileError) {
        console.error('Error finding user profile:', profileError);
        return;
      }

      if (!profiles || !profiles.id) {
        console.log('User not found in profiles, they may not have signed up yet');
        return;
      }

      // Check if I'm already in their contacts to prevent duplicates
      const { data: existingContact, error: checkError } = await supabase
        .from('contacts')
        .select('id')
        .eq('user_id', profiles.id)
        .eq('email', myContactCard.email)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing contact:', checkError);
        return;
      }

      if (existingContact) {
        console.log('Mutual contact already exists, skipping addition');
        return;
      }

      // Add my contact card to their contacts
      const mutualContact: ContactInsert = {
        user_id: profiles.id,
        name: myContactCard.name,
        email: myContactCard.email,
        phone: myContactCard.phone || null,
        company: myContactCard.company || null,
        industry: myContactCard.industry || null,
        services: myContactCard.services || null,
        tier: 'Acquaintance',
        notes: 'Added automatically through mutual contact addition',
        linkedin: myContactCard.linkedin || null,
        facebook: myContactCard.facebook || null,
        whatsapp: myContactCard.whatsapp || null,
        websites: myContactCard.websites || null,
        added_date: new Date().toISOString().split('T')[0]
      };

      const { error: insertError } = await supabase
        .from('contacts')
        .insert([mutualContact]);

      if (insertError) {
        console.error('Error adding mutual contact:', insertError);
      } else {
        console.log('Successfully added mutual contact');
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
        websites: contactData.websites.length > 0 ? contactData.websites : null
      };

      const { data, error } = await supabase
        .from('contacts')
        .insert([newContact])
        .select()
        .single();

      if (error) throw error;

      setContacts(prev => [data, ...prev]);

      // Try to add mutual contact - fetch my contact card first
      try {
        const { data: myContactCard, error: cardError } = await supabase
          .from('user_contact_cards')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (!cardError && myContactCard) {
          await addMutualContact(contactData.email, myContactCard);
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
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setContacts(prev => prev.filter(contact => contact.id !== id));
      toast({
        title: "Contact Deleted",
        description: "Contact has been removed from your network."
      });

      return { success: true };
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
