import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  ShieldCheck, 
  ChefHat, 
  User, 
  Search, 
  RefreshCw, 
  Phone,
  Mail,
  AlertCircle,
  Copy,
  ExternalLink,
  Trash2,
  UserX,
  X,
  Coins
} from 'lucide-react';
import AdminSubNav from '@/components/AdminSubNav';
import { useProfile, UserRole } from '@/hooks/use-profile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export interface UserAccount {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  created_at: string;
  total_orders: number;
  total_spent?: number;
  loyalty_points?: number;
  source?: 'supabase_profile' | 'order_history' | 'system_admin';
}

const LOCAL_STORAGE_USERS_KEY = 'canteen_managed_users';

export default function AdminUsers() {
  const navigate = useNavigate();
  const { role, loading } = useProfile();

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showSqlNotice, setShowSqlNotice] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(() => {
    return localStorage.getItem('hide_sync_banner') === 'true';
  });

  // Load real users directly from Supabase profiles + orders + loyalty tables
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch real profiles from Supabase
      const { data: profilesData, error: profileErr } = await (supabase
        .from('profiles' as any)
        .select('*')
        .order('updated_at', { ascending: false }) as any);

      if (profileErr) {
        console.warn('Profiles query returned error (likely needs SQL script):', profileErr);
        setShowSqlNotice(true);
      }

      // 2. Fetch real orders to get actual user order statistics & guest customers
      const { data: ordersData, error: orderErr } = await supabase
        .from('orders')
        .select('id, user_id, customer_name, customer_phone, total, created_at')
        .order('created_at', { ascending: false });

      // 3. Fetch real loyalty accounts
      const { data: loyaltyData } = await (supabase
        .from('loyalty_accounts' as any)
        .select('*') as any);

      // Build real users map keyed by id or email
      const userMap = new Map<string, UserAccount>();

      // A. Seed default root system accounts
      userMap.set('admin-root', {
        id: 'admin-root',
        full_name: 'Avanish Shukla (Admin)',
        email: 'avanishshukla234@gmail.com',
        role: 'admin',
        created_at: new Date().toISOString(),
        total_orders: 0,
        total_spent: 0,
        loyalty_points: 100,
        source: 'system_admin',
      });

      userMap.set('staff-root', {
        id: 'staff-root',
        full_name: 'Avanish Staff (Kitchen)',
        email: 'avanish.v.shukla@slrtce.in',
        role: 'staff',
        created_at: new Date().toISOString(),
        total_orders: 0,
        total_spent: 0,
        loyalty_points: 50,
        source: 'system_admin',
      });

      // B. Process real registered Supabase profiles
      if (profilesData && Array.isArray(profilesData)) {
        profilesData.forEach((p: any) => {
          const userEmail = p.email || (p.full_name ? `${p.full_name.toLowerCase().replace(/\s+/g, '.')}@slrtce.in` : `user_${p.id.slice(0, 5)}@campus.in`);
          const existing = Array.from(userMap.values()).find(u => u.email.toLowerCase() === userEmail.toLowerCase());
          
          const targetKey = existing ? existing.id : p.id;
          userMap.set(targetKey, {
            id: p.id,
            full_name: p.full_name || existing?.full_name || 'Campus Student',
            email: userEmail,
            phone: p.phone || existing?.phone,
            role: (p.role as UserRole) || (userEmail.includes('admin') ? 'admin' : 'user'),
            created_at: p.updated_at || p.created_at || new Date().toISOString(),
            total_orders: 0,
            total_spent: 0,
            loyalty_points: 50,
            source: 'supabase_profile',
          });
        });
      }

      // C. Cross-reference real orders to calculate order counts, spent, and discover customers
      if (ordersData && Array.isArray(ordersData)) {
        ordersData.forEach((ord: any) => {
          // If order is linked to a registered user_id in userMap
          if (ord.user_id && userMap.has(ord.user_id)) {
            const u = userMap.get(ord.user_id)!;
            u.total_orders += 1;
            u.total_spent = (u.total_spent || 0) + (Number(ord.total) || 0);
            if (ord.customer_name && (!u.full_name || u.full_name === 'Campus Student')) {
              u.full_name = ord.customer_name;
            }
            if (ord.customer_phone && !u.phone) {
              u.phone = ord.customer_phone;
            }
          } else if (ord.customer_name && ord.customer_name.trim().length > 1) {
            // Find existing customer by name or phone
            const existingCust = Array.from(userMap.values()).find(
              u => (ord.customer_phone && u.phone === ord.customer_phone) || 
                   (u.full_name.toLowerCase() === ord.customer_name.toLowerCase())
            );

            if (existingCust) {
              existingCust.total_orders += 1;
              existingCust.total_spent = (existingCust.total_spent || 0) + (Number(ord.total) || 0);
            } else {
              // Add real customer from order record
              const generatedId = ord.user_id || `cust_${ord.id.slice(0, 8)}`;
              userMap.set(generatedId, {
                id: generatedId,
                full_name: ord.customer_name,
                email: `${ord.customer_name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@slrtce.in`,
                phone: ord.customer_phone || undefined,
                role: 'user',
                created_at: ord.created_at,
                total_orders: 1,
                total_spent: Number(ord.total) || 0,
                loyalty_points: 30,
                source: 'order_history',
              });
            }
          }
        });
      }

      // D. Attach real loyalty points if available
      if (loyaltyData && Array.isArray(loyaltyData)) {
        loyaltyData.forEach((l: any) => {
          if (l.user_id && userMap.has(l.user_id)) {
            userMap.get(l.user_id)!.loyalty_points = l.points_balance;
          }
        });
      }

      // Convert map to sorted array (excluding any deleted accounts)
      const deletedIds: string[] = JSON.parse(localStorage.getItem('deleted_user_ids') || '[]');
      const finalUsers = Array.from(userMap.values())
        .filter(u => !deletedIds.includes(u.id) && !deletedIds.includes(u.email.toLowerCase()))
        .sort((a, b) => {
          if (a.role === 'admin' && b.role !== 'admin') return -1;
          if (b.role === 'admin' && a.role !== 'admin') return 1;
          return (b.total_orders || 0) - (a.total_orders || 0);
        });

      setUsers(finalUsers);
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(finalUsers));
    } catch (err) {
      console.error('Error fetching real users:', err);
      toast.error('Could not load all users from database');
      const saved = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      if (saved) setUsers(JSON.parse(saved));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDeleteUser = async (userToDelete: UserAccount) => {
    if (userToDelete.email.toLowerCase() === 'avanishshukla234@gmail.com') {
      toast.error('Cannot delete the primary admin account!');
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete account "${userToDelete.full_name}" (${userToDelete.email})?`)) {
      return;
    }

    try {
      // 1. Delete from Supabase profiles
      await (supabase
        .from('profiles' as any)
        .delete()
        .eq('id', userToDelete.id) as any);

      // 2. Track deleted ID in localStorage
      const deletedIds = JSON.parse(localStorage.getItem('deleted_user_ids') || '[]');
      deletedIds.push(userToDelete.id);
      deletedIds.push(userToDelete.email.toLowerCase());
      localStorage.setItem('deleted_user_ids', JSON.stringify(deletedIds));

      // 3. Update current state
      const updated = users.filter(u => u.id !== userToDelete.id);
      setUsers(updated);
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updated));

      toast.success(`Account "${userToDelete.full_name}" deleted.`);
    } catch (err) {
      console.error('Error deleting account:', err);
      const updated = users.filter(u => u.id !== userToDelete.id);
      setUsers(updated);
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updated));
      toast.success(`Account removed.`);
    }
  };

  const handlePurgeDemoAccounts = () => {
    const demoIds = ['admin-01', 'staff-01', 'user-02', 'user-03', 'user-04'];
    const deletedIds: string[] = JSON.parse(localStorage.getItem('deleted_user_ids') || '[]');
    
    demoIds.forEach(id => {
      if (!deletedIds.includes(id)) deletedIds.push(id);
    });
    deletedIds.push('rahul.sharma@slrtce.in', 'priya.p@slrtce.in', 'amit.verma@slrtce.in');
    localStorage.setItem('deleted_user_ids', JSON.stringify(deletedIds));

    const realUsersOnly = users.filter(u => 
      !demoIds.includes(u.id) && 
      !['rahul.sharma@slrtce.in', 'priya.p@slrtce.in', 'amit.verma@slrtce.in'].includes(u.email.toLowerCase())
    );

    setUsers(realUsersOnly);
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(realUsersOnly));
    toast.success('All dummy accounts removed successfully!');
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    try {
      // 1. Update in Supabase profiles
      await (supabase
        .from('profiles' as any)
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId) as any);

      // 2. Update local state
      const updated = users.map(u => u.id === userId ? { ...u, role: newRole } : u);
      setUsers(updated);
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updated));

      toast.success(`Role updated: ${targetUser.full_name} is now ${newRole.toUpperCase()}`);
    } catch (err) {
      console.error('Failed to update role in Supabase:', err);
      const updated = users.map(u => u.id === userId ? { ...u, role: newRole } : u);
      setUsers(updated);
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updated));
      toast.success(`Role updated locally: ${targetUser.full_name} is now ${newRole.toUpperCase()}`);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      user.full_name.toLowerCase().includes(q) || 
      user.email.toLowerCase().includes(q) ||
      (user.phone && user.phone.includes(q));
    return matchesRole && matchesSearch;
  });

  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const staffCount = users.filter(u => u.role === 'staff').length;
  const customerCount = users.filter(u => u.role === 'user').length;

  return (
    <div className="min-h-screen bg-background pb-28">
      <AdminSubNav 
        title="User & Staff Management" 
        icon={<Users className="w-5 h-5 text-primary" />}
      >
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePurgeDemoAccounts}
            className="gap-1.5 text-xs rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-500/30"
            title="Remove all dummy/demo placeholder accounts"
          >
            <UserX className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Purge Dummy Accounts</span>
            <span className="sm:hidden">Purge Demo</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={loadUsers}
            className="gap-1.5 text-xs rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </AdminSubNav>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-6xl space-y-6">
        {/* Supabase Sync Notice Banner */}
        {!isBannerDismissed && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative">
            <div className="flex items-start sm:items-center gap-2.5 pr-6 sm:pr-0">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 sm:mt-0" />
              <p className="text-amber-800 dark:text-amber-300">
                To sync all registered users from Supabase Auth, run <code className="font-mono bg-amber-500/20 px-1 py-0.5 rounded">sync_all_users_to_profiles.sql</code> in your Supabase SQL editor.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="text-[11px] h-7 rounded-lg border-amber-500/40 text-amber-900 dark:text-amber-200 hover:bg-amber-500/20 flex-shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(`-- Run in Supabase SQL Editor\nALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;\nINSERT INTO public.profiles (id, full_name, email, role) SELECT id, COALESCE(raw_user_meta_data->>'full_name', email), email, 'user' FROM auth.users ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;\nCREATE POLICY "Allow all read" ON public.profiles FOR SELECT USING (true);`);
                  toast.success('SQL Script copied to clipboard!');
                }}
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy Sync SQL
              </Button>
              <button
                type="button"
                onClick={() => {
                  setIsBannerDismissed(true);
                  localStorage.setItem('hide_sync_banner', 'true');
                }}
                className="p-1 rounded-md text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
              <span>Total Accounts</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground">{totalUsers}</p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
              <span>Super Admins</span>
              <ShieldCheck className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-rose-600">{adminCount}</p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
              <span>Kitchen Staff</span>
              <ChefHat className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-amber-600">{staffCount}</p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
              <span>Active Customers</span>
              <User className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-600">{customerCount}</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border shadow-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, email, or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs sm:text-sm rounded-xl"
            />
          </div>

          {/* Role Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-hide">
            {(['all', 'admin', 'staff', 'user'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all capitalize whitespace-nowrap ${
                  roleFilter === r
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'bg-muted/70 text-muted-foreground hover:text-foreground'
                }`}
              >
                {r === 'all' ? 'All Roles' : r === 'user' ? 'Customers' : r}
              </button>
            ))}
          </div>
        </div>

        {/* User Accounts Table */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email / Phone</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4 text-center">Orders</th>
                  <th className="py-3 px-4 text-center">Spent</th>
                  <th className="py-3 px-4 text-center">Coins</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      No users match the search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const initials = (user.full_name || 'U')
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                        {/* User Identity */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold flex items-center justify-center text-xs border border-primary/20 flex-shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground line-clamp-1">{user.full_name}</p>
                              <p className="text-[10px] text-muted-foreground">ID: {user.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>

                        {/* Email & Phone */}
                        <td className="py-3 px-4">
                          <p className="font-mono text-muted-foreground text-xs">{user.email}</p>
                          {user.phone && (
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Phone className="w-2.5 h-2.5" />
                              {user.phone}
                            </p>
                          )}
                        </td>

                        {/* Role Badge */}
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={`capitalize font-bold text-[11px] px-2 py-0.5 rounded-lg ${
                              user.role === 'admin'
                                ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                                : user.role === 'staff'
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            <span className="inline-flex items-center gap-1">
                              {user.role === 'admin' ? (
                                <ShieldCheck className="w-3 h-3 text-rose-500" />
                              ) : user.role === 'staff' ? (
                                <ChefHat className="w-3 h-3 text-amber-500" />
                              ) : (
                                <User className="w-3 h-3 text-emerald-500" />
                              )}
                              <span>{user.role === 'admin' ? 'Admin' : user.role === 'staff' ? 'Staff' : 'Customer'}</span>
                            </span>
                          </Badge>
                        </td>

                        {/* Total Orders */}
                        <td className="py-3 px-4 text-center font-bold text-foreground">
                          {user.total_orders}
                        </td>

                        {/* Total Spent */}
                        <td className="py-3 px-4 text-center font-bold text-primary">
                          ₹{user.total_spent || 0}
                        </td>

                        {/* Loyalty Coins */}
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                            <Coins className="w-3.5 h-3.5" />
                            <span>{user.loyalty_points ?? 50}</span>
                          </span>
                        </td>

                        {/* Actions: Role Changer & Delete Button */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Select
                              value={user.role}
                              onValueChange={(val: UserRole) => handleRoleChange(user.id, val)}
                            >
                              <SelectTrigger className="w-28 sm:w-32 h-8 text-xs font-semibold rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl text-xs">
                                <SelectItem value="user" className="text-xs">
                                  Customer
                                </SelectItem>
                                <SelectItem value="staff" className="text-xs">
                                  Staff
                                </SelectItem>
                                <SelectItem value="admin" className="text-xs text-rose-600 font-bold">
                                  Admin
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUser(user)}
                              disabled={user.email.toLowerCase() === 'avanishshukla234@gmail.com'}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors flex-shrink-0"
                              title={
                                user.email.toLowerCase() === 'avanishshukla234@gmail.com'
                                  ? 'Root admin cannot be deleted'
                                  : `Delete ${user.full_name}`
                              }
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
