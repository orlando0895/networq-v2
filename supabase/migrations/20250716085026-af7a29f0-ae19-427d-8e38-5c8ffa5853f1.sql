-- Fix the get_or_create_direct_conversation function to properly check for existing conversations
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
  SELECT c.id INTO conversation_id
  FROM public.conversations c
  WHERE c.id IN (
    SELECT cp1.conversation_id
    FROM public.conversation_participants cp1
    INNER JOIN public.conversation_participants cp2 
      ON cp1.conversation_id = cp2.conversation_id
    WHERE cp1.user_id = current_user_id 
      AND cp2.user_id = other_user_id
      AND cp1.user_id != cp2.user_id
    GROUP BY cp1.conversation_id
    HAVING COUNT(DISTINCT cp1.user_id) = 2
      AND COUNT(*) = 2  -- Ensure exactly 2 participants total
  )
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
$function$