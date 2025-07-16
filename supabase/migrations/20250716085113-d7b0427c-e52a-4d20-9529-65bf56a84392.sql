-- Clean up duplicate conversations
-- First, identify and delete duplicate conversations (keep the oldest one for each pair of users)
WITH duplicate_conversations AS (
  SELECT 
    c.id as conversation_id,
    cp1.user_id as user1,
    cp2.user_id as user2,
    c.created_at,
    ROW_NUMBER() OVER (
      PARTITION BY 
        LEAST(cp1.user_id, cp2.user_id), 
        GREATEST(cp1.user_id, cp2.user_id)
      ORDER BY c.created_at ASC
    ) as rn
  FROM conversations c
  JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
  JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
  WHERE cp1.user_id != cp2.user_id
    AND cp1.user_id < cp2.user_id  -- Avoid duplicates in the result
),
conversations_to_delete AS (
  SELECT conversation_id 
  FROM duplicate_conversations 
  WHERE rn > 1
)
-- Delete conversation participants first (due to foreign key)
DELETE FROM conversation_participants 
WHERE conversation_id IN (SELECT conversation_id FROM conversations_to_delete);

-- Delete the duplicate conversations
WITH duplicate_conversations AS (
  SELECT 
    c.id as conversation_id,
    cp1.user_id as user1,
    cp2.user_id as user2,
    c.created_at,
    ROW_NUMBER() OVER (
      PARTITION BY 
        LEAST(cp1.user_id, cp2.user_id), 
        GREATEST(cp1.user_id, cp2.user_id)
      ORDER BY c.created_at ASC
    ) as rn
  FROM conversations c
  JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
  JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
  WHERE cp1.user_id != cp2.user_id
    AND cp1.user_id < cp2.user_id  -- Avoid duplicates in the result
),
conversations_to_delete AS (
  SELECT conversation_id 
  FROM duplicate_conversations 
  WHERE rn > 1
)
DELETE FROM conversations 
WHERE id IN (SELECT conversation_id FROM conversations_to_delete);