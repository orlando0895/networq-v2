-- Add column to track deleted conversations for each participant
ALTER TABLE conversation_participants 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add index for better performance when filtering out deleted conversations
CREATE INDEX idx_conversation_participants_deleted_at 
ON conversation_participants(user_id, deleted_at) 
WHERE deleted_at IS NULL;