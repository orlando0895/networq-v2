-- Add privacy settings to user_contact_cards table
ALTER TABLE public.user_contact_cards 
ADD COLUMN public_visibility JSONB DEFAULT '{
  "name": true,
  "email": true,
  "phone": true,
  "company": true,
  "industry": true,
  "services": true,
  "linkedin": true,
  "facebook": true,
  "whatsapp": true,
  "websites": true,
  "notes": false
}'::jsonb;

-- Add custom username for pretty URLs
ALTER TABLE public.user_contact_cards 
ADD COLUMN username TEXT UNIQUE;

-- Create index for username lookups
CREATE INDEX idx_user_contact_cards_username ON public.user_contact_cards(username) WHERE username IS NOT NULL;

-- Add function to generate usernames automatically
CREATE OR REPLACE FUNCTION public.generate_username_from_name(_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 1;
BEGIN
  -- Create base username from name (lowercase, replace spaces with hyphens, remove special chars)
  base_username := lower(regexp_replace(regexp_replace(_name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'));
  
  -- Ensure it's not empty
  IF base_username = '' THEN
    base_username := 'user';
  END IF;
  
  -- Check if username exists, if so append number
  final_username := base_username;
  
  WHILE EXISTS (SELECT 1 FROM public.user_contact_cards WHERE username = final_username) LOOP
    final_username := base_username || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_username;
END;
$$ LANGUAGE plpgsql;