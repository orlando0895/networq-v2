-- Create a policy that allows the add_mutual_contact function to insert contacts for any user
-- This policy specifically allows inserts when called from the add_mutual_contact function
CREATE POLICY "Allow mutual contact addition via function" 
ON public.contacts 
FOR INSERT 
WITH CHECK (
  -- Allow if it's the user's own contact (existing behavior)
  auth.uid() = user_id 
  OR 
  -- Allow if the insertion is happening via the add_mutual_contact function
  -- We check this by seeing if the function is in the call stack
  current_setting('transaction_isolation') IS NOT NULL
);

-- Actually, let's use a better approach with a custom setting
-- Drop the policy we just created and create a better one
DROP POLICY "Allow mutual contact addition via function" ON public.contacts;

-- Update the add_mutual_contact function to set a custom setting
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
    linkedin, facebook, whatsapp, websites, added_date, added_via
  ) VALUES (
    target_user_id, contact_name, contact_email, contact_phone, contact_company, 
    contact_industry, contact_services, contact_tier, contact_notes,
    contact_linkedin, contact_facebook, contact_whatsapp, contact_websites, CURRENT_DATE, 'mutual_contact'
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Create a new policy that allows mutual contact addition
CREATE POLICY "Allow mutual contact addition" 
ON public.contacts 
FOR INSERT 
WITH CHECK (
  -- Allow if it's the user's own contact (existing behavior)
  auth.uid() = user_id 
  OR 
  -- Allow if this is being called from the add_mutual_contact function
  current_setting('app.adding_mutual_contact', true) = 'true'
);