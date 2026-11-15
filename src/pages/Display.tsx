import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Maximize, Minimize, Volume2, VolumeX } from 'lucide-react';
import { fetchStaffOrders, Order } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';

/* ── Simple counter chime ──────────────────────────────────────────── */
function playChime() {
  try {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(880, t);
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.5);
  } catch {}
}

export default function Display() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [now, setNow] = useState(new Date());
  const [isFs, setIsFs] = useState(false);
  const [sound, setSound] = useState(true);
  const prevRef = useRef<Set<string>>(new Set());
  const first = useRef(true);

  const toggleFs = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFs(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFs(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const d = await fetchStaffOrders();
        setOrders(d);
        const rdy = d.filter((o) => o.status === 'ready' && o.type !== 'staff-delivery');
        const ids = new Set(rdy.map((o) => o.id));
        if (!first.current && sound && rdy.some((o) => !prevRef.current.has(o.id))) {
          playChime();
        }
        prevRef.current = ids;
        first.current = false;
      } catch {}
    };
    load();
    const ch = supabase
      .channel('display-tv')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => load())
      .subscribe();
    const clk = setInterval(() => setNow(new Date()), 1000);
    return () => { supabase.removeChannel(ch); clearInterval(clk); };
  }, [sound]);

  const { ready, cooking } = useMemo(() => {
    const p = orders.filter((o) => o.type !== 'staff-delivery');
    return {
      ready: p.filter((o) => o.status === 'ready'),
      cooking: p.filter((o) => o.status === 'cooking' || o.status === 'placed'),
    };
  }, [orders]);

  const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="h-screen w-screen bg-white flex flex-col overflow-hidden select-none">

      {/* ═══ TOP RED BRAND BAR ═══════════════════════════════════════ */}
      <div className="bg-[#DA291C] px-5 sm:px-8 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
            <span className="text-[#DA291C] font-black text-base">C</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-base sm:text-lg leading-tight">Campus Canteen</h1>
            <p className="text-white/70 text-[10px] sm:text-xs">SLRTCE Food Court</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-white font-semibold text-sm sm:text-base">{time}</span>
          <div className="flex gap-1">
            <button
              onClick={() => { setSound(!sound); if (!sound) playChime(); }}
              className={`p-1.5 rounded-md cursor-pointer ${sound ? 'bg-white/20 text-white' : 'bg-white/10 text-white/40'}`}
            >
              {sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button onClick={toggleFs} className="p-1.5 rounded-md bg-white/10 text-white/70 hover:text-white cursor-pointer">
              {isFs ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* ═══ MAIN TWO-COLUMN BOARD ══════════════════════════════════ */}
      <div className="flex-1 grid grid-cols-2 min-h-0">

        {/* ─── LEFT: PREPARING ─────────────────────────────────────── */}
        <div className="flex flex-col border-r-2 border-gray-200">
          {/* Section header */}
          <div className="bg-[#FFC72C] px-5 sm:px-8 py-3 sm:py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-white/80 animate-pulse" />
              <h2 className="font-extrabold text-[#3C2415] text-lg sm:text-2xl uppercase tracking-wide">
                Preparing
              </h2>
            </div>
            <span className="bg-[#3C2415]/15 text-[#3C2415] font-bold text-xs sm:text-sm px-3 py-1 rounded-full">
              {cooking.length} orders
            </span>
          </div>

          {/* Token list */}
          <div className="flex-1 overflow-y-auto bg-[#FFFDF5]">
            {cooking.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-300 text-base sm:text-lg font-medium">No orders in kitchen</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {cooking.map((o, i) => (
                  <div
                    key={o.id}
                    className={`flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5 ${
                      i % 2 === 0 ? 'bg-white' : 'bg-[#FFFDF5]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FFC72C]/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#B8860B] text-xs sm:text-sm font-bold">{i + 1}</span>
                      </div>
                      <span className="font-bold text-gray-900 text-2xl sm:text-4xl tabular-nums">
                        {o.token}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm text-amber-600 font-semibold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      In Kitchen
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT: READY ────────────────────────────────────────── */}
        <div className="flex flex-col">
          {/* Section header */}
          <div className="bg-[#27AE60] px-5 sm:px-8 py-3 sm:py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-white animate-ping" />
              <h2 className="font-extrabold text-white text-lg sm:text-2xl uppercase tracking-wide">
                Ready — Collect Now
              </h2>
            </div>
            <span className="bg-white/20 text-white font-bold text-xs sm:text-sm px-3 py-1 rounded-full">
              {ready.length} orders
            </span>
          </div>

          {/* Token list */}
          <div className="flex-1 overflow-y-auto bg-[#F0FFF4]">
            {ready.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-300 text-base sm:text-lg font-medium">Waiting for kitchen</p>
              </div>
            ) : (
              <div className="divide-y divide-emerald-100">
                {ready.map((o, i) => (
                  <div
                    key={o.id}
                    className={`flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5 ${
                      i % 2 === 0 ? 'bg-white' : 'bg-[#F0FFF4]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs sm:text-sm font-bold">✓</span>
                      </div>
                      <span className="font-bold text-gray-900 text-2xl sm:text-4xl tabular-nums">
                        {o.token}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Pick Up
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM INFO BAR ════════════════════════════════════════ */}
      <div className="bg-gray-50 border-t border-gray-200 px-5 sm:px-8 py-2 flex items-center justify-between text-xs text-gray-400 font-medium flex-shrink-0">
        <span>Please collect your order at the counter when your number appears on the right</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live</span>
        </div>
      </div>
    </div>
  );
}
