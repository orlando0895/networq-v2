-- Let's try a simpler approach: make the function completely bypass RLS
-- by using a more direct insertion method

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
SET search_path = public
AS $$
DECLARE
  contact_exists BOOLEAN := FALSE;
BEGIN
  -- Check if contact already exists
  SELECT EXISTS(
    SELECT 1 FROM contacts 
    WHERE user_id = target_user_id AND email = contact_email
  ) INTO contact_exists;
  
  IF contact_exists THEN
    RETURN TRUE; -- Contact already exists, consider it successful
  END IF;
  
  -- Use direct SQL to bypass RLS completely
  EXECUTE format('
    INSERT INTO contacts (
      user_id, name, email, phone, company, industry, services, tier, notes,
      linkedin, facebook, whatsapp, websites, added_date, added_via
    ) VALUES (
      %L, %L, %L, %L, %L, %L, %L, %L, %L,
      %L, %L, %L, %L, CURRENT_DATE, %L
    )',
    target_user_id, contact_name, contact_email, contact_phone, contact_company, 
    contact_industry, contact_services, contact_tier, contact_notes,
    contact_linkedin, contact_facebook, contact_whatsapp, contact_websites, 'mutual_contact'
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error for debugging
    RAISE WARNING 'Error in add_mutual_contact: %', SQLERRM;
    RETURN FALSE;
END;
$$;