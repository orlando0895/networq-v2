-- Update function for mutual contact deletion to also delete conversations
CREATE OR REPLACE FUNCTION public.delete_mutual_contact(
  contact_id_to_delete uuid,
  current_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  contact_email text;
  current_user_email text;
  contact_profile_id uuid;
  conversation_to_delete uuid;
BEGIN
  -- Get the contact's email that we're deleting
  SELECT email INTO contact_email
  FROM public.contacts 
  WHERE id = contact_id_to_delete AND user_id = current_user_id;
  
  -- If contact doesn't exist or doesn't belong to current user, return false
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Delete the contact from current user's list
  DELETE FROM public.contacts 
  WHERE id = contact_id_to_delete AND user_id = current_user_id;
  
  -- Check if the contact is also a user in the system by looking up their profile
  SELECT id INTO contact_profile_id
  FROM public.profiles
  WHERE email = contact_email;
  
  -- If the contact is a user in the system, remove current user from their contact list
  IF contact_profile_id IS NOT NULL THEN
    -- Get current user's email to find them in the contact's list
    SELECT email INTO current_user_email
    FROM public.profiles
    WHERE id = current_user_id;
    
    -- Delete current user from the contact's contact list
    DELETE FROM public.contacts
    WHERE user_id = contact_profile_id 
    AND email = current_user_email;
    
    -- Find and delete any direct conversation between the two users
    SELECT c.id INTO conversation_to_delete
    FROM public.conversations c
    WHERE c.id IN (
      -- Get conversations where current user is a participant
      SELECT cp1.conversation_id
      FROM public.conversation_participants cp1
      WHERE cp1.user_id = current_user_id 
        AND cp1.deleted_at IS NULL
    )
    AND c.id IN (
      -- Get conversations where contact is a participant  
      SELECT cp2.conversation_id
      FROM public.conversation_participants cp2
      WHERE cp2.user_id = contact_profile_id
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
    
    -- Delete the conversation if it exists
    IF conversation_to_delete IS NOT NULL THEN
      -- Delete all messages in the conversation
      DELETE FROM public.messages
      WHERE conversation_id = conversation_to_delete;
      
      -- Delete all participants
      DELETE FROM public.conversation_participants
      WHERE conversation_id = conversation_to_delete;
      
      -- Delete the conversation
      DELETE FROM public.conversations
      WHERE id = conversation_to_delete;
    END IF;
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;