-- Fix the function search path security issue for the new function
CREATE OR REPLACE FUNCTION public.update_event_comment_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;