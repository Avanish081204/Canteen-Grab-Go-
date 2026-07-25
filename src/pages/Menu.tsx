import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ShoppingCart, X } from 'lucide-react';
import { getOrderType, getCart, getCartTotal, fetchMenuItems } from '@/lib/store';
import { MenuItem } from '@/lib/store';
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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryList, setCategoryList] = useState<string[]>(['All']);
  const orderType = getOrderType();

  useEffect(() => {
    if (!orderType) {
      navigate('/');
    }
  }, [orderType, navigate]);

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

  useEffect(() => {
    if (selectedCategory !== 'All' && !categoryList.includes(selectedCategory)) {
      setSelectedCategory('All');
    }
  }, [categoryList, selectedCategory]);

  // Filter by category AND search query (name/description)
  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q ||
      item.name.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const orderTypeLabels = {
    'dine-in': 'Dine In',
    'take-away': 'Take Away',
    'staff-delivery': 'Staff Delivery',
  };

  return (
    <div className="min-h-screen bg-background pb-36 md:pb-24">
      {/* Sticky Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <span className="text-sm font-medium bg-muted px-3 py-1 rounded-full">
              {orderType && orderTypeLabels[orderType]}
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items, e.g. Samosa, Tea…"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground/60 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
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
        </div>
      </div>

      {/* Menu Grid */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          // ── Shimmer Skeleton Grid ──────────────────────────────────
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <p className="font-semibold text-foreground">No items found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery ? `No results for "${searchQuery}"` : 'No items in this category'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 z-50">
          <button
            onClick={() => navigate('/cart')}
            className="w-full max-w-lg mx-auto flex items-center justify-between bg-primary text-primary-foreground px-4 sm:px-6 py-3.5 sm:py-4 rounded-2xl shadow-2xl hover:bg-primary/90 active:scale-[0.98] transition-all duration-300 animate-slide-up"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="font-semibold text-sm sm:text-base">{cartCount} items</span>
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm opacity-80">Total</p>
              <p className="text-lg sm:text-xl font-bold">₹{cartTotal}</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
