-- Create waitlist signups table
CREATE TABLE public.waitlist_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  source TEXT DEFAULT 'landing_page',
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts
CREATE POLICY "Allow anonymous waitlist signups" 
ON public.waitlist_signups 
FOR INSERT 
WITH CHECK (true);

-- Create index on email for uniqueness constraint
CREATE UNIQUE INDEX idx_waitlist_email_unique ON public.waitlist_signups(LOWER(email));