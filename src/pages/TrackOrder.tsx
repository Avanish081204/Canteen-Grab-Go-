import { useState, useEffect } from 'react';
import { Search, Package, ChefHat, Bell, CheckCircle2, Truck, MapPin, Star, Clock, ArrowRight } from 'lucide-react';
import { getOrderByToken, Order, OrderStatus, fetchUserOrders } from '@/lib/store';
import { useProfile } from '@/hooks/use-profile';
import { supabase } from '@/integrations/supabase/client';

const statusConfig: Record<OrderStatus, { label: string; icon: typeof Package; color: string }> = {
  placed: { label: 'Order Placed', icon: Package, color: 'text-blue-500' },
  cooking: { label: 'Cooking', icon: ChefHat, color: 'text-orange-500' },
  ready: { label: 'Ready for Pickup', icon: Bell, color: 'text-emerald-500' },
  collected: { label: 'Collected', icon: CheckCircle2, color: 'text-green-600' },
  'out-for-delivery': { label: 'Out for Delivery', icon: Truck, color: 'text-purple-500' },
  delivered: { label: 'Delivered', icon: MapPin, color: 'text-green-600' },
};

const statusOrder: OrderStatus[] = ['placed', 'cooking', 'ready', 'collected'];
const deliveryStatusOrder: OrderStatus[] = ['placed', 'cooking', 'ready', 'out-for-delivery', 'delivered'];

function getStepIndex(status: OrderStatus, isDelivery: boolean) {
  const order = isDelivery ? deliveryStatusOrder : statusOrder;
  return order.indexOf(status);
}

export default function TrackOrder() {
  const [tokenInput, setTokenInput] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const { profile, loading: profileLoading } = useProfile();

  useEffect(() => {
    if (profile) {
      loadHistory();
    }
  }, [profile]);

  // Subscribe to real-time status updates for the currently tracked order
  useEffect(() => {
    if (!order?.id) return;

    const channel = supabase
      .channel(`order-status-${order.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${order.id}`
        },
        (payload) => {
          const nextStatus = payload.new.status as OrderStatus;
          setOrder(prev => prev ? { ...prev, status: nextStatus } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.id]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const orders = await fetchUserOrders();
      setMyOrders(orders);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tokenInput.trim().toUpperCase();
    if (!trimmed) return;
    const found = getOrderByToken(trimmed);
    setOrder(found || null);
    setSearched(true);
  };

  const selectOrder = (o: Order) => {
    setOrder(o);
    setSearched(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isDelivery = order?.type === 'staff-delivery';
  const steps = isDelivery ? deliveryStatusOrder : statusOrder;
  const currentStep = order ? getStepIndex(order.status, isDelivery) : -1;

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Track Your Order</h1>
          <p className="text-muted-foreground">Enter your token number to check order status</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="e.g. BAPH26021001"
              className="flex-1 px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base uppercase"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Track
            </button>
          </div>
        </form>

        {/* Recent Orders for Logged-in Users */}
        {profile && myOrders.length > 0 && !order && (
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-2 mb-4 text-foreground/80 font-semibold px-1">
              <Clock className="w-4 h-4" />
              <h2>My Recent Orders</h2>
            </div>
            <div className="space-y-3">
              {myOrders.slice(0, 5).map((o) => (
                <button
                  key={o.id}
                  onClick={() => selectOrder(o)}
                  className="w-full text-left bg-card hover:bg-muted/50 p-4 rounded-2xl border border-border transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${
                      o.status === 'ready' || o.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'
                    }`}>
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm tracking-tight">{o.token}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-muted-foreground">•</span>
                        <span className={`text-[11px] font-medium uppercase tracking-wider ${statusConfig[o.status].color}`}>
                          {statusConfig[o.status].label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-primary">₹{o.total}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {loadingHistory && !order && (
           <div className="text-center py-10 animate-pulse text-muted-foreground">
             Loading your order history...
           </div>
        )}

        {/* Results */}
        {searched && !order && (
          <div className="bg-card rounded-2xl p-8 border border-border text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Order Not Found</h2>
            <p className="text-muted-foreground text-sm">Please check your token number and try again.</p>
          </div>
        )}

        {order && (
          <div className="space-y-6 animate-slide-up">
            {/* Status Card */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Token</p>
                  <p className="text-xl font-bold text-foreground">{order.token}</p>
                </div>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  order.status === 'ready' || order.status === 'collected' || order.status === 'delivered'
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-orange-500/10 text-orange-600'
                }`}>
                  {statusConfig[order.status].label}
                </span>
              </div>

              {/* Progress Steps */}
              <div className="relative">
                {steps.map((step, index) => {
                  const config = statusConfig[step];
                  const Icon = config.icon;
                  const isActive = index <= currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <div key={step} className="flex items-start gap-4 relative">
                      {/* Line */}
                      {index < steps.length - 1 && (
                        <div
                          className={`absolute left-5 top-10 w-0.5 h-8 ${
                            index < currentStep ? 'bg-primary' : 'bg-border'
                          }`}
                        />
                      )}
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          isCurrent
                            ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                            : isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      {/* Label */}
                      <div className={`pb-8 ${isCurrent ? 'pt-1' : 'pt-2'}`}>
                        <p className={`font-medium text-sm ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {config.label}
                        </p>
                        {isCurrent && (
                          <p className="text-xs text-muted-foreground mt-0.5">Current status</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <h3 className="font-semibold mb-3">Order Items</h3>
              <div className="space-y-2 text-sm">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-3 pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">₹{order.total}</span>
              </div>
            </div>

            {/* Delivery Info */}
            {isDelivery && (
              <div className="bg-card rounded-2xl p-6 border border-border shadow-sm text-sm space-y-1">
                <h3 className="font-semibold mb-2">Delivery Details</h3>
                <p><span className="text-muted-foreground">Department:</span> {order.department}</p>
                <p><span className="text-muted-foreground">Location:</span> {order.location}</p>
                <p><span className="text-muted-foreground">Time Slot:</span> {order.timeSlot}</p>
              </div>
            )}

            {/* Rating Section */}
            {(order.status === 'collected' || order.status === 'delivered') && (
              <div className="bg-card rounded-2xl p-6 border border-border shadow-sm text-center animate-bounce-in">
                <h3 className="font-bold text-lg mb-2">Rate Your Experience</h3>
                <p className="text-muted-foreground text-sm mb-4">How was your food and service?</p>
                
                {order.rating ? (
                  <div className="flex flex-col items-center">
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-8 h-8 ${star <= order.rating! ? 'fill-secondary text-secondary' : 'text-muted'}`}
                        />
                      ))}
                    </div>
                    <p className="text-success font-semibold text-sm">Thank you for your feedback!</p>
                  </div>
                ) : (
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => {
                          import('@/lib/store').then(m => {
                            m.rateOrder(order.id, star);
                            setOrder({ ...order, rating: star });
                          });
                        }}
                        className="hover:scale-125 transition-transform duration-200"
                      >
                        <Star className="w-10 h-10 text-muted hover:text-secondary hover:fill-secondary" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
