import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Maximize, Minimize, Volume2, VolumeX } from 'lucide-react';
import { fetchStaffOrders, Order } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';

/* ── Two-tone counter chime (Web Audio) ──────────────────────────────── */
function playChime() {
  try {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const t = ctx.currentTime;

    const o1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    o1.type = 'sine';
    o1.frequency.setValueAtTime(659.25, t); // E5
    g1.gain.setValueAtTime(0.28, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    o1.connect(g1).connect(ctx.destination);
    o1.start(t);
    o1.stop(t + 0.4);

    const o2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    o2.type = 'sine';
    o2.frequency.setValueAtTime(523.25, t + 0.25); // C5
    g2.gain.setValueAtTime(0.28, t + 0.25);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    o2.connect(g2).connect(ctx.destination);
    o2.start(t + 0.25);
    o2.stop(t + 0.7);
  } catch {}
}

export default function Display() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [now, setNow] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const prevReadyRef = useRef<Set<string>>(new Set());
  const firstLoad = useRef(true);

  const toggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchStaffOrders();
        setOrders(data);

        const ready = data.filter(
          (o) => o.status === 'ready' && o.type !== 'staff-delivery'
        );
        const readyIds = new Set(ready.map((o) => o.id));

        if (!firstLoad.current && soundOn) {
          const isNew = ready.some((o) => !prevReadyRef.current.has(o.id));
          if (isNew) playChime();
        }
        prevReadyRef.current = readyIds;
        firstLoad.current = false;
      } catch (e) {
        console.error('Display load error:', e);
      }
    };

    load();
    const ch = supabase
      .channel('display-board')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => load())
      .subscribe();
    const clock = setInterval(() => setNow(new Date()), 1000);
    return () => {
      supabase.removeChannel(ch);
      clearInterval(clock);
    };
  }, [soundOn]);

  const { ready, cooking } = useMemo(() => {
    const pick = orders.filter((o) => o.type !== 'staff-delivery');
    return {
      ready: pick.filter((o) => o.status === 'ready'),
      cooking: pick.filter((o) => o.status === 'cooking' || o.status === 'placed'),
    };
  }, [orders]);

  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="h-screen w-screen bg-[#1a1a2e] flex flex-col overflow-hidden select-none">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-3 bg-[#16213e] border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-4">
          {/* Brand */}
          <div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <span className="text-white font-black text-lg">C</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg sm:text-xl tracking-tight leading-none">
              Campus Canteen
            </h1>
            <p className="text-white/40 text-[11px] font-medium">
              SLRTCE Food Court &middot; Live Order Board
            </p>
          </div>
        </div>

        {/* Clock + Controls */}
        <div className="flex items-center gap-4">
          <span className="text-white/90 font-semibold text-lg sm:text-xl tracking-wide hidden sm:block">
            {time}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setSoundOn(!soundOn);
                if (!soundOn) playChime();
              }}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                soundOn
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-white/5 text-white/30'
              }`}
            >
              {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              onClick={toggle}
              className="p-2 rounded-lg bg-white/5 text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Board ─────────────────────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-2 min-h-0">
        {/* ── PREPARING ────────────────────────────────────────────────── */}
        <div className="bg-[#1a1a2e] flex flex-col border-r border-white/10">
          {/* Column header */}
          <div className="flex items-center justify-between px-6 py-4 bg-amber-500">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-white/90 animate-pulse" />
              <h2 className="text-white font-extrabold text-xl sm:text-2xl tracking-wide uppercase">
                Preparing
              </h2>
            </div>
            <span className="bg-white/20 text-white font-bold text-sm px-3 py-1 rounded-full">
              {cooking.length}
            </span>
          </div>

          {/* Token grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {cooking.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-white/20 text-lg font-medium">No orders cooking</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 content-start">
                {cooking.map((o) => (
                  <div
                    key={o.id}
                    className="bg-white/[0.06] rounded-2xl py-5 sm:py-7 flex items-center justify-center"
                  >
                    <span className="font-bold text-amber-400 text-4xl sm:text-5xl lg:text-6xl tabular-nums">
                      {o.token}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── READY / NOW SERVING ──────────────────────────────────────── */}
        <div className="bg-[#0f2922] flex flex-col">
          {/* Column header */}
          <div className="flex items-center justify-between px-6 py-4 bg-emerald-600">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-white animate-ping" />
              <h2 className="text-white font-extrabold text-xl sm:text-2xl tracking-wide uppercase">
                Ready &mdash; Collect Now
              </h2>
            </div>
            <span className="bg-white/20 text-white font-bold text-sm px-3 py-1 rounded-full">
              {ready.length}
            </span>
          </div>

          {/* Token grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {ready.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-emerald-500/30 text-lg font-medium">Waiting for kitchen</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 content-start">
                {ready.map((o) => (
                  <div
                    key={o.id}
                    className="bg-emerald-500/20 border-2 border-emerald-400 rounded-2xl py-5 sm:py-7 flex items-center justify-center animate-pulse"
                  >
                    <span className="font-bold text-white text-4xl sm:text-5xl lg:text-6xl tabular-nums">
                      {o.token}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="flex items-center justify-between px-6 py-2 bg-[#16213e] border-t border-white/10 text-white/30 text-xs font-medium flex-shrink-0">
        <span>Please collect your order at the counter when your token is called</span>
        <span>Live &middot; Auto-refresh</span>
      </footer>
    </div>
  );
}
