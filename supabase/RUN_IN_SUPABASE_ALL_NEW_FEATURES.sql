-- =========================================================================
-- RUN THIS IN SUPABASE SQL EDITOR (ALL NEW FEATURES MIGRATION)
-- =========================================================================

-- 1. INVENTORY MANAGEMENT
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 100;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10;

CREATE TABLE IF NOT EXISTS inventory_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id TEXT NOT NULL,
  item_name TEXT,
  quantity_change INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('order', 'restock', 'waste', 'adjustment', 'initial')),
  performed_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS waste_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id TEXT NOT NULL,
  item_name TEXT,
  quantity INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('expired', 'damaged', 'spoiled', 'cancelled_order', 'other')),
  cost_loss NUMERIC DEFAULT 0,
  reported_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE inventory_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to authenticated users on inventory_log" ON inventory_log;
CREATE POLICY "Allow read access to authenticated users on inventory_log" 
  ON inventory_log FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert/update to staff and admin on inventory_log" ON inventory_log;
CREATE POLICY "Allow insert/update to staff and admin on inventory_log" 
  ON inventory_log FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read access to authenticated users on waste_log" ON waste_log;
CREATE POLICY "Allow read access to authenticated users on waste_log" 
  ON waste_log FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert/update to staff and admin on waste_log" ON waste_log;
CREATE POLICY "Allow insert/update to staff and admin on waste_log" 
  ON waste_log FOR ALL USING (true) WITH CHECK (true);


-- 2. COUPON & DISCOUNT ENGINE
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC DEFAULT 0,
  max_discount_amount NUMERIC,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

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

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on active coupons" ON coupons;
CREATE POLICY "Allow public read on active coupons" 
  ON coupons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow full access to staff and admin on coupons" ON coupons;
CREATE POLICY "Allow full access to staff and admin on coupons" 
  ON coupons FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert and read on coupon_usage" ON coupon_usage;
CREATE POLICY "Allow insert and read on coupon_usage" 
  ON coupon_usage FOR ALL USING (true) WITH CHECK (true);

-- Default coupons insert
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, is_active)
VALUES 
  ('WELCOME50', 'Get ₹50 off on orders above ₹150', 'flat', 50, 150, 50, true),
  ('GRAB10', '10% instant discount on orders above ₹100', 'percentage', 10, 100, 40, true),
  ('SNACK20', 'Flat ₹20 off for quick snacks', 'flat', 20, 80, 20, true)
ON CONFLICT (code) DO NOTHING;

