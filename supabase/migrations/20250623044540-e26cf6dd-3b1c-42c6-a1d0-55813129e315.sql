
-- Add social media and website columns to the contacts table
ALTER TABLE public.contacts 
ADD COLUMN linkedin TEXT,
ADD COLUMN facebook TEXT,
ADD COLUMN whatsapp TEXT,
ADD COLUMN websites TEXT[]; -- Array to store multiple websites

-- Add a comment to describe the new columns
COMMENT ON COLUMN public.contacts.linkedin IS 'LinkedIn profile URL or username';
COMMENT ON COLUMN public.contacts.facebook IS 'Facebook profile URL or username';
COMMENT ON COLUMN public.contacts.whatsapp IS 'WhatsApp number or link';
COMMENT ON COLUMN public.contacts.websites IS 'Array of website URLs';
