
-- Create a table for user contact cards (their own profile for sharing)
CREATE TABLE public.user_contact_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  industry TEXT,
  services TEXT[],
  notes TEXT,
  linkedin TEXT,
  facebook TEXT,
  whatsapp TEXT,
  websites TEXT[],
  share_code TEXT NOT NULL UNIQUE DEFAULT substring(md5(random()::text), 1, 8),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_contact_cards ENABLE ROW LEVEL SECURITY;

-- Users can view their own contact card
CREATE POLICY "Users can view their own contact card" 
  ON public.user_contact_cards 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own contact card (only one per user)
CREATE POLICY "Users can create their own contact card" 
  ON public.user_contact_cards 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own contact card
CREATE POLICY "Users can update their own contact card" 
  ON public.user_contact_cards 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own contact card
CREATE POLICY "Users can delete their own contact card" 
  ON public.user_contact_cards 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Anyone can view active contact cards by share code (for sharing functionality)
CREATE POLICY "Anyone can view contact cards by share code" 
  ON public.user_contact_cards 
  FOR SELECT 
  USING (is_active = true);

-- Create indexes for better performance
CREATE INDEX user_contact_cards_user_id_idx ON public.user_contact_cards(user_id);
CREATE INDEX user_contact_cards_share_code_idx ON public.user_contact_cards(share_code);

-- Function to generate new share code
CREATE OR REPLACE FUNCTION public.regenerate_share_code(card_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_code TEXT;
BEGIN
  -- Generate a new unique share code
  LOOP
    new_code := substring(md5(random()::text), 1, 8);
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.user_contact_cards WHERE share_code = new_code
    );
  END LOOP;
  
  -- Update the card with the new code
  UPDATE public.user_contact_cards 
  SET share_code = new_code, updated_at = now()
  WHERE id = card_id AND user_id = auth.uid();
  
  RETURN new_code;
END;
$$;
