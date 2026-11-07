import { supabase } from '@/integrations/supabase/client';
import { fetchStaffOrders, Order } from '@/lib/store';

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  todayRevenue: number;
  todayOrders: number;
  topSellingItem: { name: string; count: number };
  revenueByDay: { date: string; revenue: number; orders: number }[];
  ordersByCategory: { category: string; value: number }[];
  peakHours: { hour: string; count: number }[];
  topItems: { name: string; quantity: number; revenue: number }[];
  orderTypeBreakdown: { name: string; value: number }[];
  paymentMethodBreakdown: { name: string; value: number }[];
}

export async function fetchAnalyticsData(
  startDate?: Date,
  endDate?: Date
): Promise<{ orders: Order[]; summary: AnalyticsSummary }> {
  try {
    // 1. Fetch orders with items
    const orders = await fetchStaffOrders();

    // 2. Filter by date if specified
    const filteredOrders = orders.filter((o) => {
      const orderDate = new Date(o.createdAt);
      if (startDate && orderDate < startDate) return false;
      if (endDate && orderDate > endDate) return false;
      return true;
    });

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    let totalRevenue = 0;
    let todayRevenue = 0;
    let todayOrders = 0;

    // Day maps
    const dayMap: Record<string, { revenue: number; orders: number }> = {};
    const itemMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    const categoryMap: Record<string, number> = {};
    const hourMap: Record<number, number> = {};
    const typeMap: Record<string, number> = { 'dine-in': 0, 'take-away': 0, 'staff-delivery': 0 };
    const paymentMap: Record<string, number> = { upi: 0, cash: 0 };

    for (let h = 8; h <= 18; h++) {
      hourMap[h] = 0;
    }

    filteredOrders.forEach((order) => {
      totalRevenue += order.total;

      const orderDate = new Date(order.createdAt);
      const dayKey = orderDate.toISOString().slice(0, 10);

      if (dayKey === todayStr) {
        todayRevenue += order.total;
        todayOrders += 1;
      }

      // Day aggregations
      if (!dayMap[dayKey]) {
        dayMap[dayKey] = { revenue: 0, orders: 0 };
      }
      dayMap[dayKey].revenue += order.total;
      dayMap[dayKey].orders += 1;

      // Peak hour
      const hour = orderDate.getHours();
      if (hourMap[hour] !== undefined) {
        hourMap[hour] += 1;
      }

      // Order type
      const oType = order.type || 'dine-in';
      typeMap[oType] = (typeMap[oType] || 0) + 1;

      // Payment method
      const pMethod = order.paymentMethod || 'cash';
      paymentMap[pMethod] = (paymentMap[pMethod] || 0) + 1;

      // Items
      order.items?.forEach((item) => {
        const key = item.id || item.name;
        if (!itemMap[key]) {
          itemMap[key] = { name: item.name, quantity: 0, revenue: 0 };
        }
        itemMap[key].quantity += item.quantity;
        itemMap[key].revenue += item.quantity * item.price;

        const cat = item.category || 'General';
        categoryMap[cat] = (categoryMap[cat] || 0) + item.quantity;
      });
    });

    // Format revenue by day sorted ascending
    const revenueByDay = Object.keys(dayMap)
      .sort()
      .slice(-14) // last 14 days
      .map((d) => ({
        date: new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        revenue: dayMap[d].revenue,
        orders: dayMap[d].orders,
      }));

    // Top items
    const topItems = Object.values(itemMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);

    const topSellingItem = topItems[0]
      ? { name: topItems[0].name, count: topItems[0].quantity }
      : { name: 'None', count: 0 };

    // Orders by category
    const ordersByCategory = Object.keys(categoryMap).map((cat) => ({
      category: cat,
      value: categoryMap[cat],
    }));

    // Peak hours array
    const peakHours = Object.keys(hourMap).map((h) => {
      const hourNum = parseInt(h, 10);
      const displayHour =
        hourNum === 12
          ? '12 PM'
          : hourNum > 12
          ? `${hourNum - 12} PM`
          : `${hourNum} AM`;
      return {
        hour: displayHour,
        count: hourMap[hourNum],
      };
    });

    // Breakdown arrays
    const orderTypeBreakdown = [
      { name: 'Dine-In', value: typeMap['dine-in'] || 0 },
      { name: 'Take-Away', value: typeMap['take-away'] || 0 },
      { name: 'Staff Delivery', value: typeMap['staff-delivery'] || 0 },
    ];

    const paymentMethodBreakdown = [
      { name: 'UPI / Online', value: paymentMap['upi'] || 0 },
      { name: 'Cash at Counter', value: paymentMap['cash'] || 0 },
    ];

    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    return {
      orders: filteredOrders,
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        todayRevenue,
        todayOrders,
        topSellingItem,
        revenueByDay,
        ordersByCategory,
        peakHours,
        topItems,
        orderTypeBreakdown,
        paymentMethodBreakdown,
      },
    };
  } catch (err) {
    console.error('Error in fetchAnalyticsData:', err);
    throw err;
  }
}

