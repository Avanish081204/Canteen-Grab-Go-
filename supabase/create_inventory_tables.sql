-- Migration: Inventory Management Tables
-- Run this in Supabase SQL Editor if tables/columns don't exist yet

-- 1. Add inventory columns to menu_items table
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 100;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10;

-- 2. Create inventory_log table for tracking stock adjustments, restocks, and waste
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

-- 3. Create waste_log table for tracking damaged/expired stock
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

-- 4. Enable Row Level Security (RLS)
ALTER TABLE inventory_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to authenticated users on inventory_log" 
  ON inventory_log FOR SELECT USING (true);

CREATE POLICY "Allow insert/update to staff and admin on inventory_log" 
  ON inventory_log FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow read access to authenticated users on waste_log" 
  ON waste_log FOR SELECT USING (true);

CREATE POLICY "Allow insert/update to staff and admin on waste_log" 
  ON waste_log FOR ALL USING (true) WITH CHECK (true);

