import { supabase } from '@/integrations/supabase/client';

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  max_uses?: number;
  used_count: number;
  valid_from?: string;
  valid_until?: string;
  is_active: boolean;
  created_at?: string;
}

export interface CouponValidationResult {
  valid: boolean;
  discount: number;
  message: string;
  coupon?: Coupon;
}

// Built-in default coupons for fallback / offline
const DEFAULT_COUPONS: Coupon[] = [
  {
    id: 'c_welcome50',
    code: 'WELCOME50',
    description: 'Flat ₹50 off on orders above ₹150',
    discount_type: 'flat',
    discount_value: 50,
    min_order_amount: 150,
    max_discount_amount: 50,
    used_count: 0,
    is_active: true,
  },
  {
    id: 'c_grab10',
    code: 'GRAB10',
    description: '10% instant discount on orders above ₹100',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 100,
    max_discount_amount: 40,
    used_count: 0,
    is_active: true,
  },
  {
    id: 'c_snack20',
    code: 'SNACK20',
    description: 'Flat ₹20 off on orders above ₹80',
    discount_type: 'flat',
    discount_value: 20,
    min_order_amount: 80,
    max_discount_amount: 20,
    used_count: 0,
    is_active: true,
  },
];

const LOCAL_COUPONS_KEY = 'canteen_custom_coupons_v1';

function getLocalCoupons(): Coupon[] {
  try {
    const raw = localStorage.getItem(LOCAL_COUPONS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_COUPONS_KEY, JSON.stringify(DEFAULT_COUPONS));
      return DEFAULT_COUPONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_COUPONS;
  }
}

function saveLocalCoupons(coupons: Coupon[]) {
  try {
    localStorage.setItem(LOCAL_COUPONS_KEY, JSON.stringify(coupons));
  } catch {}
}

export async function fetchAllCoupons(): Promise<Coupon[]> {
  try {
    const { data, error } = await supabase
      .from('coupons' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return getLocalCoupons();
    }

    return data.map((d: any) => ({
      id: d.id,
      code: d.code,
      description: d.description || '',
      discount_type: d.discount_type,
      discount_value: Number(d.discount_value),
      min_order_amount: Number(d.min_order_amount || 0),
      max_discount_amount: d.max_discount_amount ? Number(d.max_discount_amount) : undefined,
      max_uses: d.max_uses,
      used_count: Number(d.used_count || 0),
      valid_from: d.valid_from,
      valid_until: d.valid_until,
      is_active: Boolean(d.is_active),
      created_at: d.created_at,
    }));
  } catch {
    return getLocalCoupons();
  }
}

export function calculateDiscount(coupon: Coupon, orderTotal: number): number {
  if (orderTotal < coupon.min_order_amount) return 0;

  let discount = 0;
  if (coupon.discount_type === 'flat') {
    discount = coupon.discount_value;
  } else {
    // percentage
    discount = Math.round((orderTotal * coupon.discount_value) / 100);
    if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
      discount = coupon.max_discount_amount;
    }
  }

  // Discount cannot exceed order total
  return Math.min(discount, orderTotal);
}

export async function validateCoupon(
  code: string,
  orderTotal: number
): Promise<CouponValidationResult> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, discount: 0, message: 'Please enter a coupon code' };
  }

  const coupons = await fetchAllCoupons();
  const coupon = coupons.find((c) => c.code.toUpperCase() === cleanCode);

  if (!coupon) {
    return { valid: false, discount: 0, message: 'Invalid coupon code' };
  }

  if (!coupon.is_active) {
    return { valid: false, discount: 0, message: 'This coupon is no longer active' };
  }

  if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
    return { valid: false, discount: 0, message: 'This coupon has expired' };
  }

  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
    return { valid: false, discount: 0, message: 'Coupon usage limit has been reached' };
  }

  if (orderTotal < coupon.min_order_amount) {
    return {
      valid: false,
      discount: 0,
      message: `Minimum order amount of ₹${coupon.min_order_amount} required`,
      coupon,
    };
  }

  const discount = calculateDiscount(coupon, orderTotal);

  return {
    valid: true,
    discount,
    message: `Coupon applied! You saved ₹${discount}`,
    coupon,
  };
}

export async function applyCouponToOrder(
  couponId: string,
  orderId: string,
  orderToken: string,
  discount: number
): Promise<void> {
  try {
    // Update used count
    await supabase.rpc('increment_coupon_usage', { coupon_id: couponId }).catch(() => {});

    await supabase
      .from('coupon_usage' as any)
      .insert({
        coupon_id: couponId,
        order_id: orderId,
        order_token: orderToken,
        discount_applied: discount,
      })
      .then(() => {})
      .catch(() => {});

    // Update local cache
    const locals = getLocalCoupons();
    const target = locals.find((c) => c.id === couponId);
    if (target) {
      target.used_count += 1;
      saveLocalCoupons(locals);
    }
  } catch (err) {
    console.warn('Coupon apply notice:', err);
  }
}

export async function createCoupon(coupon: Omit<Coupon, 'id' | 'used_count'>): Promise<Coupon | null> {
  try {
    const id = crypto.randomUUID();
    const newCoupon: Coupon = {
      ...coupon,
      id,
      used_count: 0,
      code: coupon.code.toUpperCase().trim(),
    };

    // Try Supabase insert
    const { data, error } = await supabase
      .from('coupons' as any)
      .insert({
        id,
        code: newCoupon.code,
        description: newCoupon.description,
        discount_type: newCoupon.discount_type,
        discount_value: newCoupon.discount_value,
        min_order_amount: newCoupon.min_order_amount,
        max_discount_amount: newCoupon.max_discount_amount || null,
        max_uses: newCoupon.max_uses || null,
        used_count: 0,
        valid_until: newCoupon.valid_until || null,
        is_active: newCoupon.is_active,
      })
      .select()
      .single();

    // Also persist to local list
    const locals = getLocalCoupons();
    locals.unshift(newCoupon);
    saveLocalCoupons(locals);

    return data ? (data as any) : newCoupon;
  } catch (err) {
    console.error('Error creating coupon:', err);
    return null;
  }
}

export async function updateCoupon(id: string, updates: Partial<Coupon>): Promise<boolean> {
  try {
    await supabase
      .from('coupons' as any)
      .update(updates)
      .eq('id', id);

    const locals = getLocalCoupons();
    const idx = locals.findIndex((c) => c.id === id);
    if (idx >= 0) {
      locals[idx] = { ...locals[idx], ...updates };
      saveLocalCoupons(locals);
    }
    return true;
  } catch {
    return false;
  }
}

export async function deleteCoupon(id: string): Promise<boolean> {
  try {
    await supabase
      .from('coupons' as any)
      .delete()
      .eq('id', id);

    const locals = getLocalCoupons().filter((c) => c.id !== id);
    saveLocalCoupons(locals);
    return true;
  } catch {
    return false;
  }
}

