import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/use-profile';
import { getOrders } from '@/lib/store';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { getFirebaseMessaging } from '@/lib/firebase';
import { onMessage } from 'firebase/messaging';

// ── Types ────────────────────────────────────────────────────────────────────
export type NotificationType =
  | 'order_placed'
  | 'order_cooking'
  | 'order_ready'
  | 'order_collected'
  | 'order_delivered'
  | 'new_order'        // staff/admin only
  | 'promo'
  | 'system';

export type SoundTone = 'chime' | 'food-ready' | 'service-bell' | 'pop';

export interface SoundToneOption {
  id: SoundTone;
  label: string;
  description: string;
  icon: string;
}

export const SOUND_TONE_OPTIONS: SoundToneOption[] = [
  { id: 'chime', label: 'Glass Chime', description: 'Apple-style soft elegant chime', icon: '🎵' },
  { id: 'food-ready', label: 'Order Ready Melody', description: 'Warm marimba food alert', icon: '🍕' },
  { id: 'service-bell', label: 'Service Desk Bell', description: 'Crisp canteen counter ding', icon: '🛎️' },
  { id: 'pop', label: 'Subtle Pop', description: 'Minimalist bubble sound', icon: '🫧' },
];

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
  actionUrl?: string;
}

export interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  soundEnabled: boolean;
  selectedTone: SoundTone;
  browserPermission: NotificationPermission | 'unsupported';
  toggleSound: () => void;
  setSelectedTone: (tone: SoundTone) => void;
  previewTone: (tone: SoundTone) => void;
  requestBrowserPermission: () => Promise<boolean>;
  addNotification: (
    notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>,
    options?: { skipToast?: boolean; skipSound?: boolean; skipBrowser?: boolean }
  ) => void;
  addPromo: (title: string, message: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  sendTestNotification: () => void;
}

// ── Constants ────────────────────────────────────────────────────────────────
const NOTIFICATIONS_KEY = 'canteen_notifications';
const SOUND_SETTING_KEY = 'canteen_sound_enabled';
const SOUND_TONE_KEY = 'canteen_sound_tone';
const MAX_NOTIFICATIONS = 50;

// Status → notification config mapping
const STATUS_CONFIG: Record<
  string,
  {
    type: NotificationType;
    title: string;
    icon: string;
    message: (token: string) => string;
    sound: 'status' | 'order_ready' | 'default';
  }
> = {
  placed: {
    type: 'order_placed',
    title: 'Order Confirmed',
    icon: '📦',
    message: (token) => `Order #${token} has been received and confirmed.`,
    sound: 'status',
  },
  cooking: {
    type: 'order_cooking',
    title: 'Preparing Order',
    icon: '🍳',
    message: (token) => `Order #${token} is currently being prepared.`,
    sound: 'status',
  },
  ready: {
    type: 'order_ready',
    title: 'Order Ready for Pickup',
    icon: '✅',
    message: (token) => `Order #${token} is ready for collection at the counter.`,
    sound: 'order_ready',
  },
  collected: {
    type: 'order_collected',
    title: 'Order Collected',
    icon: '✓',
    message: (token) => `Order #${token} has been collected successfully.`,
    sound: 'status',
  },
  'out-for-delivery': {
    type: 'order_delivered',
    title: 'Out for Delivery',
    icon: '🚚',
    message: (token) => `Order #${token} is on its way for delivery.`,
    sound: 'status',
  },
  delivered: {
    type: 'order_delivered',
    title: 'Order Delivered',
    icon: '✓',
    message: (token) => `Order #${token} has been delivered successfully.`,
    sound: 'status',
  },
};

// ── High Quality Audio Playback Engine ───────────────────────────────────────
const audioCache: Map<string, HTMLAudioElement> = new Map();

function playSoundAsset(tone: SoundTone | 'order_ready' | 'new_order') {
  try {
    let file = 'chime';
    if (tone === 'order_ready' || tone === 'food-ready') file = 'food-ready';
    else if (tone === 'new_order' || tone === 'service-bell') file = 'service-bell';
    else if (tone === 'pop') file = 'pop';
    else if (tone === 'chime') file = 'chime';

    const url = `/sounds/${file}.wav`;
    let audio = audioCache.get(url);
    if (!audio) {
      audio = new Audio(url);
      audioCache.set(url, audio);
    }
    audio.currentTime = 0;
    audio.volume = 0.9;
    const p = audio.play();
    if (p !== undefined) {
      p.catch(() => {
        // Fallback to synthesized audio if file load is restricted
        playSynthesizedFallback(tone);
      });
    }

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(tone === 'new_order' ? [120, 60, 120] : [80, 40, 80]);
    }
  } catch {
    playSynthesizedFallback(tone);
  }
}

