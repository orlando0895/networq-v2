-- Create function to handle group conversation creation with proper RLS handling
CREATE OR REPLACE FUNCTION public.create_group_conversation(participant_ids uuid[])
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  conversation_id UUID;
  participant_id UUID;
  current_user_id UUID := auth.uid();
BEGIN
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Validate that we have at least 2 participants (including creator)
  IF array_length(participant_ids, 1) < 1 THEN
    RAISE EXCEPTION 'At least one other participant required for group chat';
  END IF;
  
  -- Create the conversation
  INSERT INTO public.conversations DEFAULT VALUES
  RETURNING id INTO conversation_id;
  
  -- Add the current user as a participant
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES (conversation_id, current_user_id);
  
  -- Add all other participants
  FOREACH participant_id IN ARRAY participant_ids
  LOOP
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES (conversation_id, participant_id)
    ON CONFLICT DO NOTHING; -- Avoid duplicates if current user is in the list
  END LOOP;
  
  RETURN conversation_id;
END;
$function$