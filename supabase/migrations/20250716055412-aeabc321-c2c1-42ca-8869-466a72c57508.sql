-- Create the missing triggers for auto-contact functionality

-- Trigger for when a new user is created (should create profile and contact card)
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for when a new contact card is created (should add mutual contacts)
CREATE OR REPLACE TRIGGER on_contact_card_created
  AFTER INSERT ON public.user_contact_cards
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_contact_card();