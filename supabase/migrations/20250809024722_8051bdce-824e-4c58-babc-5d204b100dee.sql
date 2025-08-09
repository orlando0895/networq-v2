-- 1) Add company_logo_url to user_contact_cards and contacts
ALTER TABLE public.user_contact_cards
  ADD COLUMN IF NOT EXISTS company_logo_url text;

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS company_logo_url text;

-- 2) Update sync_contact_card_updates() to propagate logo to contacts
CREATE OR REPLACE FUNCTION public.sync_contact_card_updates()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Update all contacts entries that match the updated contact card's email
  UPDATE public.contacts 
  SET 
    name = NEW.name,
    phone = NEW.phone,
    company = NEW.company,
    industry = NEW.industry,
    services = NEW.services,
    linkedin = NEW.linkedin,
    facebook = NEW.facebook,
    whatsapp = NEW.whatsapp,
    websites = NEW.websites,
    profile_picture_url = NEW.avatar_url,
    company_logo_url = NEW.company_logo_url,
    updated_at = now()
  WHERE email = NEW.email 
    AND user_id != NEW.user_id; -- Don't update the contact card owner's own entry
  
  RETURN NEW;
END;
$function$;

-- 3) Optional: backfill is not performed here to avoid unintended mass updates
--    UI will gradually propagate with next updates to contact cards
