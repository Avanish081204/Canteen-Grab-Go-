import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  ArrowLeft,
  Radio,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { fetchStaffOrders, Order } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import Logo from '@/components/Logo';

// ── Built-in Airport Two-Tone Chime (Web Audio API) ──────────────────
function playAirportChime(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        resolve();
        return;
      }
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Note 1: High chime tone (D5 - 587.33 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Note 2: Low resolution chime tone (A4 - 440 Hz) after 200ms
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(440, now + 0.22);
      gain2.gain.setValueAtTime(0.3, now + 0.22);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.22);
      osc2.stop(now + 0.7);

      setTimeout(() => resolve(), 650);
    } catch {
      resolve();
    }
  });
}

// ── Synthesized Airport Voice Announcement ───────────────────────────
function announceAirportToken(token: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();
    const cleanToken = token.replace(/[^0-9a-zA-Z]/g, '');
    const spokenTokens = cleanToken.split('').join(' '); // e.g. "1 0 4" for clarity

    const text = `Attention please. Order token ${spokenTokens} is now ready for collection at Counter 1.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    utterance.volume = 1;

    // Pick crisp English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find(
        (v) =>
          v.lang.startsWith('en-IN') ||
          v.lang.startsWith('en-GB') ||
          v.lang.startsWith('en-US')
      ) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Voice announcement error:', err);
  }
}

export default function Display() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [now, setNow] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [testActive, setTestActive] = useState(false);

  const prevReadyIdsRef = useRef<Set<string>>(new Set());
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

  const triggerCallout = async (token: string) => {
    await playAirportChime();
    announceAirportToken(token);
  };

  const handleTestAudio = async () => {
    setTestActive(true);
    await triggerCallout('#104');
    setTimeout(() => setTestActive(false), 2500);
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

        // Skip announcement on first boot load
        if (!isFirstLoadRef.current && isAudioEnabled) {
          const newlyReadyOrders = currentReady.filter(
            (o) => !prevReadyIdsRef.current.has(o.id)
          );
          if (newlyReadyOrders.length > 0) {
            const latest = newlyReadyOrders[0];
            triggerCallout(latest.token);
          }
        }

        prevReadyIdsRef.current = currentReadyIds;
        isFirstLoadRef.current = false;
      } catch (err) {
        console.error('Failed to load orders for display:', err);
      }
    };

    loadOrders();

    // Realtime Supabase Subscription
    const channel = supabase
      .channel('display-realtime-airport-board')
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
  }, [isAudioEnabled]);

  const categorizedOrders = useMemo(() => {
    const nonDelivery = orders.filter((o) => o.type !== 'staff-delivery');
    return {
      ready: nonDelivery.filter((o) => o.status === 'ready'),
      cooking: nonDelivery.filter(
        (o) => o.status === 'cooking' || o.status === 'placed'
      ),
    };
  }, [orders]);

  // Aviation flight board time format: HH:MM:SS
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Aviation flight board date format: 08 NOV 2026
  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = date
      .toLocaleDateString('en-US', { month: 'short' })
      .toUpperCase();
    const year = date.getFullYear();
    const weekday = date
      .toLocaleDateString('en-US', { weekday: 'short' })
      .toUpperCase();
    return `${weekday} • ${day} ${month} ${year}`;
  };

  return (
    <div className="h-screen w-screen bg-[#050608] text-white flex flex-col justify-between p-3 sm:p-5 select-none font-mono overflow-hidden relative">
      {/* ── Dot-Matrix LED Screen Background Pattern ─────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />

      {/* ── Top Airport Departure Header ─────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between pb-3 sm:pb-4 border-b-2 border-white/15 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-2xl flex-shrink-0">
        {/* Left: Airport Hub / Terminal Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer"
            title="Exit to Main Menu"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Logo size="sm" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black tracking-widest text-white uppercase">
                CAMPUS FOOD COURT
              </h1>
              <span className="hidden md:inline-block text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-bold">
                GATE 1 • DISPATCH BOARD
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 tracking-wider">
              SLRTCE SMART CANTEEN // DIGITAL FLIGHT-STYLE LED ORDER BOARD
            </p>
          </div>
        </div>

        {/* Center: Live Radar Telemetry (Hidden on small mobile) */}
        <div className="hidden lg:flex items-center gap-3 bg-emerald-950/40 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-300 font-bold tracking-wider text-[11px]">
            RADAR ONLINE • AUTO-SYNC REALTIME
          </span>
        </div>

        {/* Right: Digital Military Clock & Audio Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Digital Clock */}
          <div className="text-right">
            <div className="font-mono font-black text-xl sm:text-2xl md:text-3xl text-emerald-400 tracking-widest [text-shadow:0_0_12px_rgba(52,211,153,0.7)] leading-none">
              {formatTime(now)}
            </div>
            <div className="text-[9px] sm:text-[11px] text-slate-400 tracking-wider mt-1 font-semibold">
              {formatDate(now)}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Test Audio Button */}
            <button
              onClick={handleTestAudio}
              disabled={testActive}
              className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
                testActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                  : 'bg-white/5 text-slate-300 hover:text-white border-white/10'
              }`}
              title="Test Airport Ding-Dong & Voice Announcement"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>TEST CALL</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => {
                const next = !isAudioEnabled;
                setIsAudioEnabled(next);
                if (next) triggerCallout('#104');
              }}
              className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer ${
                isAudioEnabled
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : 'bg-white/5 text-slate-500 hover:text-slate-300 border-white/10'
              }`}
              title={
                isAudioEnabled
                  ? 'Voice & Chime Enabled'
                  : 'Voice & Chime Muted'
              }
            >
              {isAudioEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main High-Contrast LED Airport Grid ─────────────────────── */}
      <div className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5 my-3 sm:my-4 overflow-hidden">
        {/* ═════════════════════════════════════════════════════════════ */}
        {/* ── LEFT 50%: PREPARING IN KITCHEN (AMBER / GOLD LED) ──────── */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <div className="bg-[#0b0c10] border-2 border-amber-500/50 rounded-3xl p-4 sm:p-6 flex flex-col justify-between overflow-hidden shadow-[0_0_25px_rgba(245,158,11,0.12)]">
          <div>
            {/* LED Header Bar */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b-2 border-amber-500/30 mb-4 bg-amber-500/5 -mx-4 -mt-4 px-4 pt-4 sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-5">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-amber-400 tracking-widest uppercase [text-shadow:0_0_15px_rgba(251,191,36,0.6)]">
                    PREPARING
                  </h2>
                  <span className="text-[10px] text-amber-300/70 tracking-wider block font-semibold">
                    ORDERS IN KITCHEN COOK QUEUE
                  </span>
                </div>
              </div>

              <div className="bg-amber-500/20 border-2 border-amber-400/50 text-amber-300 px-3.5 py-1 rounded-xl text-xs sm:text-sm font-black tracking-widest">
                [ {categorizedOrders.cooking.length} COOKING ]
              </div>
            </div>

            {/* Amber LED Token Numbers Grid */}
            {categorizedOrders.cooking.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
                <Clock className="w-12 h-12 text-amber-500/40 mb-3 animate-pulse" />
                <div className="text-amber-400/80 font-bold text-base sm:text-lg tracking-widest uppercase">
                  ALL CURRENT ORDERS PREPARED
                </div>
                <p className="text-xs text-slate-500 tracking-wider mt-1">
                  Kitchen queue clear • Ready for new orders
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5 overflow-y-auto max-h-[calc(100vh-260px)] pr-1 scrollbar-hide">
                {categorizedOrders.cooking.map((order) => {
                  const rawToken = order.token.replace(/^#/, '');
                  return (
                    <div
                      key={order.id}
                      className="relative p-3 sm:p-5 rounded-2xl bg-black/80 border-2 border-amber-500/40 shadow-[inset_0_0_15px_rgba(245,158,11,0.15)] flex flex-col items-center justify-center transition-all group"
                    >
                      {/* Top mini badge */}
                      <span className="text-[9px] uppercase font-bold text-amber-400/70 tracking-widest mb-0.5">
                        IN KITCHEN
                      </span>

                      {/* Giant Amber LED Number */}
                      <span className="font-mono font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-amber-400 tracking-widest [text-shadow:0_0_20px_rgba(251,191,36,0.8)] leading-none my-1">
                        {rawToken}
                      </span>

                      {/* Bottom ETA tag */}
                      <span className="text-[10px] text-slate-400 tracking-wider font-semibold">
                        ~{order.items?.length || 1} item(s)
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column Bottom Info Bar */}
          <div className="pt-3 border-t border-amber-500/20 flex items-center justify-between text-[10px] sm:text-xs text-amber-300/70 tracking-wider">
            <span>FOOD PREP IN PROGRESS</span>
            <span>PLEASE KEEP YOUR TOKEN TICKET READY</span>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* ── RIGHT 50%: READY FOR COLLECTION (EMERALD GREEN LED) ─────── */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <div className="bg-[#05110e] border-2 border-emerald-400 rounded-3xl p-4 sm:p-6 flex flex-col justify-between overflow-hidden relative shadow-[0_0_35px_rgba(16,185,129,0.25)]">
          {/* Subtle neon emerald ambient top aura */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-emerald-300 to-emerald-500 shadow-[0_0_25px_rgba(52,211,153,0.9)]" />

          <div>
            {/* LED Header Bar */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b-2 border-emerald-400/40 mb-4 bg-emerald-500/10 -mx-4 -mt-4 px-4 pt-4 sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-5">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-300 tracking-widest uppercase [text-shadow:0_0_20px_rgba(52,211,153,0.9)]">
                    NOW SERVING
                  </h2>
                  <span className="text-[10px] text-emerald-300/80 tracking-wider block font-semibold">
                    READY FOR PICKUP AT COUNTER 1
                  </span>
                </div>
              </div>

              <div className="bg-emerald-500/30 border-2 border-emerald-400 text-emerald-200 px-3.5 py-1 rounded-xl text-xs sm:text-sm font-black tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                [ {categorizedOrders.ready.length} READY ]
              </div>
            </div>

            {/* Emerald Green LED Token Numbers Grid */}
            {categorizedOrders.ready.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500/40 mb-3 animate-pulse" />
                <div className="text-emerald-400/90 font-bold text-base sm:text-lg tracking-widest uppercase [text-shadow:0_0_10px_rgba(52,211,153,0.5)]">
                  WAITING FOR ORDERS FROM KITCHEN
                </div>
                <p className="text-xs text-slate-400 tracking-wider mt-1">
                  Orders will flash here and sound chime when hot &amp; packed
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5 overflow-y-auto max-h-[calc(100vh-260px)] pr-1 scrollbar-hide">
                {categorizedOrders.ready.map((order) => {
                  const rawToken = order.token.replace(/^#/, '');
                  return (
                    <div
                      key={order.id}
                      className="relative p-3 sm:p-5 rounded-2xl bg-emerald-950/70 border-3 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)] flex flex-col items-center justify-center transition-all animate-pulse"
                    >
                      {/* Top status indicator */}
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-[9px] uppercase font-black text-emerald-300 tracking-widest">
                          READY NOW
                        </span>
                      </div>

                      {/* Giant Emerald LED Number */}
                      <span className="font-mono font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-widest [text-shadow:0_0_25px_rgba(52,211,153,1)] leading-none my-1">
                        {rawToken}
                      </span>

                      {/* Counter Designation */}
                      <span className="text-[10px] bg-emerald-400 text-slate-950 font-black px-2 py-0.5 rounded tracking-wider uppercase mt-1">
                        COUNTER 1
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column Bottom Info Bar */}
          <div className="pt-3 border-t border-emerald-400/30 flex items-center justify-between text-[10px] sm:text-xs text-emerald-300 font-bold tracking-wider">
            <span>COLLECT ORDER AT WINDOW A</span>
            <span>SHOW TOKEN NUMBER TO STAFF</span>
          </div>
        </div>
      </div>

      {/* ── Bottom Airport Marquee Departure Ticker ──────────────────── */}
      <div className="relative z-10 flex items-center bg-black/60 border border-white/15 px-3 py-2 rounded-xl overflow-hidden flex-shrink-0">
        <div className="flex items-center gap-2 bg-amber-500 text-slate-950 text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-md tracking-wider flex-shrink-0 uppercase mr-3">
          <span>NOTICE</span>
        </div>

        <div className="overflow-hidden whitespace-nowrap w-full">
          <div className="inline-block animate-marquee text-[11px] sm:text-xs font-semibold tracking-widest text-amber-300/90 [text-shadow:0_0_10px_rgba(251,191,36,0.5)]">
            ✈️ SLRTCE CAMPUS FOOD COURT &bull; PLEASE PRESENT YOUR TOKEN SLIP AT PICKUP COUNTER 1 &bull; 🥗 COMBO MEALS SERVED WITH COMPLIMENTARY WATER &bull; 📱 SCAN QR CODE AT TABLE TO REORDER FROM YOUR MOBILE &bull; CANTEEN SERVICE HOURS: 08:30 TO 19:00 HRS &bull; FRESH FOOD COOKED TO ORDER &bull; THANK YOU FOR DINING WITH US &bull; ✈️
          </div>
        </div>
      </div>
    </div>
  );
}
