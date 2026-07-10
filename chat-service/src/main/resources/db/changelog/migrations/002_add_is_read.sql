ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_chat_unread
    ON chat_messages (recipient_id, is_read)
    WHERE is_read = FALSE;