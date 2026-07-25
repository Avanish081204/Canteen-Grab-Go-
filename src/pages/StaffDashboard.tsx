import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Clock, ChefHat, CheckCircle, Truck, RefreshCw, PackageCheck } from 'lucide-react';
import { Order, fetchStaffOrders } from '@/lib/store';
import { useProfile } from '@/hooks/use-profile';
import OrderCard from '@/components/OrderCard';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type TabType = 'new' | 'cooking' | 'ready' | 'collected' | 'delivery';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { role, loading } = useProfile();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('new');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (role !== 'staff' && role !== 'admin') {
      toast.error('Access Denied: Staff only');
      navigate('/login');
      return;
    }
    
    loadOrders();
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => loadOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate, role, loading]);

  const loadOrders = async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchStaffOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filterOrders = (tab: TabType): Order[] => {
    switch (tab) {
      case 'new':
        return orders.filter(o => o.status === 'placed');
      case 'cooking':
        return orders.filter(o => o.status === 'cooking');
      case 'ready':
        return orders.filter(o => o.status === 'ready' && o.type !== 'staff-delivery');
      case 'collected':
        return orders.filter(o => o.status === 'collected');
      case 'delivery':
        return orders.filter(o => 
          o.type === 'staff-delivery' && 
          ['placed', 'cooking', 'ready', 'out-for-delivery'].includes(o.status)
        );
      default:
        return [];
    }
  };

  const tabs = [
    { id: 'new' as TabType, label: 'New', icon: Clock, count: filterOrders('new').length },
    { id: 'cooking' as TabType, label: 'Cooking', icon: ChefHat, count: filterOrders('cooking').length },
    { id: 'ready' as TabType, label: 'Ready', icon: CheckCircle, count: filterOrders('ready').length },
    { id: 'collected' as TabType, label: 'Collected', icon: PackageCheck, count: filterOrders('collected').length },
    { id: 'delivery' as TabType, label: 'Delivery', icon: Truck, count: filterOrders('delivery').length },
  ];

  const filteredOrders = filterOrders(activeTab);

  return (
    <div className="min-h-screen bg-muted/30 pb-28">
      {/* Top Header section */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">Staff Dashboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Manage live orders in real-time</p>
            </div>
            <button
              onClick={loadOrders}
              disabled={isRefreshing}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary text-xs sm:text-sm font-semibold transition-all duration-200 ${isRefreshing ? 'opacity-50' : ''}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing…' : 'Refresh'}</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-muted/50 p-2 sm:p-3 rounded-2xl border border-border/60 mb-4">
            <div className="text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Total Today</p>
              <p className="text-base sm:text-xl font-bold text-foreground">{orders.length}</p>
            </div>
            <div className="text-center border-x border-border/80">
              <p className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 font-medium">Pending</p>
              <p className="text-base sm:text-xl font-bold text-amber-600 dark:text-amber-400">
                {orders.filter(o => o.status === 'placed').length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium">Completed</p>
              <p className="text-base sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {orders.filter(o => ['ready', 'collected', 'delivered'].includes(o.status)).length}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-button text-xs sm:text-sm px-3 py-1.5 rounded-xl flex-shrink-0 ${
                    isActive ? 'tab-button-active' : 'tab-button-inactive'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`count-badge ${isActive ? 'count-badge-active' : 'count-badge-inactive'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {filteredOrders.length === 0 ? (
          <div className="empty-state animate-fade-in py-12">
            <div className="empty-state-icon w-16 h-16 sm:w-20 sm:h-20 mb-3">
              {activeTab === 'new' && <Clock className="w-8 h-8 text-muted-foreground" />}
              {activeTab === 'cooking' && <ChefHat className="w-8 h-8 text-muted-foreground" />}
              {activeTab === 'ready' && <CheckCircle className="w-8 h-8 text-muted-foreground" />}
              {activeTab === 'collected' && <PackageCheck className="w-8 h-8 text-muted-foreground" />}
              {activeTab === 'delivery' && <Truck className="w-8 h-8 text-muted-foreground" />}
            </div>
            <h3 className="text-base sm:text-xl font-semibold text-foreground mb-1">No orders here</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Orders in this status will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 animate-fade-in">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusUpdate={loadOrders}
                isStaff
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
