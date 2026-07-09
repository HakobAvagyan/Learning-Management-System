CREATE TABLE IF NOT EXISTS chat_messages (
    id           BIGSERIAL    PRIMARY KEY,
    sender_id    BIGINT       NOT NULL,
    recipient_id BIGINT       NOT NULL,
    content      TEXT         NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_sender    ON chat_messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_recipient ON chat_messages (recipient_id);
CREATE INDEX IF NOT EXISTS idx_chat_thread    ON chat_messages (
    LEAST(sender_id, recipient_id),
    GREATEST(sender_id, recipient_id),
    created_at DESC
);