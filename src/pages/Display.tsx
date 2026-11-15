import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Maximize, Minimize, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { fetchStaffOrders, Order } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';

/* ── Standard QSR Ding-Dong Counter Chime ───────────────────────────── */
function playDingDong() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Ding (High note)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(784, now); // G5
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1).connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Dong (Lower note)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(523.25, now + 0.22); // C5
    gain2.gain.setValueAtTime(0.25, now + 0.22);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now + 0.22);
    osc2.stop(now + 0.8);
  } catch {}
}

export default function Display() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [now, setNow] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const prevReadyRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(true);

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

        if (!initialLoadRef.current && soundEnabled) {
          const hasNewReady = currentReady.some((o) => !prevReadyRef.current.has(o.id));
          if (hasNewReady) {
            playDingDong();
          }
        }

        prevReadyRef.current = currentReadyIds;
        initialLoadRef.current = false;
      } catch (err) {
        console.error('Display sync error:', err);
      }
    };

    loadOrders();

    const channel = supabase
      .channel('tv-order-display')
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

  const { readyOrders, preparingOrders } = useMemo(() => {
    const valid = orders.filter((o) => o.type !== 'staff-delivery');
    return {
      readyOrders: valid.filter((o) => o.status === 'ready'),
      preparingOrders: valid.filter((o) => o.status === 'cooking' || o.status === 'placed'),
    };
  }, [orders]);

  const timeString = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="h-screen w-screen bg-[#111215] text-white flex flex-col justify-between font-sans select-none overflow-hidden">
      {/* ── Top Bar ─────────────────────────────────────────────────── */}
      <header className="h-16 px-6 sm:px-8 bg-[#18191e] border-b border-[#262830] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg bg-[#22242b] hover:bg-[#2c2f38] text-gray-300 hover:text-white transition-colors cursor-pointer"
            title="Back to App"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-none">
              CAMPUS CANTEEN
            </h1>
            <p className="text-xs text-gray-400 mt-1">Order Status Board</p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-bold text-white tabular-nums tracking-wide">
              {timeString}
            </span>
          </div>

          <div className="h-6 w-[1px] bg-[#2a2c35]" />

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playDingDong();
              }}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-emerald-950/50 border-emerald-600/60 text-emerald-400'
                  : 'bg-[#22242b] border-[#2c2f38] text-gray-400 hover:text-white'
              }`}
              title={soundEnabled ? 'Chime ON' : 'Chime Muted'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-[#22242b] hover:bg-[#2c2f38] border border-[#2c2f38] text-gray-300 hover:text-white transition-colors cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main 50 / 50 Industrial QSR Board ──────────────────────── */}
      <main className="flex-1 grid grid-cols-2 min-h-0 bg-[#0d0e11]">
        {/* ── LEFT: PREPARING ────────────────────────────────────────── */}
        <section className="flex flex-col border-r border-[#22242c] overflow-hidden">
          <div className="h-16 px-6 sm:px-8 bg-[#18191e] border-b border-[#262830] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <h2 className="text-lg sm:text-2xl font-extrabold tracking-wider text-amber-400 uppercase">
                PREPARING
              </h2>
            </div>
            <span className="text-sm font-bold text-gray-400 bg-[#22242b] px-3 py-1 rounded-md">
              {preparingOrders.length}
            </span>
          </div>

          <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
            {preparingOrders.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-600 text-base sm:text-lg font-medium">
                No orders in preparation
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 content-start">
                {preparingOrders.map((order) => {
                  const num = order.token.replace(/^#/, '');
                  return (
                    <div
                      key={order.id}
                      className="h-24 sm:h-28 rounded-xl bg-[#18191f] border border-[#262933] flex items-center justify-center"
                    >
                      <span className="text-4xl sm:text-5xl md:text-6xl font-black text-amber-300/90 tabular-nums tracking-tight">
                        {num}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── RIGHT: NOW SERVING / READY ─────────────────────────────── */}
        <section className="flex flex-col overflow-hidden bg-[#0d1412]">
          <div className="h-16 px-6 sm:px-8 bg-[#10221c] border-b border-emerald-900/60 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-lg sm:text-2xl font-extrabold tracking-wider text-emerald-400 uppercase">
                NOW SERVING
              </h2>
            </div>
            <span className="text-sm font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800/60 px-3 py-1 rounded-md">
              {readyOrders.length}
            </span>
          </div>

          <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
            {readyOrders.length === 0 ? (
              <div className="h-full flex items-center justify-center text-emerald-900/80 text-base sm:text-lg font-medium">
                No orders ready for pickup
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 content-start">
                {readyOrders.map((order) => {
                  const num = order.token.replace(/^#/, '');
                  return (
                    <div
                      key={order.id}
                      className="h-24 sm:h-28 rounded-xl bg-emerald-600 border-2 border-emerald-400 flex items-center justify-center shadow-md"
                    >
                      <span className="text-4xl sm:text-5xl md:text-6xl font-black text-white tabular-nums tracking-tight">
                        {num}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ── Bottom Strip ────────────────────────────────────────────── */}
      <footer className="h-10 px-6 sm:px-8 bg-[#14151a] border-t border-[#22242c] flex items-center justify-between text-xs text-gray-400 flex-shrink-0">
        <span>Please present your token receipt at the pickup counter when your number is called</span>
        <span className="text-gray-500 font-medium">Live Kitchen Counter Feed</span>
      </footer>
    </div>
  );
}
