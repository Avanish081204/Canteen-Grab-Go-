-- Migration: Loyalty Points & Rewards System

CREATE TABLE IF NOT EXISTS loyalty_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  points_balance INTEGER DEFAULT 50, -- 50 Welcome bonus points!
  lifetime_earned INTEGER DEFAULT 50,
  lifetime_spent INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'Bronze' CHECK (tier IN ('Bronze', 'Silver', 'Gold')),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loyalty_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  order_token TEXT,
  points_change INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('welcome', 'order_earn', 'order_redeem', 'bonus', 'adjustment')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on loyalty_accounts" ON loyalty_accounts;
CREATE POLICY "Allow all on loyalty_accounts" ON loyalty_accounts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on loyalty_history" ON loyalty_history;
CREATE POLICY "Allow all on loyalty_history" ON loyalty_history FOR ALL USING (true) WITH CHECK (true);
