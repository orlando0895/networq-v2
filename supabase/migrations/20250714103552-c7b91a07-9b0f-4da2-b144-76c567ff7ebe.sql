-- Update RLS policy to allow public access to active contact cards
DROP POLICY IF EXISTS "Anyone can view contact cards by share code" ON public.user_contact_cards;

CREATE POLICY "Public can view active contact cards by share code" 
ON public.user_contact_cards 
FOR SELECT 
TO public
USING (is_active = true);