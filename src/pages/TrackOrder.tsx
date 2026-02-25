import { useState } from 'react';
import { Search, Package, ChefHat, Bell, CheckCircle2, Truck, MapPin } from 'lucide-react';
import { getOrderByToken, Order, OrderStatus } from '@/lib/store';

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tokenInput.trim().toUpperCase();
    if (!trimmed) return;
    const found = getOrderByToken(trimmed);
    setOrder(found || null);
    setSearched(true);
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
          </div>
        )}
      </div>
    </div>
  );
}
