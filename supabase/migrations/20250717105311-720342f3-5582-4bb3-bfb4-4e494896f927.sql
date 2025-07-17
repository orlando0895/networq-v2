-- Add DELETE policies for conversation deletion

-- Allow users to delete messages in conversations they participate in
CREATE POLICY "Users can delete messages in their conversations"
ON public.messages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id
    AND cp.user_id = auth.uid()
  )
);

-- Allow users to delete conversation participants (for both soft and hard deletes)
CREATE POLICY "Users can delete conversation participants"
ON public.conversation_participants
FOR DELETE
USING (
  -- User can delete their own participation OR
  -- User can delete others' participation if they're in the conversation (for hard deletes)
  user_id = auth.uid() 
  OR user_is_in_conversation(conversation_id, auth.uid())
);

-- Allow users to delete conversations they participate in
CREATE POLICY "Users can delete conversations they participate in"
ON public.conversations
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = conversations.id
    AND cp.user_id = auth.uid()
  )
);