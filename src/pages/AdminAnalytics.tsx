import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Award,
  Download,
  Calendar,
  Clock,
  RefreshCw,
  UtensilsCrossed,
  CreditCard,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { fetchAnalyticsData, AnalyticsSummary } from '@/lib/analytics';
import { exportToCSV } from '@/lib/export-utils';
import { Order } from '@/lib/store';
import { useProfile } from '@/hooks/use-profile';
import AdminSubNav from '@/components/AdminSubNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const { role, loading } = useProfile();

  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | 'all'>('30d');
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      let start: Date | undefined;
      const now = new Date();

      if (dateRange === 'today') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (dateRange === '7d') {
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (dateRange === '30d') {
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const data = await fetchAnalyticsData(start);
      setSummary(data.summary);
      setOrders(data.orders);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      toast.error('Could not load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const handleExportCSV = () => {
    if (!orders.length) {
      toast.error('No orders available to export');
      return;
    }

    const exportRows = orders.map((o) => ({
      Token: o.token,
      Date: new Date(o.createdAt).toLocaleString(),
      OrderType: o.type,
      Customer: o.customerName || 'Guest',
      Phone: o.customerPhone || '',
      Total_INR: o.total,
      Status: o.status,
      PaymentMethod: o.paymentMethod || 'cash',
      PaymentStatus: o.paymentStatus || 'pending',
      Items: o.items.map((i) => `${i.quantity}x ${i.name}`).join('; '),
    }));

    exportToCSV(exportRows, `canteen_orders_${dateRange}_${new Date().toISOString().slice(0, 10)}`);
    toast.success('Orders exported successfully');
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Analytics...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-12">
      <AdminSubNav
        title="Sales & Analytics Dashboard"
        icon={<TrendingUp className="w-4 h-4" />}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Preset Buttons */}
          <div className="flex bg-muted/80 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setDateRange('today')}
              className={`px-2 py-1 rounded-md font-semibold text-[11px] transition-all ${
                dateRange === 'today' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateRange('7d')}
              className={`px-2 py-1 rounded-md font-semibold text-[11px] transition-all ${
                dateRange === '7d' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setDateRange('30d')}
              className={`px-2 py-1 rounded-md font-semibold text-[11px] transition-all ${
                dateRange === '30d' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
              }`}
            >
              30D
            </button>
            <button
              onClick={() => setDateRange('all')}
              className={`px-2 py-1 rounded-md font-semibold text-[11px] transition-all ${
                dateRange === 'all' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
              }`}
            >
              All
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="h-7 text-xs px-2 rounded-lg flex items-center gap-1 shadow-xs"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={loadAnalytics}
            className="h-7 w-7 p-0 rounded-lg"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </AdminSubNav>

      <main className="container mx-auto px-3 sm:px-4 py-4 space-y-4 sm:space-y-6">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs font-medium">Total Revenue</span>
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              ₹{summary?.totalRevenue.toLocaleString('en-IN') ?? 0}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Today: ₹{summary?.todayRevenue.toLocaleString('en-IN') ?? 0}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs font-medium">Total Orders</span>
              <ShoppingBag className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {summary?.totalOrders ?? 0}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Today: {summary?.todayOrders ?? 0} orders
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs font-medium">Average Order Value</span>
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              ₹{summary?.averageOrderValue ?? 0}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">Per transaction</div>
          </div>

          <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs font-medium">Top Selling Item</span>
              <Award className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-base sm:text-lg font-bold text-foreground truncate">
              {summary?.topSellingItem.name || 'None'}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {summary?.topSellingItem.count ?? 0} units sold
            </div>
          </div>
        </div>

        {/* Charts Row 1: Revenue Over Time + Orders by Category */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Trend Area Chart */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-foreground">Revenue Trend</h3>
                <p className="text-xs text-muted-foreground">Daily revenue generation (₹)</p>
              </div>
            </div>

            <div className="h-64 w-full">
              {summary?.revenueByDay && summary.revenueByDay.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={summary.revenueByDay}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip
                      formatter={(val: any) => [`₹${val}`, 'Revenue']}
                      labelStyle={{ color: '#000', fontWeight: 'bold' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#revenueGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  No revenue history recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Orders by Category Pie Chart */}
          <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm">
            <h3 className="font-bold text-sm sm:text-base text-foreground mb-1">Popular Categories</h3>
            <p className="text-xs text-muted-foreground mb-4">Items ordered by category</p>

            <div className="h-64 w-full">
              {summary?.ordersByCategory && summary.ordersByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summary.ordersByCategory}
                      dataKey="value"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {summary.ordersByCategory.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  No category data available.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charts Row 2: Peak Hours + Top Selling Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Peak Hours Bar Chart */}
          <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm sm:text-base text-foreground">Peak Ordering Hours</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Rush hours throughout the day</p>

            <div className="h-60 w-full">
              {summary?.peakHours ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.peakHours}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(val: any) => [val, 'Orders']} />
                    <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : null}
            </div>
          </div>

          {/* Top Selling Items */}
          <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <UtensilsCrossed className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm sm:text-base text-foreground">Top 8 Best Sellers</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Ranked by units ordered</p>

            <div className="space-y-2.5">
              {summary?.topItems && summary.topItems.length > 0 ? (
                summary.topItems.map((item, idx) => {
                  const maxCount = summary.topItems[0].quantity || 1;
                  const pct = Math.round((item.quantity / maxCount) * 100);

                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                          <span className="w-4 text-muted-foreground font-mono">#{idx + 1}</span>
                          {item.name}
                        </span>
                        <span className="text-muted-foreground font-medium">
                          {item.quantity} sold (₹{item.revenue})
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No item sales data yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charts Row 3: Order Type & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm">
            <h3 className="font-bold text-sm sm:text-base text-foreground mb-1">Order Fulfillment Mode</h3>
            <p className="text-xs text-muted-foreground mb-2">Dine-in vs Take-away vs Staff Delivery</p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary?.orderTypeBreakdown || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                  >
                    <Cell fill="#3B82F6" />
                    <Cell fill="#10B981" />
                    <Cell fill="#F59E0B" />
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <CreditCard className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm sm:text-base text-foreground">Payment Method Split</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-2">UPI / Online vs Cash</p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary?.paymentMethodBreakdown || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                  >
                    <Cell fill="#8B5CF6" />
                    <Cell fill="#10B981" />
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

