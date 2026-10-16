import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/use-profile';

// ── Types ────────────────────────────────────────────────────────────────────
export type NotificationType =
  | 'order_placed'
  | 'order_cooking'
  | 'order_ready'
  | 'order_collected'
  | 'order_delivered'
  | 'new_order'        // staff/admin only
  | 'promo';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon: string;        // emoji
  timestamp: string;   // ISO string
  read: boolean;
  orderId?: string;
  orderToken?: string;
}

// ── Constants ────────────────────────────────────────────────────────────────
const NOTIFICATIONS_KEY = 'canteen_notifications';
const MAX_NOTIFICATIONS = 50;

// Status → human-readable config
const STATUS_CONFIG: Record<string, { type: NotificationType; title: string; icon: string; message: (token: string) => string }> = {
  placed: {
    type: 'order_placed',
    title: 'Order Placed',
    icon: '📦',
    message: (token) => `Your order ${token} has been placed successfully!`,
  },
  cooking: {
    type: 'order_cooking',
    title: 'Order Being Prepared',
    icon: '👨‍🍳',
    message: (token) => `Your order ${token} is now being prepared by our chef!`,
  },
  ready: {
    type: 'order_ready',
    title: 'Order Ready! 🎉',
    icon: '✅',
    message: (token) => `Your order ${token} is ready for pickup! Please collect it now.`,
  },
  collected: {
    type: 'order_collected',
    title: 'Order Collected',
    icon: '🎒',
    message: (token) => `Your order ${token} has been collected. Enjoy your meal!`,
  },
  'out-for-delivery': {
    type: 'order_delivered',
    title: 'Out for Delivery',
    icon: '🚀',
    message: (token) => `Your order ${token} is on its way to you!`,
  },
  delivered: {
    type: 'order_delivered',
    title: 'Order Delivered',
    icon: '📍',
    message: (token) => `Your order ${token} has been delivered. Bon appétit!`,
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function loadNotifications(): AppNotification[] {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveNotifications(notifications: AppNotification[]) {
  // Keep only the latest MAX_NOTIFICATIONS
  const trimmed = notifications.slice(0, MAX_NOTIFICATIONS);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(trimmed));
}

function playNotificationSound() {
  try {
    // Create a brief, pleasant notification "ding" using Web Audio API
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);          // A5
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);   // C#6
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);

    // Vibrate on mobile if available
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  } catch {
    // Audio not available — silent fallback
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>(loadNotifications);
  const { role, profile } = useProfile();
  const processedIdsRef = useRef<Set<string>>(new Set());

  // Keep localStorage in sync
  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  // ── Push a new notification ─────────────────────────────────────────────
  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const id = crypto.randomUUID();
    const newNotif: AppNotification = {
      ...notif,
      id,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => [newNotif, ...prev]);
    playNotificationSound();
  }, []);

  // ── Mark single / all as read ───────────────────────────────────────────
  const markAsRead = useCallback((notifId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notifId ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // ── Delete a single notification ────────────────────────────────────────
  const deleteNotification = useCallback((notifId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notifId));
  }, []);

  // ── Clear all ───────────────────────────────────────────────────────────
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // ── Unread count ────────────────────────────────────────────────────────
  const unreadCount = notifications.filter(n => !n.read).length;

  // ── Supabase real-time subscription ─────────────────────────────────────
  useEffect(() => {
    // For customers: listen to their own orders' status changes
    // For staff/admin: listen to all new orders
    const channel = supabase
      .channel('notifications-order-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        async (payload) => {
          const nextStatus = payload.new.status as string;
          const orderId = payload.new.id as string;
          const token = payload.new.token as string;
          const userId = payload.new.user_id as string | null;

          // Avoid duplicate processing
          const eventKey = `${orderId}-${nextStatus}`;
          if (processedIdsRef.current.has(eventKey)) return;
          processedIdsRef.current.add(eventKey);

          // Limit the set size
          if (processedIdsRef.current.size > 200) {
            const arr = Array.from(processedIdsRef.current);
            processedIdsRef.current = new Set(arr.slice(-100));
          }

          const config = STATUS_CONFIG[nextStatus];
          if (!config) return;

          // If user is staff/admin, show notifications for all orders
          if (role === 'staff' || role === 'admin') {
            addNotification({
              type: config.type,
              title: config.title,
              message: config.message(token),
              icon: config.icon,
              orderId,
              orderToken: token,
            });
            return;
          }

          // For regular users, only notify about their own orders
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.id && userId === session.user.id) {
              addNotification({
                type: config.type,
                title: config.title,
                message: config.message(token),
                icon: config.icon,
                orderId,
                orderToken: token,
              });
            }
          } catch {
            // Not logged in — skip
          }
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const token = payload.new.token as string;
          const orderId = payload.new.id as string;

          // Avoid duplicate processing
          const eventKey = `insert-${orderId}`;
          if (processedIdsRef.current.has(eventKey)) return;
          processedIdsRef.current.add(eventKey);

          // Staff/Admin: alert on every new order
          if (role === 'staff' || role === 'admin') {
            addNotification({
              type: 'new_order',
              title: 'New Order Received! 🔔',
              message: `A new order ${token} has been placed. Check the dashboard.`,
              icon: '🆕',
              orderId,
              orderToken: token,
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [role, addNotification]);

  // ── Add promotional notification (manual trigger) ───────────────────────
  const addPromo = useCallback((title: string, message: string) => {
    addNotification({
      type: 'promo',
      title,
      message,
      icon: '🎉',
    });
  }, [addNotification]);

  return {
    notifications,
    unreadCount,
    addNotification,
    addPromo,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
}
