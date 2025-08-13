-- Create the update_updated_at_column function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add notification settings to conversation_participants
ALTER TABLE public.conversation_participants 
ADD COLUMN IF NOT EXISTS muted_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN NOT NULL DEFAULT true;

-- Create user blocks table
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Create user reports table  
CREATE TABLE IF NOT EXISTS public.user_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_blocks
CREATE POLICY "Users can view their own blocks" 
ON public.user_blocks 
FOR SELECT 
USING (auth.uid() = blocker_id);

CREATE POLICY "Users can create their own blocks" 
ON public.user_blocks 
FOR INSERT 
WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete their own blocks" 
ON public.user_blocks 
FOR DELETE 
USING (auth.uid() = blocker_id);

-- RLS policies for user_reports
CREATE POLICY "Users can view their own reports" 
ON public.user_reports 
FOR SELECT 
USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports" 
ON public.user_reports 
FOR INSERT 
WITH CHECK (auth.uid() = reporter_id);

-- Add full-text search index on messages
CREATE INDEX IF NOT EXISTS messages_content_search_idx 
ON public.messages 
USING gin(to_tsvector('english', content));

-- Create function to toggle mute conversation
CREATE OR REPLACE FUNCTION public.toggle_conversation_mute(
  conversation_id_param UUID,
  mute_duration_hours INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  current_muted_until TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get current mute status
  SELECT muted_until INTO current_muted_until
  FROM public.conversation_participants
  WHERE conversation_id = conversation_id_param 
    AND user_id = auth.uid();
    
  -- If currently muted, unmute
  IF current_muted_until IS NOT NULL AND current_muted_until > now() THEN
    UPDATE public.conversation_participants
    SET muted_until = NULL, notifications_enabled = true
    WHERE conversation_id = conversation_id_param 
      AND user_id = auth.uid();
  ELSE
    -- If not muted, mute for specified duration or indefinitely
    UPDATE public.conversation_participants
    SET muted_until = CASE 
        WHEN mute_duration_hours IS NULL THEN 'infinity'::timestamp
        ELSE now() + (mute_duration_hours || ' hours')::interval
      END,
      notifications_enabled = false
    WHERE conversation_id = conversation_id_param 
      AND user_id = auth.uid();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to search messages in conversation
CREATE OR REPLACE FUNCTION public.search_messages_in_conversation(
  conversation_id_param UUID,
  search_query TEXT,
  limit_param INTEGER DEFAULT 50
)
RETURNS TABLE(
  id UUID,
  content TEXT,
  sender_id UUID,
  message_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  sender_name TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.content,
    m.sender_id,
    m.message_type,
    m.created_at,
    COALESCE(p.full_name, p.email) as sender_name,
    ts_rank(to_tsvector('english', m.content), plainto_tsquery('english', search_query)) as rank
  FROM public.messages m
  LEFT JOIN public.profiles p ON m.sender_id = p.id
  WHERE m.conversation_id = conversation_id_param
    AND to_tsvector('english', m.content) @@ plainto_tsquery('english', search_query)
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp 
      WHERE cp.conversation_id = conversation_id_param 
        AND cp.user_id = auth.uid()
    )
  ORDER BY rank DESC, m.created_at DESC
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updated_at on user_reports
CREATE TRIGGER update_user_reports_updated_at
BEFORE UPDATE ON public.user_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();