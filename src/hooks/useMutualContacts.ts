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
    console.log('🔍 Current user:', user);
    
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

      console.log('Step 3: Calling edge function for mutual contact addition...');
      console.log('Payload to edge function:', { otherUserContactCard });
      
      const { data: edgeFunctionResult, error: edgeFunctionError } = await supabase.functions.invoke(
        'add-mutual-contact',
        {
          body: { otherUserContactCard }
        }
      );

      console.log('Edge function result:', { edgeFunctionResult, edgeFunctionError });

      if (edgeFunctionError) {
        console.error('❌ Error in edge function:', edgeFunctionError);
        toast({
          title: "Partial Success",
          description: "Contact added to your list, but couldn't add you to theirs.",
          variant: "destructive"
        });
      } else if (edgeFunctionResult?.success) {
        console.log('✅ Mutual contact added successfully via edge function');
        if (edgeFunctionResult.partial) {
          toast({
            title: "Partial Success",
            description: edgeFunctionResult.message,
            variant: "destructive"
          });
        }
      } else {
        console.log('⚠️ Edge function returned unsuccessful result');
        toast({
          title: "Partial Success", 
          description: "Contact added to your list, but couldn't add you to theirs.",
          variant: "destructive"
        });
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