
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type UserContactCard = Database['public']['Tables']['user_contact_cards']['Row'];
type UserContactCardInsert = Database['public']['Tables']['user_contact_cards']['Insert'];
type UserContactCardUpdate = Database['public']['Tables']['user_contact_cards']['Update'];

export const useUserContactCard = () => {
  const [contactCard, setContactCard] = useState<UserContactCard | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchContactCard = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_contact_cards')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setContactCard(data);
    } catch (error: any) {
      console.error('Error fetching contact card:', error);
      toast({
        title: "Error",
        description: "Failed to load your contact card.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createContactCard = async (cardData: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    industry?: string;
    services: string[];
    notes?: string;
    linkedin?: string;
    facebook?: string;
    whatsapp?: string;
    websites: string[];
    company_logo_url?: string;
    avatar_url?: string;
  }) => {
    if (!user) return { success: false };

    try {
      const newCard: UserContactCardInsert = {
        ...cardData,
        user_id: user.id,
        linkedin: cardData.linkedin || null,
        facebook: cardData.facebook || null,
        whatsapp: cardData.whatsapp || null,
        websites: cardData.websites.length > 0 ? cardData.websites : null,
        services: cardData.services.length > 0 ? cardData.services : null
      };

      const { data, error } = await supabase
        .from('user_contact_cards')
        .insert([newCard])
        .select()
        .single();

      if (error) throw error;

      setContactCard(data);
      toast({
        title: "Contact Card Created! 🎉",
        description: "Your contact card is ready to share."
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating contact card:', error);
      toast({
        title: "Error",
        description: "Failed to create contact card.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const updateContactCard = async (updates: UserContactCardUpdate) => {
    if (!user || !contactCard) return { success: false };

    try {
      const { data, error } = await supabase
        .from('user_contact_cards')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', contactCard.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setContactCard(data);
      toast({
        title: "Contact Card Updated",
        description: "Your contact card has been updated."
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating contact card:', error);
      toast({
        title: "Error",
        description: "Failed to update contact card.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const regenerateShareCode = async () => {
    if (!user || !contactCard) return { success: false };

    try {
      console.log('🔄 Regenerating share code for card:', contactCard.id);
      
      const { data, error } = await supabase.rpc('regenerate_share_code', {
        card_id: contactCard.id
      });

      if (error) throw error;

      console.log('✅ New share code generated:', data);

      // Refresh the contact card to get the new share code
      await fetchContactCard();

      toast({
        title: "Share Code Updated",
        description: `Your new share code: ${data}`
      });

      return { success: true, shareCode: data };
    } catch (error: any) {
      console.error('❌ Error regenerating share code:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate share code.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const fetchContactCardByShareCode = async (shareCode: string) => {
    try {
      const { data, error } = await supabase
        .from('user_contact_cards')
        .select('*')
        .eq('share_code', shareCode)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Invalid Code",
          description: "No contact card found with this share code.",
          variant: "destructive"
        });
        return { success: false };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error fetching contact card by share code:', error);
      toast({
        title: "Error",
        description: "Failed to load contact card.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  useEffect(() => {
    fetchContactCard();
  }, [user]);

  return {
    contactCard,
    loading,
    createContactCard,
    updateContactCard,
    regenerateShareCode,
    fetchContactCardByShareCode,
    refetch: fetchContactCard
  };
};
