-- =========================================================================
-- CANTEEN SETTINGS & MASTER ON/OFF SWITCH TABLE
-- =========================================================================

CREATE TABLE IF NOT EXISTS canteen_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default canteen status if not exists
INSERT INTO canteen_settings (key, value)
VALUES (
  'canteen_status',
  '{"isOpen": true, "reason": "Canteen is open for orders", "updated_at": "2026-11-15T00:00:00.000Z"}'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE canteen_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for customers and staff to check if canteen is open)
DROP POLICY IF EXISTS "Allow public read on canteen_settings" ON canteen_settings;
CREATE POLICY "Allow public read on canteen_settings"
  ON canteen_settings FOR SELECT USING (true);

-- Allow public/authenticated update access (for staff to toggle ON/OFF)
DROP POLICY IF EXISTS "Allow update on canteen_settings" ON canteen_settings;
CREATE POLICY "Allow update on canteen_settings"
  ON canteen_settings FOR ALL USING (true) WITH CHECK (true);

