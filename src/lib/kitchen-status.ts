import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface KitchenStatus {
  activeCount: number;
  rushLevel: 'low' | 'moderate' | 'high';
  rushLabel: string;
  estimatedWaitMinutes: number;
  isOpen: boolean;
  isManuallyClosed: boolean;
  closedReason: string;
  statusBadgeColor: string;
}

interface CanteenSettingValue {
  isOpen: boolean;
  reason?: string;
  updated_at?: string;
}

// ── Check default operating hours (8:00 AM to 7:30 PM) ────────────────
export function isWithinOperatingHours(): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const totalMinutes = currentHour * 60 + currentMinute;
  const openTime = 8 * 60; // 08:00 AM
  const closeTime = 19 * 60 + 30; // 07:30 PM
  return totalMinutes >= openTime && totalMinutes <= closeTime;
}

// ── Fetch current Canteen ON/OFF status ────────────────────────────────
export async function fetchCanteenStatus(): Promise<{ isOpen: boolean; reason: string }> {
  try {
    const { data, error } = await supabase
      .from('canteen_settings')
      .select('value')
      .eq('key', 'canteen_status')
      .maybeSingle();

    if (!error && data?.value) {
      const val = data.value as CanteenSettingValue;
      if (typeof val.isOpen === 'boolean') {
        localStorage.setItem('canteen_is_open_override', val.isOpen ? 'open' : 'closed');
        if (val.reason) localStorage.setItem('canteen_closed_reason', val.reason);
        return {
          isOpen: val.isOpen,
          reason: val.reason || (val.isOpen ? 'Canteen is open' : 'Canteen closed by staff'),
        };
      }
    }
  } catch (err) {
    console.warn('Could not fetch canteen_settings from Supabase, checking local:', err);
  }

  // Local fallback
  const localOverride = localStorage.getItem('canteen_is_open_override');
  const localReason = localStorage.getItem('canteen_closed_reason') || 'Canteen is currently closed';
  if (localOverride === 'closed') {
    return { isOpen: false, reason: localReason };
  } else if (localOverride === 'open') {
    return { isOpen: true, reason: 'Canteen is open' };
  }

  // Fallback to operating hours
  const openByHours = isWithinOperatingHours();
  return {
    isOpen: openByHours,
    reason: openByHours ? 'Canteen is open' : 'Canteen operating hours: 8:00 AM - 7:30 PM',
  };
}

// ── Update Canteen ON/OFF status (Staff / Admin master switch) ─────────
export async function setCanteenStatus(
  isOpen: boolean,
  reason: string = isOpen ? 'Canteen is open for orders' : 'Canteen is currently closed'
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Update localStorage immediately for zero latency
    localStorage.setItem('canteen_is_open_override', isOpen ? 'open' : 'closed');
    localStorage.setItem('canteen_closed_reason', reason);

    // 2. Dispatch local window event so all open tabs on same browser update instantly
    window.dispatchEvent(
      new CustomEvent('canteen-status-change', { detail: { isOpen, reason } })
    );

    // 3. Upsert into Supabase canteen_settings table
    const { error } = await supabase.from('canteen_settings').upsert({
      key: 'canteen_status',
      value: {
        isOpen,
        reason,
        updated_at: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Supabase canteen_settings upsert error:', error);
    }

    // 4. Broadcast on Supabase channel for all external devices / browsers
    const broadcastChannel = supabase.channel('canteen-realtime-broadcast');
    broadcastChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        broadcastChannel.send({
          type: 'broadcast',
          event: 'canteen_status_updated',
          payload: { isOpen, reason },
        });
      }
    });

    return { success: true };
  } catch (err: any) {
    console.error('Failed to set canteen status:', err);
    return { success: false, error: err.message };
  }
}

