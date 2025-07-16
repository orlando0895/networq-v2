-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add participants to conversations they're in" ON conversation_participants;

-- Create a security definer function to check if user is in a conversation
CREATE OR REPLACE FUNCTION public.user_is_in_conversation(_conversation_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM conversation_participants 
    WHERE conversation_id = _conversation_id 
    AND user_id = _user_id
  );
$$;

-- Create new policies using the security definer function
CREATE POLICY "Users can view participants in their conversations" 
ON conversation_participants 
FOR SELECT 
USING (public.user_is_in_conversation(conversation_id, auth.uid()));

CREATE POLICY "Users can add participants to conversations they're in" 
ON conversation_participants 
FOR INSERT 
WITH CHECK (
  public.user_is_in_conversation(conversation_id, auth.uid()) 
  OR NOT EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id
  )
);