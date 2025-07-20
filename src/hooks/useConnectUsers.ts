import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useConnectUsers = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const connectUsers = async (shareCode: string) => {
    console.log('🚀 CONNECT USERS: Starting process');
    console.log('🔍 Share code:', shareCode);
    console.log('👤 Current user:', user?.id);
    
    if (!user) {
      console.error('❌ No authenticated user');
      toast({
        title: "Authentication Error",
        description: "You must be logged in to add contacts.",
        variant: "destructive"
      });
      return { success: false };
    }

    if (!shareCode || shareCode.length !== 8) {
      console.error('❌ Invalid share code');
      toast({
        title: "Invalid Share Code",
        description: "Please enter a valid 8-character share code.",
        variant: "destructive"
      });
      return { success: false };
    }

    try {
      console.log('📡 Calling connect-users function...');
      console.log('🌐 Function details:', { shareCode: shareCode.trim(), currentUserId: user.id });
      
      const { data, error } = await supabase.functions.invoke('connect-users', {
        body: {
          shareCode: shareCode.trim(),
          currentUserId: user.id
        }
      });

      console.log('📥 Function response:', { data, error });

      if (error) {
        console.error('❌ Function error:', error);
        toast({
          title: "Connection Failed",
          description: "Unable to connect with the user. Please try again.",
          variant: "destructive"
        });
        return { success: false };
      }

      if (data?.success) {
        console.log('✅ Users connected successfully!');
        toast({
          title: "Contact Added! 🎉",
          description: `You and ${data.targetUser?.name || 'the user'} are now connected!`
        });
        return { success: true, targetUser: data.targetUser };
      } else {
        console.error('❌ Function returned error:', data?.error);
        toast({
          title: "Connection Failed",
          description: data?.error || "Unable to connect with the user.",
          variant: "destructive"
        });
        return { success: false };
      }

    } catch (error: any) {
      console.error('💥 Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  return {
    connectUsers
  };
};