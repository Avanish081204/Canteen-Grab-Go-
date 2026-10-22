import { useState, useRef, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  CheckCheck,
  Trash2,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Play,
  Music,
  Check,
  SlidersHorizontal,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  ChefHat,
  Info,
} from 'lucide-react';
import {
  useNotifications,
  AppNotification,
  SOUND_TONE_OPTIONS,
  SoundTone,
} from '@/hooks/use-notifications';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';

function renderNotificationBadge(type: string) {
  switch (type) {
    case 'order_placed':
      return {
        icon: <Package className="w-4 h-4 text-primary" />,
        bg: 'bg-primary/10 border-primary/20',
      };
    case 'order_cooking':
      return {
        icon: <ChefHat className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
        bg: 'bg-amber-500/10 border-amber-500/20',
      };
    case 'order_ready':
      return {
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        bg: 'bg-emerald-500/10 border-emerald-500/20',
      };
    case 'order_collected':
      return {
        icon: <CheckCheck className="w-4 h-4 text-muted-foreground" />,
        bg: 'bg-muted/70 border-border/40',
      };
    case 'order_delivered':
      return {
        icon: <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        bg: 'bg-blue-500/10 border-blue-500/20',
      };
    case 'new_order':
      return {
        icon: <BellRing className="w-4 h-4 text-primary" />,
        bg: 'bg-primary/10 border-primary/20',
      };
    case 'promo':
      return {
        icon: <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />,
        bg: 'bg-violet-500/10 border-violet-500/20',
      };
    default:
      return {
        icon: <Info className="w-4 h-4 text-primary" />,
        bg: 'bg-primary/10 border-primary/20',
      };
  }
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const seconds = Math.floor(diff / 1000);

  if (seconds < 45) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    soundEnabled,
    selectedTone,
    browserPermission,
    toggleSound,
    setSelectedTone,
    previewTone,
    requestBrowserPermission,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    sendTestNotification,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [hasNewNotifAnimation, setHasNewNotifAnimation] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    return sessionStorage.getItem('canteen_desktop_banner_dismissed') === 'true';
  });
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const prevCountRef = useRef(unreadCount);
  const navigate = useNavigate();

  // Trigger subtle wiggle animation when unreadCount increases
  useEffect(() => {
    if (unreadCount > prevCountRef.current) {
      setHasNewNotifAnimation(true);
      const timer = setTimeout(() => setHasNewNotifAnimation(false), 1200);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setShowSoundSettings(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        setShowSoundSettings(false);
      }
    }
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const handleNotifClick = (n: AppNotification) => {
    markAsRead(n.id);
    setOpen(false);
    if (n.orderToken) {
      navigate(`/track?token=${encodeURIComponent(n.orderToken)}`);
    } else if (n.type === 'new_order') {
      navigate('/staff/dashboard');
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className={`relative inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 group ${
          open
            ? 'bg-primary/15 text-primary'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        } ${hasNewNotifAnimation ? 'animate-bell-wiggle' : ''}`}
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className={`h-5 w-5 transition-transform duration-200 group-hover:scale-105 ${open ? 'text-primary' : ''}`} />

        {/* Animated Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-bold px-1 border-2 border-background shadow-md shadow-red-500/30 animate-scale-in">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Pulse ring for unread notifications */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] rounded-full bg-red-500/40 animate-ping pointer-events-none" />
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <>
          {/* Mobile Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setOpen(false)}
          />

          <div
            ref={panelRef}
            className="fixed md:absolute right-2 md:right-0 top-16 md:top-full md:mt-2.5 w-[calc(100vw-16px)] md:w-[410px] max-h-[85vh] md:max-h-[560px] bg-card/95 backdrop-blur-xl rounded-2xl border border-border/80 shadow-2xl shadow-black/20 z-50 flex flex-col overflow-hidden animate-slide-down"
            style={{
              animation: 'slideDown 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/40 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground leading-none">Notifications</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Live order updates & alerts</p>
                </div>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-semibold bg-primary/15 text-primary px-2 py-0.5 rounded-full ml-1">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-1">
                {/* Sound Tone Selection Button */}
                <button
                  onClick={() => setShowSoundSettings((prev) => !prev)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    showSoundSettings
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  title="Customize notification sound"
                >
                  <Music className="w-4 h-4" />
                </button>

                {/* Sound Mute/Unmute Button */}
                <button
                  onClick={toggleSound}
                  className={`p-1.5 rounded-lg transition-colors ${
                    soundEnabled
                      ? 'text-primary hover:bg-primary/10'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  title={soundEnabled ? 'Mute notification sound' : 'Unmute notification sound'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {notifications.length > 0 && (
                  <>
                    {/* Mark all as read */}
                    <button
                      onClick={markAllAsRead}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>

                    {/* Clear all */}
                    <button
                      onClick={clearAll}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                      title="Clear all notifications"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Mobile close */}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground md:hidden"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sound Tone Selection Sub-Panel */}
            {showSoundSettings && (
              <div className="px-4 py-3 bg-muted/40 border-b border-border/60 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                    Choose Notification Sound
                  </span>
                  <span className="text-[10px] text-muted-foreground">Click to select & listen</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {SOUND_TONE_OPTIONS.map((tone) => {
                    const isSelected = selectedTone === tone.id;
                    return (
                      <button
                        key={tone.id}
                        onClick={() => setSelectedTone(tone.id)}
                        className={`flex items-center justify-between p-2 rounded-xl text-left border transition-all text-xs ${
                          isSelected
                            ? 'bg-primary/10 border-primary/40 text-foreground font-semibold shadow-xs'
                            : 'bg-background/80 hover:bg-background border-border/60 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm">{tone.icon}</span>
                          <span className="truncate text-[11px] leading-tight">{tone.label}</span>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                previewTone(tone.id);
                              }}
                              className="p-1 hover:text-primary transition-colors text-muted-foreground"
                              title="Listen preview"
                            >
                              <Play className="w-3 h-3 fill-current" />
                            </button>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Desktop / System Push Permission Banner */}
            {browserPermission === 'default' && !bannerDismissed && (
              <div className="px-4 py-2.5 bg-gradient-to-r from-primary/10 via-amber-500/10 to-transparent border-b border-border/50 flex items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                    <BellRing className="w-4 h-4 animate-bounce" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground leading-tight">
                      {Capacitor.isNativePlatform() ? 'Enable Push Alerts' : 'Enable Desktop Alerts'}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 truncate">
                      {Capacitor.isNativePlatform()
                        ? 'Get alerts even when app is closed or in background'
                        : 'Get notified when food is ready, even in background'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={requestBrowserPermission}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:brightness-110 shadow-sm transition-all"
                  >
                    Enable
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setBannerDismissed(true);
                      sessionStorage.setItem('canteen_desktop_banner_dismissed', 'true');
                    }}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                    title="Dismiss banner"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-border/40 scrollbar-thin">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-3.5 shadow-inner">
                    <Sparkles className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">All caught up!</h4>
                  <p className="text-xs text-muted-foreground max-w-[240px]">
                    No notifications right now. When you order food, real-time alerts will show up here.
                  </p>
                  <button
                    onClick={sendTestNotification}
                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-all"
                  >
                    <Play className="w-3.5 h-3.5 text-primary" />
                    Try Test Notification
                  </button>
                </div>
              ) : (
                notifications.map((n) => {
                  const badge = renderNotificationBadge(n.type);
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-muted/60 group relative ${
                        !n.read ? 'bg-primary/[0.04]' : ''
                      }`}
                    >
                      {/* Professional Icon Badge */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs border ${badge.bg}`}
                      >
                        {badge.icon}
                      </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-start justify-between gap-1">
                        <p
                          className={`text-xs sm:text-sm leading-snug line-clamp-1 ${
                            !n.read ? 'font-bold text-foreground' : 'font-medium text-foreground/80'
                          }`}
                        >
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0 mt-1" />
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>

                      <div className="flex items-center justify-between mt-2 gap-2">
                        <span className="text-[10px] text-muted-foreground/75 font-medium">
                          {timeAgo(n.timestamp)}
                        </span>

                        {/* Order Action Button */}
                        {n.orderToken && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
                            Track Order #{n.orderToken}
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        )}
                        {n.type === 'new_order' && !n.orderToken && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
                            View Kitchen
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete single notification button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n.id);
                      }}
                      className="absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                      title="Dismiss notification"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border/60 px-4 py-2.5 bg-muted/30 backdrop-blur-sm flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                {browserPermission === 'granted' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    Desktop alerts ON
                  </span>
                ) : (
                  <span>
                    {notifications.length > 0
                      ? `${notifications.length} notification${notifications.length === 1 ? '' : 's'}`
                      : 'Notifications active'}
                  </span>
                )}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={sendTestNotification}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                >
                  <Play className="w-3 h-3" />
                  Test Sound
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bell Keyframes */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes bellWiggle {
          0% { transform: rotate(0); }
          15% { transform: rotate(14deg); }
          30% { transform: rotate(-14deg); }
          45% { transform: rotate(10deg); }
          60% { transform: rotate(-10deg); }
          75% { transform: rotate(4deg); }
          100% { transform: rotate(0); }
        }
        .animate-bell-wiggle {
          animation: bellWiggle 0.8s ease-in-out;
        }
      `}</style>
    </div>
  );
}
