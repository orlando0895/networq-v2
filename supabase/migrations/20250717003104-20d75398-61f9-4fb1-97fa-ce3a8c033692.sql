-- Fix the handle_new_contact_card function to set proper added_via values
CREATE OR REPLACE FUNCTION public.handle_new_contact_card()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  founder_email TEXT := 'orlando@networq.app'; -- Your founder email
  founder_card RECORD;
  founder_profile_id UUID;
BEGIN
  -- Get the founder's profile ID
  SELECT id INTO founder_profile_id 
  FROM public.profiles 
  WHERE email = founder_email;
  
  -- If founder profile doesn't exist, skip this process
  IF founder_profile_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Get the founder's contact card
  SELECT * INTO founder_card 
  FROM public.user_contact_cards 
  WHERE user_id = founder_profile_id AND is_active = true;
  
  -- If founder doesn't have a contact card, skip this process
  IF founder_card IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Add the new user to founder's contacts
  INSERT INTO public.contacts (
    user_id, name, email, phone, company, industry, services, tier, notes,
    linkedin, facebook, whatsapp, websites, added_date, added_via
  ) VALUES (
    founder_profile_id,
    NEW.name,
    NEW.email,
    NEW.phone,
    NEW.company,
    NEW.industry,
    NEW.services,
    'A-player',
    'New user - automatically added',
    NEW.linkedin,
    NEW.facebook,
    NEW.whatsapp,
    NEW.websites,
    CURRENT_DATE,
    'mutual_contact'
  );
  
  -- Add the founder to new user's contacts
  INSERT INTO public.contacts (
    user_id, name, email, phone, company, industry, services, tier, notes,
    linkedin, facebook, whatsapp, websites, added_date, added_via
  ) VALUES (
    NEW.user_id,
    founder_card.name,
    founder_card.email,
    founder_card.phone,
    founder_card.company,
    founder_card.industry,
    founder_card.services,
    'A-player',
    'Founder - automatically added',
    founder_card.linkedin,
    founder_card.facebook,
    founder_card.whatsapp,
    founder_card.websites,
    CURRENT_DATE,
    'mutual_contact'
  );
  
  RETURN NEW;
END;
$function$;

-- Update existing contacts that were added automatically (have user_id) to have proper added_via
UPDATE public.contacts 
SET added_via = 'mutual_contact' 
WHERE user_id IS NOT NULL AND added_via = 'manual';