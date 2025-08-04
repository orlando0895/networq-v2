-- Fix security warnings by adding proper search_path to all functions

-- Update get_user_premium_status function
CREATE OR REPLACE FUNCTION public.get_user_premium_status(user_uuid UUID)
RETURNS subscription_status
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT COALESCE(
    (SELECT subscription_status 
     FROM public.user_subscriptions 
     WHERE user_id = user_uuid 
     AND (expires_at IS NULL OR expires_at > now())
     LIMIT 1),
    'free'::public.subscription_status
  );
$$;

-- Update is_user_premium function
CREATE OR REPLACE FUNCTION public.is_user_premium(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT CASE 
    WHEN public.get_user_premium_status(user_uuid) IN ('premium'::public.subscription_status, 'enterprise'::public.subscription_status) THEN true
    ELSE false
  END;
$$;

-- Update check_subscription_expiry function
CREATE OR REPLACE FUNCTION public.check_subscription_expiry()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Update expired subscriptions to free status
  UPDATE public.user_subscriptions 
  SET subscription_status = 'free'::public.subscription_status,
      updated_at = now()
  WHERE expires_at IS NOT NULL 
    AND expires_at <= now() 
    AND subscription_status != 'free'::public.subscription_status;
    
  -- Update profiles table to reflect expired subscriptions
  UPDATE public.profiles 
  SET is_premium = false,
      subscription_expires_at = NULL,
      updated_at = now()
  WHERE id IN (
    SELECT user_id 
    FROM public.user_subscriptions 
    WHERE subscription_status = 'free'::public.subscription_status
  ) AND is_premium = true;
END;
$$;

-- Update sync_subscription_to_profile function
CREATE OR REPLACE FUNCTION public.sync_subscription_to_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Update the profiles table when subscription changes
  UPDATE public.profiles
  SET 
    is_premium = CASE 
      WHEN NEW.subscription_status IN ('premium'::public.subscription_status, 'enterprise'::public.subscription_status) 
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

-- Update handle_new_user_subscription function
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Create a free subscription for new users
  INSERT INTO public.user_subscriptions (user_id, subscription_status)
  VALUES (NEW.id, 'free'::public.subscription_status)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Update current_user_is_premium function
CREATE OR REPLACE FUNCTION public.current_user_is_premium()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT public.is_user_premium(auth.uid());
$$;