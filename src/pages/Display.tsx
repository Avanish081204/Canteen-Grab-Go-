import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  ChefHat,
  CheckCircle,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  ArrowLeft,
  Utensils,
  ShoppingBag,
  Bell,
  Sparkles,
} from 'lucide-react';
import { fetchStaffOrders, Order } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import Logo from '@/components/Logo';

/* ── Pleasant Counter Chime ─────────────────────────────────────────── */
function playCounterChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1).connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(523.25, now + 0.18); // C5
    gain2.gain.setValueAtTime(0.28, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now + 0.18);
    osc2.stop(now + 0.7);
  } catch {}
}

export default function Display() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [now, setNow] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const prevReadyRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

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

        const currentReady = data.filter(
          (o) => o.status === 'ready' && o.type !== 'staff-delivery'
        );
        const currentReadyIds = new Set(currentReady.map((o) => o.id));

        if (!isFirstLoadRef.current && soundEnabled) {
          const hasNew = currentReady.some((o) => !prevReadyRef.current.has(o.id));
          if (hasNew) playCounterChime();
        }

        prevReadyRef.current = currentReadyIds;
        isFirstLoadRef.current = false;
      } catch (err) {
        console.error('Failed to load orders for display:', err);
      }
    };

    loadOrders();

    const channel = supabase
      .channel('tv-display-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => loadOrders()
      )
      .subscribe();

    const timer = setInterval(() => setNow(new Date()), 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
    };
  }, [soundEnabled]);

  const { readyOrders, cookingOrders } = useMemo(() => {
    const valid = orders.filter((o) => o.type !== 'staff-delivery');
    return {
      readyOrders: valid.filter((o) => o.status === 'ready'),
      cookingOrders: valid.filter(
        (o) => o.status === 'cooking' || o.status === 'placed'
      ),
    };
  }, [orders]);

  const timeString = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const dateString = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="h-screen w-screen bg-background text-foreground flex flex-col justify-between select-none font-sans overflow-hidden">
      {/* ── Top App Bar (Matches Header.tsx & StaffDashboard.tsx) ──── */}
      <header className="bg-card border-b border-border/80 px-4 sm:px-8 py-3.5 flex items-center justify-between flex-shrink-0 shadow-xs">
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-all cursor-pointer shadow-xs active:scale-95"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Logo size="sm" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight leading-none">
                Campus Canteen
              </h1>
              <span className="hidden sm:inline-block bg-primary/10 text-primary text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Live TV Display
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
              SLRTCE Smart Food Court • Order Collection Counter
            </p>
          </div>
        </div>

        {/* Center: Live Order Status Pills (Direct Website DNA) */}
        <div className="hidden lg:flex items-center gap-2 bg-muted/50 p-1.5 rounded-full border border-border/70">
          {/* Cooking Pill */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold text-xs">
            <ChefHat className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Cooking in Kitchen</span>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-black">
              {cookingOrders.length}
            </span>
          </div>

          {/* Ready Pill */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-xs">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Ready for Pickup</span>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-white/25 text-white text-[11px] font-black">
              {readyOrders.length}
            </span>
          </div>
        </div>

        {/* Right: Clock & Action Buttons */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-right">
            <span className="font-extrabold text-base sm:text-lg text-foreground block leading-tight font-mono">
              {timeString}
            </span>
            <span className="text-[10px] text-muted-foreground font-semibold block">
              {dateString}
            </span>
          </div>

          <div className="h-7 w-[1px] bg-border/80 hidden sm:block" />

          <div className="flex items-center gap-1.5">
            {/* Chime toggle */}
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playCounterChime();
              }}
              className={`p-2 sm:p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-primary/10 text-primary border-primary/30 shadow-xs'
                  : 'bg-muted text-muted-foreground border-border/70 hover:text-foreground'
              }`}
              title={soundEnabled ? 'Chime ON' : 'Chime Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Fullscreen toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 sm:p-2.5 rounded-xl bg-card hover:bg-muted text-foreground border border-border/80 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main 50 / 50 Dual Order Board (Matching Website UI/UX) ─── */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-3 sm:p-6 min-h-0 bg-background/50">
        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ── COLUMN 1: COOKING / PREPARING (Left 50%) ─────────────── */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="bg-card rounded-3xl border border-border/90 shadow-sm flex flex-col justify-between overflow-hidden">
          {/* Header Bar matching Staff Dashboard tab style */}
          <div className="p-4 sm:p-5 border-b border-border/70 bg-muted/20 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-xl font-black text-foreground tracking-tight">
                    Preparing Food
                  </h2>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                </div>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Freshly being prepared in kitchen
                </p>
              </div>
            </div>

            {/* Count Badge matching website */}
            <span className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-3.5 py-1 rounded-full text-xs sm:text-sm font-black">
              {cookingOrders.length} Cooking
            </span>
          </div>

          {/* Tokens Grid */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {cookingOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mb-3">
                  <ChefHat className="w-8 h-8 text-muted-foreground/60" />
                </div>
                <p className="text-sm sm:text-base font-bold text-foreground">
                  No orders currently cooking
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  New orders will automatically appear here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 content-start">
                {cookingOrders.map((order) => {
                  const isDineIn = order.type === 'dine-in';
                  return (
                    <div
                      key={order.id}
                      onClick={() => navigate(`/track?token=${encodeURIComponent(order.token)}`)}
                      className="p-4 sm:p-5 rounded-2xl bg-background border border-border/80 shadow-xs flex flex-col items-center justify-center hover:shadow-md hover:border-amber-500/60 active:scale-95 transition-all cursor-pointer group"
                      title={`Click to view live tracking for order ${order.token}`}
                    >
                      {/* Order Type Tag */}
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2 flex items-center gap-1 ${
                          isDineIn
                            ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/25'
                            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25'
                        }`}
                      >
                        {isDineIn ? (
                          <Utensils className="w-3 h-3" />
                        ) : (
                          <ShoppingBag className="w-3 h-3" />
                        )}
                        <span>{isDineIn ? 'Dine In' : 'Takeaway'}</span>
                      </span>

                      {/* Giant Token Number */}
                      <span className="font-mono font-black text-3xl sm:text-4xl lg:text-5xl text-foreground tracking-tight leading-none my-1">
                        {order.token}
                      </span>

                      {/* Item count */}
                      <span className="text-[11px] font-semibold text-muted-foreground mt-2">
                        {order.items?.length || 1} item
                        {(order.items?.length || 1) > 1 ? 's' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column Footer */}
          <div className="px-4 py-2.5 bg-muted/20 border-t border-border/60 text-[11px] text-muted-foreground font-medium flex items-center justify-between">
            <span>Food is freshly prepared to order</span>
            <span>Est. Wait ~5-8 mins</span>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ── COLUMN 2: READY FOR COLLECTION (Right 50%) ───────────── */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="bg-emerald-500/5 dark:bg-emerald-950/15 rounded-3xl border-2 border-emerald-500/40 shadow-sm flex flex-col justify-between overflow-hidden relative">
          {/* Header Bar matching Staff Dashboard tab style */}
          <div className="p-4 sm:p-5 border-b border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-xl font-black text-emerald-800 dark:text-emerald-300 tracking-tight">
                    Now Serving
                  </h2>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400 font-medium">
                  Please collect your order at Counter 1
                </p>
              </div>
            </div>

            {/* Ready Badge matching website */}
            <span className="bg-emerald-600 text-white px-3.5 py-1 rounded-full text-xs sm:text-sm font-black shadow-xs">
              {readyOrders.length} Ready
            </span>
          </div>

          {/* Tokens Grid */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {readyOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                  <CheckCircle className="w-8 h-8 text-emerald-600/60" />
                </div>
                <p className="text-sm sm:text-base font-bold text-foreground">
                  Waiting for kitchen orders
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ready orders will chime and appear here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 content-start">
                {readyOrders.map((order) => {
                  const isDineIn = order.type === 'dine-in';
                  return (
                    <div
                      key={order.id}
                      onClick={() => navigate(`/track?token=${encodeURIComponent(order.token)}`)}
                      className="p-4 sm:p-5 rounded-2xl bg-card border-2 border-emerald-500 text-foreground shadow-md shadow-emerald-500/10 flex flex-col items-center justify-center hover:scale-[1.03] active:scale-95 transition-all animate-fade-in relative overflow-hidden cursor-pointer"
                      title={`Click to view live tracking for order ${order.token}`}
                    >
                      {/* Top Ready Tag */}
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white px-3 py-0.5 rounded-full mb-2 shadow-xs">
                        Ready • Collect
                      </span>

                      {/* Giant Token Number */}
                      <span className="font-mono font-black text-3xl sm:text-4xl lg:text-5xl text-foreground tracking-tight leading-none my-1">
                        {order.token}
                      </span>

                      {/* Counter Tag */}
                      <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 mt-2 flex items-center gap-1">
                        <span>Pickup Counter 1</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column Footer */}
          <div className="px-4 py-2.5 bg-emerald-500/10 border-t border-emerald-500/25 text-[11px] text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-between">
            <span>Please show your token slip at the counter</span>
            <span>Counter 1</span>
          </div>
        </section>
      </main>

      {/* ── Bottom Information Bar (Matches website footer) ─────────── */}
      <footer className="bg-card border-t border-border/80 px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs text-muted-foreground font-medium flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time kitchen queue sync</span>
          <span className="hidden sm:inline">• Ground Floor Food Court</span>
        </div>
        <div className="font-semibold text-foreground">
          Order online from your phone to skip the line
        </div>
      </footer>
    </div>
  );
}
