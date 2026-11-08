import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, ShoppingCart, X, Sparkles, Flame, Star, Leaf, ChevronRight } from 'lucide-react';
import { getOrderType, setOrderType, getCart, getCartTotal, fetchMenuItems } from '@/lib/store';
import { MenuItem } from '@/lib/store';
import { useKitchenStatus } from '@/lib/kitchen-status';
import MenuItemCard from '@/components/MenuItemCard';

// ── Shimmer Skeleton Card ─────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-3xl overflow-hidden border border-border/50 bg-card">
      <div className="skeleton h-36 w-full rounded-none" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="flex justify-between items-center mt-3">
          <div className="skeleton h-5 w-12" />
          <div className="skeleton h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function Menu() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const kitchenStatus = useKitchenStatus();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryList, setCategoryList] = useState<string[]>(['All']);
  const [orderType, setOrderTypeState] = useState<string>(() => getOrderType());

  useEffect(() => {
    setOrderTypeState(getOrderType());
  }, []);

  const updateCartInfo = () => {
    setCartTotal(getCartTotal());
    setCartCount(getCart().reduce((sum, item) => sum + item.quantity, 0));
  };

  useEffect(() => {
    updateCartInfo();
  }, []);

  useEffect(() => {
    async function initMenu() {
      setLoading(true);
      const data = await fetchMenuItems();
      setItems(data);
      
      const derivedCategories = Array.from(new Set(data.map(i => i.category))).sort((a, b) => a.localeCompare(b));
      setCategoryList(['All', ...derivedCategories]);
      setLoading(false);
    }
    
    initMenu();

    const syncMenu = () => {
      initMenu();
    };
    
    window.addEventListener('menuUpdated', syncMenu);
    return () => {
      window.removeEventListener('menuUpdated', syncMenu);
    };
  }, []);

  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg' | 'jain' | 'spicy' | 'special'>('all');

  useEffect(() => {
    if (selectedCategory !== 'All' && !categoryList.includes(selectedCategory)) {
      setSelectedCategory('All');
    }
  }, [categoryList, selectedCategory]);

  // Filter by category, dietary tag, AND search query
  const filteredItems = items.filter(item => {
    const matchesCategory =
      selectedCategory === 'All' ||
      item.category === selectedCategory ||
      (selectedCategory === 'Combos' && Boolean(item.isCombo));
    
    let matchesDietary = true;
    if (dietaryFilter === 'veg') matchesDietary = item.dietary === 'veg';
    else if (dietaryFilter === 'non-veg') matchesDietary = item.dietary === 'non-veg';
    else if (dietaryFilter === 'jain') matchesDietary = item.dietary === 'jain';
    else if (dietaryFilter === 'spicy') matchesDietary = Boolean(item.isSpicy);
    else if (dietaryFilter === 'special') matchesDietary = Boolean(item.isSpecial);

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q ||
      item.name.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q);

    return matchesCategory && matchesDietary && matchesSearch;
  });

  const specialItems = items.filter(i => i.isSpecial && i.isAvailable);

  const orderTypeLabels = {
    'dine-in': 'Dine In',
    'take-away': 'Take Away',
    'staff-delivery': 'Staff Delivery',
  };

  return (
    <div className="min-h-screen bg-background pb-36 md:pb-24">
      {/* Sticky Header */}
      <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/');
                }
              }}
              className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full border border-border/40">
                <span className={`w-1.5 h-1.5 rounded-full ${kitchenStatus.rushLevel === 'low' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {kitchenStatus.rushLabel} (~{kitchenStatus.estimatedWaitMinutes}m wait)
              </span>

              <button
                onClick={() => {
                  if (orderType === 'staff-delivery') return;
                  const nextType = orderType === 'take-away' ? 'dine-in' : 'take-away';
                  setOrderType(nextType as any);
                  setOrderTypeState(nextType);
                }}
                title={orderType === 'staff-delivery' ? 'Staff Delivery' : 'Click to switch between Dine In & Take Away'}
                className="text-xs sm:text-sm font-semibold bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded-full transition-colors flex items-center gap-1 border border-primary/20"
              >
                <span>{orderTypeLabels[orderType] || 'Dine In'}</span>
                {orderType !== 'staff-delivery' && (
                  <span className="text-[10px] opacity-70 ml-0.5">⇄</span>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items, e.g. Samosa, Tea…"
              className="w-full pl-8 pr-8 py-1.5 sm:py-2 rounded-lg border border-input bg-background text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground/60 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {categoryList.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`category-chip whitespace-nowrap ${
                  selectedCategory === category
                    ? 'category-chip-active'
                    : 'category-chip-inactive'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Quick Dietary & Specials Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1.5 pb-0.5 scrollbar-hide text-xs border-t border-border/40 mt-1">
            <button
              onClick={() => setDietaryFilter('all')}
              className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                dietaryFilter === 'all'
                  ? 'bg-foreground text-background font-semibold shadow-xs'
                  : 'bg-muted/70 text-muted-foreground hover:text-foreground'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setDietaryFilter('special')}
              className={`px-2.5 py-1 rounded-full font-medium transition-all flex items-center gap-1 ${
                dietaryFilter === 'special'
                  ? 'bg-amber-500 text-white font-bold shadow-xs'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20'
              }`}
            >
              <Star className="w-3 h-3 fill-current" />
              Specials
            </button>
            <button
              onClick={() => setDietaryFilter('veg')}
              className={`px-2.5 py-1 rounded-full font-medium transition-all flex items-center gap-1 ${
                dietaryFilter === 'veg'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 inline-block" />
              Pure Veg
            </button>
            <button
              onClick={() => setDietaryFilter('non-veg')}
              className={`px-2.5 py-1 rounded-full font-medium transition-all flex items-center gap-1 ${
                dietaryFilter === 'non-veg'
                  ? 'bg-rose-600 text-white font-bold shadow-xs'
                  : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-600 dark:bg-rose-400 inline-block" />
              Non-Veg
            </button>
            <button
              onClick={() => setDietaryFilter('jain')}
              className={`px-2.5 py-1 rounded-full font-medium transition-all flex items-center gap-1 ${
                dietaryFilter === 'jain'
                  ? 'bg-teal-600 text-white font-bold shadow-xs'
                  : 'bg-teal-500/10 text-teal-700 dark:text-teal-400 hover:bg-teal-500/20'
              }`}
            >
              <Leaf className="w-3 h-3" />
              Jain
            </button>
            <button
              onClick={() => setDietaryFilter('spicy')}
              className={`px-2.5 py-1 rounded-full font-medium transition-all flex items-center gap-1 ${
                dietaryFilter === 'spicy'
                  ? 'bg-orange-600 text-white font-bold shadow-xs'
                  : 'bg-orange-500/10 text-orange-700 dark:text-orange-400 hover:bg-orange-500/20'
              }`}
            >
              <Flame className="w-3 h-3 fill-current" />
              Spicy
            </button>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-6">
        {/* Today's Specials Hero Spotlight (Visible when on All & no search) */}
        {!loading && selectedCategory === 'All' && !searchQuery && dietaryFilter === 'all' && specialItems.length > 0 && (
          <div className="mb-6 rounded-3xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-primary/10 border border-amber-500/30 p-3.5 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-sm">
                  <Flame className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-1.5">
                    Today&apos;s Specials &amp; Chef&apos;s Picks
                    <span className="text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Featured
                    </span>
                  </h2>
                  <p className="text-[11px] text-muted-foreground">Handpicked canteen favorites for today</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
              {specialItems.slice(0, 4).map((special) => (
                <MenuItemCard
                  key={`special-${special.id}`}
                  item={special}
                  onCartUpdate={updateCartInfo}
                />
              ))}
            </div>
          </div>
        )}
        {loading ? (
          // ── Shimmer Skeleton Grid ──────────────────────────────────
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-muted-foreground opacity-50" />
            </div>
            <p className="font-semibold text-sm text-foreground">No items found</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {searchQuery ? `No results for "${searchQuery}"` : 'No items in this category'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onCartUpdate={updateCartInfo}
              />
            ))}
          </div>
        )}
      </div>

      {/* Ultra-Modern Floating Cart Drawer Pill */}
      {cartCount > 0 && (
        <div className="fixed bottom-16 sm:bottom-20 md:bottom-6 left-3 right-3 sm:left-4 sm:right-4 z-50 pointer-events-none">
          <div className="max-w-lg mx-auto pointer-events-auto">
            <button
              onClick={() => navigate('/cart')}
              className="w-full flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-neutral-900 text-white shadow-2xl border border-amber-500/40 hover:border-amber-400 active:scale-[0.98] transition-all duration-300 animate-slide-up group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 animate-ping" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider leading-none">
                    {cartCount} {cartCount === 1 ? 'Item' : 'Items'} Added
                  </p>
                  <p className="text-base sm:text-lg font-black text-white leading-tight mt-0.5">
                    ₹{cartTotal}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold text-white transition-colors">
                <span>View Cart</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
