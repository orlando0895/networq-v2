-- Create subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('free', 'premium', 'enterprise');

-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_status subscription_status NOT NULL DEFAULT 'free',
  subscription_type TEXT, -- e.g., 'monthly', 'yearly', 'lifetime'
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id) -- One active subscription per user
);

-- Add premium status fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_premium BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN subscription_expires_at TIMESTAMPTZ;

-- Create indexes for performance
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(subscription_status);
CREATE INDEX idx_user_subscriptions_expires_at ON public.user_subscriptions(expires_at);
CREATE INDEX idx_profiles_is_premium ON public.profiles(is_premium);

-- Enable RLS on user_subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_subscriptions
CREATE POLICY "Users can view their own subscription" ON public.user_subscriptions
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own subscription" ON public.user_subscriptions
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own subscription" ON public.user_subscriptions
FOR UPDATE USING (user_id = auth.uid());

-- Premium status check functions
CREATE OR REPLACE FUNCTION public.get_user_premium_status(user_uuid UUID)
RETURNS subscription_status
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT subscription_status 
     FROM public.user_subscriptions 
     WHERE user_id = user_uuid 
     AND (expires_at IS NULL OR expires_at > now())
     LIMIT 1),
    'free'::subscription_status
  );
$$;

CREATE OR REPLACE FUNCTION public.is_user_premium(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT CASE 
    WHEN public.get_user_premium_status(user_uuid) IN ('premium', 'enterprise') THEN true
    ELSE false
  END;
$$;

-- Function to check and update expired subscriptions
CREATE OR REPLACE FUNCTION public.check_subscription_expiry()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update expired subscriptions to free status
  UPDATE public.user_subscriptions 
  SET subscription_status = 'free'::subscription_status,
      updated_at = now()
  WHERE expires_at IS NOT NULL 
    AND expires_at <= now() 
    AND subscription_status != 'free';
    
  -- Update profiles table to reflect expired subscriptions
  UPDATE public.profiles 
  SET is_premium = false,
      subscription_expires_at = NULL,
      updated_at = now()
  WHERE id IN (
    SELECT user_id 
    FROM public.user_subscriptions 
    WHERE subscription_status = 'free'
  ) AND is_premium = true;
END;
$$;

-- Function to sync subscription status to profiles
CREATE OR REPLACE FUNCTION public.sync_subscription_to_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the profiles table when subscription changes
  UPDATE public.profiles
  SET 
    is_premium = CASE 
      WHEN NEW.subscription_status IN ('premium', 'enterprise') 
      AND (NEW.expires_at IS NULL OR NEW.expires_at > now()) 
      THEN true 
      ELSE false 
    END,
    subscription_expires_at = NEW.expires_at,
    updated_at = now()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Trigger to automatically sync subscription changes to profiles
CREATE TRIGGER sync_subscription_to_profile_trigger
  AFTER INSERT OR UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_subscription_to_profile();

-- Function to handle new user subscription creation
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create a free subscription for new users
  INSERT INTO public.user_subscriptions (user_id, subscription_status)
  VALUES (NEW.id, 'free'::subscription_status)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to create free subscription for new users
CREATE TRIGGER handle_new_user_subscription_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_subscription();

-- Function to get current user's premium status (for authenticated users)
CREATE OR REPLACE FUNCTION public.current_user_is_premium()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT public.is_user_premium(auth.uid());
$$;