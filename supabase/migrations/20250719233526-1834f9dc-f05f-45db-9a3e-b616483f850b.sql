-- Remove the old conflicting policy
DROP POLICY "Users can insert their own contacts" ON public.contacts;

-- Test the function by adding some logging
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
  -- Set a flag to indicate this is a mutual contact operation
  PERFORM set_config('app.adding_mutual_contact', 'true', true);
  
  -- Log the attempt
  RAISE NOTICE 'Attempting to add contact for user: % with email: %', target_user_id, contact_email;
  
  -- Check if contact already exists
  IF EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE user_id = target_user_id AND email = contact_email
  ) THEN
    RAISE NOTICE 'Contact already exists, returning true';
    RETURN TRUE; -- Contact already exists, consider it successful
  END IF;
  
  -- Insert the new contact
  INSERT INTO public.contacts (
    user_id, name, email, phone, company, industry, services, tier, notes,
    linkedin, facebook, whatsapp, websites, added_date, added_via
  ) VALUES (
    target_user_id, contact_name, contact_email, contact_phone, contact_company, 
    contact_industry, contact_services, contact_tier, contact_notes,
    contact_linkedin, contact_facebook, contact_whatsapp, contact_websites, CURRENT_DATE, 'mutual_contact'
  );
  
  RAISE NOTICE 'Successfully inserted contact';
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error inserting contact: %', SQLERRM;
    RETURN FALSE;
END;
$$;