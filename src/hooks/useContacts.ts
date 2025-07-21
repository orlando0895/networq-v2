import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMutualContacts } from '@/hooks/useMutualContacts';
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];
type ContactInsert = Database['public']['Tables']['contacts']['Insert'];

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { addMutualContact } = useMutualContacts();

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
    added_via?: string;
    shareCode?: string; // Add optional share code parameter
  }) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      // First, add the contact to current user's list
      const newContact: ContactInsert = {
        ...contactData,
        user_id: user.id,
        added_date: new Date().toISOString().split('T')[0],
        linkedin: contactData.linkedin || null,
        facebook: contactData.facebook || null,
        whatsapp: contactData.whatsapp || null,
        websites: contactData.websites.length > 0 ? contactData.websites : null,
        added_via: contactData.added_via || 'mutual_contact'
      };

      const { data, error } = await supabase
        .from('contacts')
        .insert([newContact])
        .select()
        .single();

      if (error) throw error;

      setContacts(prev => [data, ...prev]);

      // Check if the contact is also a user in the system
      let contactProfile = null;
      
      if (contactData.shareCode) {
        // If we have a share code, use it to find the user (more reliable)
        const { data: contactCard, error: cardError } = await supabase
          .from('user_contact_cards')
          .select('user_id')
          .eq('share_code', contactData.shareCode)
          .eq('is_active', true)
          .maybeSingle();
          
        if (contactCard && !cardError) {
          contactProfile = { id: contactCard.user_id };
        }
      } else {
        // Fallback to email lookup if no share code provided
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', contactData.email)
          .maybeSingle();
          
        if (profile && !profileError) {
          contactProfile = profile;
        }
      }

      let isMutualConnection = false;

      if (contactProfile) {
        // Get the contact's card to use for mutual addition
        const { data: otherUserCard, error: cardError } = await supabase
          .from('user_contact_cards')
          .select('*')
          .eq('user_id', contactProfile.id)
          .eq('is_active', true)
          .single();

        if (otherUserCard && !cardError) {
          // Use the mutual contacts hook with elevated privileges
          const mutualResult = await addMutualContact(otherUserCard);
          if (mutualResult.success) {
            isMutualConnection = true;
          }
        }
      }

      toast({
        title: "Contact Added! 🎉",
        description: isMutualConnection 
          ? `You and ${contactData.name} are now connected!`
          : `${contactData.name} has been added to your network.`
      });

      return { success: true, isMutual: isMutualConnection };
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
      // Use the mutual deletion function with elevated privileges
      const { data: success, error } = await supabase
        .rpc('delete_mutual_contact', {
          contact_id_to_delete: id,
          current_user_id: user.id
        });

      if (error) throw error;
      
      if (!success) {
        throw new Error('Failed to delete contact - contact may not exist');
      }

      setContacts(prev => prev.filter(contact => contact.id !== id));
      toast({
        title: "Contact Deleted",
        description: "Contact has been mutually removed from both networks."
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
