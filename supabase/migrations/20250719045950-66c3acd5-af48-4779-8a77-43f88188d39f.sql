-- Fix the get_or_create_direct_conversation function to properly check for existing conversations
-- and avoid creating duplicates

DROP FUNCTION IF EXISTS public.get_or_create_direct_conversation(uuid);

CREATE OR REPLACE FUNCTION public.get_or_create_direct_conversation(other_user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  conversation_id UUID;
  current_user_id UUID := auth.uid();
BEGIN
  -- Check if conversation already exists between these two users
  -- Look for conversations where both users are participants and it's exactly 2 participants
  SELECT c.id INTO conversation_id
  FROM public.conversations c
  WHERE c.id IN (
    -- Get conversations where current user is a participant
    SELECT cp1.conversation_id
    FROM public.conversation_participants cp1
    WHERE cp1.user_id = current_user_id 
      AND cp1.deleted_at IS NULL
  )
  AND c.id IN (
    -- Get conversations where other user is a participant  
    SELECT cp2.conversation_id
    FROM public.conversation_participants cp2
    WHERE cp2.user_id = other_user_id
      AND cp2.deleted_at IS NULL
  )
  AND (
    -- Ensure this conversation has exactly 2 participants (direct conversation)
    SELECT COUNT(*)
    FROM public.conversation_participants cp3
    WHERE cp3.conversation_id = c.id 
      AND cp3.deleted_at IS NULL
  ) = 2
  LIMIT 1;

  -- If conversation doesn't exist, create it
  IF conversation_id IS NULL THEN
    INSERT INTO public.conversations DEFAULT VALUES
    RETURNING id INTO conversation_id;
    
    -- Add both users as participants
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES 
      (conversation_id, current_user_id),
      (conversation_id, other_user_id);
  END IF;
  
  RETURN conversation_id;
END;
$function$;