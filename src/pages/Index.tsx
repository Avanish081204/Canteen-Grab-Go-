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
  Search,
  Coins,
  ShieldCheck,
  Flame,
  ArrowRight,
  Monitor,
  MapPin,
  Leaf,
  Percent,
} from 'lucide-react';
import MenuItemCard from '@/components/MenuItemCard';
import {
  setOrderType,
  getOrderType,
  fetchAllReviews,
  fetchMenuItems,
  Review,
  MenuItem,
  fetchStaffOrders,
  OrderType,
} from '@/lib/store';
import { useKitchenStatus } from '@/lib/kitchen-status';

const CATEGORY_ITEMS = [
  { name: 'All', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=300&q=80' },
  { name: 'Snacks', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=300&q=80' },
  { name: 'Sandwich/Burger', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=300&q=80' },
  { name: 'Chinese', image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=300&q=80' },
  { name: 'Meals', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=300&q=80' },
  { name: 'Cold Drinks', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=300&q=80' },
  { name: 'Combos', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=300&q=80' },
];

export default function Index() {
  const navigate = useNavigate();
  const kitchenStatus = useKitchenStatus();
  const [currentOrderType, setCurrentOrderType] = useState<OrderType>(() => getOrderType() || 'dine-in');
  const [searchQuery, setSearchQuery] = useState('');
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'specials' | 'veg' | 'under50'>('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [readyTokens, setReadyTokens] = useState<string[]>([]);
  const [cartUpdateTrigger, setCartUpdateTrigger] = useState(0);

  useEffect(() => {
    fetchMenuItems().then(items => {
      setAllItems(items);
    });

    fetchStaffOrders().then(orders => {
      const ready = orders
        .filter(o => o.status === 'ready' && o.type !== 'staff-delivery')
        .map(o => o.token)
        .slice(0, 4);
      setReadyTokens(ready);
    });
  }, []);

  const handleOrderTypeChange = (type: OrderType) => {
    if (type === 'staff-delivery') {
      navigate('/staff-code');
    } else {
      setOrderType(type);
      setCurrentOrderType(type);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Filter items based on tab & category
  const displayedItems = allItems.filter(item => {
    if (!item.isAvailable) return false;

    // Category filter
    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      return false;
    }

    // Tab filter
    if (activeTab === 'specials' && !item.isSpecial) return false;
    if (activeTab === 'veg' && item.dietary !== 'veg' && item.dietary !== 'jain') return false;
    if (activeTab === 'under50' && item.price > 50) return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16">
      {/* ── Top Campus Location & Dining Mode Bar ──────────────────── */}
      <div className="bg-card border-b border-border/70 py-2.5 px-3 sm:px-4">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Location & Status */}
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <span>SLRTCE Campus Canteen • Ground Floor</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              {kitchenStatus.isOpen ? `Open (~${kitchenStatus.estimatedWaitMinutes}m prep)` : 'Closed'}
            </span>
          </div>

          {/* Dining Mode Pill Switcher */}
          <div className="flex items-center p-1 bg-muted/80 rounded-2xl border border-border/50 text-xs font-bold">
            <button
              onClick={() => handleOrderTypeChange('dine-in')}
              className={`px-3 py-1 rounded-xl transition-all ${
                currentOrderType === 'dine-in'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Dine In
            </button>
            <button
              onClick={() => handleOrderTypeChange('take-away')}
              className={`px-3 py-1 rounded-xl transition-all ${
                currentOrderType === 'take-away'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Take Away
            </button>
            <button
              onClick={() => handleOrderTypeChange('staff-delivery')}
              className={`px-3 py-1 rounded-xl transition-all ${
                currentOrderType === 'staff-delivery'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Faculty Delivery
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-3 sm:px-4 pt-3 sm:pt-5 space-y-6">
        {/* ── Real Search Bar ────────────────────────────────────────── */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for Samosa, Cold Coffee, Burgers, Meals..."
            className="w-full pl-10 pr-24 py-3 rounded-2xl bg-card border border-border/80 text-xs sm:text-sm font-medium placeholder:text-muted-foreground/70 shadow-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground font-bold text-xs px-4 py-2 rounded-xl shadow-xs hover:brightness-110 active:scale-95 transition-all"
          >
            Search
          </button>
        </form>

        {/* ── Live Kitchen Counter Ticker ────────────────────────────── */}
        {readyTokens.length > 0 && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
              <span className="font-extrabold uppercase text-[10px] tracking-wider text-emerald-700 dark:text-emerald-400">
                Ready at Counter:
              </span>
              <span className="font-mono font-bold text-foreground">
                Tokens {readyTokens.map(t => `#${t}`).join(', ')}
              </span>
            </div>
            <button
              onClick={() => navigate('/display')}
              className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1"
            >
              <span>TV Display</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── Swiggy-Style Promo Banners ─────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Banner 1 */}
          <div
            onClick={() => navigate('/menu?q=combo')}
            className="p-5 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500 text-white cursor-pointer hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-between overflow-hidden relative"
          >
            <div className="relative z-10 max-w-[65%]">
              <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                Special Combo Deals
              </span>
              <h3 className="text-lg sm:text-xl font-black mt-1.5 leading-tight">
                Burger + Fries + Drink @ ₹99
              </h3>
              <p className="text-white/85 text-xs mt-1">Complete meal combo • Save ₹35</p>
            </div>
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-md flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=300&q=80"
                alt="Combo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Banner 2 */}
          <div
            onClick={() => navigate('/profile')}
            className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-border/40 cursor-pointer hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-between overflow-hidden relative"
          >
            <div className="relative z-10 max-w-[65%]">
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                Canteen Loyalty Coins
              </span>
              <h3 className="text-lg sm:text-xl font-black mt-1.5 leading-tight text-white">
                Earn 10% Coins Back
              </h3>
              <p className="text-slate-300 text-xs mt-1">50 bonus coins on signup • Redeem at checkout</p>
            </div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Coins className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
            </div>
          </div>
        </div>

        {/* ── "What's on your mind?" Category Circle Strip ───────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight">
              What&apos;s on your mind?
            </h2>
            <button
              onClick={() => navigate('/menu')}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              <span>See All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORY_ITEMS.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0 group focus:outline-none"
                >
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden p-0.5 transition-all duration-300 ${
                      isSelected
                        ? 'ring-2 ring-primary ring-offset-2 scale-105 shadow-md'
                        : 'border border-border/80 group-hover:scale-105'
                    }`}
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <span
                    className={`text-xs text-center transition-colors font-bold ${
                      isSelected ? 'text-primary' : 'text-foreground/80'
                    }`}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Direct Food Feed Filter Tabs ───────────────────────────── */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-4 border-b border-border/60 pb-2 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'all'
                    ? 'bg-foreground text-background shadow-xs'
                    : 'text-muted-foreground hover:text-foreground bg-muted/60'
                }`}
              >
                All Items ({displayedItems.length})
              </button>
              <button
                onClick={() => setActiveTab('specials')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'specials'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground bg-muted/60'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                Chef Specials
              </button>
              <button
                onClick={() => setActiveTab('veg')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'veg'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground bg-muted/60'
                }`}
              >
                <Leaf className="w-3.5 h-3.5" />
                Pure Veg
              </button>
              <button
                onClick={() => setActiveTab('under50')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'under50'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground bg-muted/60'
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                Under ₹50 Bites
              </button>
            </div>

            {selectedCategory !== 'All' && (
              <button
                onClick={() => setSelectedCategory('All')}
                className="text-xs text-primary font-bold hover:underline whitespace-nowrap"
              >
                Reset Filter
              </button>
            )}
          </div>

          {/* Actual Food Grid (Directly on Homepage!) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {displayedItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onCartUpdate={() => setCartUpdateTrigger(prev => prev + 1)}
              />
            ))}
          </div>
        </div>

        {/* ── Customer Reviews & College Social Proof ────────────────── */}
        <ReviewsSection onViewAll={() => navigate('/reviews')} />

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <footer className="pt-6 pb-10 border-t border-border/50 text-center text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Campus Grab &amp; Go — SLRTCE Cafeteria</p>
          <p className="mt-1">Freshly prepared meals • Contactless Token Pickup • Open 8 AM to 7:30 PM</p>
        </footer>
      </div>
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
    <div className="py-6 border-t border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-black text-foreground">
            Student &amp; Faculty Reviews
          </h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= Math.round(avg) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <span className="font-black text-foreground">{avg.toFixed(1)}/5.0</span>
              <span>• Verified Orders</span>
            </div>
          )}
        </div>

        <button
          onClick={onViewAll}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          <span>All Reviews</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="p-4 rounded-2xl bg-card border border-border/70 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
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
                <p className="text-xs text-muted-foreground italic line-clamp-2">
                  "{r.comment}"
                </p>
              )}
            </div>
            <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
              <span className="font-mono">Token #{r.order_token}</span>
              <span>{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