// ── Master Hook: useKitchenStatus() ────────────────────────────────────
export function useKitchenStatus(): KitchenStatus {
  const [activeCount, setActiveCount] = useState<number>(() => {
    const saved = localStorage.getItem('kitchen_active_orders_count');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [isOpen, setIsOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('canteen_is_open_override');
    if (saved === 'closed') return false;
    if (saved === 'open') return true;
    return isWithinOperatingHours();
  });

  const [closedReason, setClosedReason] = useState<string>(() => {
    return (
      localStorage.getItem('canteen_closed_reason') ||
      'Canteen is currently closed. New orders cannot be placed.'
    );
  });

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch live order counts
    const fetchActiveOrders = async () => {
      try {
        const { count, error } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .in('status', ['placed', 'cooking']);

        if (!error && count !== null && isMounted) {
          setActiveCount(count);
          localStorage.setItem('kitchen_active_orders_count', count.toString());
        }
      } catch (err) {
        console.warn('Could not fetch active order count:', err);
      }
    };

    // 2. Fetch master Canteen ON/OFF setting
    const checkCanteenStatus = async () => {
      const status = await fetchCanteenStatus();
      if (isMounted) {
        setIsOpen(status.isOpen);
        setClosedReason(status.reason);
      }
    };

    fetchActiveOrders();
    checkCanteenStatus();

    // 3. Listen to local custom event
    const handleLocalStatusChange = (e: any) => {
      if (isMounted && e.detail) {
        setIsOpen(e.detail.isOpen);
        if (e.detail.reason) setClosedReason(e.detail.reason);
      }
    };
    window.addEventListener('canteen-status-change', handleLocalStatusChange);

    // 4. Realtime subscription to canteen_settings table
    const settingsChannel = supabase
      .channel('canteen-settings-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'canteen_settings' },
        (payload: any) => {
          if (payload.new && payload.new.key === 'canteen_status') {
            const val = payload.new.value as CanteenSettingValue;
            if (val && typeof val.isOpen === 'boolean' && isMounted) {
              setIsOpen(val.isOpen);
              if (val.reason) setClosedReason(val.reason);
              localStorage.setItem('canteen_is_open_override', val.isOpen ? 'open' : 'closed');
            }
          }
        }
      )
      .on('broadcast', { event: 'canteen_status_updated' }, (data: any) => {
        if (data?.payload && isMounted) {
          setIsOpen(data.payload.isOpen);
          if (data.payload.reason) setClosedReason(data.payload.reason);
        }
      })
      .subscribe();

    // 5. Realtime subscription to orders table
    const ordersChannel = supabase
      .channel('kitchen-rush-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchActiveOrders()
      )
      .subscribe();

    const interval = setInterval(() => {
      fetchActiveOrders();
      checkCanteenStatus();
    }, 15000);

    return () => {
      isMounted = false;
      window.removeEventListener('canteen-status-change', handleLocalStatusChange);
      supabase.removeChannel(settingsChannel);
      supabase.removeChannel(ordersChannel);
      clearInterval(interval);
    };
  }, []);

  // Compute rush metrics
  let rushLevel: 'low' | 'moderate' | 'high' = 'low';
  let rushLabel = 'Low Rush';
  let estimatedWaitMinutes = 5;
  let statusBadgeColor = 'emerald';

  if (activeCount <= 2) {
    rushLevel = 'low';
    rushLabel = 'Low Rush';
    estimatedWaitMinutes = 5;
    statusBadgeColor = 'emerald';
  } else if (activeCount <= 6) {
    rushLevel = 'moderate';
    rushLabel = 'Moderate';
    estimatedWaitMinutes = 10;
    statusBadgeColor = 'amber';
  } else {
    rushLevel = 'high';
    rushLabel = 'Peak Rush';
    estimatedWaitMinutes = 18;
    statusBadgeColor = 'rose';
  }

  const isManuallyClosed = !isOpen;

  return {
    activeCount,
    rushLevel,
    rushLabel,
    estimatedWaitMinutes,
    isOpen,
    isManuallyClosed,
    closedReason,
    statusBadgeColor: isOpen ? statusBadgeColor : 'rose',
  };
}
