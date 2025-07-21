-- Update RLS policies for user_contact_cards to allow public access to active cards
-- First, drop the existing public policy if it exists
DROP POLICY IF EXISTS "Public can view active contact cards by share code" ON public.user_contact_cards;

-- Create a comprehensive public policy that allows viewing active cards by share_code OR username
CREATE POLICY "Public can view active contact cards" 
ON public.user_contact_cards 
FOR SELECT 
USING (is_active = true);

-- Ensure the policy allows access to anyone (not just authenticated users)
-- This replaces the more restrictive policy that might be blocking public access