// Synthesized Fallback (Harmonic Web Audio)
let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (typeof window === 'undefined') return null;
    if (!sharedAudioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) sharedAudioCtx = new AudioCtxClass();
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') ctx.resume();
    } catch {}
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
}

function playSynthesizedFallback(tone: SoundTone | 'order_ready' | 'new_order') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freq = tone === 'new_order' || tone === 'service-bell' ? 2093 : tone === 'order_ready' ? 784 : 880;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  } catch {}
}

// ── Browser Notification API ─────────────────────────────────────────────────
function triggerBrowserNotification(
  title: string,
  message: string,
  orderToken?: string,
  navigate?: (path: string) => void
) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const notif = new Notification(title, {
      body: message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: orderToken ? `order-${orderToken}` : `canteen-${Date.now()}`,
    });

    notif.onclick = () => {
      window.focus();
      if (orderToken && navigate) {
        navigate(`/track?token=${orderToken}`);
      }
      notif.close();
    };
  } catch (e) {
    console.warn('Could not display browser notification:', e);
  }
}

// ── Toast Trigger ────────────────────────────────────────────────────────────
function triggerToast(
  title: string,
  message: string,
  icon: string,
  orderToken?: string,
  isStaffAlert?: boolean,
  navigate?: (path: string) => void
) {
  if (isStaffAlert) {
    toast.info(`${icon} ${title}`, {
      description: message,
      duration: 6500,
      action: {
        label: 'View Queue',
        onClick: () => navigate?.('/staff/dashboard'),
      },
    });
  } else if (orderToken) {
    toast.success(`${icon} ${title}`, {
      description: message,
      duration: 6500,
      action: {
        label: 'Track Order',
        onClick: () => navigate?.(`/track?token=${orderToken}`),
      },
    });
  } else {
    toast(`${icon} ${title}`, {
      description: message,
      duration: 4500,
    });
  }
}

// ── Local Storage Helpers ────────────────────────────────────────────────────
function loadStoredNotifications(): AppNotification[] {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveStoredNotifications(notifications: AppNotification[]) {
  const trimmed = notifications.slice(0, MAX_NOTIFICATIONS);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(trimmed));
}

function loadSoundSetting(): boolean {
  try {
    const stored = localStorage.getItem(SOUND_SETTING_KEY);
    return stored === null ? true : stored === 'true';
  } catch {
    return true;
  }
}

function saveSoundSetting(enabled: boolean) {
  localStorage.setItem(SOUND_SETTING_KEY, String(enabled));
}

function loadToneSetting(): SoundTone {
  try {
    const stored = localStorage.getItem(SOUND_TONE_KEY) as SoundTone;
    if (stored && ['chime', 'food-ready', 'service-bell', 'pop'].includes(stored)) {
      return stored;
    }
    return 'chime';
  } catch {
    return 'chime';
  }
}

function saveToneSetting(tone: SoundTone) {
  localStorage.setItem(SOUND_TONE_KEY, tone);
}

