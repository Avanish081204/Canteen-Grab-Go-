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
} from '@/lib/store';
import Logo from '@/components/Logo';
import { useNotifications } from '@/hooks/use-notifications';
import { useKitchenStatus } from '@/lib/kitchen-status';

export default function Index() {
  const navigate = useNavigate();
  const { addPromo } = useNotifications();
  const kitchenStatus = useKitchenStatus();
  const [heroSearch, setHeroSearch] = useState('');
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);

  // Welcome notification — strictly once per calendar day
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

  // Load featured chef specials
  useEffect(() => {
    fetchMenuItems().then(items => {
      const specials = items.filter(i => i.isSpecial && i.isAvailable).slice(0, 4);
      setFeaturedItems(specials);
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

  return (
    <div className="page-container">
      {/* ── Gourmet Hero Section ────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-primary/85 to-amber-950/90" />

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 py-10 sm:py-20 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            {/* Logo */}
            <div className="flex justify-center mb-4 sm:mb-6 animate-bounce-in">
              <Logo size="md" className="shadow-2xl sm:hidden" />
              <Logo size="lg" className="shadow-2xl hidden sm:block" />
            </div>

            {/* Live Kitchen Rush Pill */}
            <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 mb-4 animate-fade-in shadow-lg">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  kitchenStatus.rushLevel === 'low'
                    ? 'bg-emerald-400 animate-pulse'
                    : kitchenStatus.rushLevel === 'moderate'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-rose-400 animate-ping'
                }`}
              />
              <span className="text-white text-xs font-semibold tracking-wide">
                {kitchenStatus.isOpen
                  ? `Kitchen Status: ${kitchenStatus.rushLabel} (~${kitchenStatus.estimatedWaitMinutes}m wait)`
                  : 'Canteen Hours: 8:00 AM – 7:30 PM'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-3 sm:mb-4 animate-slide-up leading-tight tracking-tight">
              Campus Gourmet
              <span className="block bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-md">
                Grab &amp; Go Dining
              </span>
            </h1>

            <p className="text-xs sm:text-base md:text-lg text-white/80 mb-6 sm:mb-8 animate-slide-up max-w-xl mx-auto leading-relaxed">
              Skip campus lines with real-time token tracking, customized food orders, and instant counter pickup.
            </p>

            {/* Instant Food Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative max-w-lg mx-auto mb-6 sm:mb-8 animate-slide-up"
            >
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Craving something? Search Burger, Samosa, Cold Coffee..."
                  className="w-full pl-11 pr-24 py-3 sm:py-3.5 rounded-2xl bg-white/95 text-slate-900 text-xs sm:text-sm font-medium placeholder:text-slate-400 shadow-2xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs px-4 py-2 sm:py-2.5 rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all"
                >
                  Explore
                </button>
              </div>
            </form>

            {/* Quick Feature Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-white/15">
                <span className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-amber-300" /> Made Fresh Daily
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-white/15">
                <span className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-300" /> Express Token Prep
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-white/15">
                <span className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                  <Coins className="w-3.5 h-3.5 text-amber-300" /> Earn 10% Coins Back
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 120"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </section>

      {/* ── Order Type Selection ────────────────────────────────────── */}
      <section className="py-8 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 sm:mb-12">
            <span className="inline-block text-primary font-bold text-xs sm:text-sm uppercase tracking-wider mb-2">
              Select Your Dining Mode
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-2 sm:mb-3">
              How would you like to order today?
            </h2>
            <p className="text-muted-foreground text-xs sm:text-base max-w-xl mx-auto">
              Select your dining preference and enjoy contactless pickup at your convenience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            <OrderTypeCard
              title="Dine In"
              description="Eat comfortably at the cafeteria table using live token counter"
              icon={UtensilsCrossed}
              color="blue"
              onClick={() => handleOrderType('dine-in')}
            />
            <OrderTypeCard
              title="Take Away"
              description="Packaged in eco-friendly food containers ready for express pickup"
              icon={Package}
              color="green"
              onClick={() => handleOrderType('take-away')}
            />
            <OrderTypeCard
              title="Staff Delivery"
              description="Direct office/cabin delivery exclusively for college faculty & staff"
              icon={Truck}
              color="purple"
              onClick={() => handleOrderType('staff-delivery')}
            />
          </div>
        </div>
      </section>

      {/* ── Chef's Signature Specials ───────────────────────────────── */}
      {featuredItems.length > 0 && (
        <section className="py-10 bg-muted/30 border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-3">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Chef's Recommendations
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-0.5">
                  Today's Gourmet Specials
                </h2>
              </div>
              <button
                onClick={() => navigate('/menu')}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-primary hover:underline"
              >
                <span>View Full 22+ Item Menu</span>
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
          <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-primary/10 border border-amber-500/30 p-6 sm:p-10 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-500/30">
                  <Coins className="w-3.5 h-3.5" />
                  Campus Canteen Loyalty Rewards
                </div>
                <h3 className="text-xl sm:text-3xl font-extrabold text-foreground">
                  Earn Canteen Coins with Every Order
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm max-w-xl">
                  Get 50 bonus coins on signup, earn 10% cash value on orders, and redeem coins directly at checkout for discounts!
                </p>
              </div>

              <button
                onClick={() => navigate('/profile')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition-all whitespace-nowrap"
              >
                View Your Coins Balance
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ───────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-block text-primary font-bold text-xs uppercase tracking-wider mb-2">
              The Grab &amp; Go Advantage
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Built for Fast Campus Living
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8 max-w-5xl mx-auto">
            <div className="feature-card text-center group bg-card p-6 rounded-3xl border border-border/60 shadow-xs hover:shadow-md transition-all">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-300">
                <Smartphone className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-foreground mb-1.5">
                Instant Order Ahead
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Place your order during class or between lectures and pick up right when ready.
              </p>
            </div>

            <div className="feature-card text-center group bg-card p-6 rounded-3xl border border-border/60 shadow-xs hover:shadow-md transition-all">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-300">
                <Ticket className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500" />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-foreground mb-1.5">
                Smart Digital Tokens
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Never wait around the counter — track your assigned token live on your phone or big screen.
              </p>
            </div>

            <div className="feature-card text-center group bg-card p-6 rounded-3xl border border-border/60 shadow-xs hover:shadow-md transition-all">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-300">
                <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-500" />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-foreground mb-1.5">
                Live Kitchen Status
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                See estimated wait times in real time before placing your order.
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
          <span className="inline-block text-primary font-bold text-xs uppercase tracking-wider mb-2">
            Campus Dining Experiences
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">
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
              <span className="text-foreground font-extrabold ml-1.5 text-sm">{avg.toFixed(1)}</span>
              <span className="text-muted-foreground text-xs">/ 5.0</span>
            </div>
          )}
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-8">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-card border border-border/70 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between"
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
                    <p className="text-xs text-muted-foreground italic line-clamp-3">
                      "{r.comment}"
                    </p>
                  )}
                </div>
                <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Token #{r.order_token}</span>
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
