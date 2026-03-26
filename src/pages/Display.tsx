import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ChefHat, Clock, UtensilsCrossed } from 'lucide-react';
import { fetchStaffOrders, Order } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';

export default function Display() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchStaffOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders for display:', err);
      }
    };

    loadOrders();

    // Subscribe to real-time status updates
    const channel = supabase
      .channel('display-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => loadOrders()
      )
      .subscribe();

    const clockInterval = setInterval(() => setNow(new Date()), 1000);

    return () => {
      supabase.removeChannel(channel);
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
    <div className="min-h-screen bg-[#1a1f2e] flex flex-col p-3 sm:p-4 md:p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
        <div
          className="flex items-center gap-2 sm:gap-3 md:gap-4 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/')}
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 flex-shrink-0">
            <UtensilsCrossed className="h-4 w-4 sm:h-5 sm:w-5 md:h-7 md:w-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-none">
              Campus Bites
            </h1>
            <p className="text-slate-400 text-[9px] sm:text-xs tracking-[0.15em] uppercase">Order Status Display</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-light text-white tracking-wide leading-none">
            {formatTime(now)}
          </p>
          <p className="text-slate-400 text-[9px] sm:text-xs mt-0.5">{formatDate(now)}</p>
        </div>
      </div>

      {/* Main Grid — stacked on mobile, side-by-side on large screens */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[2fr_1fr] gap-3 sm:gap-4 md:gap-5">

        {/* Now Serving - Large Panel */}
        <div
          className="rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-8 flex flex-col min-h-[180px] sm:min-h-[220px] md:min-h-[320px]"
          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)' }}
        >
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
            <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-white leading-tight">Now Serving</h2>
              <p className="text-white/70 text-xs sm:text-sm md:text-lg">Please collect your order</p>
            </div>
          </div>

          {categorizedOrders.ready.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-white/15 rounded-full flex items-center justify-center mb-3 md:mb-6">
                <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 md:w-12 md:h-12 text-white/50" />
              </div>
              <p className="text-white/60 text-base sm:text-lg md:text-2xl font-medium text-center">No orders ready for pickup</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 animate-fade-in">
              {categorizedOrders.ready.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl md:rounded-2xl py-3 sm:py-4 md:py-5 px-2 text-center shadow-xl hover:scale-105 transition-transform duration-200 overflow-hidden"
                >
                  <span className="text-sm sm:text-base md:text-xl font-bold text-emerald-600 whitespace-nowrap block tracking-tight">
                    {order.token}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-3 sm:gap-4 md:gap-5">

          {/* Preparing Panel */}
          <div
            className="rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 min-h-[110px] sm:min-h-[130px] md:min-h-[160px]"
            style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-3 md:mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight">Preparing</h2>
                <p className="text-white/70 text-xs sm:text-sm">Being prepared</p>
              </div>
            </div>

            {categorizedOrders.cooking.length === 0 ? (
              <p className="text-white/60 text-sm sm:text-base md:text-lg text-center mt-2 md:mt-4">No orders cooking</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 animate-fade-in">
                {categorizedOrders.cooking.map((order) => (
                  <span
                    key={order.id}
                    className="bg-white/25 backdrop-blur-sm text-white px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg md:rounded-xl font-bold text-xs sm:text-sm"
                  >
                    {order.token}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* In Queue Panel */}
          <div className="rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 min-h-[100px] sm:min-h-[120px] md:min-h-[140px] bg-[#252d3d]">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 md:mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-slate-600/50 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-slate-300" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight">In Queue</h2>
                <p className="text-slate-400 text-xs sm:text-sm">Waiting to start</p>
              </div>
            </div>

            {categorizedOrders.waiting.length === 0 ? (
              <p className="text-slate-500 text-sm sm:text-base md:text-lg text-center mt-1 md:mt-2">No orders in queue</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 animate-fade-in">
                {categorizedOrders.waiting.map((order) => (
                  <span
                    key={order.id}
                    className="bg-slate-600/50 text-slate-200 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg md:rounded-xl font-bold text-xs sm:text-sm"
                  >
                    {order.token}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Today's Summary Panel */}
          <div className="rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 bg-[#252d3d]">
            <h3 className="text-slate-400 text-[10px] sm:text-xs font-semibold tracking-wider uppercase mb-3 md:mb-5">
              Today's Summary
            </h3>
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-400">
                  {categorizedOrders.ready.length}
                </p>
                <p className="text-slate-400 text-xs sm:text-sm mt-0.5 md:mt-1">Ready</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-400">
                  {categorizedOrders.cooking.length}
                </p>
                <p className="text-slate-400 text-xs sm:text-sm mt-0.5 md:mt-1">Cooking</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  {categorizedOrders.waiting.length}
                </p>
                <p className="text-slate-400 text-xs sm:text-sm mt-0.5 md:mt-1">Queued</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-3 sm:mt-4 md:mt-6 pt-3 md:pt-4 border-t border-slate-700/50">
        <p className="text-slate-500 text-[10px] sm:text-xs">
          Powered by <span className="text-orange-400 font-semibold">Campus Bites</span> • Auto-refreshes in real-time
        </p>
      </div>
    </div>
  );
}