// ── Context Creation ─────────────────────────────────────────────────────────
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(loadStoredNotifications);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(loadSoundSetting);
  const [selectedTone, setSelectedToneState] = useState<SoundTone>(loadToneSetting);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (Capacitor.isNativePlatform()) {
      return 'default';
    }
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const { role, profile } = useProfile();
  const processedIdsRef = useRef<Set<string>>(new Set());
  const navigate = useNavigate();

  // Keep localStorage synchronized
  useEffect(() => {
    saveStoredNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    saveSoundSetting(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    saveToneSetting(selectedTone);
  }, [selectedTone]);

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === NOTIFICATIONS_KEY && e.newValue) {
        try {
          setNotifications(JSON.parse(e.newValue));
        } catch {}
      } else if (e.key === SOUND_SETTING_KEY && e.newValue !== null) {
        setSoundEnabled(e.newValue === 'true');
      } else if (e.key === SOUND_TONE_KEY && e.newValue !== null) {
        setSelectedToneState(e.newValue as SoundTone);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Set selected sound tone
  const setSelectedTone = useCallback((tone: SoundTone) => {
    setSelectedToneState(tone);
    playSoundAsset(tone);
    const option = SOUND_TONE_OPTIONS.find((o) => o.id === tone);
    toast(`🎵 Notification tone set to: ${option?.label || tone}`);
  }, []);

  // Preview sound tone without setting
  const previewTone = useCallback((tone: SoundTone) => {
    playSoundAsset(tone);
  }, []);

  // Request browser desktop / Mobile App notification permission
  const requestBrowserPermission = useCallback(async (): Promise<boolean> => {
    if (Capacitor.isNativePlatform()) {
      try {
        let perm = await PushNotifications.checkPermissions();
        if (perm.receive === 'prompt') {
          perm = await PushNotifications.requestPermissions();
        }
        if (perm.receive === 'granted') {
          await PushNotifications.register();
          setBrowserPermission('granted');
          toast.success('Push notifications enabled!', {
            description: "You'll receive order alerts even when the app is in the background.",
          });
          return true;
        } else {
          setBrowserPermission('denied');
          toast.error('Notification permission was denied in phone settings.');
          return false;
        }
      } catch (e) {
        console.warn('Native push permission error:', e);
        return false;
      }
    }

    if (typeof window === 'undefined' || !('Notification' in window)) {
      setBrowserPermission('unsupported');
      toast.error('Browser desktop notifications are not supported on this device.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      if (permission === 'granted') {
        toast.success('Desktop notifications enabled!', {
          description: "You'll now receive order status alerts even in the background.",
        });
        triggerBrowserNotification('Campus Canteen Notifications', 'Desktop alerts are now active!', undefined, navigate);
        return true;
      } else {
        toast.error('Notification permission was denied in your browser settings.');
        return false;
      }
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
      return false;
    }
  }, [navigate]);

  // Toggle sound alert
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      toast(next ? '🔔 Notification sounds enabled' : '🔕 Notification sounds muted');
      if (next) {
        playSoundAsset(selectedTone);
      }
      return next;
    });
  }, [selectedTone]);

  // Dispatch a notification
  const addNotification = useCallback(
    (
      notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>,
      options?: { skipToast?: boolean; skipSound?: boolean; skipBrowser?: boolean }
    ) => {
      const id = crypto.randomUUID();
      const newNotif: AppNotification = {
        ...notif,
        id,
        timestamp: new Date().toISOString(),
        read: false,
      };

      setNotifications((prev) => [newNotif, ...prev]);

      // Sound
      if (!options?.skipSound && soundEnabled) {
        const soundType =
          notif.type === 'order_ready'
            ? 'food-ready'
            : notif.type === 'new_order'
            ? 'service-bell'
            : selectedTone;
        playSoundAsset(soundType);
      }

      // In-app Toast Banner
      if (!options?.skipToast) {
        const isStaffAlert = notif.type === 'new_order';
        triggerToast(notif.title, notif.message, notif.icon, notif.orderToken, isStaffAlert, navigate);
      }

      // Native Browser OS Notification
      if (!options?.skipBrowser) {
        triggerBrowserNotification(notif.title, notif.message, notif.orderToken, navigate);
      }
    },
    [soundEnabled, selectedTone, navigate]
  );

  // Send a test notification
  const sendTestNotification = useCallback(() => {
    const demoToken = 'DEMO-101';
    addNotification({
      type: 'order_ready',
      title: 'Order Ready for Pickup',
      message: `Demo order #${demoToken} is ready for collection at the counter.`,
      icon: '✓',
      orderToken: demoToken,
    });
  }, [addNotification]);

  // Mark single as read
  const markAsRead = useCallback((notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Delete notification
  const deleteNotification = useCallback((notifId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
  }, []);

  // Clear all
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Add announcement / promotional notification
  const addPromo = useCallback(
    (title: string, message: string) => {
      addNotification(
        {
          type: 'promo',
          title,
          message,
          icon: '📢',
        },
        { skipToast: false, skipSound: false, skipBrowser: false }
      );
    },
    [addNotification]
  );

  // Helper to check if an order strictly belongs to this customer/device
  const isTargetOrder = useCallback(
    (orderId: string, orderToken: string, userId: string | null, currentUserId: string | null): boolean => {
      // 1. If order has an authenticated user_id, it must match current logged-in user
      if (userId && currentUserId) {
        return currentUserId === userId;
      }

      // 2. If guest order or user is not logged in: check if order was placed on this device
      try {
        const localOrders = getOrders();
        return localOrders.some((o) => (o.id && o.id === orderId) || (o.token && o.token === orderToken));
      } catch {
        return false;
      }
    },
    []
  );

  // ── Capacitor Native Push Notification Integration ─────────────────────────
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let isSubscribed = true;

    const setupNativePush = async () => {
      try {
        let perm = await PushNotifications.checkPermissions();
        if (perm.receive === 'prompt') {
          perm = await PushNotifications.requestPermissions();
        }

        if (perm.receive === 'granted') {
          if (isSubscribed) setBrowserPermission('granted');
          await PushNotifications.register();
        } else if (perm.receive === 'denied') {
          if (isSubscribed) setBrowserPermission('denied');
        }

        // 1. Device Token received from FCM
        await PushNotifications.addListener('registration', (token: Token) => {
          console.log('[FCM Push] Device Token registered:', token.value);
          localStorage.setItem('canteen_fcm_token', token.value);
        });

        // 2. Registration Error
        await PushNotifications.addListener('registrationError', (error: any) => {
          console.warn('[FCM Push] Registration error:', error);
        });

        // 3. Notification received while app is foregrounded / open
        await PushNotifications.addListener(
          'pushNotificationReceived',
          (notification: PushNotificationSchema) => {
            console.log('[FCM Push] Received in app:', notification);
            const data = (notification.data || {}) as Record<string, any>;
            const token = data.orderToken || data.token;
            const orderId = data.orderId;

            addNotification({
              type: (data.type as any) || 'system',
              title: notification.title || 'Canteen Update 🔔',
              message: notification.body || '',
              icon: data.icon || '🔔',
              orderToken: token,
              orderId: orderId,
            });
          }
        );

        // 4. Notification clicked in notification tray (e.g. when app was in background or closed)
        await PushNotifications.addListener(
          'pushNotificationActionPerformed',
          (action: ActionPerformed) => {
            console.log('[FCM Push] Tapped by user:', action);
            const data = (action.notification.data || {}) as Record<string, any>;
            const token = data.orderToken || data.token;
            if (token) {
              navigate(`/track?token=${encodeURIComponent(token)}`);
            } else if (data.orderId) {
              navigate(`/track?orderId=${encodeURIComponent(data.orderId)}`);
            }
          }
        );
      } catch (err) {
        console.warn('[FCM Push] Setup error:', err);
      }
    };

    setupNativePush();

    return () => {
      isSubscribed = false;
      try {
        PushNotifications.removeAllListeners();
      } catch {}
    };
  }, [addNotification, navigate]);

  // ── Web Firebase Cloud Messaging (Desktop / Browser) ────────────────────────
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    if (browserPermission !== 'granted') return;

    let unsubscribe: (() => void) | undefined;

    getFirebaseMessaging()
      .then((messaging) => {
        if (!messaging) return;
        unsubscribe = onMessage(messaging, (payload) => {
          console.log('[Web FCM] Received foreground message:', payload);
          const data = payload.data || {};
          addNotification({
            type: (data.type as any) || 'system',
            title: payload.notification?.title || data.title || 'Canteen Alert 🔔',
            message: payload.notification?.body || data.message || '',
            icon: data.icon || '🔔',
            orderToken: data.orderToken || data.token,
            orderId: data.orderId,
          });
        });
      })
      .catch((err) => {
        console.warn('[Web FCM] Listener setup error:', err);
      });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [browserPermission, addNotification]);

  // Real-time Supabase Subscription
  useEffect(() => {
    const channel = supabase
      .channel('app-global-order-notifications')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        async (payload) => {
          // Rule 1: Staff & Admin do NOT receive status updates (cooking, ready, collected).
          // Staff only receives alerts on NEW incoming orders (INSERT event).
          if (role === 'staff' || role === 'admin') {
            return;
          }

          const nextStatus = payload.new.status as string;
          const orderId = payload.new.id as string;
          const token = payload.new.token as string;
          const userId = payload.new.user_id as string | null;

          const eventKey = `${orderId}-${nextStatus}`;
          if (processedIdsRef.current.has(eventKey)) return;
          processedIdsRef.current.add(eventKey);

          if (processedIdsRef.current.size > 200) {
            const arr = Array.from(processedIdsRef.current);
            processedIdsRef.current = new Set(arr.slice(-100));
          }

          const config = STATUS_CONFIG[nextStatus];
          if (!config) return;

          // Rule 2: ONLY the specific customer who placed this order receives the update!
          let currentUserId: string | null = null;
          try {
            const { data: { session } } = await supabase.auth.getSession();
            currentUserId = session?.user?.id ?? null;
          } catch {}

          if (isTargetOrder(orderId, token, userId, currentUserId)) {
            addNotification({
              type: config.type,
              title: config.title,
              message: config.message(token),
              icon: config.icon,
              orderId,
              orderToken: token,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          // Rule 3: ONLY Staff and Admin receive alerts when a new order arrives in the kitchen
          if (role !== 'staff' && role !== 'admin') {
            return;
          }

          const token = payload.new.token as string;
          const orderId = payload.new.id as string;
          const total = payload.new.total as number;
          const orderType = payload.new.order_type as string;

          const eventKey = `insert-${orderId}`;
          if (processedIdsRef.current.has(eventKey)) return;
          processedIdsRef.current.add(eventKey);

          addNotification({
            type: 'new_order',
            title: 'New Order Received',
            message: `Order #${token} (${orderType} • ₹${total}) received in kitchen.`,
            icon: '📋',
            orderId,
            orderToken: token,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [role, addNotification, isTargetOrder]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        soundEnabled,
        selectedTone,
        browserPermission,
        toggleSound,
        setSelectedTone,
        previewTone,
        requestBrowserPermission,
        addNotification,
        addPromo,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        sendTestNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
