-- Create a function to handle mutual contact addition
CREATE OR REPLACE FUNCTION public.add_mutual_contact(
  target_user_id UUID,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT DEFAULT NULL,
  contact_company TEXT DEFAULT NULL,
  contact_industry TEXT DEFAULT NULL,
  contact_services TEXT[] DEFAULT NULL,
  contact_tier TEXT DEFAULT 'Acquaintance',
  contact_notes TEXT DEFAULT NULL,
  contact_linkedin TEXT DEFAULT NULL,
  contact_facebook TEXT DEFAULT NULL,
  contact_whatsapp TEXT DEFAULT NULL,
  contact_websites TEXT[] DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if contact already exists
  IF EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE user_id = target_user_id AND email = contact_email
  ) THEN
    RETURN TRUE; -- Contact already exists, consider it successful
  END IF;
  
  -- Insert the new contact
  INSERT INTO public.contacts (
    user_id, name, email, phone, company, industry, services, tier, notes,
    linkedin, facebook, whatsapp, websites, added_date
  ) VALUES (
    target_user_id, contact_name, contact_email, contact_phone, contact_company, 
    contact_industry, contact_services, contact_tier, contact_notes,
    contact_linkedin, contact_facebook, contact_whatsapp, contact_websites, CURRENT_DATE
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;