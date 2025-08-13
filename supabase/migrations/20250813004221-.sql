-- Create trigger to sync contact card updates across all connections
CREATE TRIGGER sync_contact_card_on_update
  AFTER UPDATE ON public.user_contact_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_contact_card_updates();