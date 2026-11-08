import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface KitchenStatus {
  activeCount: number;
  rushLevel: 'low' | 'moderate' | 'high';
  rushLabel: string;
  estimatedWaitMinutes: number;
  isOpen: boolean;
  statusBadgeColor: string;
}

// Compute live status based on active orders
export function computeKitchenStatus(activeOrderCount: number): KitchenStatus {
  // Check canteen operating hours: 8:00 AM to 7:30 PM
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const totalMinutes = currentHour * 60 + currentMinute;
  const openTime = 8 * 60; // 08:00 AM
  const closeTime = 19 * 60 + 30; // 07:30 PM
  const isOpen = totalMinutes >= openTime && totalMinutes <= closeTime;

  if (activeOrderCount <= 2) {
    return {
      activeCount: activeOrderCount,
      rushLevel: 'low',
      rushLabel: 'Low Rush',
      estimatedWaitMinutes: 5,
      isOpen,
      statusBadgeColor: 'emerald',
    };
  } else if (activeOrderCount <= 6) {
    return {
      activeCount: activeOrderCount,
      rushLevel: 'moderate',
      rushLabel: 'Moderate',
      estimatedWaitMinutes: 10,
      isOpen,
      statusBadgeColor: 'amber',
    };
  } else {
    return {
      activeCount: activeOrderCount,
      rushLevel: 'high',
      rushLabel: 'Peak Rush',
      estimatedWaitMinutes: 18,
      isOpen,
      statusBadgeColor: 'rose',
    };
  }
}

export function useKitchenStatus(): KitchenStatus {
  const [activeCount, setActiveCount] = useState<number>(() => {
    const saved = localStorage.getItem('kitchen_active_orders_count');
    return saved ? parseInt(saved, 10) : 1;
  });

  useEffect(() => {
    let isMounted = true;

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
        console.warn('Could not fetch active order count for rush meter:', err);
      }
    };

    fetchActiveOrders();

    // Subscribe to realtime orders changes
    const channel = supabase
      .channel('kitchen-rush-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchActiveOrders()
      )
      .subscribe();

    const interval = setInterval(fetchActiveOrders, 30000);

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return computeKitchenStatus(activeCount);
}
