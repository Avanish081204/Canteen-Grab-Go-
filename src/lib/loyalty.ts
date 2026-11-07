import { supabase } from '@/integrations/supabase/client';

export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold';

export interface LoyaltyAccount {
  user_id: string;
  points_balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  tier: LoyaltyTier;
  updated_at?: string;
}

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  order_token?: string;
  points_change: number;
  balance_after: number;
  type: 'welcome' | 'order_earn' | 'order_redeem' | 'bonus' | 'adjustment';
  description: string;
  created_at: string;
}

const LOCAL_LOYALTY_KEY = 'canteen_loyalty_account_v1';
const LOCAL_HISTORY_KEY = 'canteen_loyalty_history_v1';

function getLocalAccount(userId: string): LoyaltyAccount {
  try {
    const raw = localStorage.getItem(`${LOCAL_LOYALTY_KEY}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch {}

  const defaultAccount: LoyaltyAccount = {
    user_id: userId,
    points_balance: 50, // 50 Welcome bonus points!
    lifetime_earned: 50,
    lifetime_spent: 0,
    tier: 'Bronze',
  };
  saveLocalAccount(defaultAccount);
  return defaultAccount;
}

function saveLocalAccount(account: LoyaltyAccount) {
  try {
    localStorage.setItem(
      `${LOCAL_LOYALTY_KEY}_${account.user_id}`,
      JSON.stringify(account)
    );
  } catch {}
}

function getLocalHistory(userId: string): LoyaltyTransaction[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_HISTORY_KEY}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch {}

  const welcomeTx: LoyaltyTransaction = {
    id: 'tx_welcome',
    user_id: userId,
    points_change: 50,
    balance_after: 50,
    type: 'welcome',
    description: 'Welcome Bonus Points! 🎉',
    created_at: new Date().toISOString(),
  };
  return [welcomeTx];
}

function saveLocalHistory(userId: string, history: LoyaltyTransaction[]) {
  try {
    localStorage.setItem(`${LOCAL_HISTORY_KEY}_${userId}`, JSON.stringify(history));
  } catch {}
}

export function computeTier(lifetimeEarned: number): LoyaltyTier {
  if (lifetimeEarned >= 500) return 'Gold';
  if (lifetimeEarned >= 200) return 'Silver';
  return 'Bronze';
}

export async function fetchLoyaltyAccount(userId: string): Promise<LoyaltyAccount> {
  if (!userId) {
    return {
      user_id: 'guest',
      points_balance: 0,
      lifetime_earned: 0,
      lifetime_spent: 0,
      tier: 'Bronze',
    };
  }

  try {
    const { data, error } = await supabase
      .from('loyalty_accounts' as any)
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      return data as LoyaltyAccount;
    }
  } catch {}

  return getLocalAccount(userId);
}

export async function fetchLoyaltyTransactions(userId: string): Promise<LoyaltyTransaction[]> {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('loyalty_history' as any)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data && data.length > 0) {
      return data as LoyaltyTransaction[];
    }
  } catch {}

  return getLocalHistory(userId);
}

/**
 * Earn points after order:
 * 1 point per ₹10 spent, multiplied by tier bonus (Bronze: 1x, Silver: 1.25x, Gold: 1.5x)
 */
export async function earnPointsForOrder(
  userId: string,
  orderToken: string,
  orderTotal: number
): Promise<number> {
  if (!userId || orderTotal <= 0) return 0;

  const account = await fetchLoyaltyAccount(userId);
  const multiplier = account.tier === 'Gold' ? 1.5 : account.tier === 'Silver' ? 1.25 : 1.0;
  const pointsEarned = Math.max(1, Math.round((orderTotal / 10) * multiplier));

  const newBalance = account.points_balance + pointsEarned;
  const newLifetime = account.lifetime_earned + pointsEarned;
  const newTier = computeTier(newLifetime);

  const updatedAccount: LoyaltyAccount = {
    ...account,
    points_balance: newBalance,
    lifetime_earned: newLifetime,
    tier: newTier,
  };

  saveLocalAccount(updatedAccount);

  const newTx: LoyaltyTransaction = {
    id: `tx_${Date.now()}`,
    user_id: userId,
    order_token: orderToken,
    points_change: pointsEarned,
    balance_after: newBalance,
    type: 'order_earn',
    description: `Earned on order #${orderToken}`,
    created_at: new Date().toISOString(),
  };

  const history = getLocalHistory(userId);
  history.unshift(newTx);
  saveLocalHistory(userId, history);

  // Sync to Supabase
  try {
    await supabase.from('loyalty_accounts' as any).upsert(updatedAccount);
    await supabase.from('loyalty_history' as any).insert(newTx);
  } catch {}

  window.dispatchEvent(new Event('loyaltyUpdated'));
  return pointsEarned;
}

/**
 * Redeem points for cash discount:
 * 1 point = ₹1 discount (max 50% of total order value)
 */
export async function redeemPointsForOrder(
  userId: string,
  orderToken: string,
  pointsToRedeem: number
): Promise<number> {
  if (!userId || pointsToRedeem <= 0) return 0;

  const account = await fetchLoyaltyAccount(userId);
  const actualRedeem = Math.min(account.points_balance, pointsToRedeem);
  if (actualRedeem <= 0) return 0;

  const newBalance = Math.max(0, account.points_balance - actualRedeem);
  const updatedAccount: LoyaltyAccount = {
    ...account,
    points_balance: newBalance,
    lifetime_spent: account.lifetime_spent + actualRedeem,
  };

  saveLocalAccount(updatedAccount);

  const newTx: LoyaltyTransaction = {
    id: `tx_${Date.now()}`,
    user_id: userId,
    order_token: orderToken,
    points_change: -actualRedeem,
    balance_after: newBalance,
    type: 'order_redeem',
    description: `Redeemed ₹${actualRedeem} on order #${orderToken}`,
    created_at: new Date().toISOString(),
  };

  const history = getLocalHistory(userId);
  history.unshift(newTx);
  saveLocalHistory(userId, history);

  // Sync to Supabase
  try {
    await supabase.from('loyalty_accounts' as any).upsert(updatedAccount);
    await supabase.from('loyalty_history' as any).insert(newTx);
  } catch {}

  window.dispatchEvent(new Event('loyaltyUpdated'));
  return actualRedeem; // ₹ discount amount
}

