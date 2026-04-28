-- ============================================================
-- Migration: Create reviews table
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id      UUID          NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_token   TEXT          NOT NULL,
  customer_name TEXT          NOT NULL DEFAULT 'Anonymous',
  rating        SMALLINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT          NOT NULL DEFAULT '',
  items         JSONB         NOT NULL DEFAULT '[]'::jsonb,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index for fast ordering
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews (created_at DESC);

-- Unique constraint: one review per order
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_order_id_unique ON public.reviews (order_id);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to READ reviews (public display)
CREATE POLICY "Allow public read of reviews"
  ON public.reviews
  FOR SELECT
  USING (true);

-- Allow anyone to INSERT a review (anonymous + logged-in users)
CREATE POLICY "Allow anyone to insert a review"
  ON public.reviews
  FOR INSERT
  WITH CHECK (true);
