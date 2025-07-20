import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type UserContactCard = Database['public']['Tables']['user_contact_cards']['Row'];

export const useMutualContacts = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const addMutualContact = async (otherUserContactCard: UserContactCard) => {
    console.log('🚀 MUTUAL CONTACT: Starting process');
    console.log('🔍 Current user:', user?.id);
    console.log('🎯 Target user card:', otherUserContactCard);
    
    if (!user) {
      console.error('❌ No authenticated user');
      toast({
        title: "Authentication Error",
        description: "You must be logged in to add contacts.",
        variant: "destructive"
      });
      return { success: false };
    }

    try {
      // Step 1: Verify my contact card exists
      console.log('📋 Step 1: Checking my contact card...');
      const { data: myContactCard, error: myCardError } = await supabase
        .from('user_contact_cards')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (myCardError) {
        console.error('❌ Error fetching my contact card:', myCardError);
        toast({
          title: "Error",
          description: "Failed to fetch your contact card.",
          variant: "destructive"
        });
        return { success: false };
      }

      if (!myContactCard) {
        console.error('❌ No active contact card found');
        toast({
          title: "Setup Required",
          description: "Please create your contact card first.",
          variant: "destructive"
        });
        return { success: false };
      }

      console.log('✅ My contact card found:', myContactCard.name);

      // Step 2: Add their contact to my list (normal RLS allows this)
      console.log('📝 Step 2: Adding their contact to my list...');
      const { error: addToMyListError } = await supabase
        .from('contacts')
        .insert({
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
        });

      if (addToMyListError) {
        if (addToMyListError.code === '23505') {
          console.log('ℹ️ Contact already exists in my list');
        } else {
          console.error('❌ Error adding to my contacts:', addToMyListError);
          toast({
            title: "Error",
            description: "Failed to add contact to your list.",
            variant: "destructive"
          });
          return { success: false };
        }
      } else {
        console.log('✅ Successfully added to my contacts');
      }

      // Step 3: Use edge function to add me to their contacts (bypasses RLS)
      console.log('🚀 Step 3: Calling edge function for mutual addition...');
      console.log('📤 Payload:', { otherUserContactCard });
      
      const { data: edgeFunctionResult, error: edgeFunctionError } = await supabase.functions.invoke(
        'add-mutual-contact',
        {
          body: { otherUserContactCard }
        }
      );

      console.log('📥 Edge function response:', { edgeFunctionResult, edgeFunctionError });

      // Handle edge function results
      if (edgeFunctionError) {
        console.error('❌ Edge function error:', edgeFunctionError);
        toast({
          title: "Partial Success",
          description: "Contact added to your list, but couldn't add you to theirs. They may need to add you manually.",
          variant: "destructive"
        });
      } else if (edgeFunctionResult?.success) {
        if (edgeFunctionResult.partial) {
          console.log('⚠️ Partial success');
          toast({
            title: "Partial Success",
            description: edgeFunctionResult.message || "Contact added to your list, but mutual addition had issues.",
            variant: "destructive"
          });
        } else {
          console.log('✅ Complete mutual contact success!');
          toast({
            title: "Contact Added! 🎉",
            description: `${otherUserContactCard.name} has been added to your network, and you've been added to theirs!`
          });
        }
      } else {
        console.log('⚠️ Edge function returned unsuccessful result');
        toast({
          title: "Partial Success",
          description: "Contact added to your list, but couldn't add you to theirs. They may need to add you manually.",
          variant: "destructive"
        });
      }

      console.log('🏁 MUTUAL CONTACT: Process completed');
      return { success: true };

    } catch (error: any) {
      console.error('💥 MUTUAL CONTACT: Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while adding the contact.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  return {
    addMutualContact
  };
};