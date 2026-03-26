import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { getOrderType, getCart, getCartTotal, fetchMenuItems } from '@/lib/store';
import { getMenuCategories } from '@/lib/menu-overrides';
import { MenuItem } from '@/lib/store';
import MenuItemCard from '@/components/MenuItemCard';

export default function Menu() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
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

  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter(item => item.category === selectedCategory);

  const orderTypeLabels = {
    'dine-in': 'Dine In',
    'take-away': 'Take Away',
    'staff-delivery': 'Staff Delivery',
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
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
          <div className="flex justify-center py-12 text-muted-foreground animate-pulse">
            Loading menu...
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
        <div className="fixed bottom-6 left-4 right-4 z-50">
          <button
            onClick={() => navigate('/cart')}
            className="w-full max-w-lg mx-auto flex items-center justify-between bg-primary text-primary-foreground px-6 py-4 rounded-2xl shadow-2xl hover:bg-primary/90 transition-all duration-300 animate-slide-up"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <span className="font-semibold">{cartCount} items</span>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Total</p>
              <p className="text-xl font-bold">₹{cartTotal}</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
