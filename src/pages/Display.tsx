import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ChefHat,
  Clock,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  ArrowLeft,
  Sparkles,
  Flame,
  Radio,
  BellRing,
} from 'lucide-react';
import { fetchStaffOrders, Order } from '@/lib/store';
import { useKitchenStatus } from '@/lib/kitchen-status';
import { supabase } from '@/integrations/supabase/client';
import Logo from '@/components/Logo';

// ── Built-in High-End Web Audio Chime (Zero external network MP3) ──────
function playPickupChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Dual-tone Ding-Dong Chime (D5 to A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.setValueAtTime(880, now + 0.14); // A5

    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.75);
  } catch {}
}

export default function Display() {
  const navigate = useNavigate();
  const kitchenStatus = useKitchenStatus();
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

        // Check if any new order became ready and play chime
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

    // Subscribe to real-time status updates from Supabase
    const channel = supabase
      .channel('display-db-changes')
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
      cooking: nonDelivery.filter((o) => o.status === 'cooking'),
      waiting: nonDelivery.filter((o) => o.status === 'placed'),
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
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col justify-between p-3 sm:p-5 md:p-6 select-none font-sans overflow-hidden">
      {/* ── Top TV Header Bar ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 pb-4 border-b border-white/10">
        {/* Brand & Campus Identity */}
        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-between md:justify-start">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-all flex items-center justify-center cursor-pointer"
            title="Return to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <Logo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-none">
                  Campus Canteen
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live TV Feed
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                SLRTCE Smart Food Court • Order Collection Display
              </p>
            </div>
          </div>

          {/* Mobile TV Controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className={`p-2 rounded-xl border transition-all ${
                isAudioEnabled ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-white/5 border-white/10 text-white/60'
              }`}
            >
              {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Center Live Kitchen Badge */}
        <div className="hidden lg:flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Kitchen Online</span>
          </div>
          <div className="w-px h-4 bg-white/20" />
          <span className="text-xs text-slate-300 font-medium">
            Wait Time: <strong className="text-white">~{kitchenStatus.estimatedWaitMinutes} mins</strong>
          </span>
          <div className="w-px h-4 bg-white/20" />
          <span className="text-xs text-slate-300 font-medium">
            Active Rush: <strong className="text-amber-400 uppercase">{kitchenStatus.rushLevel}</strong>
          </span>
        </div>

        {/* Right Digital Clock & Controls */}
        <div className="hidden md:flex items-center gap-4 text-right">
          <div>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tight text-white leading-none">
              {formatTime(now)}
            </p>
            <p className="text-xs text-slate-400 font-medium mt-1">{formatDate(now)}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Chime Audio Switch */}
            <button
              type="button"
              onClick={() => {
                const next = !isAudioEnabled;
                setIsAudioEnabled(next);
                if (next) playPickupChime();
              }}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center ${
                isAudioEnabled
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/10'
              }`}
              title={isAudioEnabled ? 'Pickup Chime Active (Ding-Dong on Ready)' : 'Mute Pickup Chime'}
            >
              {isAudioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* TV Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all flex items-center justify-center cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter TV Fullscreen Mode'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Split Board: Now Serving (60%) vs Kitchen Queue (40%) ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 my-4 min-h-[480px]">
        {/* ── LEFT: NOW SERVING (READY FOR COUNTER PICKUP) ─────────────── */}
        <div className="lg:col-span-7 rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-950/70 via-slate-950 to-slate-950 p-5 sm:p-7 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-4 border-b border-emerald-500/30 mb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 flex-shrink-0 shadow-lg">
                  <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight uppercase">
                      Now Serving
                    </h2>
                    <span className="bg-emerald-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full shadow-sm">
                      {categorizedOrders.ready.length} Ready
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-300/80 font-medium">
                    Please collect your food at Ground Floor Counter with Token
                  </p>
                </div>
              </div>
            </div>

            {/* Tokens Display Grid */}
            {categorizedOrders.ready.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400/60 mb-4">
                  <Clock className="w-10 h-10" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-white/80">
                  All Ready Orders Collected!
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-sm mt-1">
                  Kitchen is actively cooking the next orders. Tokens will flash here as soon as they are ready.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4.5 animate-fade-in max-h-[460px] overflow-y-auto pr-1 scrollbar-hide">
                {categorizedOrders.ready.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 sm:p-5 rounded-2xl md:rounded-3xl bg-emerald-500/15 border-2 border-emerald-400/70 text-center shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                  >
                    {/* Top Order Type Pill */}
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full inline-block mb-1.5 shadow-xs">
                      {order.type === 'take-away' ? 'Take Away' : 'Dine In'}
                    </span>

                    {/* Massive Token Number */}
                    <span className="text-4xl sm:text-5xl md:text-6xl font-black font-mono tracking-tight text-white block my-1 drop-shadow-lg">
                      #{order.token}
                    </span>

                    <span className="text-[11px] text-emerald-300 font-bold block mt-1">
                      Ready at Counter Window
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Left Panel Footer Notice */}
          <div className="pt-4 border-t border-emerald-500/25 flex items-center justify-between text-xs text-emerald-300/80 font-medium mt-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Counter Staff verifies token number before handover
            </span>
            <span className="hidden sm:inline font-bold">Station: Counter A / B</span>
          </div>
        </div>

        {/* ── RIGHT: KITCHEN PREPARATION & QUEUE (40%) ─────────────────── */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          {/* Top Card: Preparing in Kitchen */}
          <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-950/60 via-slate-950 to-slate-950 p-5 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/30 mb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-md">
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                      <span>Preparing</span>
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                        {categorizedOrders.cooking.length} Cooking
                      </span>
                    </h3>
                    <p className="text-[11px] text-amber-300/80">Active in pan &amp; wok</p>
                  </div>
                </div>
              </div>

              {categorizedOrders.cooking.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs sm:text-sm font-medium">
                  No orders currently cooking
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 animate-fade-in max-h-[140px] overflow-y-auto pr-1 scrollbar-hide">
                  {categorizedOrders.cooking.map((order) => (
                    <span
                      key={order.id}
                      className="bg-amber-500/20 border border-amber-400/50 text-white font-mono font-black text-base sm:text-lg px-3.5 py-1.5 rounded-xl shadow-md flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      #{order.token}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <span className="text-[10px] text-amber-400/70 font-mono pt-2 border-t border-amber-500/20 block text-right">
              Est. time remaining: 4-6 mins
            </span>
          </div>

          {/* Middle Card: In Queue / Order Placed */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-lg flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-slate-300 flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                      <span>In Queue</span>
                      <span className="bg-slate-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        {categorizedOrders.waiting.length} Waiting
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Order placed, awaiting kitchen prep</p>
                  </div>
                </div>
              </div>

              {categorizedOrders.waiting.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs sm:text-sm font-medium">
                  Queue is clear! Orders start immediately.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 animate-fade-in max-h-[120px] overflow-y-auto pr-1 scrollbar-hide">
                  {categorizedOrders.waiting.map((order) => (
                    <span
                      key={order.id}
                      className="bg-white/10 border border-white/15 text-slate-200 font-mono font-bold text-sm sm:text-base px-3 py-1 rounded-xl"
                    >
                      #{order.token}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Card: Live Metrics Summary */}
          <div className="rounded-3xl border border-white/10 bg-slate-950 p-4 shadow-md">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] font-bold text-emerald-400 block uppercase">Ready</span>
                <span className="text-2xl font-black text-emerald-300 font-mono">
                  {categorizedOrders.ready.length}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-[10px] font-bold text-amber-400 block uppercase">Cooking</span>
                <span className="text-2xl font-black text-amber-300 font-mono">
                  {categorizedOrders.cooking.length}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Queued</span>
                <span className="text-2xl font-black text-white font-mono">
                  {categorizedOrders.waiting.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Live Scrolling Ticker Marquee ─────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-white/15 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-300 shadow-md overflow-hidden">
        <div className="flex items-center gap-2 flex-shrink-0 mr-4">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
          <span className="font-extrabold uppercase text-[10px] tracking-wider text-primary">
            Canteen Live Broadcast:
          </span>
        </div>

        <div className="overflow-hidden whitespace-nowrap flex-1">
          <p className="animate-marquee inline-block font-medium">
            📢 Keep your token number handy for instant counter pickup • Fast preparation active • Average kitchen wait time: ~6 mins • Order on your mobile to skip the physical line • Enjoy fresh food at SLRTCE Campus Canteen!
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 flex-shrink-0 ml-4 font-mono text-[11px] text-slate-400">
          <span>Real-time Sync Active</span>
        </div>
      </div>
    </div>
  );
}