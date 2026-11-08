import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  UtensilsCrossed,
  Package,
  Truck,
  Sparkles,
  Clock,
  Ticket,
  Star,
  ChevronRight,
  Zap,
  Smartphone,
  Search,
  Coins,
  ShieldCheck,
  Flame,
  ArrowRight,
  Monitor,
} from 'lucide-react';
import OrderTypeCard from '@/components/OrderTypeCard';
import MenuItemCard from '@/components/MenuItemCard';
import heroImage from '@/assets/hero-food.jpg';
import {
  setOrderType,
  fetchAllReviews,
  fetchMenuItems,
  Review,
  MenuItem,
  fetchStaffOrders,
  Order,
} from '@/lib/store';
import Logo from '@/components/Logo';
import { useNotifications } from '@/hooks/use-notifications';
import { useKitchenStatus } from '@/lib/kitchen-status';

const POPULAR_SEARCH_PILLS = [
  { name: 'Burger', query: 'burger' },
  { name: 'Cold Coffee', query: 'coffee' },
  { name: 'Samosa', query: 'samosa' },
  { name: 'Fries', query: 'fries' },
  { name: 'Pav Bhaji', query: 'pav' },
  { name: 'Combos', query: 'combo' },
];

export default function Index() {
  const navigate = useNavigate();
  const { addPromo } = useNotifications();
  const kitchenStatus = useKitchenStatus();
  const [heroSearch, setHeroSearch] = useState('');
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [readyTokens, setReadyTokens] = useState<string[]>([]);

  // Welcome promo check
  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const lastShownDate = localStorage.getItem('canteen_welcome_last_shown_date');

      if (lastShownDate !== today) {
        localStorage.setItem('canteen_welcome_last_shown_date', today);
        const timer = setTimeout(() => {
          addPromo(
            'Welcome to Campus Gourmet Canteen',
            "Fresh meals prepared daily. Order ahead to skip the waiting line!"
          );
        }, 1500);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn('Welcome notification check error:', e);
    }
  }, [addPromo]);

  // Load featured chef specials & live ready tokens
  useEffect(() => {
    fetchMenuItems().then(items => {
      const specials = items.filter(i => i.isSpecial && i.isAvailable).slice(0, 4);
      setFeaturedItems(specials);
    });

    fetchStaffOrders().then(orders => {
      const ready = orders
        .filter(o => o.status === 'ready' && o.type !== 'staff-delivery')
        .map(o => o.token)
        .slice(0, 4);
      setReadyTokens(ready);
    });
  }, []);

  const handleOrderType = (type: 'dine-in' | 'take-away' | 'staff-delivery') => {
    if (type === 'staff-delivery') {
      navigate('/staff-code');
    } else {
      setOrderType(type);
      navigate('/menu');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      setOrderType('dine-in');
      navigate(`/menu?q=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/menu');
    }
  };

  const handlePillClick = (query: string) => {
    setOrderType('dine-in');
    navigate(`/menu?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="page-container">
      {/* ── Live Token Counter Ticker ─────────────────────────────── */}
      <div className="bg-slate-900 text-white text-xs border-b border-white/10 px-3 py-2">
        <div className="container mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="flex h-2 w-2 relative flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-extrabold text-amber-400 uppercase tracking-wider text-[10px]">
              Now Serving Counter:
            </span>
            {readyTokens.length > 0 ? (
              <span className="font-mono font-bold text-white tracking-wide">
                Tokens {readyTokens.map(t => `#${t}`).join(', ')}
              </span>
            ) : (
              <span className="text-slate-300">
                Kitchen active • Orders ready in ~{kitchenStatus.estimatedWaitMinutes}m
              </span>
            )}
          </div>

          <button
            onClick={() => navigate('/display')}
            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 hover:underline flex-shrink-0"
          >
            <Monitor className="w-3 h-3" />
            <span>Open Big Screen</span>
          </button>
        </div>
      </div>

      {/* ── Visual Gourmet Hero Section ────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-background py-10 sm:py-16 md:py-24">
        {/* Ambient Decorative Blurs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headlines & Instant Search */}
            <div className="lg:col-span-7 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 mb-4 animate-fade-in shadow-md">
                <span
                  className={`w-2 h-2 rounded-full ${
                    kitchenStatus.rushLevel === 'low'
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-amber-400 animate-pulse'
                  }`}
                />
                <span className="text-white text-xs font-bold tracking-wide">
                  {kitchenStatus.isOpen
                    ? `Live Kitchen Status: ${kitchenStatus.rushLabel} (~${kitchenStatus.estimatedWaitMinutes}m wait)`
                    : 'Canteen Hours: 8:00 AM – 7:30 PM'}
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-[1.1] tracking-tight">
                Skip Canteen Lines.
                <span className="block mt-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
                  Fresh Food On Demand.
                </span>
              </h1>

              <p className="text-sm sm:text-lg text-slate-300 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Pre-order gourmet snacks, authentic meals, and chilled beverages from anywhere on campus. Get assigned a smart digital token and pick up fresh food without the wait.
              </p>

              {/* High-Tech Food Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative max-w-lg mx-auto lg:mx-0 mb-4">
                <div className="relative flex items-center shadow-2xl rounded-2xl overflow-hidden border border-white/20 bg-white/95">
                  <Search className="absolute left-4 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search e.g. Cheese Burger, Cold Coffee, Samosa..."
                    className="w-full pl-11 pr-28 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold text-slate-900 bg-transparent placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md active:scale-95 transition-all"
                  >
                    Explore
                  </button>
                </div>
              </form>

              {/* Quick Search Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 mb-8">
                <span className="text-[11px] font-bold text-slate-400 mr-1">Popular:</span>
                {POPULAR_SEARCH_PILLS.map((pill) => (
                  <button
                    key={pill.name}
                    type="button"
                    onClick={() => handlePillClick(pill.query)}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all active:scale-95"
                  >
                    {pill.name}
                  </button>
                ))}
              </div>

              {/* Dual Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <button
                  onClick={() => {
                    setOrderType('dine-in');
                    navigate('/menu');
                  }}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black px-6 py-3.5 rounded-2xl shadow-xl hover:shadow-2xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 text-sm"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>Start Food Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate('/track')}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3.5 rounded-2xl border border-white/20 backdrop-blur-md active:scale-95 transition-all text-sm flex items-center gap-2"
                >
                  <Ticket className="w-4 h-4 text-amber-400" />
                  <span>Track Live Token</span>
                </button>
              </div>
            </div>

            {/* Right Column: Visual Interactive Showcase Card */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative">
                {/* Floating Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl blur-xl opacity-40 animate-pulse" />

                {/* Glassmorphic Showcase Card */}
                <div className="relative rounded-3xl bg-slate-900/90 border border-white/20 p-5 backdrop-blur-2xl text-white shadow-2xl">
                  {/* Food Image */}
                  <div className="relative h-56 rounded-2xl overflow-hidden mb-4 bg-muted">
                    <img
                      src="https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80"
                      alt="Burger Combo"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black px-2.5 py-1 rounded-full text-xs shadow-md uppercase tracking-wider">
                      Chef's Choice
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-white/20">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>4.9 (480+ reviews)</span>
                    </div>
                  </div>

                  {/* Dish Title & Description */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-xl font-black text-white">Signature Burger Combo</h3>
                      <p className="text-xs text-slate-300">Crispy burger + Golden Fries + Chilled drink</p>
                    </div>
                    <span className="text-2xl font-black text-amber-400">₹99</span>
                  </div>

                  {/* Floating Live Token Notification Simulation */}
                  <div className="p-3 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                        ✓
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Token #104 Ready!</p>
                        <p className="text-[10px] text-emerald-400 font-semibold">Ready for pickup at counter 1</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setOrderType('dine-in');
                        navigate('/menu');
                      }}
                      className="text-xs font-bold bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl hover:bg-amber-300 transition-colors"
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 Smart Dining Modes ────────────────────────────────────── */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <span className="inline-block text-primary font-black text-xs uppercase tracking-widest mb-2">
              Fast, Flexible &amp; Contactless
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-foreground mb-2">
              Choose How You Want to Dine
            </h2>
            <p className="text-muted-foreground text-xs sm:text-base max-w-lg mx-auto">
              Skip traditional counter standing — pick your dining mode and track your order live.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            <OrderTypeCard
              title="Dine In"
              description="Eat in the cafeteria. Receive a digital token number and collect at counter."
              icon={UtensilsCrossed}
              color="blue"
              onClick={() => handleOrderType('dine-in')}
            />
            <OrderTypeCard
              title="Take Away"
              description="Neatly packaged in hot food containers. Grab your box and head to class."
              icon={Package}
              color="green"
              onClick={() => handleOrderType('take-away')}
            />
            <OrderTypeCard
              title="Staff Delivery"
              description="Direct office & department delivery exclusively for college faculty."
              icon={Truck}
              color="purple"
              onClick={() => handleOrderType('staff-delivery')}
            />
          </div>
        </div>
      </section>

      {/* ── Today's Signature Specials ───────────────────────────────── */}
      {featuredItems.length > 0 && (
        <section className="py-12 bg-muted/30 border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-3">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Chef's Recommendations
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-foreground mt-0.5">
                  Today's Gourmet Specials
                </h2>
              </div>
              <button
                onClick={() => navigate('/menu')}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:underline"
              >
                <span>View Full Menu &amp; Categories</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {featuredItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onCartUpdate={() => {}}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── VIP Canteen Club Banner ─────────────────────────────────── */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-primary/10 border border-amber-500/30 p-6 sm:p-10 relative overflow-hidden shadow-sm">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-500/30">
                  <Coins className="w-3.5 h-3.5" />
                  Campus Canteen Loyalty Rewards
                </div>
                <h3 className="text-xl sm:text-3xl font-black text-foreground">
                  Earn Canteen Coins with Every Order
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm max-w-xl">
                  Get 50 bonus coins on signup, earn 10% back on every meal, and redeem coins directly at checkout for discounts!
                </p>
              </div>

              <button
                onClick={() => navigate('/profile')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition-all whitespace-nowrap"
              >
                View Your Coins Balance
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us Metrics ───────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-block text-primary font-black text-xs uppercase tracking-widest mb-2">
              Why Campus Students Love It
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">
              Smart Cafeteria Technology
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8 max-w-5xl mx-auto">
            <div className="feature-card text-center group bg-card p-6 rounded-3xl border border-border/70 shadow-xs hover:shadow-xl transition-all">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-300">
                <Smartphone className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-foreground mb-1.5">
                Instant Order Ahead
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Place orders from class or hostel and arrive right when food is hot and ready.
              </p>
            </div>

            <div className="feature-card text-center group bg-card p-6 rounded-3xl border border-border/70 shadow-xs hover:shadow-xl transition-all">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-300">
                <Ticket className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500" />
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-foreground mb-1.5">
                Live Token Counter
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Track your token on your phone or check the big TV display screen in the cafeteria.
              </p>
            </div>

            <div className="feature-card text-center group bg-card p-6 rounded-3xl border border-border/70 shadow-xs hover:shadow-xl transition-all">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-300">
                <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-500" />
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-foreground mb-1.5">
                Real-Time Rush Meter
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Know exact kitchen wait times before you order so you never run late for lectures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <ReviewsSection onViewAll={() => navigate('/reviews')} />

      {/* Footer */}
      <footer className="py-8 border-t border-border/50 text-center text-xs text-muted-foreground">
        <p>© 2026 SLRTCE Campus Canteen — Premium Grab &amp; Go Service.</p>
      </footer>
    </div>
  );
}

// ── Inline Reviews Preview Section ───────────────────────────────────────────
function ReviewsSection({ onViewAll }: { onViewAll: () => void }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avg, setAvg] = useState(0);

  useEffect(() => {
    fetchAllReviews().then((data) => {
      setReviews(data.slice(0, 3));
      if (data.length) {
        setAvg(data.reduce((s, r) => s + r.rating, 0) / data.length);
      }
    });
  }, []);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <span className="inline-block text-primary font-extrabold text-xs uppercase tracking-widest mb-2">
            Campus Dining Experiences
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-2">
            What Students &amp; Staff Say
          </h2>
          {reviews.length > 0 && (
            <div className="flex items-center justify-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(avg) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                  }`}
                />
              ))}
              <span className="text-foreground font-black ml-1.5 text-sm">{avg.toFixed(1)}</span>
              <span className="text-muted-foreground text-xs">/ 5.0</span>
            </div>
          )}
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-8">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-card border border-border/70 rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-foreground">
                      {r.customer_name || 'Campus Student'}
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {r.comment && (
                    <p className="text-xs text-muted-foreground italic line-clamp-3 leading-relaxed">
                      "{r.comment}"
                    </p>
                  )}
                </div>
                <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="font-mono">Token #{r.order_token}</span>
                  <span>{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-xs text-muted-foreground py-4">
            No reviews yet. Be the first to share your experience!
          </p>
        )}

        <div className="text-center">
          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            <span>Read All Verified Customer Reviews</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
