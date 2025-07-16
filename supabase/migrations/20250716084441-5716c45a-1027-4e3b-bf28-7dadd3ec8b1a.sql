-- Add a field to track how contacts were added
ALTER TABLE public.contacts 
ADD COLUMN added_via TEXT DEFAULT 'manual' CHECK (added_via IN ('manual', 'share_code', 'qr_code', 'mutual_contact', 'business_card'));