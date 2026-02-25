import { useEffect, useState, useMemo } from 'react';
import { CheckCircle, ChefHat, Clock, UtensilsCrossed } from 'lucide-react';
import { getOrders, Order } from '@/lib/store';

export default function Display() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const updateOrders = () => {
      setOrders(getOrders());
    };

    updateOrders();
    const interval = setInterval(updateOrders, 3000);
    const clockInterval = setInterval(() => setNow(new Date()), 1000);

    return () => {
      clearInterval(interval);
      clearInterval(clockInterval);
    };
  }, []);

  const categorizedOrders = useMemo(() => {
    const nonDelivery = orders.filter(o => o.type !== 'staff-delivery');
    return {
      ready: nonDelivery.filter(o => o.status === 'ready'),
      cooking: nonDelivery.filter(o => o.status === 'cooking'),
      waiting: nonDelivery.filter(o => o.status === 'placed'),
    };
  }, [orders]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toLowerCase();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="min-h-screen bg-[#1a1f2e] p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <UtensilsCrossed className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Campus Bites
            </h1>
            <p className="text-slate-400 text-sm tracking-[0.2em] uppercase">Order Status Display</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-4xl md:text-5xl font-light text-white tracking-wide">
            {formatTime(now)}
          </p>
          <p className="text-slate-400 text-sm">{formatDate(now)}</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
        {/* Now Serving - Large Panel */}
        <div 
          className="rounded-3xl p-8 flex flex-col min-h-[400px]"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)'
          }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-white">Now Serving</h2>
              <p className="text-white/70 text-lg">Please collect your order</p>
            </div>
          </div>
          
          {categorizedOrders.ready.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-white/15 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-12 h-12 text-white/50" />
              </div>
              <p className="text-white/60 text-2xl font-medium">No orders ready for pickup</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-fade-in">
              {categorizedOrders.ready.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl py-5 px-6 text-center shadow-xl hover:scale-105 transition-transform duration-200"
                >
                  <span className="text-2xl md:text-3xl font-bold text-emerald-600">
                    {order.token}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-5">
          {/* Preparing Panel */}
          <div 
            className="rounded-3xl p-6 min-h-[160px]"
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Preparing</h2>
                <p className="text-white/70 text-sm">Being prepared</p>
              </div>
            </div>
            
            {categorizedOrders.cooking.length === 0 ? (
              <p className="text-white/60 text-lg text-center mt-4">No orders cooking</p>
            ) : (
              <div className="flex flex-wrap gap-2 animate-fade-in">
                {categorizedOrders.cooking.map((order) => (
                  <span
                    key={order.id}
                    className="bg-white/25 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-bold text-sm"
                  >
                    {order.token}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* In Queue Panel */}
          <div className="rounded-3xl p-6 min-h-[140px] bg-[#252d3d]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-slate-600/50 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-slate-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">In Queue</h2>
                <p className="text-slate-400 text-sm">Waiting to start</p>
              </div>
            </div>
            
            {categorizedOrders.waiting.length === 0 ? (
              <p className="text-slate-500 text-lg text-center mt-2">No orders in queue</p>
            ) : (
              <div className="flex flex-wrap gap-2 animate-fade-in">
                {categorizedOrders.waiting.map((order) => (
                  <span
                    key={order.id}
                    className="bg-slate-600/50 text-slate-200 px-4 py-2 rounded-xl font-bold text-sm"
                  >
                    {order.token}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Today's Summary Panel */}
          <div className="rounded-3xl p-6 bg-[#252d3d]">
            <h3 className="text-slate-400 text-sm font-semibold tracking-wider uppercase mb-5">
              Today's Summary
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-emerald-400">
                  {categorizedOrders.ready.length}
                </p>
                <p className="text-slate-400 text-sm mt-1">Ready</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-orange-400">
                  {categorizedOrders.cooking.length}
                </p>
                <p className="text-slate-400 text-sm mt-1">Cooking</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-white">
                  {categorizedOrders.waiting.length}
                </p>
                <p className="text-slate-400 text-sm mt-1">Queued</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 pt-4 border-t border-slate-700/50">
        <p className="text-slate-500 text-sm">
          Powered by <span className="text-orange-400 font-semibold">Campus Bites</span> • Auto-refreshes every 3 seconds
        </p>
      </div>
    </div>
  );
}
