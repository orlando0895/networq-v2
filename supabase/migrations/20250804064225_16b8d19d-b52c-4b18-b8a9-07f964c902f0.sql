-- Create events table with location data
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location_name TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  tags TEXT[],
  image_url TEXT,
  contact_info JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_coordinates CHECK (
    latitude BETWEEN -90 AND 90 AND 
    longitude BETWEEN -180 AND 180
  ),
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= event_date),
  CONSTRAINT valid_attendees CHECK (
    max_attendees IS NULL OR 
    (max_attendees > 0 AND current_attendees <= max_attendees)
  )
);

-- Create event_attendees table for tracking attendees
CREATE TABLE public.event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'attending' CHECK (status IN ('attending', 'maybe', 'declined')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create user_location_settings table for radius preferences
CREATE TABLE public.user_location_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  default_radius INTEGER NOT NULL DEFAULT 25, -- kilometers
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_name TEXT,
  auto_location BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_radius CHECK (default_radius BETWEEN 1 AND 1000),
  CONSTRAINT valid_user_coordinates CHECK (
    (latitude IS NULL AND longitude IS NULL) OR
    (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
  )
);

-- Create indexes for performance
CREATE INDEX idx_events_created_by ON public.events(created_by);
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_events_location ON public.events(latitude, longitude);
CREATE INDEX idx_events_public ON public.events(is_public) WHERE is_public = true;
CREATE INDEX idx_event_attendees_event_id ON public.event_attendees(event_id);
CREATE INDEX idx_event_attendees_user_id ON public.event_attendees(user_id);
CREATE INDEX idx_user_location_settings_user_id ON public.user_location_settings(user_id);

-- Enable RLS on all tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_location_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for events table
CREATE POLICY "Anyone can view public events" ON public.events
FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own events" ON public.events
FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Premium users can create events" ON public.events
FOR INSERT WITH CHECK (
  created_by = auth.uid() AND 
  public.is_user_premium(auth.uid()) = true
);

CREATE POLICY "Users can update their own events" ON public.events
FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own events" ON public.events
FOR DELETE USING (created_by = auth.uid());

-- RLS policies for event_attendees table
CREATE POLICY "Users can view attendees of public events" ON public.event_attendees
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_attendees.event_id 
    AND (is_public = true OR created_by = auth.uid())
  )
);

CREATE POLICY "Users can manage their own attendance" ON public.event_attendees
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Event creators can view all attendees" ON public.event_attendees
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_attendees.event_id 
    AND created_by = auth.uid()
  )
);

-- RLS policies for user_location_settings table
CREATE POLICY "Users can view their own location settings" ON public.user_location_settings
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own location settings" ON public.user_location_settings
FOR ALL USING (user_id = auth.uid());

-- Function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION public.calculate_distance(
  lat1 DECIMAL, lon1 DECIMAL, 
  lat2 DECIMAL, lon2 DECIMAL
)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  r DECIMAL := 6371; -- Earth's radius in kilometers
  dlat DECIMAL;
  dlon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  
  a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN r * c;
END;
$$;

-- Function to get events within radius
CREATE OR REPLACE FUNCTION public.get_events_within_radius(
  user_lat DECIMAL,
  user_lon DECIMAL,
  radius_km INTEGER DEFAULT 25,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  description TEXT,
  event_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  location_name TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  address TEXT,
  max_attendees INTEGER,
  current_attendees INTEGER,
  tags TEXT[],
  image_url TEXT,
  created_by UUID,
  distance_km DECIMAL
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    e.description,
    e.event_date,
    e.end_date,
    e.location_name,
    e.latitude,
    e.longitude,
    e.address,
    e.max_attendees,
    e.current_attendees,
    e.tags,
    e.image_url,
    e.created_by,
    public.calculate_distance(user_lat, user_lon, e.latitude, e.longitude) as distance_km
  FROM public.events e
  WHERE e.is_public = true
    AND e.event_date > now()
    AND public.calculate_distance(user_lat, user_lon, e.latitude, e.longitude) <= radius_km
  ORDER BY distance_km ASC, e.event_date ASC
  LIMIT limit_count;
END;
$$;

-- Function to get user's location settings with defaults
CREATE OR REPLACE FUNCTION public.get_user_location_settings(user_uuid UUID)
RETURNS public.user_location_settings
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  settings public.user_location_settings;
BEGIN
  SELECT * INTO settings
  FROM public.user_location_settings
  WHERE user_id = user_uuid;
  
  -- Return default settings if none exist
  IF NOT FOUND THEN
    settings.user_id := user_uuid;
    settings.default_radius := 25;
    settings.auto_location := true;
  END IF;
  
  RETURN settings;
END;
$$;

-- Function to update event attendee count
CREATE OR REPLACE FUNCTION public.update_event_attendee_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'attending' THEN
    UPDATE public.events 
    SET current_attendees = current_attendees + 1,
        updated_at = now()
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status changes
    IF OLD.status != 'attending' AND NEW.status = 'attending' THEN
      UPDATE public.events 
      SET current_attendees = current_attendees + 1,
          updated_at = now()
      WHERE id = NEW.event_id;
    ELSIF OLD.status = 'attending' AND NEW.status != 'attending' THEN
      UPDATE public.events 
      SET current_attendees = GREATEST(0, current_attendees - 1),
          updated_at = now()
      WHERE id = NEW.event_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'attending' THEN
    UPDATE public.events 
    SET current_attendees = GREATEST(0, current_attendees - 1),
        updated_at = now()
    WHERE id = OLD.event_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger to automatically update attendee counts
CREATE TRIGGER update_event_attendee_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.event_attendees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_event_attendee_count();

-- Function to handle new user location settings
CREATE OR REPLACE FUNCTION public.handle_new_user_location_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Create default location settings for new users
  INSERT INTO public.user_location_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to create default location settings for new users
CREATE TRIGGER handle_new_user_location_settings_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_location_settings();

-- Enable realtime for events
ALTER TABLE public.events REPLICA IDENTITY FULL;
ALTER TABLE public.event_attendees REPLICA IDENTITY FULL;