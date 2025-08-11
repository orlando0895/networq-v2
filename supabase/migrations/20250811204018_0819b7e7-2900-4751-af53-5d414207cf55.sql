-- Attendee privacy preferences
CREATE TABLE public.event_attendee_privacy (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  show_profile BOOLEAN NOT NULL DEFAULT true,
  show_contact_info BOOLEAN NOT NULL DEFAULT false,
  allow_messages BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Event discussion/comments
CREATE TABLE public.event_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.event_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Organizer updates/announcements
CREATE TABLE public.event_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Attendee networking connections
CREATE TABLE public.event_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, requester_id, recipient_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.event_attendee_privacy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_attendee_privacy
CREATE POLICY "Users can manage their own privacy settings" 
ON public.event_attendee_privacy 
FOR ALL 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Event attendees can view privacy settings" 
ON public.event_attendee_privacy 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.event_attendees ea 
    WHERE ea.event_id = event_attendee_privacy.event_id 
    AND ea.user_id::text = auth.uid()::text
  )
);

-- RLS Policies for event_comments
CREATE POLICY "Event attendees can view comments" 
ON public.event_comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.event_attendees ea 
    WHERE ea.event_id = event_comments.event_id 
    AND ea.user_id::text = auth.uid()::text
  ) OR
  EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = event_comments.event_id 
    AND e.created_by::text = auth.uid()::text
  )
);

CREATE POLICY "Event attendees can create comments" 
ON public.event_comments 
FOR INSERT 
WITH CHECK (
  auth.uid()::text = user_id::text AND
  EXISTS (
    SELECT 1 FROM public.event_attendees ea 
    WHERE ea.event_id = event_comments.event_id 
    AND ea.user_id::text = auth.uid()::text
  )
);

CREATE POLICY "Users can update their own comments" 
ON public.event_comments 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own comments" 
ON public.event_comments 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- RLS Policies for event_updates
CREATE POLICY "Event attendees can view updates" 
ON public.event_updates 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.event_attendees ea 
    WHERE ea.event_id = event_updates.event_id 
    AND ea.user_id::text = auth.uid()::text
  ) OR
  EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = event_updates.event_id 
    AND e.created_by::text = auth.uid()::text
  )
);

CREATE POLICY "Event creators can create updates" 
ON public.event_updates 
FOR INSERT 
WITH CHECK (
  auth.uid()::text = created_by::text AND
  EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = event_updates.event_id 
    AND e.created_by::text = auth.uid()::text
  )
);

CREATE POLICY "Event creators can update their own updates" 
ON public.event_updates 
FOR UPDATE 
USING (auth.uid()::text = created_by::text);

CREATE POLICY "Event creators can delete their own updates" 
ON public.event_updates 
FOR DELETE 
USING (auth.uid()::text = created_by::text);

-- RLS Policies for event_connections
CREATE POLICY "Users can view their own connections" 
ON public.event_connections 
FOR SELECT 
USING (
  auth.uid()::text = requester_id::text OR 
  auth.uid()::text = recipient_id::text
);

CREATE POLICY "Event attendees can create connections" 
ON public.event_connections 
FOR INSERT 
WITH CHECK (
  auth.uid()::text = requester_id::text AND
  requester_id::text != recipient_id::text AND
  EXISTS (
    SELECT 1 FROM public.event_attendees ea1 
    WHERE ea1.event_id = event_connections.event_id 
    AND ea1.user_id::text = requester_id::text
  ) AND
  EXISTS (
    SELECT 1 FROM public.event_attendees ea2 
    WHERE ea2.event_id = event_connections.event_id 
    AND ea2.user_id::text = recipient_id::text
  )
);

CREATE POLICY "Recipients can update connection status" 
ON public.event_connections 
FOR UPDATE 
USING (auth.uid()::text = recipient_id::text);

-- Create function to update comment timestamps
CREATE OR REPLACE FUNCTION public.update_event_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on comments
CREATE TRIGGER update_event_comments_updated_at
  BEFORE UPDATE ON public.event_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_event_comment_updated_at();