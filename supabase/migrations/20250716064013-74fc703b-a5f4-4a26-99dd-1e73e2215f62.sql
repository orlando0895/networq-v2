-- Fix: Create the founder profile if it doesn't exist
-- We need the founder profile to exist for the auto-contact feature to work

-- First, let's ensure the founder profile exists
INSERT INTO public.profiles (id, email, full_name)
SELECT 
  '062c08ce-0c92-4cd7-b969-670e2551f8cf'::uuid,
  'orlando@networq.app',
  'Orlando Taylor'
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE id = '062c08ce-0c92-4cd7-b969-670e2551f8cf'::uuid
);

-- Also create the triggers that are missing (they might not have been created properly)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_contact_card_created ON public.user_contact_cards;

-- Create the triggers again
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_contact_card_created
  AFTER INSERT ON public.user_contact_cards
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_contact_card();