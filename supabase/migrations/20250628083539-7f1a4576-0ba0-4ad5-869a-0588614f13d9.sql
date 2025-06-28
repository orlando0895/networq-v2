
-- Create a function to automatically add founder contacts when a new user creates their contact card
CREATE OR REPLACE FUNCTION public.handle_new_contact_card()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
    linkedin, facebook, whatsapp, websites, added_date
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
    CURRENT_DATE
  );
  
  -- Add the founder to new user's contacts
  INSERT INTO public.contacts (
    user_id, name, email, phone, company, industry, services, tier, notes,
    linkedin, facebook, whatsapp, websites, added_date
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
    CURRENT_DATE
  );
  
  RETURN NEW;
END;
$$;

-- Create the trigger that fires when a new contact card is created
CREATE OR REPLACE TRIGGER on_contact_card_created
  AFTER INSERT ON public.user_contact_cards
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_contact_card();
