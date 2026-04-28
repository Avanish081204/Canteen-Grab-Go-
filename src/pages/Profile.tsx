import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  ShoppingBag,
  Clock,
  ChevronRight,
  LogOut,
  Heart,
  HelpCircle,
  Info,
  Star,
  MapPin,
  Phone,
  Edit3,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserOrders, Order } from '@/lib/store';
import { useProfile } from '@/hooks/use-profile';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  placed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  cooking: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  ready: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  collected: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'out-for-delivery': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const orderTypeLabels: Record<string, string> = {
  'dine-in': '🍽️ Dine In',
  'take-away': '📦 Take Away',
  'staff-delivery': '🚀 Staff Delivery',
};

export default function Profile() {
  const navigate = useNavigate();
  const { role } = useProfile();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllOrders, setShowAllOrders] = useState(false);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (typeof window !== 'undefined') {
        if (sessionStorage.getItem('local_admin') === 'true') {
          setUser({
            user_metadata: { full_name: 'Avanish', phone: '9503658089' },
            email: 'avanishshukla234@gmail.com',
            created_at: new Date().toISOString()
          });
          setEditName('Avanish');
          setEditPhone('9503658089');
          setOrders([]);
          setLoading(false);
          return;
        }

        if (sessionStorage.getItem('local_staff') === 'true') {
          setUser({
            user_metadata: { full_name: 'Staff Avanish', phone: '9503658089' },
            email: 'avanish.v.shukla@slrtce.in',
            created_at: new Date().toISOString()
          });
          setEditName('Staff Avanish');
          setEditPhone('9503658089');
          setOrders([]);
          setLoading(false);
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/login');
        return;
      }
      setUser(session.user);
      setEditName(session.user.user_metadata?.full_name || '');
      setEditPhone(session.user.user_metadata?.phone || '');

      try {
        const fetchedOrders = await fetchUserOrders();
        setOrders(fetchedOrders);
      } catch (e) {
        console.error('Failed to fetch orders:', e);
      }
      setLoading(false);
    };

    loadProfile();
  }, [navigate]);

  const handleLogout = async () => {
    sessionStorage.removeItem('local_admin');
    sessionStorage.removeItem('local_staff');
    window.dispatchEvent(new Event('userLoggedOut'));
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    window.location.href = '/';
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      if (typeof window !== 'undefined' && (sessionStorage.getItem('local_admin') === 'true' || sessionStorage.getItem('local_staff') === 'true')) {
        // Local Bypass: Update local state only
        setUser((prev: any) => ({
          ...prev,
          user_metadata: { ...prev.user_metadata, full_name: editName, phone: editPhone }
        }));
        setIsEditing(false);
        toast.success('Profile updated successfully!');
        return;
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: editName,
          phone: editPhone,
        },
      });
      if (error) throw error;

      // Refresh user data
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      setUser(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const userName = user.user_metadata?.full_name || 'User';
  const userEmail = user.email || '';
  const userPhone = user.user_metadata?.phone || '';
  const userInitial = userName.charAt(0).toUpperCase();
  const memberSince = new Date(user.created_at).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  const displayedOrders = showAllOrders ? orders : orders.slice(0, 3);
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="min-h-screen bg-muted/30 pb-8">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-lg space-y-5">

        {/* Profile Card */}
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-3xl font-bold shadow-lg flex-shrink-0">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground truncate">{userName}</h1>
              <p className="text-sm text-muted-foreground truncate">{userEmail}</p>
              {userPhone && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" />
                  {userPhone}
                </p>
              )}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-primary text-sm font-semibold mt-1 flex items-center gap-1 hover:underline"
              >
                <Edit3 className="w-3 h-3" />
                {isEditing ? 'Cancel' : 'Edit profile'}
              </button>
            </div>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <div className="mt-5 pt-5 border-t border-border space-y-3 animate-fade-in">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Quick Stats / Info */}
        <div className="grid grid-cols-3 gap-3 animate-fade-in">
          {(role === 'admin' || role === 'staff') ? (
            <>
              <div className="bg-card rounded-2xl p-4 shadow-sm border border-primary/20 bg-primary/5 text-center col-span-3 sm:col-span-1">
                <p className="text-xl font-bold text-primary capitalize">{role}</p>
                <p className="text-xs text-muted-foreground mt-1">Current Role</p>
              </div>
              <div className="bg-card rounded-2xl p-4 shadow-sm border border-border text-center">
                <p className="text-xl font-bold text-foreground">Active</p>
                <p className="text-xs text-muted-foreground mt-1">Status</p>
              </div>
              <div className="bg-card rounded-2xl p-4 shadow-sm border border-border text-center">
                <p className="text-lg font-bold text-foreground leading-tight">{memberSince}</p>
                <p className="text-xs text-muted-foreground mt-1">Joined</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-card rounded-2xl p-4 shadow-sm border border-border text-center">
                <p className="text-2xl font-bold text-primary">{orders.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Orders</p>
              </div>
              <div className="bg-card rounded-2xl p-4 shadow-sm border border-border text-center">
                <p className="text-2xl font-bold text-primary">₹{totalSpent}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Spent</p>
              </div>
              <div className="bg-card rounded-2xl p-4 shadow-sm border border-border text-center">
                <p className="text-lg font-bold text-primary leading-tight">{memberSince}</p>
                <p className="text-xs text-muted-foreground mt-1">Member Since</p>
              </div>
            </>
          )}
        </div>

        {/* Order History - Only show if not admin, or if admin but has orders */}
        {(role === 'user' || orders.length > 0) && (
          <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden animate-fade-in">
            <div className="p-5 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h2 className="font-bold text-lg">Your Orders</h2>
              </div>
              <ShoppingBag className="w-5 h-5 text-muted-foreground" />
            </div>

            {orders.length === 0 ? (
              <div className="px-5 pb-5 text-center text-muted-foreground text-sm py-6">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
                No orders yet. Start ordering from the menu!
              </div>
            ) : (
              <>
                <div className="divide-y divide-border">
                  {displayedOrders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => navigate(`/success/${order.token}`)}
                      className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm">{order.token}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[order.status] || ''}`}>
                            {order.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{orderTypeLabels[order.type] || order.type}</span>
                          <span>•</span>
                          <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <span className="font-bold text-primary">₹{order.total}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
                {orders.length > 3 && (
                  <button
                    onClick={() => setShowAllOrders(!showAllOrders)}
                    className="w-full py-3 text-center text-sm font-semibold text-primary hover:bg-primary/5 transition-colors border-t border-border"
                  >
                    {showAllOrders ? 'Show Less' : `View All ${orders.length} Orders`}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Admin Controls or Dining Experiences */}
        {role === 'admin' || role === 'staff' ? (
          <div className="bg-card rounded-3xl shadow-sm border border-primary/20 overflow-hidden animate-fade-in relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10" />
            <div className="p-5 pb-3 flex items-center gap-2">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h2 className="font-bold text-lg text-primary">Admin Quick Links</h2>
            </div>
            <div className="divide-y divide-border">
              <ProfileLink
                icon={<User className="w-5 h-5 text-primary" />}
                label="Go to Staff Dashboard"
                onClick={() => navigate('/staff/dashboard')}
              />
              {role === 'admin' && (
                <ProfileLink
                  icon={<Star className="w-5 h-5 text-primary" />}
                  label="Manage Menu & Inventory"
                  onClick={() => navigate('/admin/menu')}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden animate-fade-in">
            <div className="p-5 pb-3 flex items-center gap-2">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h2 className="font-bold text-lg">Dining & Experiences</h2>
            </div>
            <div className="divide-y divide-border">
              <ProfileLink
                icon={<Clock className="w-5 h-5" />}
                label="Your dining transactions"
                onClick={() => navigate('/track')}
              />
              <ProfileLink
                icon={<Star className="w-5 h-5" />}
                label="Your dining rewards"
              />
              <ProfileLink
                icon={<MapPin className="w-5 h-5" />}
                label="Your bookings"
              />
              <ProfileLink
                icon={<Heart className="w-5 h-5" />}
                label="Your favorites"
              />
            </div>
          </div>
        )}

        {/* More Section */}
        <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden animate-fade-in">
          <div className="p-5 pb-3 flex items-center gap-2">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="font-bold text-lg">More</h2>
          </div>
          <div className="divide-y divide-border">
            <ProfileLink
              icon={<HelpCircle className="w-5 h-5" />}
              label="Help & Support"
              onClick={() => navigate('/help')}
            />
            <ProfileLink
              icon={<Info className="w-5 h-5" />}
              label="About"
              onClick={() => navigate('/about')}
            />
            <ProfileLink
              icon={<Mail className="w-5 h-5" />}
              label="Send feedback"
              onClick={() => navigate('/feedback')}
            />
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 bg-card rounded-2xl p-4 shadow-sm border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors animate-fade-in"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>

        {/* App version */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          Campus Canteen v1.0 • All rights reserved
        </p>
      </div>
    </div>
  );
}

// Reusable profile link/row component
function ProfileLink({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors text-left"
    >
      <div className="flex items-center gap-3 text-foreground">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </button>
  );
}
