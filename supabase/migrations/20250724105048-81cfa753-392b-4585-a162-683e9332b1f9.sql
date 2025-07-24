-- Function to handle comprehensive user account deletion cleanup
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_email TEXT;
  conversation_to_delete UUID;
  conversation_rec RECORD;
BEGIN
  -- Get the user's email from their profile
  SELECT email INTO user_email 
  FROM public.profiles 
  WHERE id = OLD.id;
  
  -- If no email found, try to get it from the auth user data
  IF user_email IS NULL THEN
    user_email := OLD.email;
  END IF;
  
  -- 1. Remove user from everyone's contact lists (where they appear as a contact)
  IF user_email IS NOT NULL THEN
    DELETE FROM public.contacts 
    WHERE email = user_email;
  END IF;
  
  -- 2. Handle conversations the user participated in
  FOR conversation_rec IN 
    SELECT DISTINCT cp.conversation_id
    FROM public.conversation_participants cp
    WHERE cp.user_id = OLD.id AND cp.deleted_at IS NULL
  LOOP
    -- Check how many active participants are in this conversation
    DECLARE
      participant_count INTEGER;
    BEGIN
      SELECT COUNT(*) INTO participant_count
      FROM public.conversation_participants cp2
      WHERE cp2.conversation_id = conversation_rec.conversation_id 
        AND cp2.deleted_at IS NULL;
      
      -- If it's a direct conversation (2 people), delete the entire conversation
      IF participant_count = 2 THEN
        -- Delete all messages in the conversation
        DELETE FROM public.messages 
        WHERE conversation_id = conversation_rec.conversation_id;
        
        -- Delete all participants
        DELETE FROM public.conversation_participants 
        WHERE conversation_id = conversation_rec.conversation_id;
        
        -- Delete the conversation itself
        DELETE FROM public.conversations 
        WHERE id = conversation_rec.conversation_id;
        
      -- If it's a group conversation (3+ people), just remove the user
      ELSE
        DELETE FROM public.conversation_participants 
        WHERE conversation_id = conversation_rec.conversation_id 
          AND user_id = OLD.id;
      END IF;
    END;
  END LOOP;
  
  -- 3. Delete the user's own contact card
  DELETE FROM public.user_contact_cards 
  WHERE user_id = OLD.id;
  
  -- 4. Delete the user's own contacts list
  DELETE FROM public.contacts 
  WHERE user_id = OLD.id;
  
  -- 5. Delete the user's profile
  DELETE FROM public.profiles 
  WHERE id = OLD.id;
  
  RETURN OLD;
END;
$$;

-- Create trigger to fire when a user is deleted from auth.users
CREATE TRIGGER handle_user_deletion_trigger
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_deletion();