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
  Plus,
  ShieldCheck,
  Ticket,
} from 'lucide-react';
import { fetchAllCoupons, Coupon } from '@/lib/coupons';
import { fetchMenuItems, MenuItem, addToCart } from '@/lib/store';
import { toast } from 'sonner';

export default function Offers() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [combos, setCombos] = useState<MenuItem[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchAllCoupons().then((all) => {
      setCoupons(all.filter((c) => c.is_active));
    });

    fetchMenuItems().then((items) => {
      setCombos(items.filter((i) => i.isCombo && i.isAvailable));
    });
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied! Apply at checkout.`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleAddCombo = (combo: MenuItem) => {
    addToCart(combo);
    toast.success(`${combo.name} added to cart!`);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16">
      {/* ── Top Header Banner ────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-primary text-white py-8 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2 border border-white/20">
            <Percent className="w-3.5 h-3.5" /> Campus Specials &amp; Savings
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Offers, Coupons &amp; Combo Deals
          </h1>
          <p className="text-white/85 text-xs sm:text-sm max-w-lg mx-auto mt-1.5">
            Save money on everyday campus meals with active coupons and value combo packs.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-3 sm:px-4 pt-6 space-y-8">
        {/* ── 1. Canteen Coins VIP Rewards Card ────────────────────── */}
        <div className="p-5 sm:p-7 rounded-3xl bg-card border border-amber-500/30 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <Coins className="w-7 h-7 sm:w-9 sm:h-9 text-amber-500" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                Automatic Cashback
              </span>
              <h3 className="text-base sm:text-xl font-black text-foreground mt-1">
                Earn 10% Back in Canteen Coins
              </h3>
              <p className="text-muted-foreground text-xs mt-0.5">
                Every meal earns you coins automatically. 1 Coin = ₹1 discount on future orders.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/profile')}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-sm transition-all whitespace-nowrap active:scale-95"
          >
            Check Coins Balance
          </button>
        </div>

        {/* ── 2. Active Coupons Section ────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" />
                Active Discount Coupons
              </h2>
              <p className="text-xs text-muted-foreground">
                Copy coupon code and paste in the checkout summary
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {coupons.map((coupon) => {
              const isCopied = copiedCode === coupon.code;
              return (
                <div
                  key={coupon.id}
                  className="p-4 rounded-3xl bg-card border border-border/70 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group"
                >
                  <div>
                    {/* Top Tag & Discount Amount */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-primary/10 text-primary border border-primary/20">
                        {coupon.discount_type === 'flat'
                          ? `FLAT ₹${coupon.discount_value} OFF`
                          : `${coupon.discount_value}% OFF`}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        Min ₹{coupon.min_order_amount}
                      </span>
                    </div>

                    {/* Coupon Code Pill */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-muted/60 border border-dashed border-border/80 my-2">
                      <span className="font-mono font-black text-sm text-foreground tracking-wider">
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => handleCopy(coupon.code)}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                        title="Copy coupon code"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-600 text-[11px]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      {coupon.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Valid on all canteen items</span>
                    <button
                      onClick={() => navigate('/')}
                      className="text-primary font-bold hover:underline"
                    >
                      Order Food →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 3. Daily Value Combo Packs ────────────────────────────── */}
        {combos.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Value Meal Combos
                </h2>
                <p className="text-xs text-muted-foreground">
                  Pre-bundled meal deals with maximum savings
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {combos.map((combo) => (
                <div
                  key={combo.id}
                  className="rounded-3xl bg-card border border-border/70 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="relative h-36 w-full bg-muted">
                    <img
                      src={combo.image}
                      alt={combo.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full text-[10px] shadow-md uppercase tracking-wider">
                      Combo Saver
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-black text-base text-foreground leading-tight">
                        {combo.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {combo.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50">
                      <div>
                        <span className="text-xs text-muted-foreground line-through mr-1.5">
                          ₹{combo.price + 35}
                        </span>
                        <span className="text-lg font-black text-primary">
                          ₹{combo.price}
                        </span>
                      </div>

                      <button
                        onClick={() => handleAddCombo(combo)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs px-3.5 py-2 rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        Add Combo
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 4. Happy Hours & Group Dining Perk ────────────────────── */}
        <div className="p-5 rounded-3xl bg-muted/40 border border-border/60 text-center space-y-2">
          <Clock className="w-6 h-6 text-amber-500 mx-auto" />
          <h4 className="font-black text-sm text-foreground">
            Campus Tea Break &amp; Group Orders
          </h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Order for your project team or batch! Orders above ₹300 automatically qualify for priority preparation and extra bonus coins.
          </p>
        </div>
      </div>
    </div>
  );
}

