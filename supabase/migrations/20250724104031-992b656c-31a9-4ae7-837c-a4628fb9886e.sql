-- Function to sync contact card updates to all contacts lists
CREATE OR REPLACE FUNCTION public.sync_contact_card_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
    updated_at = now()
  WHERE email = NEW.email 
    AND user_id != NEW.user_id; -- Don't update the contact card owner's own entry
  
  RETURN NEW;
END;
$$;

-- Create trigger to fire when contact cards are updated
CREATE TRIGGER sync_contact_card_updates_trigger
  AFTER UPDATE ON public.user_contact_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_contact_card_updates();

-- Enable realtime for contacts table
ALTER TABLE public.contacts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;