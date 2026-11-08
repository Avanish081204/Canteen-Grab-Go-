import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  ArrowLeft,
} from 'lucide-react';
import { fetchStaffOrders, Order } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import Logo from '@/components/Logo';

// ── Built-in Counter Audio Chime (Web Audio API) ──────────────────────
function playPickupChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.setValueAtTime(880, now + 0.15); // A5

    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.8);
  } catch {}
}

export default function Display() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [now, setNow] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  const prevReadyIdsRef = useRef<Set<string>>(new Set());

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchStaffOrders();
        setOrders(data);

        // Play sound when an order becomes ready
        const currentReady = data.filter((o) => o.status === 'ready' && o.type !== 'staff-delivery');
        const currentReadyIds = new Set(currentReady.map((o) => o.id));

        if (prevReadyIdsRef.current.size > 0 && isAudioEnabled) {
          const hasNewReady = currentReady.some((o) => !prevReadyIdsRef.current.has(o.id));
          if (hasNewReady) {
            playPickupChime();
          }
        }
        prevReadyIdsRef.current = currentReadyIds;
      } catch (err) {
        console.error('Failed to load orders for display:', err);
      }
    };

    loadOrders();

    // Real-time listener for orders table
    const channel = supabase
      .channel('display-realtime-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadOrders())
      .subscribe();

    const clockInterval = setInterval(() => setNow(new Date()), 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(clockInterval);
    };
  }, [isAudioEnabled]);

  const categorizedOrders = useMemo(() => {
    const nonDelivery = orders.filter((o) => o.type !== 'staff-delivery');
    return {
      ready: nonDelivery.filter((o) => o.status === 'ready'),
      cooking: nonDelivery.filter((o) => o.status === 'cooking' || o.status === 'placed'),
    };
  }, [orders]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="h-screen w-screen bg-[#0c0d12] text-white flex flex-col justify-between p-4 sm:p-6 select-none font-sans overflow-hidden">
      {/* ── Top Header Bar (Authentic QSR Signage Style) ─────────────── */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Logo size="sm" />
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-none">
              Campus Canteen
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              SLRTCE Smart Food Court • Order Collection
            </p>
          </div>
        </div>

        {/* Live Kitchen Status Pill */}
        <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-300">Live Counter Feed</span>
        </div>

        {/* Right: Clock & Signage Controls */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="font-mono font-black text-xl sm:text-2xl text-white block leading-none">
              {formatTime(now)}
            </span>
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
              {formatDate(now)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                const next = !isAudioEnabled;
                setIsAudioEnabled(next);
                if (next) playPickupChime();
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isAudioEnabled
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-white/5 text-slate-400 hover:text-white border-white/10'
              }`}
              title={isAudioEnabled ? 'Chime Active' : 'Enable Chime'}
            >
              {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Split Screen (True McDonald's 50 / 50 Industrial Grid) ─ */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 my-4 overflow-hidden">
        {/* ── COLUMN 1: PREPARING (Left 50%) ──────────────────────────── */}
        <div className="bg-[#131620] border border-white/10 rounded-3xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-wider">
                  Preparing
                </h2>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full">
                {categorizedOrders.cooking.length} in progress
              </span>
            </div>

            {/* Token Numbers Grid */}
            {categorizedOrders.cooking.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 text-sm">
                No orders currently in preparation
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[calc(100vh-250px)] pr-1 scrollbar-hide">
                {categorizedOrders.cooking.map((order) => (
                  <div
                    key={order.id}
                    className="p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10 text-center transition-all"
                  >
                    <span className="font-mono font-black text-3xl sm:text-4xl md:text-5xl text-amber-400 tracking-tight block">
                      #{order.token}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-white/10 text-[11px] text-slate-500 font-medium">
            Please wait while your food is being cooked fresh
          </div>
        </div>

        {/* ── COLUMN 2: NOW SERVING (Right 50%) ───────────────────────── */}
        <div className="bg-[#0e1a18] border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden relative">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-emerald-500/30 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-400 uppercase tracking-wider">
                  Now Serving
                </h2>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
                {categorizedOrders.ready.length} ready
              </span>
            </div>

            {/* Ready Token Numbers Grid */}
            {categorizedOrders.ready.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-emerald-500/50 text-sm">
                Waiting for ready orders from kitchen
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[calc(100vh-250px)] pr-1 scrollbar-hide">
                {categorizedOrders.ready.map((order) => (
                  <div
                    key={order.id}
                    className="p-3 sm:p-4 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 text-center transition-all animate-fade-in shadow-lg shadow-emerald-500/20"
                  >
                    <span className="font-mono font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight block">
                      #{order.token}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-emerald-500/30 text-[11px] text-emerald-400/80 font-medium">
            Please collect your order at the food counter
          </div>
        </div>
      </div>

      {/* ── Bottom Status Bar ────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-white/10 flex-shrink-0">
        <span>Campus Canteen • Ground Floor Counter</span>
        <span>Auto-syncs in real time with kitchen queue</span>
      </div>
    </div>
  );
}