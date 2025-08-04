-- Add discovery settings to profiles table
ALTER TABLE public.profiles 
ADD COLUMN discovery_visible BOOLEAN DEFAULT true,
ADD COLUMN discovery_radius INTEGER DEFAULT 50, -- kilometers
ADD COLUMN bio TEXT,
ADD COLUMN job_title TEXT,
ADD COLUMN company TEXT,
ADD COLUMN linkedin_url TEXT,
ADD COLUMN website_url TEXT,
ADD COLUMN interests TEXT[],
ADD COLUMN location_name TEXT,
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN last_active_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN discovery_settings JSONB DEFAULT '{"show_location": true, "show_company": true, "show_linkedin": true, "show_interests": true}'::jsonb;

-- Create user_boosts table for boost purchase tracking
CREATE TABLE public.user_boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  boost_type TEXT NOT NULL CHECK (boost_type IN ('discovery_24h', 'discovery_7d', 'discovery_30d')),
  purchase_amount INTEGER NOT NULL, -- amount in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  stripe_payment_intent_id TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_boost_dates CHECK (expires_at > started_at)
);

-- Create discovery_interactions table to track views/likes
CREATE TABLE public.discovery_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'like', 'pass')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(viewer_id, viewed_user_id, interaction_type)
);

-- Create indexes for performance
CREATE INDEX idx_profiles_discovery_visible ON public.profiles(discovery_visible) WHERE discovery_visible = true;
CREATE INDEX idx_profiles_location ON public.profiles(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_profiles_last_active ON public.profiles(last_active_at);
CREATE INDEX idx_user_boosts_user_id ON public.user_boosts(user_id);
CREATE INDEX idx_user_boosts_active ON public.user_boosts(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_user_boosts_expires ON public.user_boosts(expires_at);
CREATE INDEX idx_discovery_interactions_viewer ON public.discovery_interactions(viewer_id);
CREATE INDEX idx_discovery_interactions_viewed ON public.discovery_interactions(viewed_user_id);

-- Enable RLS on new tables
ALTER TABLE public.user_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_interactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_boosts table
CREATE POLICY "Users can view their own boosts" ON public.user_boosts
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own boosts" ON public.user_boosts
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own boosts" ON public.user_boosts
FOR UPDATE USING (user_id = auth.uid());

-- RLS policies for discovery_interactions table
CREATE POLICY "Users can view their own interactions" ON public.discovery_interactions
FOR SELECT USING (viewer_id = auth.uid() OR viewed_user_id = auth.uid());

CREATE POLICY "Users can create their own interactions" ON public.discovery_interactions
FOR INSERT WITH CHECK (viewer_id = auth.uid());

CREATE POLICY "Users can update their own interactions" ON public.discovery_interactions
FOR UPDATE USING (viewer_id = auth.uid());

-- Update profiles RLS to allow discovery visibility
CREATE POLICY "Public can view discoverable profiles" ON public.profiles
FOR SELECT USING (discovery_visible = true);

-- Function to check if user has active boost
CREATE OR REPLACE FUNCTION public.user_has_active_boost(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_boosts
    WHERE user_id = user_uuid 
    AND is_active = true 
    AND expires_at > now()
  );
$$;

-- Function to get users for discovery with location and boost prioritization
CREATE OR REPLACE FUNCTION public.get_users_for_discovery(
  current_user_lat DECIMAL,
  current_user_lon DECIMAL,
  radius_km INTEGER DEFAULT 50,
  limit_count INTEGER DEFAULT 20,
  exclude_viewed BOOLEAN DEFAULT true
)
RETURNS TABLE(
  id UUID,
  full_name TEXT,
  bio TEXT,
  job_title TEXT,
  company TEXT,
  avatar_url TEXT,
  interests TEXT[],
  location_name TEXT,
  distance_km DECIMAL,
  has_boost BOOLEAN,
  last_active_at TIMESTAMPTZ,
  is_premium BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.bio,
    p.job_title,
    p.company,
    p.avatar_url,
    p.interests,
    p.location_name,
    public.calculate_distance(current_user_lat, current_user_lon, p.latitude, p.longitude) as distance_km,
    public.user_has_active_boost(p.id) as has_boost,
    p.last_active_at,
    p.is_premium
  FROM public.profiles p
  WHERE p.discovery_visible = true
    AND p.id != current_user_id
    AND p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL
    AND public.calculate_distance(current_user_lat, current_user_lon, p.latitude, p.longitude) <= radius_km
    AND (
      NOT exclude_viewed OR 
      NOT EXISTS (
        SELECT 1 FROM public.discovery_interactions di 
        WHERE di.viewer_id = current_user_id 
        AND di.viewed_user_id = p.id
      )
    )
  ORDER BY 
    public.user_has_active_boost(p.id) DESC, -- Boosted users first
    p.is_premium DESC, -- Premium users next
    distance_km ASC, -- Then by distance
    p.last_active_at DESC -- Finally by last activity
  LIMIT limit_count;
END;
$$;

-- Function to get boost pricing (can be customized)
CREATE OR REPLACE FUNCTION public.get_boost_pricing()
RETURNS TABLE(
  boost_type TEXT,
  duration_hours INTEGER,
  price_cents INTEGER,
  currency TEXT,
  display_name TEXT,
  description TEXT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT 
    unnest(ARRAY['discovery_24h', 'discovery_7d', 'discovery_30d']),
    unnest(ARRAY[24, 168, 720]), -- hours
    unnest(ARRAY[299, 999, 2999]), -- price in cents
    unnest(ARRAY['usd', 'usd', 'usd']),
    unnest(ARRAY['24 Hour Boost', '7 Day Boost', '30 Day Boost']),
    unnest(ARRAY[
      'Be featured at the top of discovery for 24 hours',
      'Stay at the top of discovery for a full week', 
      'Maximum visibility for an entire month'
    ]);
$$;

-- Function to activate a boost after purchase
CREATE OR REPLACE FUNCTION public.activate_user_boost(
  user_uuid UUID,
  boost_type_param TEXT,
  stripe_payment_intent_id_param TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  boost_duration_hours INTEGER;
  boost_price INTEGER;
  new_boost_id UUID;
BEGIN
  -- Get boost details
  SELECT duration_hours, price_cents INTO boost_duration_hours, boost_price
  FROM public.get_boost_pricing()
  WHERE boost_type = boost_type_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid boost type: %', boost_type_param;
  END IF;
  
  -- Deactivate any existing active boosts for this user
  UPDATE public.user_boosts 
  SET is_active = false, updated_at = now()
  WHERE user_id = user_uuid AND is_active = true;
  
  -- Create new boost
  INSERT INTO public.user_boosts (
    user_id, 
    boost_type, 
    purchase_amount, 
    stripe_payment_intent_id,
    expires_at
  ) VALUES (
    user_uuid,
    boost_type_param,
    boost_price,
    stripe_payment_intent_id_param,
    now() + (boost_duration_hours || ' hours')::INTERVAL
  ) RETURNING id INTO new_boost_id;
  
  RETURN new_boost_id;
END;
$$;

-- Function to record discovery interaction
CREATE OR REPLACE FUNCTION public.record_discovery_interaction(
  viewed_user_uuid UUID,
  interaction_type_param TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  interaction_id UUID;
BEGIN
  INSERT INTO public.discovery_interactions (
    viewer_id,
    viewed_user_id,
    interaction_type
  ) VALUES (
    current_user_id,
    viewed_user_uuid,
    interaction_type_param
  ) 
  ON CONFLICT (viewer_id, viewed_user_id, interaction_type) 
  DO UPDATE SET created_at = now()
  RETURNING id INTO interaction_id;
  
  RETURN interaction_id;
END;
$$;

-- Function to update user's last active timestamp
CREATE OR REPLACE FUNCTION public.update_user_last_active()
RETURNS void
LANGUAGE SQL
SECURITY DEFINER
SET search_path TO ''
AS $$
  UPDATE public.profiles 
  SET last_active_at = now(), updated_at = now()
  WHERE id = auth.uid();
$$;

-- Function to clean up expired boosts
CREATE OR REPLACE FUNCTION public.cleanup_expired_boosts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  UPDATE public.user_boosts 
  SET is_active = false, updated_at = now()
  WHERE is_active = true AND expires_at <= now();
  
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RETURN affected_count;
END;
$$;

-- Function to get user's discovery stats
CREATE OR REPLACE FUNCTION public.get_user_discovery_stats(user_uuid UUID)
RETURNS TABLE(
  profile_views INTEGER,
  profile_likes INTEGER,
  active_boost_expires_at TIMESTAMPTZ,
  discovery_visible BOOLEAN
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT 
    COALESCE((
      SELECT COUNT(*)::INTEGER 
      FROM public.discovery_interactions 
      WHERE viewed_user_id = user_uuid AND interaction_type = 'view'
    ), 0) as profile_views,
    COALESCE((
      SELECT COUNT(*)::INTEGER 
      FROM public.discovery_interactions 
      WHERE viewed_user_id = user_uuid AND interaction_type = 'like'
    ), 0) as profile_likes,
    (
      SELECT expires_at 
      FROM public.user_boosts 
      WHERE user_id = user_uuid AND is_active = true AND expires_at > now()
      ORDER BY expires_at DESC LIMIT 1
    ) as active_boost_expires_at,
    COALESCE((
      SELECT discovery_visible 
      FROM public.profiles 
      WHERE id = user_uuid
    ), false) as discovery_visible;
$$;

-- Enable realtime for discovery interactions
ALTER TABLE public.discovery_interactions REPLICA IDENTITY FULL;
ALTER TABLE public.user_boosts REPLICA IDENTITY FULL;