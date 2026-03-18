import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Clock, ChefHat, CheckCircle, Truck, RefreshCw, PackageCheck } from 'lucide-react';
import { getOrders, Order, fetchStaffOrders } from '@/lib/store';
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
    { id: 'new' as TabType, label: 'New Orders', icon: Clock, count: filterOrders('new').length },
    { id: 'cooking' as TabType, label: 'Cooking', icon: ChefHat, count: filterOrders('cooking').length },
    { id: 'ready' as TabType, label: 'Ready', icon: CheckCircle, count: filterOrders('ready').length },
    { id: 'collected' as TabType, label: 'Collected', icon: PackageCheck, count: filterOrders('collected').length },
    { id: 'delivery' as TabType, label: 'Delivery', icon: Truck, count: filterOrders('delivery').length },
  ];

  const filteredOrders = filterOrders(activeTab);

  return (
    <div className="page-container pb-28">
      {/* Header */}
      <div className="sticky-header">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Staff Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage orders in real-time</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadOrders}
                disabled={isRefreshing}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200 ${isRefreshing ? 'opacity-50' : ''}`}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-button ${isActive ? 'tab-button-active' : 'tab-button-inactive'}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
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
      <div className="container mx-auto px-4 py-6">
        {filteredOrders.length === 0 ? (
          <div className="empty-state animate-fade-in">
            <div className="empty-state-icon">
              {activeTab === 'new' && <Clock className="w-12 h-12 text-muted-foreground" />}
              {activeTab === 'cooking' && <ChefHat className="w-12 h-12 text-muted-foreground" />}
              {activeTab === 'ready' && <CheckCircle className="w-12 h-12 text-muted-foreground" />}
              {activeTab === 'collected' && <PackageCheck className="w-12 h-12 text-muted-foreground" />}
              {activeTab === 'delivery' && <Truck className="w-12 h-12 text-muted-foreground" />}
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No orders here</h3>
            <p className="text-muted-foreground">Orders in this section will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
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

      {/* Stats Footer */}
      <div className="footer-bar p-4">
        <div className="container mx-auto flex items-center justify-center gap-6 md:gap-10">
          <div className="stat-card">
            <p className="stat-label">Total Today</p>
            <p className="stat-value text-foreground">{orders.length}</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="stat-card">
            <p className="stat-label">Pending</p>
            <p className="stat-value text-warning">
              {orders.filter(o => o.status === 'placed').length}
            </p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="stat-card">
            <p className="stat-label">Completed</p>
            <p className="stat-value text-success">
              {orders.filter(o => ['ready', 'collected', 'delivered'].includes(o.status)).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
