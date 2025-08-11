-- Update event_attendees table to ensure proper RSVP functionality
ALTER TABLE public.event_attendees 
DROP CONSTRAINT IF EXISTS valid_status_check;

-- Add constraint to ensure only valid RSVP statuses
ALTER TABLE public.event_attendees 
ADD CONSTRAINT valid_status_check 
CHECK (status IN ('going', 'interested', 'not_going'));

-- Create unique constraint to prevent duplicate RSVPs
ALTER TABLE public.event_attendees
ADD CONSTRAINT unique_user_event_rsvp 
UNIQUE (event_id, user_id);

-- Create function to handle event RSVP changes
CREATE OR REPLACE FUNCTION public.handle_event_rsvp(
  event_uuid uuid,
  rsvp_status text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  event_record record;
  existing_rsvp record;
  result jsonb;
BEGIN
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Authentication required'
    );
  END IF;

  -- Validate RSVP status
  IF rsvp_status NOT IN ('going', 'interested', 'not_going') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid RSVP status'
    );
  END IF;

  -- Get event details
  SELECT * INTO event_record 
  FROM public.events 
  WHERE id = event_uuid AND is_public = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Event not found or not public'
    );
  END IF;

  -- Check if event is full (only for 'going' status)
  IF rsvp_status = 'going' AND event_record.max_attendees IS NOT NULL THEN
    IF event_record.current_attendees >= event_record.max_attendees THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Event is at full capacity'
      );
    END IF;
  END IF;

  -- Check for existing RSVP
  SELECT * INTO existing_rsvp
  FROM public.event_attendees
  WHERE event_id = event_uuid AND user_id = current_user_id;

  -- Handle RSVP logic
  IF existing_rsvp IS NULL THEN
    -- Create new RSVP
    INSERT INTO public.event_attendees (event_id, user_id, status)
    VALUES (event_uuid, current_user_id, rsvp_status);
  ELSE
    -- Update existing RSVP
    UPDATE public.event_attendees
    SET status = rsvp_status, joined_at = now()
    WHERE event_id = event_uuid AND user_id = current_user_id;
  END IF;

  -- Get updated event info
  SELECT current_attendees INTO event_record.current_attendees
  FROM public.events
  WHERE id = event_uuid;

  RETURN jsonb_build_object(
    'success', true,
    'status', rsvp_status,
    'current_attendees', event_record.current_attendees
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Create function to get user's RSVP status for multiple events
CREATE OR REPLACE FUNCTION public.get_user_event_rsvps()
RETURNS TABLE(event_id uuid, status text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT ea.event_id, ea.status
  FROM public.event_attendees ea
  WHERE ea.user_id = auth.uid();
$$;

-- Update the existing trigger to handle all status changes properly
DROP TRIGGER IF EXISTS update_event_attendee_count_trigger ON public.event_attendees;

CREATE TRIGGER update_event_attendee_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.event_attendees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_event_attendee_count();