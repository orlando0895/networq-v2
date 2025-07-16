-- Clear all conversations and related data
-- Delete all messages first (due to foreign key constraints)
DELETE FROM public.messages;

-- Delete all conversation participants
DELETE FROM public.conversation_participants;

-- Delete all conversations
DELETE FROM public.conversations;