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
  Coins,
  Award,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserOrders, Order } from '@/lib/store';
import { useProfile } from '@/hooks/use-profile';
import { fetchLoyaltyAccount, fetchLoyaltyTransactions, LoyaltyAccount, LoyaltyTransaction } from '@/lib/loyalty';
import { Badge } from '@/components/ui/badge';
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
  'dine-in': 'Dine In',
  'take-away': 'Take Away',
  'staff-delivery': 'Staff Delivery',
};

export default function Profile() {
  const navigate = useNavigate();
  const { role } = useProfile();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [orderTab, setOrderTab] = useState<'active' | 'past'>('active');
  const [loyaltyAccount, setLoyaltyAccount] = useState<LoyaltyAccount | null>(null);
  const [loyaltyHistory, setLoyaltyHistory] = useState<LoyaltyTransaction[]>([]);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (typeof window !== 'undefined') {
        const isLocalAdmin = localStorage.getItem('local_admin') === 'true' || sessionStorage.getItem('local_admin') === 'true';
        if (isLocalAdmin) {
          setUser({
            user_metadata: { full_name: 'Avanish', phone: '9503658089' },
            email: 'avanishshukla234@gmail.com',
            created_at: new Date().toISOString()
          });
          setEditName('Avanish');
          setEditPhone('9503658089');
          setOrders([]);
          fetchLoyaltyAccount('local-admin').then(setLoyaltyAccount);
          fetchLoyaltyTransactions('local-admin').then(setLoyaltyHistory);
          setLoading(false);
          return;
        }

        const isLocalStaff = localStorage.getItem('local_staff') === 'true' || sessionStorage.getItem('local_staff') === 'true';
        if (isLocalStaff) {
          setUser({
            user_metadata: { full_name: 'Staff Avanish', phone: '9503658089' },
            email: 'avanish.v.shukla@slrtce.in',
            created_at: new Date().toISOString()
          });
          setEditName('Staff Avanish');
          setEditPhone('9503658089');
          setOrders([]);
          fetchLoyaltyAccount('local-admin').then(setLoyaltyAccount);
          fetchLoyaltyTransactions('local-admin').then(setLoyaltyHistory);
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

      fetchLoyaltyAccount(session.user.id).then(setLoyaltyAccount);
      fetchLoyaltyTransactions(session.user.id).then(setLoyaltyHistory);

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
    localStorage.removeItem('local_admin');
    localStorage.removeItem('local_staff');
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
      if (typeof window !== 'undefined' && (
        localStorage.getItem('local_admin') === 'true' || sessionStorage.getItem('local_admin') === 'true' ||
        localStorage.getItem('local_staff') === 'true' || sessionStorage.getItem('local_staff') === 'true'
      )) {
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
  const memberSinceShort = new Date(user.created_at).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });

  const displayedOrders = showAllOrders ? orders : orders.slice(0, 3);
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  const activeOrders = orders.filter(o => ['placed', 'cooking', 'ready', 'out-for-delivery'].includes(o.status));
  const pastOrders = orders.filter(o => ['collected', 'delivered'].includes(o.status));

  return (
    <div className="min-h-screen bg-muted/30 pb-24 md:pb-8">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-md border-b border-border/70 py-2.5 px-4 shadow-2xs">
        <div className="container mx-auto max-w-lg flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <span className="text-xs font-extrabold text-foreground">My Profile</span>
          <div className="w-8" />
        </div>
      </div>

      <div className="container mx-auto px-3.5 sm:px-4 py-4 sm:py-6 max-w-lg space-y-4 sm:space-y-5">

        {/* Profile Card */}
        <div className="bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs border border-border animate-fade-in">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-white flex items-center justify-center text-xl sm:text-2xl font-black shadow-md flex-shrink-0 border border-slate-700/50">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-xl font-black text-foreground truncate">{userName}</h1>
              <p className="text-xs text-muted-foreground truncate font-medium">{userEmail}</p>
              
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1 flex-wrap">
                {userPhone && (
                  <span className="flex items-center gap-1 font-medium">
                    <Phone className="w-3 h-3 text-primary" />
                    {userPhone}
                  </span>
                )}
                {userPhone && <span className="opacity-40">•</span>}
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground/70" />
                  <span>Joined {memberSinceShort}</span>
                </span>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-primary text-xs font-bold mt-1.5 inline-flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit profile'}</span>
              </button>
            </div>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <div className="mt-4 pt-4 border-t border-border space-y-3 animate-fade-in">
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Phone</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-70 cursor-pointer shadow-xs"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Quick Stats / Info - Mobile Perfect Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 animate-fade-in">
          {(role === 'admin' || role === 'staff') ? (
            <>
              <div className="bg-card rounded-2xl p-3 sm:p-4 shadow-xs border border-primary/25 bg-primary/5 text-center flex flex-col justify-center min-h-[78px]">
                <p className="text-lg sm:text-xl font-black text-primary capitalize truncate">{role}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Role</p>
              </div>
              <div className="bg-card rounded-2xl p-3 sm:p-4 shadow-xs border border-border text-center flex flex-col justify-center min-h-[78px]">
                <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">Active</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Status</p>
              </div>
              <div className="bg-card rounded-2xl p-3 sm:p-4 shadow-xs border border-border text-center flex flex-col justify-center min-h-[78px]">
                <p className="text-xs sm:text-sm font-black text-foreground truncate">{memberSinceShort}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Joined</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-card rounded-2xl p-3 sm:p-4 shadow-xs border border-border text-center flex flex-col justify-center min-h-[78px]">
                <p className="text-xl sm:text-2xl font-black text-primary">{orders.length}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Orders</p>
              </div>
              <div className="bg-card rounded-2xl p-3 sm:p-4 shadow-xs border border-border text-center flex flex-col justify-center min-h-[78px]">
                <p className="text-xl sm:text-2xl font-black text-primary">₹{totalSpent}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Total Spent</p>
              </div>
              <div className="bg-card rounded-2xl p-3 sm:p-4 shadow-xs border border-border text-center flex flex-col justify-center min-h-[78px]">
                <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
                  {loyaltyAccount?.points_balance ?? 50}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Coins</p>
              </div>
            </>
          )}
        </div>

        {/* Campus Loyalty Rewards Card */}
        <div className="bg-gradient-to-br from-amber-500/10 via-card to-orange-500/5 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xs animate-fade-in">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-xs sm:text-sm text-foreground flex items-center gap-1.5 truncate">
                  <span>Campus Coins &amp; Rewards</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                </h3>
                <p className="text-[11px] text-muted-foreground line-clamp-1">Earn 1 pt per ₹10 spent • Redeem at checkout</p>
              </div>
            </div>
            <Badge className="bg-amber-500 hover:bg-amber-500 text-white font-extrabold text-[11px] px-2.5 py-1 whitespace-nowrap flex-shrink-0 shadow-2xs">
              {loyaltyAccount?.tier || 'Bronze'} Tier
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 pt-2 border-t border-amber-500/20">
            <div className="bg-card/90 p-3 rounded-xl border border-border/80">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Available Coins</span>
              <p className="text-lg sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                {loyaltyAccount?.points_balance ?? 50} pts
              </p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium">Worth ₹{loyaltyAccount?.points_balance ?? 50} discount</p>
            </div>
            <div className="bg-card/90 p-3 rounded-xl border border-border/80">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Lifetime Earned</span>
              <p className="text-lg sm:text-2xl font-black text-foreground mt-0.5">
                {loyaltyAccount?.lifetime_earned ?? 50} pts
              </p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium line-clamp-1">
                {loyaltyAccount?.tier === 'Gold'
                  ? 'Max Gold Perks (1.5x)'
                  : loyaltyAccount?.tier === 'Silver'
                  ? 'Silver Perk (1.25x)'
                  : 'Reach 200 pts for Silver'}
              </p>
            </div>
          </div>
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

            {/* Active / Past Tabs */}
            <div className="px-5 pb-3 flex gap-2">
              <button
                onClick={() => { setOrderTab('active'); setShowAllOrders(false); }}
                className={`tab-button text-sm ${
                  orderTab === 'active' ? 'tab-button-active' : 'tab-button-inactive'
                }`}
              >
                <Clock className="w-4 h-4" />
                Active
                {activeOrders.length > 0 && (
                  <span className={`count-badge ${
                    orderTab === 'active' ? 'count-badge-active' : 'count-badge-inactive'
                  }`}>
                    {activeOrders.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => { setOrderTab('past'); setShowAllOrders(false); }}
                className={`tab-button text-sm ${
                  orderTab === 'past' ? 'tab-button-active' : 'tab-button-inactive'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                Past
                {pastOrders.length > 0 && (
                  <span className={`count-badge ${
                    orderTab === 'past' ? 'count-badge-active' : 'count-badge-inactive'
                  }`}>
                    {pastOrders.length}
                  </span>
                )}
              </button>
            </div>

            {/* Tab Content */}
            {(() => {
              const tabOrders = orderTab === 'active' ? activeOrders : pastOrders;
              const shown = showAllOrders ? tabOrders : tabOrders.slice(0, 3);
              return tabOrders.length === 0 ? (
                <div className="px-5 pb-5 text-center text-muted-foreground text-sm py-6">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  {orderTab === 'active'
                    ? 'No active orders right now.'
                    : 'No past orders yet. Start ordering!'}
                </div>
              ) : (
                <>
                  <div className="divide-y divide-border">
                    {shown.map((order) => (
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
                  {tabOrders.length > 3 && (
                    <button
                      onClick={() => setShowAllOrders(!showAllOrders)}
                      className="w-full py-3 text-center text-sm font-semibold text-primary hover:bg-primary/5 transition-colors border-t border-border"
                    >
                      {showAllOrders ? 'Show Less' : `View All ${tabOrders.length} Orders`}
                    </button>
                  )}
                </>
              );
            })()}
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
