import { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, X, Sparkles } from 'lucide-react';
import { useNotifications, AppNotification } from '@/hooks/use-notifications';
import { useNavigate } from 'react-router-dom';

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) return 'Just now';
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
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

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
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const handleNotifClick = (n: AppNotification) => {
    markAsRead(n.id);
    if (n.orderToken) {
      setOpen(false);
      navigate('/track');
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen(prev => !prev)}
        className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl hover:bg-muted transition-all duration-200 group"
        aria-label="Notifications"
      >
        <Bell className={`h-5 w-5 transition-all duration-200 ${open ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />

        {/* Animated badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 border-2 border-background animate-bounce-in shadow-lg shadow-red-500/30">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Pulse ring when there are unread notifications */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] rounded-full bg-red-500/40 animate-ping pointer-events-none" />
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <>
          {/* Backdrop for mobile */}
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setOpen(false)} />

          <div
            ref={panelRef}
            className="fixed md:absolute right-2 md:right-0 top-16 md:top-full md:mt-2 w-[calc(100vw-16px)] md:w-[400px] max-h-[70vh] md:max-h-[500px] bg-card rounded-2xl border border-border/80 shadow-2xl shadow-black/10 z-50 flex flex-col overflow-hidden animate-slide-down"
            style={{
              animation: 'slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={markAllAsRead}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                    <button
                      onClick={clearAll}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                      title="Clear all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground md:hidden"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-hide">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Sparkles className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">All caught up!</h4>
                  <p className="text-xs text-muted-foreground">
                    No notifications yet. We'll notify you when something happens.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-muted/50 group ${
                        !n.read ? 'bg-primary/[0.03]' : ''
                      }`}
                    >
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${
                        !n.read ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        {n.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm leading-tight ${!n.read ? 'font-bold text-foreground' : 'font-medium text-foreground/80'}`}>
                            {n.title}
                          </p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[10px] text-muted-foreground/70">{timeAgo(n.timestamp)}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(n.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                            title="Delete"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-border/60 px-4 py-2.5 bg-muted/20">
                <p className="text-[10px] text-muted-foreground text-center">
                  Showing latest {Math.min(notifications.length, 50)} notifications
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Inline keyframes for slide animation */}
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
        @keyframes bounceIn {
          0% {
            transform: scale(0);
          }
          60% {
            transform: scale(1.3);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-bounce-in {
          animation: bounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-slide-down {
          animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}
