-- Fix the founder profile email and ensure triggers are created properly
-- Update the founder profile to use the correct email that matches the trigger function
UPDATE public.profiles 
SET email = 'orlando@networq.app' 
WHERE id = '062c08ce-0c92-4cd7-b969-670e2551f8cf';

-- Drop any existing triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_contact_card_created ON public.user_contact_cards;

-- Create the triggers with proper error handling
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_contact_card_created
  AFTER INSERT ON public.user_contact_cards
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_contact_card();