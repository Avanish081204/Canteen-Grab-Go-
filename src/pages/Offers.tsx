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
  ChevronRight,
  Gift,
  HelpCircle,
  Zap,
  Calculator,
  Flame,
  Award,
} from 'lucide-react';
import { fetchAllCoupons, Coupon } from '@/lib/coupons';
import { fetchMenuItems, MenuItem, addToCart } from '@/lib/store';
import { fetchLoyaltyAccount, LoyaltyAccount } from '@/lib/loyalty';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Offers() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [combos, setCombos] = useState<MenuItem[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [loyaltyAccount, setLoyaltyAccount] = useState<LoyaltyAccount | null>(null);

  // Gamified Scratch Card State
  const [isScratched, setIsScratched] = useState(() => {
    return localStorage.getItem('canteen_scratched_today') === 'true';
  });

  // Interactive Savings Calculator State
  const [simulatedSpend, setSimulatedSpend] = useState<number>(200);

  // Flash Deal Live Timer (hours, minutes, seconds)
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 30 });

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

    // Flash countdown timer interval
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 3, minutes: 0, seconds: 0 }; // Loop
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    sessionStorage.setItem('active_coupon', code);
    toast.success(`Coupon "${code}" copied & activated for checkout!`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleApplyAndOrder = (code: string) => {
    navigator.clipboard.writeText(code);
    sessionStorage.setItem('active_coupon', code);
    toast.success(`Coupon "${code}" auto-applied! Redirecting to menu...`);
    navigate('/');
  };

  const handleAddCombo = (combo: MenuItem) => {
    addToCart(combo);
    toast.success(`${combo.name} added to cart!`, { duration: 1800 });
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleScratch = () => {
    if (!isScratched) {
      setIsScratched(true);
      localStorage.setItem('canteen_scratched_today', 'true');
      toast.success('🎉 Mystery Reward Unlocked: Code CHAI10 + 20 Bonus Coins!', { duration: 3500 });
    }
  };

  // Calculator logic
  const calculatedDiscount = simulatedSpend >= 150 ? 50 : simulatedSpend >= 100 ? Math.round(simulatedSpend * 0.1) : 0;
  const calculatedCoins = Math.round((simulatedSpend - calculatedDiscount) * 0.1);
  const totalSaved = calculatedDiscount + calculatedCoins;
  const finalPay = simulatedSpend - calculatedDiscount;

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 text-foreground">
      {/* ── Sleek Compact Gourmet Hero Header ────────────────────────── */}
      <div className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-background border-b border-border/40 text-white pt-8 pb-10 px-4 overflow-hidden">
        {/* Ambient Warm Spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-primary/20 blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          {/* Breadcrumb / Category Tag */}
          <div className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student Savings &amp; Deals Hub</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Offers, Coupons &amp; Value Combos
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto mt-2 leading-relaxed">
            Get instant discounts on your daily meals with active campus coupons, 10% loyalty coins cashback, and flash combo deals.
          </p>

          {/* Savings Highlight Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-5 text-xs font-bold">
            <span className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-white/90 flex items-center gap-1.5 shadow-xs">
              <Ticket className="w-3.5 h-3.5 text-amber-400" />
              <span>{coupons.length} Active Vouchers</span>
            </span>
            <span className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-white/90 flex items-center gap-1.5 shadow-xs">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>10% Auto Coins Cashback</span>
            </span>
            <span className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-white/90 flex items-center gap-1.5 shadow-xs">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Save up to ₹50 Today</span>
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-3 sm:px-4 -mt-4 space-y-8 relative z-20">
        {/* ── 1. Canteen Coins VIP Rewards Pass (Cred-Style) ──────────── */}
        <div className="p-5 sm:p-6 rounded-3xl bg-card border-2 border-amber-500/30 shadow-xl shadow-amber-500/5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-5 bg-gradient-to-r from-amber-500/10 via-card to-card">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 flex-shrink-0 shadow-md">
              <Coins className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  10% Auto Cashback
                </span>
                <span className="text-[10px] text-muted-foreground font-mono font-bold">
                  1 Coin = ₹1 Discount
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-foreground mt-1">
                Earn 10% Back in Canteen Coins
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Every meal automatically deposits coins. Redeem them at checkout for flat cash discounts!
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-border/50">
            <div className="text-left md:text-right">
              <span className="text-[10px] text-muted-foreground block font-bold">Available Balance</span>
              <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
                {loyaltyAccount ? `${loyaltyAccount.points_balance} Coins` : '50 Coins'}
              </span>
              <span className="text-[10px] text-muted-foreground block">
                Worth ₹{loyaltyAccount ? loyaltyAccount.points_balance : 50} Instant Off
              </span>
            </div>

            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition-all whitespace-nowrap active:scale-95 cursor-pointer"
            >
              View Pass
            </button>
          </div>
        </div>

        {/* ── 2. Live Flash Deal Countdown Banner ─────────────────────── */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-primary via-orange-600 to-amber-500 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
              <Flame className="w-6 h-6 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-black/25 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-1">
                <Clock className="w-3 h-3" />
                <span>Afternoon Campus Rush Deal</span>
              </div>
              <h3 className="text-base sm:text-lg font-black leading-tight">
                Burger + Salted Fries + Cold Beverage @ ₹99
              </h3>
              <p className="text-white/85 text-xs">Standard price ₹134 • Instant flat ₹35 savings</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Countdown Box */}
            <div className="flex items-center gap-1 font-mono font-black text-xs bg-black/30 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20">
              <span className="bg-white/20 px-1.5 py-0.5 rounded">{String(timeLeft.hours).padStart(2, '0')}h</span>
              <span>:</span>
              <span className="bg-white/20 px-1.5 py-0.5 rounded">{String(timeLeft.minutes).padStart(2, '0')}m</span>
              <span>:</span>
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-yellow-300">{String(timeLeft.seconds).padStart(2, '0')}s</span>
            </div>

            <button
              onClick={() => {
                const burgerCombo = combos.find((c) => c.name.toLowerCase().includes('burger')) || combos[0];
                if (burgerCombo) handleAddCombo(burgerCombo);
                else navigate('/');
              }}
              className="bg-white text-slate-950 hover:bg-white/90 font-black text-xs px-4 py-2.5 rounded-xl shadow-md active:scale-95 transition-all whitespace-nowrap cursor-pointer"
            >
              Grab Deal
            </button>
          </div>
        </div>

        {/* ── 3. Authentic Perforated Voucher Coupons (Real Ticket Cutouts) ─ */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" />
                <span>Active Discount Vouchers</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click &ldquo;Apply &amp; Order&rdquo; to auto-activate the discount code at checkout
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {coupons.map((coupon) => {
              const isCopied = copiedCode === coupon.code;
              const isFlat = coupon.discount_type === 'flat';

              return (
                <div
                  key={coupon.id}
                  className="rounded-3xl bg-card border border-border/80 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between relative group"
                >
                  {/* Left Ticket Notch (Authentic Semicircular Cutout) */}
                  <div className="w-5 h-5 rounded-full bg-background border-r border-border/80 absolute -left-2.5 top-[76px] z-20 pointer-events-none" />
                  {/* Right Ticket Notch */}
                  <div className="w-5 h-5 rounded-full bg-background border-l border-border/80 absolute -right-2.5 top-[76px] z-20 pointer-events-none" />

                  {/* Top Header Ticket Band */}
                  <div
                    className={`p-4 flex items-center justify-between text-white ${
                      isFlat
                        ? 'bg-gradient-to-r from-rose-600 to-orange-500'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-black tracking-wider uppercase bg-black/20 px-2 py-0.5 rounded-full border border-white/20">
                        {isFlat ? 'Flat Cash Off' : 'Percentage Off'}
                      </span>
                      <h3 className="text-2xl font-black tracking-tight mt-1 leading-none">
                        {isFlat ? `₹${coupon.discount_value} OFF` : `${coupon.discount_value}% OFF`}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] opacity-80 block font-medium">Min Order</span>
                      <span className="text-sm font-black">₹{coupon.min_order_amount}</span>
                    </div>
                  </div>

                  {/* Perforated Divider Line */}
                  <div className="w-full border-b-2 border-dashed border-border/80 my-0.5" />

                  {/* Voucher Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <p className="text-xs text-foreground/85 font-medium leading-relaxed">
                      {coupon.description}
                    </p>

                    {/* Promo Code Box */}
                    <div className="flex items-center justify-between p-2.5 rounded-2xl bg-muted/60 border border-border/80">
                      <div>
                        <span className="text-[9px] uppercase font-extrabold text-muted-foreground block tracking-wider">
                          Promo Code
                        </span>
                        <span className="font-mono font-black text-sm text-foreground tracking-widest">
                          {coupon.code}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopy(coupon.code)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-primary text-primary-foreground hover:brightness-110 active:scale-95 shadow-xs'
                        }`}
                        title="Copy promo code"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Voucher Footer Action */}
                    <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground font-medium">
                        Verified student perk
                      </span>
                      <button
                        onClick={() => handleApplyAndOrder(coupon.code)}
                        className="text-primary font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Apply &amp; Order</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 4. Interactive Student Mystery Scratch Card (Gamified Reward) ── */}
        <div className="p-5 sm:p-6 rounded-3xl bg-card border-2 border-dashed border-amber-500/40 shadow-lg relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-3.5 text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 flex-shrink-0">
                <Gift className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Daily Mystery Reward
                </span>
                <h3 className="text-base sm:text-lg font-black text-foreground mt-1">
                  Today&apos;s Student Secret Scratch Card
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tap to scratch and unlock guaranteed bonus coins or exclusive beverage discounts!
                </p>
              </div>
            </div>

            {/* Interactive Scratch Area */}
            <div className="w-full md:w-auto">
              {!isScratched ? (
                <button
                  type="button"
                  onClick={handleScratch}
                  className="w-full md:w-64 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer border border-yellow-200"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Tap to Scratch &amp; Reveal</span>
                </button>
              ) : (
                <div className="w-full md:w-72 p-3 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 text-center space-y-1 animate-fade-in">
                  <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 font-black text-xs">
                    <Check className="w-4 h-4" />
                    <span>Unlocked: +20 Coins &amp; Code CHAI10</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Flat ₹10 off on Masala Chai &amp; Cold Drinks!
                  </p>
                  <button
                    onClick={() => handleApplyAndOrder('CHAI10')}
                    className="text-[11px] font-bold text-primary hover:underline block mx-auto pt-1 cursor-pointer"
                  >
                    Apply Code CHAI10 &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── 5. Value Meal Combos Section ────────────────────────────── */}
        {combos.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Value Meal Combos (Save up to ₹40)</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pre-bundled meal deals offering maximum savings and complete hunger satisfaction
                </p>
              </div>

              <button
                onClick={() => navigate('/')}
                className="text-xs font-bold text-primary hover:underline hidden sm:inline-flex items-center gap-0.5 cursor-pointer"
              >
                <span>Full Menu</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {combos.map((combo) => {
                const originalPrice = combo.price + 35;
                const savings = originalPrice - combo.price;

                return (
                  <div
                    key={combo.id}
                    className="rounded-3xl bg-card border border-border/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    {/* Combo Food Image */}
                    <div className="relative h-40 w-full bg-muted overflow-hidden">
                      <img
                        src={combo.image}
                        alt={combo.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                      <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black px-2.5 py-0.5 rounded-full text-[10px] shadow-md uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Save ₹{savings}</span>
                      </div>

                      <div className="absolute bottom-2.5 left-3 text-white text-xs font-bold">
                        <span>Entrée + Drink + Sides Combo</span>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="font-black text-base text-foreground leading-tight">
                          {combo.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {combo.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <div>
                          <span className="text-xs text-muted-foreground line-through mr-1.5 font-mono">
                            ₹{originalPrice}
                          </span>
                          <span className="text-xl font-black text-primary font-mono">
                            ₹{combo.price}
                          </span>
                        </div>

                        <button
                          onClick={() => handleAddCombo(combo)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs px-4 py-2 rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Add Combo</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 6. Interactive Student Savings Calculator ───────────────── */}
        <div className="p-5 sm:p-7 rounded-3xl bg-card border border-border/80 shadow-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                <span>Student Savings Simulator</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                See how much cash and coins you save on your everyday campus order
              </p>
            </div>

            {/* Quick Spend Preset Buttons */}
            <div className="flex items-center gap-1.5 bg-muted/80 p-1 rounded-2xl border border-border/60 text-xs font-bold">
              {[100, 150, 200, 300].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setSimulatedSpend(amt)}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    simulatedSpend === amt
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Savings Calculation Receipt */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-muted/40 border border-border/60 text-center">
            <div>
              <span className="text-[10px] text-muted-foreground font-bold block">Meal Order</span>
              <span className="text-base sm:text-lg font-black font-mono">₹{simulatedSpend}</span>
            </div>

            <div>
              <span className="text-[10px] text-primary font-bold block">Coupon Off</span>
              <span className="text-base sm:text-lg font-black text-primary font-mono">-₹{calculatedDiscount}</span>
            </div>

            <div>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">Coins Cashback</span>
              <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 font-mono">+{calculatedCoins} pts</span>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-1">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">Total Saved</span>
              <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">₹{totalSaved}</span>
            </div>
          </div>
        </div>

        {/* ── 7. How to Redeem in 3 Simple Steps ──────────────────────── */}
        <div className="p-6 rounded-3xl bg-card border border-border/70 shadow-xs">
          <h3 className="text-sm sm:text-base font-black text-foreground mb-4 text-center">
            How to Redeem Coupons in 3 Easy Steps
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-black text-sm flex items-center justify-center mx-auto mb-2">
                1
              </div>
              <h4 className="text-xs font-black text-foreground">Copy Coupon</h4>
              <p className="text-[11px] text-muted-foreground">
                Click &ldquo;Copy&rdquo; on any active voucher from this page.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 font-black text-sm flex items-center justify-center mx-auto mb-2">
                2
              </div>
              <h4 className="text-xs font-black text-foreground">Add Your Food</h4>
              <p className="text-[11px] text-muted-foreground">
                Pick your canteen favorites and head over to Cart summary.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 font-black text-sm flex items-center justify-center mx-auto mb-2">
                3
              </div>
              <h4 className="text-xs font-black text-foreground">Auto-Apply &amp; Save</h4>
              <p className="text-[11px] text-muted-foreground">
                Your coupon and coins auto-apply at checkout for maximum savings!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}