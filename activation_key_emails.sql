-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New query)
-- Tracks every activation key email sent, prevents duplicates, stores full history

CREATE TABLE IF NOT EXISTS activation_key_emails (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  key_id        uuid        REFERENCES activation_keys(id) ON DELETE CASCADE,
  activation_key text       NOT NULL,
  sent_to_email text        NOT NULL,
  sent_to_name  text,
  package_name  text,
  sent_from     text,
  brevo_message_id text,
  sent_by       uuid        REFERENCES auth.users(id),
  sent_at       timestamptz DEFAULT now()
);

-- Index for fast lookups by key_id
CREATE INDEX IF NOT EXISTS idx_ake_key_id ON activation_key_emails(key_id);
-- Index for lookups by email
CREATE INDEX IF NOT EXISTS idx_ake_email  ON activation_key_emails(sent_to_email);

-- Row Level Security
ALTER TABLE activation_key_emails ENABLE ROW LEVEL SECURITY;

-- Admins & super-admins can read all logs
CREATE POLICY "admins_read_email_logs"
  ON activation_key_emails FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );

-- Admins & super-admins can insert logs
CREATE POLICY "admins_insert_email_logs"
  ON activation_key_emails FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );
