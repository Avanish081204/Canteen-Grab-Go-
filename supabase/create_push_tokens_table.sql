-- ============================================================
-- Migration: Create device_push_tokens table for Background Notifications
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/idosnceaxvgnfqbwsjml/sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.device_push_tokens (
  id          UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  token       TEXT          NOT NULL,
  order_id    TEXT,
  order_token TEXT,
  user_id     TEXT,
  platform    TEXT          NOT NULL DEFAULT 'android',
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index for instant lookup by order_token and order_id
CREATE INDEX IF NOT EXISTS idx_device_push_tokens_order_token ON public.device_push_tokens (order_token);
CREATE INDEX IF NOT EXISTS idx_device_push_tokens_order_id ON public.device_push_tokens (order_id);
CREATE INDEX IF NOT EXISTS idx_device_push_tokens_token ON public.device_push_tokens (token);

-- Enable Row Level Security
ALTER TABLE public.device_push_tokens ENABLE ROW LEVEL SECURITY;

-- Allow public read & write access
CREATE POLICY "Allow public all access on device_push_tokens"
  ON public.device_push_tokens
  FOR ALL
  USING (true)
  WITH CHECK (true);
