import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tag,
  Copy,
  Check,
  Percent,
  Coins,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  ChevronRight,
  Info,
} from 'lucide-react';
import { fetchAllCoupons, Coupon } from '@/lib/coupons';
import { fetchMenuItems, MenuItem } from '@/lib/store';
import { fetchLoyaltyAccount, LoyaltyAccount } from '@/lib/loyalty';
import { useKitchenStatus } from '@/lib/kitchen-status';
import { supabase } from '@/integrations/supabase/client';
import MenuItemCard from '@/components/MenuItemCard';
import { toast } from 'sonner';

export default function Offers() {
  const navigate = useNavigate();
  const kitchenStatus = useKitchenStatus();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [combos, setCombos] = useState<MenuItem[]>([]);
  const [appliedCode, setAppliedCode] = useState<string | null>(() => {
    return sessionStorage.getItem('active_coupon');
  });
  const [loyaltyAccount, setLoyaltyAccount] = useState<LoyaltyAccount | null>(null);
  const [cartUpdateTrigger, setCartUpdateTrigger] = useState(0);

  useEffect(() => {
    // 1. Fetch active coupons
    fetchAllCoupons().then((all) => {
      setCoupons(all.filter((c) => c.is_active));
    });

    // 2. Fetch value combo meal deals
    fetchMenuItems().then((items) => {
      setCombos(items.filter((i) => (i.isCombo || i.category === 'Combos') && i.isAvailable));
    });

    // 3. Fetch loyalty account
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        fetchLoyaltyAccount(user.id).then((acc) => {
          setLoyaltyAccount(acc);
        });
      }
    });
  }, []);

  const handleApplyCoupon = (code: string) => {
    sessionStorage.setItem('active_coupon', code);
    setAppliedCode(code);
    toast.success(`Coupon "${code}" applied! Discount will be deducted at checkout.`);
  };

  const handleCartUpdate = () => {
    setCartUpdateTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 text-foreground">
      {/* ── Top Campus Location Bar (Identical to Home Page) ─────────── */}
      <div className="bg-card border-b border-border/70 py-2.5 px-3 sm:px-4">
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <span>SLRTCE Campus Canteen • Ground Floor</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              {kitchenStatus.isOpen ? `Open (~${kitchenStatus.estimatedWaitMinutes}m prep)` : 'Closed'}
            </span>
          </div>

          <div className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-primary" />
            <span>Offers &amp; Deals Hub</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-3 sm:px-4 pt-4 sm:pt-6 space-y-6">
        {/* ── Section Header ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              <span>Offers &amp; Campus Deals</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Curated promo coupons, value combo meals, and canteen loyalty coins
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
              {coupons.length} Active Coupons
            </span>
            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">
              10% Coins Cashback
            </span>
          </div>
        </div>

        {/* ── 1. Canteen Loyalty Coins Card (Matches Home Promo Banner 2) ── */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white border border-border/40 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Coins className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  Automatic Loyalty Cashback
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-1">
                Earn 10% Back in Canteen Coins on Every Order
              </h3>
              <p className="text-slate-300 text-xs mt-0.5">
                1 Coin = ₹1 cash discount. Coins are automatically deposited on each order and redeemable at checkout.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 block font-bold">Your Balance</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                {loyaltyAccount ? `${loyaltyAccount.points_balance} Coins` : '50 Coins'}
              </span>
              <span className="text-[10px] text-slate-400 block">
                Worth ₹{loyaltyAccount ? loyaltyAccount.points_balance : 50} Instant Off
              </span>
            </div>

            <button
              onClick={() => navigate('/profile')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
            >
              Check Coins
            </button>
          </div>
        </div>

        {/* ── 2. Active Coupons (Clean Swiggy/Zomato Coupon Vouchers) ──── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                <Percent className="w-4 h-4 text-primary" />
                <span>Active Discount Coupons</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click Apply to auto-activate the discount code for your order
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coupons.map((coupon) => {
              const isApplied = appliedCode === coupon.code;
              const isFlat = coupon.discount_type === 'flat';

              return (
                <div
                  key={coupon.id}
                  className={`p-4 rounded-3xl bg-card border transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md ${
                    isApplied ? 'border-primary ring-2 ring-primary/20' : 'border-border/80'
                  }`}
                >
                  <div>
                    {/* Header: Discount Badge & Min Spend */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-xl">
                        {isFlat ? `FLAT ₹${coupon.discount_value} OFF` : `${coupon.discount_value}% OFF`}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-semibold">
                        Min spend ₹{coupon.min_order_amount}
                      </span>
                    </div>

                    {/* Code & Apply Action */}
                    <div className="flex items-center justify-between p-2.5 rounded-2xl bg-muted/60 border border-border/70 my-2.5">
                      <div>
                        <span className="text-[9px] uppercase font-extrabold text-muted-foreground block tracking-wider">
                          Coupon Code
                        </span>
                        <span className="font-mono font-black text-sm text-foreground tracking-wider">
                          {coupon.code}
                        </span>
                      </div>

                      <button
                        onClick={() => handleApplyCoupon(coupon.code)}
                        className={`text-xs font-black px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                          isApplied
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-primary text-primary-foreground hover:brightness-110 active:scale-95 shadow-xs'
                        }`}
                      >
                        {isApplied ? '✓ Applied' : 'Apply Code'}
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      {coupon.description}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 mt-3 border-t border-border/50 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground font-medium">Valid on all items</span>
                    <button
                      onClick={() => {
                        sessionStorage.setItem('active_coupon', coupon.code);
                        navigate('/');
                      }}
                      className="text-primary font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Order Food</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 3. Value Meal Combos (Using EXACT MenuItemCard from Home Page!) ── */}
        {combos.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-border/60 pb-2">
              <div>
                <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Value Meal Combos</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Complete meal combos bundled with snacks, sides, and chilled beverages
                </p>
              </div>

              <button
                onClick={() => navigate('/')}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Full Menu</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Exactly the same MenuItemCard grid from Home Page */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4.5">
              {combos.map((combo) => (
                <MenuItemCard
                  key={combo.id}
                  item={combo}
                  onCartUpdate={handleCartUpdate}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── 4. Campus Group Dining Notice ───────────────────────────── */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex items-center gap-3 text-xs text-muted-foreground">
          <Info className="w-4 h-4 text-primary flex-shrink-0" />
          <span>
            <strong className="text-foreground">Student Tip:</strong> You can stack active promo coupons with your Canteen Coins at checkout for maximum discount on every single order!
          </span>
        </div>
      </div>
    </div>
  );
}