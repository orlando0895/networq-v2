import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type UserContactCard = Database['public']['Tables']['user_contact_cards']['Row'];

export const useMutualContacts = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const addMutualContact = async (otherUserContactCard: UserContactCard) => {
    console.log('🚀 addMutualContact called with:', otherUserContactCard);
    
    if (!user) {
      console.log('❌ No authenticated user');
      return { success: false };
    }

    try {
      console.log('=== STARTING MUTUAL CONTACT ADDITION ===');
      console.log('Current user ID:', user.id);
      console.log('Other user card:', otherUserContactCard);

      // Step 1: Get my contact card
      console.log('Step 1: Getting my contact card...');
      const { data: myContactCard, error: myCardError } = await supabase
        .from('user_contact_cards')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (myCardError) {
        console.error('Error fetching my contact card:', myCardError);
        return { success: false };
      }

      if (!myContactCard) {
        console.log('No active contact card found for current user');
        toast({
          title: "Setup Required",
          description: "Please create your contact card first.",
          variant: "destructive"
        });
        return { success: false };
      }

      console.log('My contact card:', myContactCard);

      // Step 2: Add their info to my contacts
      console.log('Step 2: Adding their contact to my list...');
      const { error: addToMyListError } = await supabase
        .from('contacts')
        .insert([{
          user_id: user.id,
          name: otherUserContactCard.name,
          email: otherUserContactCard.email,
          phone: otherUserContactCard.phone,
          company: otherUserContactCard.company,
          industry: otherUserContactCard.industry,
          services: otherUserContactCard.services,
          tier: 'Acquaintance',
          notes: 'Added via share code',
          linkedin: otherUserContactCard.linkedin,
          facebook: otherUserContactCard.facebook,
          whatsapp: otherUserContactCard.whatsapp,
          websites: otherUserContactCard.websites,
          added_date: new Date().toISOString().split('T')[0],
          added_via: 'share_code'
        }]);

      if (addToMyListError) {
        console.error('Error adding to my contacts:', addToMyListError);
        if (addToMyListError.code === '23505') {
          // Duplicate entry - contact already exists
          console.log('Contact already exists in my list');
        } else {
          return { success: false };
        }
      } else {
        console.log('Successfully added to my contacts');
      }

      // Step 3: Add my info to their contacts using the database function
      console.log('Step 3: Adding my contact to their list...');
      const { data: mutualSuccess, error: mutualError } = await supabase.rpc('add_mutual_contact', {
        target_user_id: otherUserContactCard.user_id,
        contact_name: myContactCard.name,
        contact_email: myContactCard.email,
        contact_phone: myContactCard.phone,
        contact_company: myContactCard.company,
        contact_industry: myContactCard.industry,
        contact_services: myContactCard.services,
        contact_tier: 'Acquaintance',
        contact_notes: 'Added via mutual contact',
        contact_linkedin: myContactCard.linkedin,
        contact_facebook: myContactCard.facebook,
        contact_whatsapp: myContactCard.whatsapp,
        contact_websites: myContactCard.websites,
      });

      if (mutualError) {
        console.error('Error in mutual contact addition:', mutualError);
      } else if (mutualSuccess) {
        console.log('Mutual contact added successfully');
      } else {
        console.log('Mutual contact addition failed (function returned false)');
      }

      console.log('=== MUTUAL CONTACT ADDITION COMPLETE ===');

      toast({
        title: "Contact Added! 🎉",
        description: `${otherUserContactCard.name} has been added to your network.`
      });

      return { success: true };

    } catch (error: any) {
      console.error('Error in mutual contact process:', error);
      toast({
        title: "Error",
        description: "Failed to add contact.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  return {
    addMutualContact
  };
};