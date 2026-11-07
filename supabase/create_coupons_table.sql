-- Migration: Coupons & Discounts Tables
-- Run this in Supabase SQL Editor if tables don't exist yet

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC DEFAULT 0,
  max_discount_amount NUMERIC, -- cap for percentage discounts
  max_uses INTEGER,           -- null = unlimited
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Coupon redemption tracking
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  coupon_code TEXT NOT NULL,
  order_id TEXT,
  order_token TEXT,
  user_id TEXT,
  discount_applied NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on active coupons" 
  ON coupons FOR SELECT USING (true);

CREATE POLICY "Allow full access to staff and admin on coupons" 
  ON coupons FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow insert and read on coupon_usage" 
  ON coupon_usage FOR ALL USING (true) WITH CHECK (true);

-- Insert sample default coupons for immediate use
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, is_active)
VALUES 
  ('WELCOME50', 'Get ₹50 off on orders above ₹150', 'flat', 50, 150, 50, true),
  ('GRAB10', '10% instant discount on orders above ₹100', 'percentage', 10, 100, 40, true),
  ('SNACK20', 'Flat ₹20 off for quick snacks', 'flat', 20, 80, 20, true)
ON CONFLICT (code) DO NOTHING;

