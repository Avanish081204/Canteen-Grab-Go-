import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  Plus,
  Coins,
  Clock,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  UtensilsCrossed,
} from 'lucide-react';
import {
  getCart,
  getCartTotal,
  getOrderType,
  setOrderType,
  CartItem,
  fetchMenuItems,
  MenuItem,
  addToCart,
} from '@/lib/store';
import CartItemCard from '@/components/CartItemCard';
import { toast } from 'sonner';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [orderType, setOrderTypeState] = useState(() => getOrderType());
  const [recommendations, setRecommendations] = useState<MenuItem[]>([]);

  const updateCart = () => {
    const currentCart = getCart();
    setCart(currentCart);
    setTotal(getCartTotal());
  };

  useEffect(() => {
    updateCart();
    setOrderTypeState(getOrderType());
  }, []);

  // Fetch quick add recommendation snacks (items not already in cart)
  useEffect(() => {
    fetchMenuItems().then(items => {
      const cartIds = new Set(getCart().map(c => c.id));
      const suggestions = items
        .filter(i => i.isAvailable && !cartIds.has(i.id))
        .slice(0, 4);
      setRecommendations(suggestions);
    });
  }, [cart.length]);

  const handleQuickAdd = (item: MenuItem) => {
    addToCart(item);
    updateCart();
    toast.success(`${item.name} added to cart!`);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleToggleOrderType = () => {
    if (orderType === 'staff-delivery') return;
    const next = orderType === 'take-away' ? 'dine-in' : 'take-away';
    setOrderType(next);
    setOrderTypeState(next);
  };

  const orderTypeLabels: Record<string, { label: string; desc: string }> = {
    'dine-in': { label: 'Dine In', desc: 'Collect using counter token' },
    'take-away': { label: 'Take Away', desc: 'Packed in food container' },
    'staff-delivery': { label: 'Staff Delivery', desc: 'Delivered to department' },
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-sm mx-auto">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-4 border border-border shadow-xs">
            <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/60" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground mb-1.5">
            Your Cart is Empty
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-6">
            Explore our chef-curated canteen menu and add your favorite meals!
          </p>
          <button
            onClick={() => navigate('/menu')}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 px-6 rounded-2xl shadow-md hover:brightness-110 active:scale-95 transition-all text-xs sm:text-sm"
          >
            Explore Fresh Menu
          </button>
        </div>
      </div>
    );
  }

  const estimatedCoins = Math.floor(total * 0.1);

  return (
    <div className="min-h-screen bg-background pb-36 md:pb-24">
      {/* ── Sticky Header ────────────────────────────────────────── */}
      <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/menu');
                }
              }}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Menu
            </button>

            {/* Order Type Switcher Button */}
            <button
              onClick={handleToggleOrderType}
              className="text-xs font-bold bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-full border border-border/60 flex items-center gap-1.5 transition-all shadow-xs"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-primary" />
              <span>{orderTypeLabels[orderType]?.label || 'Dine In'}</span>
              {orderType !== 'staff-delivery' && (
                <span className="text-[10px] text-muted-foreground opacity-70">⇄ Switch</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-2xl">
        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Review Your Order
            </h1>
            <p className="text-xs text-muted-foreground">
              {cart.reduce((s, i) => s + i.quantity, 0)} items in your basket
            </p>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            <Coins className="w-3.5 h-3.5" />
            <span>Earn +{estimatedCoins} Coins</span>
          </div>
        </div>

        {/* Cart Item Cards */}
        <div className="space-y-3 mb-6">
          {cart.map((item) => (
            <CartItemCard
              key={item.cartItemId || item.id}
              item={item}
              onUpdate={updateCart}
            />
          ))}
        </div>

        {/* ── Quick Add Snacks / Drinks Carousel ───────────────────── */}
        {recommendations.length > 0 && (
          <div className="mb-6 bg-card border border-border/70 rounded-3xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Frequently Added Together
              </span>
              <span className="text-[10px] text-muted-foreground">Quick Tap</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {recommendations.map(rec => (
                <div
                  key={rec.id}
                  className="p-2 rounded-2xl bg-muted/40 border border-border/50 flex flex-col justify-between text-left hover:border-amber-500/30 transition-all"
                >
                  <div className="h-16 w-full rounded-xl overflow-hidden mb-1.5 bg-muted">
                    <img
                      src={rec.image}
                      alt={rec.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="text-[11px] font-bold text-foreground line-clamp-1">
                    {rec.name}
                  </h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-black text-primary">₹{rec.price}</span>
                    <button
                      onClick={() => handleQuickAdd(rec)}
                      className="p-1 rounded-lg bg-primary text-primary-foreground hover:brightness-110 active:scale-95 transition-all"
                      title="Add to cart"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Bill Summary Card ────────────────────────────────────── */}
        <div className="bg-card rounded-3xl border border-border/70 p-4 sm:p-5 shadow-xs space-y-3 mb-6">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            Bill Details
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Item Total</span>
              <span className="font-semibold text-foreground">₹{total}</span>
            </div>

            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1">
                <span>Digital Token &amp; Platform Fee</span>
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
            </div>

            <div className="flex items-center justify-between text-muted-foreground">
              <span>Estimated Kitchen Prep</span>
              <span className="font-semibold text-foreground flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" /> ~8 mins
              </span>
            </div>

            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-sm sm:text-base font-extrabold text-foreground">
              <span>To Pay</span>
              <span className="text-primary text-lg sm:text-xl font-black">₹{total}</span>
            </div>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground mb-4">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>100% Hygienic • Prepared Fresh on Campus</span>
        </div>
      </div>

      {/* ── Sticky Checkout Bar ──────────────────────────────────── */}
      <div className="fixed bottom-14 md:bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border/80 p-3 sm:p-4 z-40 shadow-xl">
        <div className="container mx-auto max-w-2xl flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Total Amount
            </p>
            <p className="text-lg sm:text-2xl font-black text-primary leading-tight">
              ₹{total}
            </p>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="flex-1 max-w-xs bg-gradient-to-r from-amber-500 via-orange-500 to-primary text-white font-black py-3 sm:py-3.5 px-6 rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition-all text-xs sm:text-sm flex items-center justify-center gap-2"
          >
            <span>Proceed to Payment</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
